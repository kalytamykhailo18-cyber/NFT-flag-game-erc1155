/**
 * Database models index - Sequelize setup and associations
 */
const { Sequelize } = require('sequelize');
const config = require('../config');

// Initialize Sequelize
const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: config.nodeEnv === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

// Import models
const Country = require('./Country')(sequelize);
const Region = require('./Region')(sequelize);
const Municipality = require('./Municipality')(sequelize);
const Place = require('./Place')(sequelize);
const PlacePhotoSlice = require('./PlacePhotoSlice')(sequelize);
const User = require('./User')(sequelize);
const UserPlaceSlice = require('./UserPlaceSlice')(sequelize);
const Auction = require('./Auction')(sequelize);
const Bid = require('./Bid')(sequelize);
const Interest = require('./Interest')(sequelize);

// Define associations

// Country - Region (1:N)
Country.hasMany(Region, { foreignKey: 'country_id', as: 'regions' });
Region.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });

// Region - Municipality (1:N)
Region.hasMany(Municipality, { foreignKey: 'region_id', as: 'municipalities' });
Municipality.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });

// Municipality - Place (1:N)
Municipality.hasMany(Place, { foreignKey: 'municipality_id', as: 'places' });
Place.belongsTo(Municipality, { foreignKey: 'municipality_id', as: 'municipality' });

// Place - PlacePhotoSlice (1:N)
Place.hasMany(PlacePhotoSlice, { foreignKey: 'place_id', as: 'slices' });
PlacePhotoSlice.belongsTo(Place, { foreignKey: 'place_id', as: 'place' });

// Place - User (claimed_by)
Place.belongsTo(User, { foreignKey: 'claimed_by', as: 'claimer' });
User.hasMany(Place, { foreignKey: 'claimed_by', as: 'claimedPlaces' });

// PlacePhotoSlice - User (owned_by)
PlacePhotoSlice.belongsTo(User, { foreignKey: 'owned_by', as: 'owner' });
User.hasMany(PlacePhotoSlice, { foreignKey: 'owned_by', as: 'ownedSlices' });

// UserPlaceSlice associations
UserPlaceSlice.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserPlaceSlice.belongsTo(Place, { foreignKey: 'place_id', as: 'place' });
UserPlaceSlice.belongsTo(PlacePhotoSlice, { foreignKey: 'slice_id', as: 'slice' });
User.hasMany(UserPlaceSlice, { foreignKey: 'user_id', as: 'userPlaceSlices' });
Place.hasMany(UserPlaceSlice, { foreignKey: 'place_id', as: 'userPlaceSlices' });
PlacePhotoSlice.hasMany(UserPlaceSlice, { foreignKey: 'slice_id', as: 'userPlaceSlices' });

// Auction associations
Auction.belongsTo(Place, { foreignKey: 'place_id', as: 'place' });
Auction.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
Auction.belongsTo(User, { foreignKey: 'winner_id', as: 'winner' });
Place.hasMany(Auction, { foreignKey: 'place_id', as: 'auctions' });
User.hasMany(Auction, { foreignKey: 'creator_id', as: 'createdAuctions' });
User.hasMany(Auction, { foreignKey: 'winner_id', as: 'wonAuctions' });

// Bid associations
Bid.belongsTo(Auction, { foreignKey: 'auction_id', as: 'auction' });
Bid.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Auction.hasMany(Bid, { foreignKey: 'auction_id', as: 'bids' });
User.hasMany(Bid, { foreignKey: 'user_id', as: 'bids' });

// Interest associations
Interest.belongsTo(Place, { foreignKey: 'place_id', as: 'place' });
Interest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Place.hasMany(Interest, { foreignKey: 'place_id', as: 'interests' });
User.hasMany(Interest, { foreignKey: 'user_id', as: 'interests' });

module.exports = {
  sequelize,
  Sequelize,
  Country,
  Region,
  Municipality,
  Place,
  PlacePhotoSlice,
  User,
  UserPlaceSlice,
  Auction,
  Bid,
  Interest,
};
