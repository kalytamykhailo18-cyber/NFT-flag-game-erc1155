/**
 * Auction routes
 * Endpoints from Section 3.2
 */
const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { validateWalletAddress } = require('../middleware/auth');

// List and detail
router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuction);

// Create and manage
router.post('/', validateWalletAddress, auctionController.createAuction);
router.post('/:id/bid', validateWalletAddress, auctionController.placeBid);
router.post('/:id/buyout', validateWalletAddress, auctionController.buyout);
router.delete('/:id', validateWalletAddress, auctionController.cancelAuction);

module.exports = router;
