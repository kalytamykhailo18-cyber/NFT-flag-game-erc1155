/**
 * Admin Controller
 * Handles all admin operations from Section 3.1
 */
const { Country, Region, Municipality, Place, PlacePhotoSlice, User, sequelize } = require('../models');
const ipfsService = require('../services/ipfs');
const serpApiService = require('../services/serpapi');
const sliceGenerator = require('../services/sliceGenerator');
const blockchainService = require('../services/blockchain');

// ==================== COUNTRY CRUD ====================

const createCountry = async (req, res, next) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name and code are required' },
      });
    }

    const country = await Country.create({ name, code });
    res.status(201).json({ success: true, data: country });
  } catch (error) {
    next(error);
  }
};

const getCountries = async (req, res, next) => {
  try {
    const countries = await Country.findAll({
      include: [{ association: 'regions', attributes: ['id'] }],
    });
    res.json({ success: true, data: countries });
  } catch (error) {
    next(error);
  }
};

const getCountry = async (req, res, next) => {
  try {
    const country = await Country.findByPk(req.params.id, {
      include: [{ association: 'regions' }],
    });

    if (!country) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Country not found' },
      });
    }

    res.json({ success: true, data: country });
  } catch (error) {
    next(error);
  }
};

const updateCountry = async (req, res, next) => {
  try {
    const country = await Country.findByPk(req.params.id);

    if (!country) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Country not found' },
      });
    }

    await country.update(req.body);
    res.json({ success: true, data: country });
  } catch (error) {
    next(error);
  }
};

const deleteCountry = async (req, res, next) => {
  try {
    const country = await Country.findByPk(req.params.id);

    if (!country) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Country not found' },
      });
    }

    await country.destroy();
    res.json({ success: true, message: 'Country deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== REGION CRUD ====================

const createRegion = async (req, res, next) => {
  try {
    const { country_id, name, code } = req.body;

    if (!country_id || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'country_id and name are required' },
      });
    }

    const region = await Region.create({ country_id, name, code });
    res.status(201).json({ success: true, data: region });
  } catch (error) {
    next(error);
  }
};

const getRegions = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.country_id) {
      where.country_id = req.query.country_id;
    }

    const regions = await Region.findAll({
      where,
      include: [{ association: 'country' }, { association: 'municipalities', attributes: ['id'] }],
    });
    res.json({ success: true, data: regions });
  } catch (error) {
    next(error);
  }
};

const getRegion = async (req, res, next) => {
  try {
    const region = await Region.findByPk(req.params.id, {
      include: [{ association: 'country' }, { association: 'municipalities' }],
    });

    if (!region) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Region not found' },
      });
    }

    res.json({ success: true, data: region });
  } catch (error) {
    next(error);
  }
};

const updateRegion = async (req, res, next) => {
  try {
    const region = await Region.findByPk(req.params.id);

    if (!region) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Region not found' },
      });
    }

    await region.update(req.body);
    res.json({ success: true, data: region });
  } catch (error) {
    next(error);
  }
};

const deleteRegion = async (req, res, next) => {
  try {
    const region = await Region.findByPk(req.params.id);

    if (!region) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Region not found' },
      });
    }

    await region.destroy();
    res.json({ success: true, message: 'Region deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== MUNICIPALITY CRUD ====================

const createMunicipality = async (req, res, next) => {
  try {
    const { region_id, name, latitude, longitude } = req.body;

    if (!region_id || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'region_id and name are required' },
      });
    }

    const municipality = await Municipality.create({ region_id, name, latitude, longitude });
    res.status(201).json({ success: true, data: municipality });
  } catch (error) {
    next(error);
  }
};

const getMunicipalities = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.region_id) {
      where.region_id = req.query.region_id;
    }

    const municipalities = await Municipality.findAll({
      where,
      include: [{ association: 'region', include: [{ association: 'country' }] }],
    });
    res.json({ success: true, data: municipalities });
  } catch (error) {
    next(error);
  }
};

const getMunicipality = async (req, res, next) => {
  try {
    const municipality = await Municipality.findByPk(req.params.id, {
      include: [{ association: 'region', include: [{ association: 'country' }] }, { association: 'places' }],
    });

    if (!municipality) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Municipality not found' },
      });
    }

    res.json({ success: true, data: municipality });
  } catch (error) {
    next(error);
  }
};

const updateMunicipality = async (req, res, next) => {
  try {
    const municipality = await Municipality.findByPk(req.params.id);

    if (!municipality) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Municipality not found' },
      });
    }

    await municipality.update(req.body);
    res.json({ success: true, data: municipality });
  } catch (error) {
    next(error);
  }
};

