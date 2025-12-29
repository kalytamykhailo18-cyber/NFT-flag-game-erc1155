#!/usr/bin/env node
'use strict';

/**
 * Update Place Images Script
 *
 * Fetches real images from Google via SerpAPI and uploads to IPFS via Pinata.
 * Updates existing places in the database with real image URIs.
 *
 * Usage:
 *   node scripts/updatePlaceImages.js [options]
 *
 * Options:
 *   --all           Update all places (default: only places without images)
 *   --limit N       Limit to N places
 *   --place-id N    Update specific place by ID
 *   --dry-run       Show what would be updated without making changes
 *
 * Required environment variables:
 *   PINATA_API_KEY
 *   PINATA_SECRET_KEY
 *   SERP_API_KEY
 */

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const { sequelize, Place, PlacePhotoSlice, Municipality, Region } = require('../database/models');

// API credentials
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;

const PINATA_API_URL = 'https://api.pinata.cloud';
const SERPAPI_URL = 'https://serpapi.com/search';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  all: args.includes('--all'),
  dryRun: args.includes('--dry-run'),
  limit: null,
  placeId: null,
};

const limitIndex = args.indexOf('--limit');
if (limitIndex !== -1 && args[limitIndex + 1]) {
  options.limit = parseInt(args[limitIndex + 1]);
}

const placeIdIndex = args.indexOf('--place-id');
if (placeIdIndex !== -1 && args[placeIdIndex + 1]) {
  options.placeId = parseInt(args[placeIdIndex + 1]);
}

/**
 * Search for image using SerpAPI
 */
async function searchImage(query) {
  if (!SERP_API_KEY) {
    throw new Error('SERP_API_KEY is required');
  }

  try {
    const response = await axios.get(SERPAPI_URL, {
      params: {
        api_key: SERP_API_KEY,
        engine: 'google_images',
        q: query,
        num: 5,
      },
      timeout: 30000,
    });

    const images = response.data.images_results;
    if (!images || images.length === 0) {
      return null;
    }

    // Find a valid image URL
    const image = images.find(img => img.original && img.original.startsWith('http')) || images[0];
    return image.original || image.thumbnail;
  } catch (error) {
    console.log(`    [ERROR] SerpAPI: ${error.message}`);
    return null;
  }
}

/**
 * Download image from URL
 */
async function downloadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.log(`    [ERROR] Download: ${error.message}`);
    return null;
  }
}

/**
 * Generate a random flag-style image using sharp
 */
