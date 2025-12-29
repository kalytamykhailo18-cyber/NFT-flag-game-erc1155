/**
 * Place Controller
 * Endpoints from Section 3.2
 */
const { Place, PlacePhotoSlice, User, Interest, UserPlaceSlice, sequelize } = require('../../database/models');
const blockchainService = require('../services/blockchain');

/**
 * Get all places with optional filters
 * Hides base_image_uri unless user has shown interest
 */
const getPlaces = async (req, res, next) => {
  try {
    const { wallet_address } = req.query; // Optional - if provided, check interest
    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.municipality_id) where.municipality_id = req.query.municipality_id;
    if (req.query.is_claimed !== undefined) where.is_claimed = req.query.is_claimed === 'true';

    const places = await Place.findAll({
      where,
      include: [
        { association: 'slices', attributes: ['id', 'pair_number', 'slice_position', 'is_owned', 'price'] },
        { association: 'municipality' },
        { association: 'interests', attributes: ['id', 'user_id'] },
      ],
    });

    // Get user if wallet provided
    let user = null;
    if (wallet_address) {
      user = await User.findOne({ where: { wallet_address: wallet_address.toLowerCase() } });
    }

    // Hide base images if user hasn't shown interest
    const placesData = places.map(place => {
      const placeData = place.toJSON();

      // Check if user has shown interest in this place
      let hasInterest = false;
      if (user && placeData.interests) {
        hasInterest = placeData.interests.some(interest => interest.user_id === user.id);
      }

      // Hide base_image_uri if no interest and place is not claimed
      if (!hasInterest && !placeData.is_claimed) {
        placeData.base_image_uri = null;
        placeData.base_image_hidden = true;
      }

      return placeData;
    });

    res.json({ success: true, data: placesData });
  } catch (error) {
    next(error);
  }
};

/**
 * Get place detail with slices and progress
 * Hides slice images unless user has shown interest
 */
const getPlace = async (req, res, next) => {
  try {
    const { wallet_address } = req.query; // Optional - if provided, check interest

    const place = await Place.findByPk(req.params.id, {
      include: [
        { association: 'slices', include: [{ association: 'owner', attributes: ['id', 'wallet_address'] }] },
        { association: 'municipality', include: [{ association: 'region', include: [{ association: 'country' }] }] },
        { association: 'interests', attributes: ['id'] },
        { association: 'claimer', attributes: ['id', 'wallet_address', 'username'] },
      ],
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    // Check if user has shown interest (default to false if no wallet)
    let hasInterest = false;
    if (wallet_address) {
      const user = await User.findOne({ where: { wallet_address: wallet_address.toLowerCase() } });
      if (user) {
        const interest = await Interest.findOne({
          where: { place_id: place.id, user_id: user.id },
        });
        hasInterest = !!interest;
      }
    }

    // Convert place to JSON and hide images if no interest OR no wallet
    const placeData = place.toJSON();

    // Hide base_image_uri if no interest and not claimed
    if (!hasInterest && !placeData.is_claimed) {
      placeData.base_image_uri = null;
      placeData.base_image_hidden = true;
    }

    // Hide slice images if no interest OR no wallet
    if (placeData.slices) {
      placeData.slices = placeData.slices.map(slice => {
        // Hide images if: no wallet provided OR (wallet provided but no interest) OR slice not owned
        if (!slice.is_owned && !hasInterest) {
          // Hide image for non-interested users or users without wallet
          slice.slice_uri = null;
          slice.image_sha256 = null;
          slice.hidden = true; // Flag to indicate image is hidden
        }
        return slice;
      });
    }

    res.json({ success: true, data: placeData, has_interest: hasInterest });
  } catch (error) {
    next(error);
  }
};

/**
 * Get slices only for a place
 * Hides slice images unless user has shown interest
 */
const getPlaceSlices = async (req, res, next) => {
  try {
    const place_id = req.params.id;
    const { wallet_address } = req.query; // Optional - if provided, check interest

    const slices = await PlacePhotoSlice.findAll({
      where: { place_id },
      include: [{ association: 'owner', attributes: ['id', 'wallet_address'] }],
      order: [['pair_number', 'ASC'], ['slice_position', 'ASC']],
    });

    // Check if user has shown interest (default to false if no wallet)
    let hasInterest = false;
    if (wallet_address) {
      const user = await User.findOne({ where: { wallet_address: wallet_address.toLowerCase() } });
      if (user) {
        const interest = await Interest.findOne({
          where: { place_id, user_id: user.id },
        });
        hasInterest = !!interest;
      }
    }

    // Hide slice images if no interest OR no wallet
    const filteredSlices = slices.map(slice => {
      const sliceData = slice.toJSON();
      // Hide images if: no wallet provided OR (wallet provided but no interest) OR slice not owned
      if (!sliceData.is_owned && !hasInterest) {
        // Hide image for non-interested users or users without wallet
        sliceData.slice_uri = null;
        sliceData.image_sha256 = null;
        sliceData.hidden = true; // Flag to indicate image is hidden
      }
      return sliceData;
    });

    res.json({ success: true, data: filteredSlices, has_interest: hasInterest });
  } catch (error) {
    next(error);
  }
};

/**
 * Add interest to a place
 */
const addInterest = async (req, res, next) => {
  try {
    const { wallet_address } = req.body;
    const place_id = req.params.id;

    // Check place exists and not claimed
    const place = await Place.findByPk(place_id);
    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    if (place.is_claimed) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cannot express interest in claimed place' },
      });
    }

    // Get or create user
    const [user] = await User.findOrCreate({
      where: { wallet_address: wallet_address.toLowerCase() },
      defaults: { wallet_address: wallet_address.toLowerCase() },
    });

    // Create interest (unique constraint will prevent duplicates)
    await Interest.create({ place_id, user_id: user.id });

    res.status(201).json({ success: true, message: 'Interest added' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Already expressed interest' },
      });
    }
    next(error);
  }
};

