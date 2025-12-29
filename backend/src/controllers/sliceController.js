/**
 * Slice Controller
 * Endpoints from Section 3.2
 * Business logic from Section 4.2
 */
const { Place, PlacePhotoSlice, User, UserPlaceSlice, Interest, sequelize } = require('../../database/models');

/**
 * Get slice detail
 */
const getSlice = async (req, res, next) => {
  try {
    const slice = await PlacePhotoSlice.findByPk(req.params.id, {
      include: [
        { association: 'place' },
        { association: 'owner', attributes: ['id', 'wallet_address', 'username'] },
      ],
    });

    if (!slice) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Slice not found' },
      });
    }

    res.json({ success: true, data: slice });
  } catch (error) {
    next(error);
  }
};

/**
 * Purchase a slice
 * Section 4.2 - Slice Purchase logic
 */
const purchaseSlice = async (req, res, next) => {
  try {
    const { wallet_address, tx_hash } = req.body;
    const slice_id = parseInt(req.params.id);

    // Step 1: Validate inputs
    if (!wallet_address) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'wallet_address is required' },
      });
    }

    // Get slice with place
    const slice = await PlacePhotoSlice.findByPk(slice_id, {
      include: [{ association: 'place' }],
    });

    if (!slice) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Slice not found' },
      });
    }

    // Step 3: Check slice is available
    if (slice.is_owned) {
      return res.status(400).json({
        success: false,
        error: { code: 'SLICE_ALREADY_OWNED', message: 'This slice has already been purchased' },
      });
    }

    // Check place is not claimed
    if (slice.place.is_claimed) {
      return res.status(400).json({
        success: false,
        error: { code: 'PLACE_ALREADY_CLAIMED', message: 'This place has already been claimed' },
      });
    }

    // Step 2: Get or create user
    const [user] = await User.findOrCreate({
      where: { wallet_address: wallet_address.toLowerCase() },
      defaults: { wallet_address: wallet_address.toLowerCase() },
    });

    // Use transaction for multi-table operations
    const transaction = await sequelize.transaction();

    try {
      // Step 4: Create UserPlaceSlice record
      await UserPlaceSlice.create({
        user_id: user.id,
        place_id: slice.place_id,
        slice_id: slice.id,
        purchased_at: new Date(),
        purchase_price: slice.price,
        tx_hash,
      }, { transaction });

      // Step 5: Update slice
      await slice.update({
        is_owned: true,
        owned_by: user.id,
      }, { transaction });

      // Step 6: Update user
      await user.update({
        total_slices_owned: user.total_slices_owned + 1,
      }, { transaction });

      // Remove interest if exists (per Section 4.5)
      await Interest.destroy({
        where: { place_id: slice.place_id, user_id: user.id },
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    // Step 7: Calculate progress
    const userSlices = await UserPlaceSlice.findAll({
      where: { user_id: user.id, place_id: slice.place_id },
      include: [{ association: 'slice' }],
    });

    const place = slice.place;
    const total_slices = place.pair_count * 2;
    const owned_slices = userSlices.length;

    // Calculate completed pairs
    const slicesByPair = {};
    for (const us of userSlices) {
      const pairNum = us.slice.pair_number;
      if (!slicesByPair[pairNum]) slicesByPair[pairNum] = [];
      slicesByPair[pairNum].push(us.slice.slice_position);
    }

    let completed_pairs = 0;
    for (let i = 1; i <= place.pair_count; i++) {
      const positions = slicesByPair[i] || [];
      if (positions.includes(1) && positions.includes(2)) {
        completed_pairs++;
      }
    }

    const is_ready_to_claim = completed_pairs === place.pair_count;

    // Step 8: Return response
    res.json({
      success: true,
      slice: await PlacePhotoSlice.findByPk(slice_id),
      progress: {
        owned_slices,
        total_slices,
        completed_pairs,
        pair_count: place.pair_count,
        is_ready_to_claim,
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { code: 'SLICE_ALREADY_OWNED', message: 'You already own this slice' },
      });
    }
    next(error);
  }
};

module.exports = {
  getSlice,
  purchaseSlice,
};
