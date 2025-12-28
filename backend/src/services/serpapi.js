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
      },
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Image download error:', error.message);
    throw new Error('IMAGE_SEARCH_ERROR: Failed to download image');
  }
};

module.exports = {
  searchImage,
  checkImageAvailability,
  downloadImage,
};