/**
 * Remove interest from a place
 */
const removeInterest = async (req, res, next) => {
  try {
    const { wallet_address } = req.body;
    const place_id = req.params.id;

    const user = await User.findOne({ where: { wallet_address: wallet_address.toLowerCase() } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const deleted = await Interest.destroy({ where: { place_id, user_id: user.id } });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Interest not found' },
      });
    }

    res.json({ success: true, message: 'Interest removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interested users for a place
 */
const getInterestedUsers = async (req, res, next) => {
  try {
    const interests = await Interest.findAll({
      where: { place_id: req.params.id },
      include: [{ association: 'user', attributes: ['id', 'wallet_address', 'username', 'category'] }],
    });

    const users = interests.map(i => i.user);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * Claim a completed place
 * Section 4.3 - Place Claim logic
 */
const claimPlace = async (req, res, next) => {
  try {
    const { wallet_address } = req.body;
    const place_id = req.params.id;

    // Step 1: Validate inputs
    const place = await Place.findByPk(place_id, { include: [{ association: 'slices' }] });

    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    if (place.is_claimed) {
      return res.status(400).json({
        success: false,
        error: { code: 'PLACE_ALREADY_CLAIMED', message: 'Place has already been claimed' },
      });
    }

    if (!place.is_minted) {
      return res.status(400).json({
        success: false,
        error: { code: 'PLACE_NOT_MINTED', message: 'Place is not minted on blockchain' },
      });
    }

    // Get user
    const user = await User.findOne({ where: { wallet_address: wallet_address.toLowerCase() } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    // Step 2: Verify user has completed all pairs
    const userSlices = await UserPlaceSlice.findAll({
      where: { user_id: user.id, place_id },
      include: [{ association: 'slice' }],
    });

    // Calculate completed pairs
    const slicesByPair = {};
    for (const us of userSlices) {
      const pairNum = us.slice.pair_number;
      if (!slicesByPair[pairNum]) slicesByPair[pairNum] = [];
      slicesByPair[pairNum].push(us.slice.slice_position);
    }

    let completedPairs = 0;
    for (let i = 1; i <= place.pair_count; i++) {
      const positions = slicesByPair[i] || [];
      if (positions.includes(1) && positions.includes(2)) {
        completedPairs++;
      }
    }

    if (completedPairs !== place.pair_count) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAIRS_NOT_COMPLETE',
          message: `You have completed ${completedPairs}/${place.pair_count} pairs. Complete all pairs to claim.`,
        },
      });
    }

    // Step 3-4: Call smart contract
    const txResult = await blockchainService.claimPlace(place.token_id, wallet_address);

    // Step 5: Update place
    const transaction = await sequelize.transaction();
    try {
      await place.update({
        is_claimed: true,
        claimed_by: user.id,
        claimed_at: new Date(),
        claim_tx_hash: txResult.transactionHash,
      }, { transaction });

      // Step 6: Update user
      await user.update({
        total_places_claimed: user.total_places_claimed + 1,
        reputation_score: user.reputation_score + 100,
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    // Step 7: Return success
    res.json({
      success: true,
      place: await Place.findByPk(place_id),
      transaction: {
        hash: txResult.transactionHash,
        block_number: txResult.blockNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlaces,
  getPlace,
  getPlaceSlices,
  addInterest,
  removeInterest,
  getInterestedUsers,
  claimPlace,
};
