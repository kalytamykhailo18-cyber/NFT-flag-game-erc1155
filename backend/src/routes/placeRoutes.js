/**
 * Place routes
 * Endpoints from Section 3.2
 */
const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');
const { validateWalletAddress } = require('../middleware/auth');

// List and detail
router.get('/', placeController.getPlaces);
router.get('/:id', placeController.getPlace);
router.get('/:id/slices', placeController.getPlaceSlices);

// Interest
router.post('/:id/interest', validateWalletAddress, placeController.addInterest);
router.delete('/:id/interest', validateWalletAddress, placeController.removeInterest);
router.get('/:id/interested-users', placeController.getInterestedUsers);

// Claim
router.post('/:id/claim', validateWalletAddress, placeController.claimPlace);

module.exports = router;
