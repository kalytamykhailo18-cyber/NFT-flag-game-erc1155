/**
 * Public geography routes (read-only)
 * Endpoints from Section 3.2
 */
const express = require('express');
const router = express.Router();
const geographyController = require('../controllers/geographyController');

// Countries
router.get('/countries', geographyController.getCountries);
router.get('/countries/:id', geographyController.getCountry);
router.get('/countries/:id/regions', geographyController.getCountryRegions);

// Regions
router.get('/regions/:id', geographyController.getRegion);
router.get('/regions/:id/municipalities', geographyController.getRegionMunicipalities);

// Municipalities
router.get('/municipalities/:id', geographyController.getMunicipality);
router.get('/municipalities/:id/places', geographyController.getMunicipalityPlaces);

module.exports = router;
