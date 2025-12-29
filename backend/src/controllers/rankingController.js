/**
 * Ranking Controller
 * Endpoints for user and place rankings
 */
const { User, Place, UserPlaceSlice, Interest, sequelize } = require('../../database/models');

/**
 * Get user rankings
 * Ranked by: places_claimed DESC, slices_owned DESC, reputation_score DESC
 */
const getUserRankings = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'wallet_address',
        'username',
        'category',
        'reputation_score',
        [
          sequelize.literal(`(
            SELECT COUNT(DISTINCT places.id)
            FROM places
            WHERE places.claimed_by = "User"."id"
          )`),
          'places_claimed'
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM user_place_slices
            WHERE user_place_slices.user_id = "User"."id"
          )`),
          'slices_owned'
        ],
      ],
      order: [
        [sequelize.literal('places_claimed'), 'DESC'],
        [sequelize.literal('slices_owned'), 'DESC'],
        ['reputation_score', 'DESC'],
      ],
      limit: 100,
    });

    // Add rank numbers
    const rankings = users.map((user, index) => ({
      rank: index + 1,
      ...user.toJSON(),
    }));

    res.json({ success: true, data: rankings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get place rankings
 * Ranked by: interest_count DESC, is_claimed ASC (unclaimed first)
 */
const getPlaceRankings = async (req, res, next) => {
  try {
    const [places] = await sequelize.query(`
      SELECT
        p.id,
        p.name,
        p.token_id,
        p.category,
        p.base_image_uri,
        p.municipality_id,
        p.is_claimed,
        p.claimed_by,
        COUNT(i.id) as interest_count
      FROM places p
      LEFT JOIN interests i ON p.id = i.place_id
      GROUP BY p.id, p.name, p.token_id, p.category, p.base_image_uri, p.municipality_id, p.is_claimed, p.claimed_by
      ORDER BY interest_count DESC, p.is_claimed ASC, p.id ASC
      LIMIT 100
    `);

    // Add rank numbers
    const rankings = places.map((place, index) => ({
      rank: index + 1,
      ...place,
      interest_count: parseInt(place.interest_count),
    }));

    res.json({ success: true, data: rankings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserRankings,
  getPlaceRankings,
};
