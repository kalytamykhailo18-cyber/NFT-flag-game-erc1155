/**
 * Slice routes
 * Endpoints from Section 3.2
 */
const express = require('express');
const router = express.Router();
const sliceController = require('../controllers/sliceController');
const { validateWalletAddress } = require('../middleware/auth');

// Get slice detail
router.get('/:id', sliceController.getSlice);

// Purchase slice
router.post('/:id/purchase', validateWalletAddress, sliceController.purchaseSlice);

module.exports = router;