const deleteMunicipality = async (req, res, next) => {
  try {
    const municipality = await Municipality.findByPk(req.params.id);

    if (!municipality) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Municipality not found' },
      });
    }

    await municipality.destroy();
    res.json({ success: true, message: 'Municipality deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== PLACE CRUD ====================

const createPlace = async (req, res, next) => {
  try {
    const { token_id, municipality_id, name, address, latitude, longitude, location_type, category, price, pair_count } = req.body;

    if (!token_id || !municipality_id || !name || !latitude || !longitude || !location_type) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'token_id, municipality_id, name, latitude, longitude, and location_type are required' },
      });
    }

    const place = await Place.create({
      token_id,
      municipality_id,
      name,
      address,
      latitude,
      longitude,
      location_type,
      category: category || (location_type === 'premiumlocation' ? 'premium' : location_type === 'pluslocation' ? 'plus' : 'standard'),
      price: price || 0.01,
      pair_count: pair_count || 2,
    });

    res.status(201).json({ success: true, data: place });
  } catch (error) {
    next(error);
  }
};

const getPlaces = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.municipality_id) where.municipality_id = req.query.municipality_id;
    if (req.query.category) where.category = req.query.category;

    const places = await Place.findAll({
      where,
      include: [{ association: 'slices' }, { association: 'municipality' }],
    });
    res.json({ success: true, data: places });
  } catch (error) {
    next(error);
  }
};

const getPlace = async (req, res, next) => {
  try {
    const place = await Place.findByPk(req.params.id, {
      include: [
        { association: 'slices' },
        { association: 'municipality', include: [{ association: 'region', include: [{ association: 'country' }] }] },
      ],
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    res.json({ success: true, data: place });
  } catch (error) {
    next(error);
  }
};

const updatePlace = async (req, res, next) => {
  try {
    const place = await Place.findByPk(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    await place.update(req.body);
    res.json({ success: true, data: place });
  } catch (error) {
    next(error);
  }
};

const deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findByPk(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    await place.destroy();
    res.json({ success: true, message: 'Place deleted' });
  } catch (error) {
    next(error);
  }
};

const mintPlace = async (req, res, next) => {
  try {
    const place = await Place.findByPk(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    if (place.is_minted) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Place is already minted' },
      });
    }

    if (!place.metadata_uri) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Place must have metadata_uri before minting' },
      });
    }

    const result = await blockchainService.mintPlace(place.token_id, place.metadata_uri, place.metadata_hash);

    await place.update({ is_minted: true });

    res.json({ success: true, data: { place, transaction: result } });
  } catch (error) {
    next(error);
  }
};

// ==================== SLICE CRUD ====================

const addSlice = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const { pair_number, slice_position, slice_uri, image_sha256, latitude, longitude, price } = req.body;

    if (!pair_number || !slice_position || !slice_uri || !image_sha256) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'pair_number, slice_position, slice_uri, and image_sha256 are required' },
      });
    }

    const slice = await PlacePhotoSlice.create({
      place_id: placeId,
      pair_number,
      slice_position,
      slice_uri,
      image_sha256,
      latitude,
      longitude,
      price: price || 0.005,
      captured_at: new Date(),
    });

    res.status(201).json({ success: true, data: slice });
  } catch (error) {
    next(error);
  }
};

const getSlices = async (req, res, next) => {
  try {
    const slices = await PlacePhotoSlice.findAll({
      where: { place_id: req.params.placeId },
      order: [['pair_number', 'ASC'], ['slice_position', 'ASC']],
    });
    res.json({ success: true, data: slices });
  } catch (error) {
    next(error);
  }
};

const updateSlice = async (req, res, next) => {
  try {
    const slice = await PlacePhotoSlice.findByPk(req.params.id);

    if (!slice) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Slice not found' },
      });
    }

    await slice.update(req.body);
    res.json({ success: true, data: slice });
  } catch (error) {
    next(error);
  }
};

