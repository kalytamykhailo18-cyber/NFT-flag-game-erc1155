/**
 * Image Processor Service
 * Sharp library utilities for image manipulation
 */
const sharp = require('sharp');
const crypto = require('crypto');

/**
 * Get image metadata
 */
const getMetadata = async (imageBuffer) => {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: imageBuffer.length,
    };
  } catch (error) {
    throw new Error(`IMAGE_PROCESSING_ERROR: ${error.message}`);
  }
};

/**
 * Resize image
 */
const resize = async (imageBuffer, width, height, options = {}) => {
  try {
    return await sharp(imageBuffer)
      .resize(width, height, {
        fit: options.fit || 'cover',
        withoutEnlargement: options.withoutEnlargement !== false,
      })
      .jpeg({ quality: options.quality || 85 })
      .toBuffer();
  } catch (error) {
    throw new Error(`IMAGE_PROCESSING_ERROR: ${error.message}`);
  }
};

/**
 * Crop image
 */
const crop = async (imageBuffer, left, top, width, height) => {
  try {
    return await sharp(imageBuffer)
      .extract({ left, top, width, height })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    throw new Error(`IMAGE_PROCESSING_ERROR: ${error.message}`);
  }
};

/**
 * Convert to JPEG
 */
const toJpeg = async (imageBuffer, quality = 85) => {
  try {
    return await sharp(imageBuffer)
      .jpeg({ quality })
      .toBuffer();
  } catch (error) {
    throw new Error(`IMAGE_PROCESSING_ERROR: ${error.message}`);
  }
};

/**
 * Convert to PNG
 */
const toPng = async (imageBuffer) => {
  try {
    return await sharp(imageBuffer)
      .png()
      .toBuffer();
  } catch (error) {
    throw new Error(`IMAGE_PROCESSING_ERROR: ${error.message}`);
  }
};

/**
 * Create thumbnail
 */
const createThumbnail = async (imageBuffer, size = 200) => {
  try {
    return await sharp(imageBuffer)
      .resize(size, size, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();
  } catch (error) {
    throw new Error(`IMAGE_PROCESSING_ERROR: ${error.message}`);
  }
};

/**
 * Compute SHA-256 hash of image
 */
const computeHash = (imageBuffer) => {
  return `0x${crypto.createHash('sha256').update(imageBuffer).digest('hex')}`;
};

/**
 * Validate image is within acceptable parameters
 */
const validateImage = async (imageBuffer, options = {}) => {
  const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
  const minWidth = options.minWidth || 100;
  const minHeight = options.minHeight || 100;
  const maxWidth = options.maxWidth || 5000;
  const maxHeight = options.maxHeight || 5000;
  const allowedFormats = options.allowedFormats || ['jpeg', 'png', 'webp', 'gif'];

  if (imageBuffer.length > maxSize) {
    return { valid: false, error: `Image exceeds maximum size of ${maxSize / 1024 / 1024}MB` };
  }

  try {
    const metadata = await sharp(imageBuffer).metadata();

    if (!allowedFormats.includes(metadata.format)) {
      return { valid: false, error: `Invalid format. Allowed: ${allowedFormats.join(', ')}` };
    }

    if (metadata.width < minWidth || metadata.height < minHeight) {
      return { valid: false, error: `Image too small. Minimum: ${minWidth}x${minHeight}` };
    }

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return { valid: false, error: `Image too large. Maximum: ${maxWidth}x${maxHeight}` };
    }

    return { valid: true, metadata };
  } catch (error) {
    return { valid: false, error: 'Invalid image file' };
  }
};

module.exports = {
  getMetadata,
  resize,
  crop,
  toJpeg,
  toPng,
  createThumbnail,
  computeHash,
  validateImage,
};
