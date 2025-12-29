/**
 * Geography Controller
 * Public read-only endpoints from Section 3.2
 */
const { Country, Region, Municipality, Place, User, Interest, sequelize } = require('../../database/models');

const getCountries = async (req, res, next) => {
  try {
    const countries = await Country.findAll({
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('regions.id')), 'region_count'],
        ],
      },
      include: [{ association: 'regions', attributes: [] }],
      group: ['Country.id'],
    });
    res.json({ success: true, data: countries });
  } catch (error) {
    next(error);
  }
};

const getCountry = async (req, res, next) => {
  try {
    const country = await Country.findByPk(req.params.id, {
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('regions.id')), 'region_count'],
        ],
      },
      include: [{ association: 'regions', attributes: [] }],
      group: ['Country.id'],
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

const getCountryRegions = async (req, res, next) => {
  try {
    const regions = await Region.findAll({
      where: { country_id: req.params.id },
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('municipalities.id')), 'municipality_count'],
        ],
      },
      include: [{ association: 'municipalities', attributes: [] }],
      group: ['Region.id'],
    });
    res.json({ success: true, data: regions });
  } catch (error) {
    next(error);
  }
};

const getRegion = async (req, res, next) => {
  try {
    const region = await Region.findByPk(req.params.id, {
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('municipalities.id')), 'municipality_count'],
        ],
      },
      include: [
        { association: 'country' },
        { association: 'municipalities', attributes: [] },
      ],
      group: ['Region.id', 'country.id'],
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

const getRegionMunicipalities = async (req, res, next) => {
  try {
    const municipalities = await Municipality.findAll({
      where: { region_id: req.params.id },
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('places.id')), 'place_count'],
        ],
      },
      include: [{ association: 'places', attributes: [] }],
      group: ['Municipality.id'],
    });
    res.json({ success: true, data: municipalities });
  } catch (error) {
    next(error);
  }
};

const getMunicipality = async (req, res, next) => {
  try {
    const municipality = await Municipality.findByPk(req.params.id, {
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('places.id')), 'place_count'],
        ],
      },
      include: [
        { association: 'region', include: [{ association: 'country' }] },
        { association: 'places', attributes: [] },
      ],
      group: ['Municipality.id', 'region.id', 'region->country.id'],
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

const getMunicipalityPlaces = async (req, res, next) => {
  try {
    const places = await Place.findAll({
      where: { municipality_id: req.params.id },
      include: [
        { association: 'slices', attributes: ['id', 'pair_number', 'slice_position', 'is_owned'] },
      ],
    });
    res.json({ success: true, data: places });
  } catch (error) {
    next(error);
  }
};

const getUserRankings = async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['total_places_claimed', 'DESC'], ['total_slices_owned', 'DESC']],
      limit: 100,
      attributes: ['id', 'wallet_address', 'username', 'total_places_claimed', 'total_slices_owned'],
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const getPlaceRankings = async (req, res, next) => {
  try {
    const places = await Place.findAll({
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('interests.id')), 'interest_count'],
        ],
      },
      include: [
        { association: 'interests', attributes: [] },
        { association: 'municipality' },
      ],
      group: ['Place.id', 'municipality.id'],
      order: [[sequelize.literal('interest_count'), 'DESC']],
      limit: 100,
    });
    res.json({ success: true, data: places });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCountries,
  getCountry,
  getCountryRegions,
  getRegion,
  getRegionMunicipalities,
  getMunicipality,
  getMunicipalityPlaces,
  getUserRankings,
  getPlaceRankings,
};
