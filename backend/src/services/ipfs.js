/**
 * IPFS Service using Pinata
 * Handles image and metadata uploads
 */
const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');
const config = require('../config');

const PINATA_API_URL = 'https://api.pinata.cloud';

/**
 * Upload image to IPFS via Pinata
 */
const uploadImage = async (imageBuffer, filename) => {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, { filename });

    const response = await axios.post(`${PINATA_API_URL}/pinning/pinFileToIPFS`, formData, {
      headers: {
        ...formData.getHeaders(),
        'pinata_api_key': config.pinataApiKey,
        'pinata_secret_api_key': config.pinataSecretKey,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const hash = response.data.IpfsHash;
    return {
      hash,
      uri: `ipfs://${hash}`,
      gateway_url: `https://gateway.pinata.cloud/ipfs/${hash}`,
    };
  } catch (error) {
    console.error('IPFS upload error:', error.response?.data || error.message);
    throw new Error('IPFS_ERROR: Failed to upload image');
  }
};

/**
 * Upload JSON metadata to IPFS via Pinata
 */
const uploadMetadata = async (metadata, filename) => {
  try {
    // Compute hash before uploading
    const metadataString = JSON.stringify(metadata);
    const hash = crypto.createHash('sha256').update(metadataString).digest('hex');

    const response = await axios.post(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, metadata, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': config.pinataApiKey,
        'pinata_secret_api_key': config.pinataSecretKey,
      },
    });

    const ipfsHash = response.data.IpfsHash;
    return {
      hash: `0x${hash}`,
      ipfsHash,
      uri: `ipfs://${ipfsHash}`,
      gateway_url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    };
  } catch (error) {
    console.error('IPFS metadata upload error:', error.response?.data || error.message);
    throw new Error('IPFS_ERROR: Failed to upload metadata');
  }
};

/**
 * Create place metadata JSON according to Section 5.1
 */
const createPlaceMetadata = async (place, slices, municipality) => {
  const region = municipality.region;
  const country = region?.country;

  // Prepare slices data
  const slicesData = slices.map(slice => ({
    pair_index: slice.pair_number,
    slice_position: slice.slice_position,
    image_uri: slice.slice_uri,
    image_sha256: slice.image_sha256,
    coordinates: {
      lat: parseFloat(slice.latitude) || parseFloat(place.latitude),
      lng: parseFloat(slice.longitude) || parseFloat(place.longitude),
    },
    captured_at: slice.captured_at?.toISOString() || new Date().toISOString(),
  }));

  // Create metadata without hash first
  const metadata = {
    name: place.name,
    description: `A unique place in ${municipality.name}, ${region?.name || ''}, ${country?.name || ''}. Collect all slice pairs to claim this NFT! Join our community: ${config.telegramGroupUrl}`,
    image: place.base_image_uri,
    external_url: `${config.frontendUrl}/places/${place.token_id}`,
    attributes: [
      { trait_type: 'Country', value: country?.name || 'Unknown' },
      { trait_type: 'Region', value: region?.name || 'Unknown' },
      { trait_type: 'Municipality', value: municipality.name },
      { trait_type: 'Category', value: place.category },
      { trait_type: 'Location Type', value: place.location_type },
      { trait_type: 'Pair Count', value: place.pair_count },
      { trait_type: 'Latitude', value: place.latitude.toString() },
      { trait_type: 'Longitude', value: place.longitude.toString() },
    ],
    properties: {
      community: {
        telegram: config.telegramGroupUrl,
      },
      slices: slicesData,
    },
  };

  // Compute hash of metadata (before adding metadata_sha256)
  const metadataString = JSON.stringify(metadata);
  const metadataHash = crypto.createHash('sha256').update(metadataString).digest('hex');

  // Add hash to properties
  metadata.properties.metadata_sha256 = `0x${metadataHash}`;

  return metadata;
};

/**
 * Get Pinata status
 */
const getStatus = async () => {
  try {
    const response = await axios.get(`${PINATA_API_URL}/data/testAuthentication`, {
      headers: {
        'pinata_api_key': config.pinataApiKey,
        'pinata_secret_api_key': config.pinataSecretKey,
      },
    });

    return {
      connected: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      connected: false,
      message: error.response?.data?.error || error.message,
    };
  }
};

module.exports = {
  uploadImage,
  uploadMetadata,
  createPlaceMetadata,
  getStatus,
};