const deleteSlice = async (req, res, next) => {
  try {
    const slice = await PlacePhotoSlice.findByPk(req.params.id);

    if (!slice) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Slice not found' },
      });
    }

    await slice.destroy();
    res.json({ success: true, message: 'Slice deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== GENERATION ====================

const createPlaceFromCoordinates = async (req, res, next) => {
  try {
    const { latitude, longitude, municipality_id, location_type, category, pair_count, custom_name } = req.body;

    // Step 1: Validate inputs
    if (!latitude || !longitude || !municipality_id || !location_type) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'latitude, longitude, municipality_id, and location_type are required' },
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'latitude must be between -90 and 90' },
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'longitude must be between -180 and 180' },
      });
    }

    const municipality = await Municipality.findByPk(municipality_id, {
      include: [{ association: 'region', include: [{ association: 'country' }] }],
    });

    if (!municipality) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Municipality not found' },
      });
    }

    // Step 2: Generate token_id
    const placeCount = await Place.count({ where: { municipality_id } });
    const token_id = municipality_id * 1000 + placeCount + 1;

    // Step 3: Search for image using SerpAPI
    const searchQuery = `${municipality.name} ${location_type} ${latitude},${longitude}`;
    let imageUrl;
    try {
      imageUrl = await serpApiService.searchImage(searchQuery);
    } catch (error) {
      // Step 4: Fallback search
      const fallbackQuery = `${municipality.name} landmark`;
      imageUrl = await serpApiService.searchImage(fallbackQuery);
    }

    // Step 5: Download image
    const imageBuffer = await serpApiService.downloadImage(imageUrl);

    // Step 6 & 7: Divide image and upload slices
    const actualPairCount = pair_count || 2;
    const slicesData = await sliceGenerator.generateSlices(imageBuffer, actualPairCount);

    // Upload slices to IPFS and create records
    const transaction = await sequelize.transaction();
    try {
      // Upload base image
      const baseImageResult = await ipfsService.uploadImage(imageBuffer, `place_${token_id}_base.jpg`);

      // Create place
      const placeName = custom_name || `${location_type}_${placeCount + 1}`;
      const placeCategory = category || (location_type === 'premiumlocation' ? 'premium' : location_type === 'pluslocation' ? 'plus' : 'standard');

      const place = await Place.create({
        token_id,
        municipality_id,
        name: placeName,
        latitude,
        longitude,
        location_type,
        category: placeCategory,
        pair_count: actualPairCount,
        base_image_uri: baseImageResult.uri,
      }, { transaction });

      // Upload and create slices
      const slices = [];
      for (const sliceData of slicesData) {
        const sliceResult = await ipfsService.uploadImage(
          sliceData.buffer,
          `place_${token_id}_pair${sliceData.pair_number}_pos${sliceData.slice_position}.jpg`
        );

        const slice = await PlacePhotoSlice.create({
          place_id: place.id,
          pair_number: sliceData.pair_number,
          slice_position: sliceData.slice_position,
          slice_uri: sliceResult.uri,
          image_sha256: sliceData.hash,
          latitude,
          longitude,
          captured_at: new Date(),
        }, { transaction });

        slices.push(slice);
      }

      // Step 8-11: Create and upload metadata
      const metadata = await ipfsService.createPlaceMetadata(place, slices, municipality);
      const metadataResult = await ipfsService.uploadMetadata(metadata, `place_${token_id}_metadata.json`);

      // Step 12: Update place with metadata
      await place.update({
        metadata_uri: metadataResult.uri,
        metadata_hash: metadataResult.hash,
      }, { transaction });

      await transaction.commit();

      // Step 13: Return result
      res.status(201).json({
        success: true,
        place: await Place.findByPk(place.id, { include: [{ association: 'slices' }] }),
        slices,
        metadata_uri: metadataResult.uri,
        token_id,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

const checkImageAvailability = async (req, res, next) => {
  try {
    const { latitude, longitude, municipality_name } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'latitude and longitude are required' },
      });
    }

    const searchQuery = `${municipality_name || ''} location ${latitude},${longitude}`;
    const available = await serpApiService.checkImageAvailability(searchQuery);

    res.json({ success: true, data: { available } });
  } catch (error) {
    next(error);
  }
};

const generateSlicesPreview = async (req, res, next) => {
  try {
    const { latitude, longitude, municipality_name, pair_count } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'latitude and longitude are required' },
      });
    }

    const searchQuery = `${municipality_name || ''} location ${latitude},${longitude}`;
    const imageUrl = await serpApiService.searchImage(searchQuery);
    const imageBuffer = await serpApiService.downloadImage(imageUrl);
    const slicesData = await sliceGenerator.generateSlices(imageBuffer, pair_count || 2);

    // Return base64 previews
    const previews = slicesData.map(slice => ({
      pair_number: slice.pair_number,
      slice_position: slice.slice_position,
      preview: `data:image/jpeg;base64,${slice.buffer.toString('base64')}`,
    }));

    res.json({ success: true, data: { previews, original_image: imageUrl } });
  } catch (error) {
    next(error);
  }
};

// ==================== DATABASE ====================

const seedDatabase = async (req, res, next) => {
  try {
    // This will be implemented in scripts/seed.js
    res.json({ success: true, message: 'Use npm run seed to seed the database' });
  } catch (error) {
    next(error);
  }
};

const resetDatabase = async (req, res, next) => {
  try {
    await sequelize.sync({ force: true });
    res.json({ success: true, message: 'Database reset complete' });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [countries, regions, municipalities, places, users, slices] = await Promise.all([
      Country.count(),
      Region.count(),
      Municipality.count(),
      Place.count(),
      User.count(),
      PlacePhotoSlice.count(),
    ]);

    res.json({
      success: true,
      data: { countries, regions, municipalities, places, users, slices },
    });
  } catch (error) {
    next(error);
  }
};

const getIpfsStatus = async (req, res, next) => {
  try {
    const status = await ipfsService.getStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Countries
  createCountry,
  getCountries,
  getCountry,
  updateCountry,
  deleteCountry,
  // Regions
  createRegion,
  getRegions,
  getRegion,
  updateRegion,
  deleteRegion,
  // Municipalities
  createMunicipality,
  getMunicipalities,
  getMunicipality,
  updateMunicipality,
  deleteMunicipality,
  // Places
  createPlace,
  getPlaces,
  getPlace,
  updatePlace,
  deletePlace,
  mintPlace,
  // Slices
  addSlice,
  getSlices,
  updateSlice,
  deleteSlice,
  // Generation
  createPlaceFromCoordinates,
  checkImageAvailability,
  generateSlicesPreview,
  // Database
  seedDatabase,
  resetDatabase,
  getStats,
  getIpfsStatus,
};