async function generateFlagImage(placeName) {
  // Generate random colors for the flag
  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008000', '#000080', '#800000', '#008080',
    '#FFD700', '#DC143C', '#4169E1', '#32CD32', '#FF6347', '#4682B4',
  ];

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  // Flag dimensions
  const width = 600;
  const height = 400;

  // Random flag pattern (horizontal stripes, vertical stripes, or tricolor)
  const pattern = Math.floor(Math.random() * 3);

  let svg;
  const color1 = getRandomColor();
  let color2 = getRandomColor();
  let color3 = getRandomColor();

  // Ensure colors are different
  while (color2 === color1) color2 = getRandomColor();
  while (color3 === color1 || color3 === color2) color3 = getRandomColor();

  if (pattern === 0) {
    // Horizontal stripes
    svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${width}" height="${height / 3}" fill="${color1}"/>
        <rect x="0" y="${height / 3}" width="${width}" height="${height / 3}" fill="${color2}"/>
        <rect x="0" y="${(height / 3) * 2}" width="${width}" height="${height / 3}" fill="${color3}"/>
      </svg>
    `;
  } else if (pattern === 1) {
    // Vertical stripes
    svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${width / 3}" height="${height}" fill="${color1}"/>
        <rect x="${width / 3}" y="0" width="${width / 3}" height="${height}" fill="${color2}"/>
        <rect x="${(width / 3) * 2}" y="0" width="${width / 3}" height="${height}" fill="${color3}"/>
      </svg>
    `;
  } else {
    // Two-color with circle/emblem
    svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${width}" height="${height}" fill="${color1}"/>
        <circle cx="${width / 2}" cy="${height / 2}" r="${height / 4}" fill="${color2}"/>
      </svg>
    `;
  }

  try {
    const imageBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    console.log(`    ✓ Generated flag image for: ${placeName}`);
    return imageBuffer;
  } catch (error) {
    console.log(`    [ERROR] Generate flag: ${error.message}`);
    return null;
  }
}

/**
 * Generate a slice image by cropping/modifying the base image
 */
async function generateSliceImage(baseImageBuffer, position, pairNumber) {
  try {
    const image = sharp(baseImageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 600;
    const height = metadata.height || 400;

    // For left slice, take left half; for right slice, take right half
    const halfWidth = Math.floor(width / 2);
    const extractOptions = position === 'left'
      ? { left: 0, top: 0, width: halfWidth, height }
      : { left: halfWidth, top: 0, width: halfWidth, height };

    // Add a slight color tint based on pair number to differentiate pairs
    const hueRotate = (pairNumber * 30) % 360;

    const sliceBuffer = await sharp(baseImageBuffer)
      .extract(extractOptions)
      .modulate({ hue: hueRotate })
      .png()
      .toBuffer();

    return sliceBuffer;
  } catch (error) {
    console.log(`      [ERROR] Generate slice: ${error.message}`);
    return null;
  }
}

/**
 * Upload image to IPFS via Pinata
 */
async function uploadToIPFS(imageBuffer, filename) {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error('PINATA_API_KEY and PINATA_SECRET_KEY are required');
  }

  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, { filename });

    const response = await axios.post(`${PINATA_API_URL}/pinning/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000,
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.log(`    [ERROR] IPFS upload: ${error.message}`);
    return null;
  }
}

/**
 * Upload metadata to IPFS via Pinata
 */
async function uploadMetadataToIPFS(metadata) {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    return null;
  }

  try {
    const response = await axios.post(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, metadata, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      timeout: 30000,
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.log(`    [ERROR] Metadata upload: ${error.message}`);
    return null;
  }
}

/**
 * Process a single place
 */
async function processPlace(place) {
  const searchQuery = `${place.location_type} ${place.municipality_name} ${place.region_name}`;
  console.log(`  Searching: "${searchQuery}"`);

  if (options.dryRun) {
    console.log(`    [DRY RUN] Would search and upload image`);
    return { success: true, dryRun: true };
  }

  // Search for image
  let imageBuffer = null;
  const imageUrl = await searchImage(searchQuery);

  if (imageUrl) {
    // Download image from Google
    imageBuffer = await downloadImage(imageUrl);
  }

  // Fallback: generate random flag image if search/download failed
  if (!imageBuffer) {
    console.log(`    [FALLBACK] Generating random flag image...`);
    imageBuffer = await generateFlagImage(place.name);
  }

  if (!imageBuffer) {
    console.log(`    [SKIP] Failed to get or generate image`);
    return { success: false, reason: 'image_failed' };
  }

  // Upload to IPFS
  const ipfsHash = await uploadToIPFS(imageBuffer, `place_${place.id}.jpg`);
  if (!ipfsHash) {
    console.log(`    [SKIP] Failed to upload to IPFS`);
    return { success: false, reason: 'ipfs_upload_failed' };
  }

  const baseImageUri = `ipfs://${ipfsHash}`;
  console.log(`    ✓ Image: ${ipfsHash}`);

  // Create and upload metadata
  const metadata = {
    name: place.name,
    description: `${place.location_type} in ${place.municipality_name}, ${place.region_name}`,
    image: baseImageUri,
    attributes: [
      { trait_type: 'Region', value: place.region_name },
      { trait_type: 'Municipality', value: place.municipality_name },
      { trait_type: 'Location Type', value: place.location_type },
      { trait_type: 'Category', value: place.category },
    ],
  };

  const metadataHash = await uploadMetadataToIPFS(metadata);
  const metadataUri = metadataHash ? `ipfs://${metadataHash}` : null;

  if (metadataHash) {
    console.log(`    ✓ Metadata: ${metadataHash}`);
  }

  // Update place in database
  await Place.update(
    { base_image_uri: baseImageUri, metadata_uri: metadataUri },
    { where: { id: place.id } }
  );

  console.log(`    ✓ Place database updated`);

  // Generate and upload slice images
  console.log(`    Generating slices for ${place.pair_count} pairs...`);

  for (let pairNum = 1; pairNum <= place.pair_count; pairNum++) {
    for (const position of ['left', 'right']) {
      // Generate slice image from base image
      const sliceBuffer = await generateSliceImage(imageBuffer, position, pairNum);
      if (!sliceBuffer) {
        console.log(`      [SKIP] Failed to generate slice ${pairNum}-${position}`);
        continue;
      }

      // Upload slice to IPFS
      const sliceIpfsHash = await uploadToIPFS(sliceBuffer, `place_${place.id}_pair${pairNum}_${position}.png`);
      if (!sliceIpfsHash) {
        console.log(`      [SKIP] Failed to upload slice ${pairNum}-${position}`);
        continue;
      }

      const sliceImageUri = `ipfs://${sliceIpfsHash}`;

      // Check if slice exists, update or create
      const [slice, created] = await PlacePhotoSlice.findOrCreate({
        where: {
          place_id: place.id,
          pair_number: pairNum,
          slice_position: position,
        },
        defaults: {
          place_id: place.id,
          pair_number: pairNum,
          slice_position: position,
          slice_uri: sliceImageUri,
          price: place.category === 'premium' ? 0.01 : place.category === 'plus' ? 0.007 : 0.005,
        },
      });

      if (!created) {
        // Update existing slice with new image
        await slice.update({ slice_uri: sliceImageUri });
      }

      console.log(`      ✓ Slice ${pairNum}-${position}: ${sliceIpfsHash}`);
    }
  }

  console.log(`    ✓ All slices updated`);
  return { success: true, ipfsHash, metadataHash };
}

