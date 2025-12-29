/**
 * SerpAPI Service
 * Image search for place photos
 */
const axios = require('axios');
const config = require('../config');

const SERPAPI_URL = 'https://serpapi.com/search';

/**
 * Search for images using SerpAPI
 */
const searchImage = async (query) => {
  try {
    const response = await axios.get(SERPAPI_URL, {
      params: {
        api_key: config.serpApiKey,
        engine: 'google_images',
        q: query,
        num: 5,
      },
    });

    const images = response.data.images_results;

    if (!images || images.length === 0) {
      throw new Error('No images found');
    }

    // Return the first high-quality image
    const image = images.find(img => img.original && img.original.startsWith('http')) || images[0];

    return image.original || image.thumbnail;
  } catch (error) {
    console.error('SerpAPI search error:', error.response?.data || error.message);
    throw new Error('IMAGE_SEARCH_ERROR: Failed to search for images');
  }
};

/**
 * Check if images are available for a query
 */
const checkImageAvailability = async (query) => {
  try {
    const response = await axios.get(SERPAPI_URL, {
      params: {
        api_key: config.serpApiKey,
        engine: 'google_images',
        q: query,
        num: 1,
      },
    });

    const images = response.data.images_results;
    return images && images.length > 0;
  } catch (error) {
    console.error('SerpAPI check error:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Download image from URL
 */
const downloadImage = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
      },
      validateStatus: (status) => status === 200,
    });

    const buffer = Buffer.from(response.data);

    // Validate that we received actual image data
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty buffer received');
    }

    // Check if buffer starts with valid image magic bytes
    const magicBytes = buffer.slice(0, 4).toString('hex');
    const isValidImage =
      magicBytes.startsWith('ffd8ff') || // JPEG
      magicBytes.startsWith('89504e47') || // PNG
      magicBytes.startsWith('47494638') || // GIF
      magicBytes.startsWith('52494646'); // WebP

    if (!isValidImage) {
      console.error('Invalid image format. Magic bytes:', magicBytes);
      throw new Error('Invalid image format detected');
    }

    return buffer;
  } catch (error) {
    console.error('Image download error:', error.message);
    throw new Error(`IMAGE_DOWNLOAD_ERROR: ${error.message}`);
  }
};

module.exports = {
  searchImage,
  checkImageAvailability,
  downloadImage,
};
