/**
 * Admin routes - protected by X-Admin-Key
 * Endpoints from Section 3.1
 */
const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply admin auth to all routes
router.use(verifyAdmin);

// Geography CRUD
router.post('/countries', adminController.createCountry);
router.get('/countries', adminController.getCountries);
router.get('/countries/:id', adminController.getCountry);
router.put('/countries/:id', adminController.updateCountry);
router.delete('/countries/:id', adminController.deleteCountry);

router.post('/regions', adminController.createRegion);
router.get('/regions', adminController.getRegions);
router.get('/regions/:id', adminController.getRegion);
router.put('/regions/:id', adminController.updateRegion);
router.delete('/regions/:id', adminController.deleteRegion);

router.post('/municipalities', adminController.createMunicipality);
router.get('/municipalities', adminController.getMunicipalities);
router.get('/municipalities/:id', adminController.getMunicipality);
router.put('/municipalities/:id', adminController.updateMunicipality);
router.delete('/municipalities/:id', adminController.deleteMunicipality);

// Place CRUD
router.post('/places', adminController.createPlace);
router.get('/places', adminController.getPlaces);
router.get('/places/:id', adminController.getPlace);
router.put('/places/:id', adminController.updatePlace);
router.delete('/places/:id', adminController.deletePlace);
router.post('/places/:id/mint', adminController.mintPlace);

// Slice CRUD
router.post('/places/:placeId/slices', adminController.addSlice);
router.get('/places/:placeId/slices', adminController.getSlices);
router.put('/slices/:id', adminController.updateSlice);
router.delete('/slices/:id', adminController.deleteSlice);

// Generation
router.post('/place-from-coordinates', adminController.createPlaceFromCoordinates);
router.post('/check-image-availability', adminController.checkImageAvailability);
router.post('/generate-slices-preview', adminController.generateSlicesPreview);

// Database
router.post('/seed', adminController.seedDatabase);
router.post('/reset', adminController.resetDatabase);
router.get('/stats', adminController.getStats);
router.get('/ipfs-status', adminController.getIpfsStatus);

module.exports = router;