/**
 * Main function
 */
async function main() {
  console.log('\n=== Update Place Images ===\n');

  // Validate credentials
  if (!SERP_API_KEY) {
    console.error('Error: SERP_API_KEY environment variable is required');
    process.exit(1);
  }
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.error('Error: PINATA_API_KEY and PINATA_SECRET_KEY environment variables are required');
    process.exit(1);
  }

  // Test database connection
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');
  } catch (error) {
    console.error('Error: Failed to connect to database:', error.message);
    process.exit(1);
  }

  // Build query options
  const whereConditions = {};

  if (options.placeId) {
    whereConditions.id = options.placeId;
  } else if (!options.all) {
    whereConditions.base_image_uri = null;
  }

  const queryOptions = {
    where: whereConditions,
    include: [
      {
        model: Municipality,
        as: 'municipality',
        include: [{ model: Region, as: 'region' }],
      },
    ],
    order: [['id', 'ASC']],
  };

  if (options.limit) {
    queryOptions.limit = options.limit;
  }

  // Fetch places
  const placesRaw = await Place.findAll(queryOptions);

  // Map to simple objects with municipality and region names
  const places = placesRaw.map((p) => ({
    id: p.id,
    name: p.name,
    location_type: p.location_type,
    category: p.category,
    pair_count: p.pair_count,
    base_image_uri: p.base_image_uri,
    municipality_name: p.municipality?.name || 'Unknown',
    region_name: p.municipality?.region?.name || 'Unknown',
  }));

  if (places.length === 0) {
    console.log('No places to update.');
    process.exit(0);
  }

  console.log(`Found ${places.length} place(s) to process\n`);

  if (options.dryRun) {
    console.log('[DRY RUN MODE - No changes will be made]\n');
  }

  // Process each place
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
  };

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    console.log(`[${i + 1}/${places.length}] ${place.name}`);

    try {
      const result = await processPlace(place);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.log(`    [ERROR] ${error.message}`);
      results.failed++;
    }

    // Rate limiting delay
    if (i < places.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`  Success: ${results.success}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Total: ${places.length}\n`);

  await sequelize.close();
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
