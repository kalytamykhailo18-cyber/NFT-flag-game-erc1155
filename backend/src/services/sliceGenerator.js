/**
 * Slice Generator Service
 * Divides ONE image into multiple slices (Section 13.2)
 */
const sharp = require('sharp');
const crypto = require('crypto');

/**
 * Generate slices from an image
 * For pair_count=2: creates 2x2 grid = 4 slices
 * For pair_count=3: creates 2x3 grid = 6 slices
 *
 * @param {Buffer} imageBuffer - The source image buffer
 * @param {number} pairCount - Number of pairs (default 2)
 * @returns {Array} Array of slice objects with buffer, pair_number, slice_position, hash
 */
const generateSlices = async (imageBuffer, pairCount = 2) => {
  try {
    // Get image metadata
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Calculate grid dimensions
    // 2 columns (for slice positions 'left' and 'right')
    // pairCount rows (for each pair)
    const cols = 2;
    const rows = pairCount;

    const sliceWidth = Math.floor(width / cols);
    const sliceHeight = Math.floor(height / rows);

    const slices = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pair_number = row + 1;
        const slice_position = col === 0 ? 'left' : 'right';

        // Extract slice
        const left = col * sliceWidth;
        const top = row * sliceHeight;

        const sliceBuffer = await sharp(imageBuffer)
          .extract({
            left,
            top,
            width: sliceWidth,
            height: sliceHeight,
          })
          .jpeg({ quality: 85 })
          .toBuffer();

        // Compute SHA-256 hash
        const hash = `0x${crypto.createHash('sha256').update(sliceBuffer).digest('hex')}`;

        slices.push({
          buffer: sliceBuffer,
          pair_number,
          slice_position,
          hash,
          dimensions: {
            width: sliceWidth,
            height: sliceHeight,
          },
        });
      }
    }

    return slices;
  } catch (error) {
    console.error('Slice generation error:', error);
    throw new Error(`IMAGE_PROCESSING_ERROR: ${error.message}`);
  }
};

/**
 * Resize image to standard size before slicing
 */
const resizeImage = async (imageBuffer, maxWidth = 1200, maxHeight = 1200) => {
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Only resize if larger than max dimensions
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return await image
        .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();
    }

    return imageBuffer;
  } catch (error) {
    console.error('Resize error:', error);
    throw new Error(`IMAGE_PROCESSING_ERROR: ${error.message}`);
  }
};

/**
 * Compute hash of an image buffer
 */
const computeHash = (buffer) => {
  return `0x${crypto.createHash('sha256').update(buffer).digest('hex')}`;
};

module.exports = {
  generateSlices,
  resizeImage,
  computeHash,
};
