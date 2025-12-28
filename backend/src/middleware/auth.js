/**
 * Authentication middleware
 */
const config = require('../config');

/**
 * Verify admin API key from X-Admin-Key header
 */
const verifyAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing X-Admin-Key header',
      },
    });
  }

  if (adminKey !== config.adminApiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid admin key',
      },
    });
  }

  next();
};

/**
 * Validate wallet address format
 */
const validateWalletAddress = (req, res, next) => {
  const walletAddress = req.body.wallet_address || req.params.walletAddress;

  if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid wallet address format',
      },
    });
  }

  next();
};

module.exports = {
  verifyAdmin,
  validateWalletAddress,
};
