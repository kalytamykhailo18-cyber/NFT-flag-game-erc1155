/**
 * User Controller
 * Endpoints from Section 3.2
 */
const { User, Place, PlacePhotoSlice, UserPlaceSlice } = require('../../database/models');

/**
 * Get or create user by wallet address
 */
const getUser = async (req, res, next) => {
  try {
    const wallet_address = req.params.walletAddress.toLowerCase();

    const [user, created] = await User.findOrCreate({
      where: { wallet_address },
      defaults: { wallet_address },
    });

    res.json({ success: true, data: user, created });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's owned slices
 */
const getUserSlices = async (req, res, next) => {
  try {
    const wallet_address = req.params.walletAddress.toLowerCase();

    const user = await User.findOne({ where: { wallet_address } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const userSlices = await UserPlaceSlice.findAll({
      where: { user_id: user.id },
      include: [
        { association: 'slice' },
        { association: 'place', attributes: ['id', 'name', 'token_id', 'category'] },
      ],
    });

    res.json({ success: true, data: userSlices });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's claimed places
 */
const getUserPlaces = async (req, res, next) => {
  try {
    const wallet_address = req.params.walletAddress.toLowerCase();

    const user = await User.findOne({ where: { wallet_address } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const places = await Place.findAll({
      where: { claimed_by: user.id },
      include: [{ association: 'municipality' }],
    });

    res.json({ success: true, data: places });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's progress on all places they have slices in
 */
const getUserProgress = async (req, res, next) => {
  try {
    const wallet_address = req.params.walletAddress.toLowerCase();

    const user = await User.findOne({ where: { wallet_address } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    // Get all user's slices grouped by place
    const userSlices = await UserPlaceSlice.findAll({
      where: { user_id: user.id },
      include: [
        { association: 'slice' },
        { association: 'place' },
      ],
    });

    // Group by place_id
    const placeMap = {};
    for (const us of userSlices) {
      if (!placeMap[us.place_id]) {
        placeMap[us.place_id] = {
          place: us.place,
          slices: [],
        };
      }
      placeMap[us.place_id].slices.push(us.slice);
    }

    // Calculate progress for each place
    const progress = Object.values(placeMap).map(({ place, slices }) => {
      const total_slices = place.pair_count * 2;
      const owned_slices = slices.length;

      // Calculate completed pairs
      const slicesByPair = {};
      for (const slice of slices) {
        if (!slicesByPair[slice.pair_number]) slicesByPair[slice.pair_number] = [];
        slicesByPair[slice.pair_number].push(slice.slice_position);
      }

      let completed_pairs = 0;
      for (let i = 1; i <= place.pair_count; i++) {
        const positions = slicesByPair[i] || [];
        if (positions.includes('left') && positions.includes('right')) {
          completed_pairs++;
        }
      }

      return {
        place_id: place.id,
        place_name: place.name,
        token_id: place.token_id,
        category: place.category,
        owned_slices,
        total_slices,
        completed_pairs,
        pair_count: place.pair_count,
        is_ready_to_claim: completed_pairs === place.pair_count,
        is_claimed: place.is_claimed,
      };
    });

    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's progress on a specific place
 */
const getUserPlaceProgress = async (req, res, next) => {
  try {
    const wallet_address = req.params.walletAddress.toLowerCase();
    const place_id = parseInt(req.params.placeId);

    const user = await User.findOne({ where: { wallet_address } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }

    const place = await Place.findByPk(place_id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Place not found' },
      });
    }

    // Get user's slices for this place
    const userSlices = await UserPlaceSlice.findAll({
      where: { user_id: user.id, place_id },
      include: [{ association: 'slice' }],
    });

    const total_slices = place.pair_count * 2;
    const owned_slices = userSlices.length;

    // Calculate completed pairs
    const slicesByPair = {};
    for (const us of userSlices) {
      if (!slicesByPair[us.slice.pair_number]) slicesByPair[us.slice.pair_number] = [];
      slicesByPair[us.slice.pair_number].push(us.slice.slice_position);
    }

    let completed_pairs = 0;
    for (let i = 1; i <= place.pair_count; i++) {
      const positions = slicesByPair[i] || [];
      if (positions.includes('left') && positions.includes('right')) {
        completed_pairs++;
      }
    }

    res.json({
      success: true,
      progress: {
        place_id,
        place_name: place.name,
        token_id: place.token_id,
        owned_slices,
        total_slices,
        completed_pairs,
        pair_count: place.pair_count,
        is_ready_to_claim: completed_pairs === place.pair_count,
        is_claimed: place.is_claimed,
        owned_slice_ids: userSlices.map(us => us.slice_id),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
  getUserSlices,
  getUserPlaces,
  getUserProgress,
  getUserPlaceProgress,
};
