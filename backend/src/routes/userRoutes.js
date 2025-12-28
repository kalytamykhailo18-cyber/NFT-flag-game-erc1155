/**
 * User routes
 * Endpoints from Section 3.2
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User management
router.get('/:walletAddress', userController.getUser);
router.get('/:walletAddress/slices', userController.getUserSlices);
router.get('/:walletAddress/places', userController.getUserPlaces);
router.get('/:walletAddress/progress', userController.getUserProgress);
router.get('/:walletAddress/places/:placeId/progress', userController.getUserPlaceProgress);

module.exports = router;
