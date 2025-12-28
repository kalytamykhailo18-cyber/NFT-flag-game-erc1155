/**
 * Main routes index
 */
const express = require('express');
const router = express.Router();

const adminRoutes = require('./adminRoutes');
const geographyRoutes = require('./geographyRoutes');
const placeRoutes = require('./placeRoutes');
const sliceRoutes = require('./sliceRoutes');
const userRoutes = require('./userRoutes');
const auctionRoutes = require('./auctionRoutes');

// Admin routes (protected by X-Admin-Key)
router.use('/admin', adminRoutes);

// Public routes
router.use('/', geographyRoutes);
router.use('/places', placeRoutes);
router.use('/slices', sliceRoutes);
router.use('/users', userRoutes);
router.use('/auctions', auctionRoutes);

module.exports = router;
