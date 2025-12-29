'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config/config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.url, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  dialectOptions: dbConfig.dialectOptions || {},
});

// Import models
const Country = require('./Country')(sequelize);
const Region = require('./Region')(sequelize);
const Municipality = require('./Municipality')(sequelize);
const User = require('./User')(sequelize);
const Place = require('./Place')(sequelize);
const PlacePhotoSlice = require('./PlacePhotoSlice')(sequelize);
const UserPlaceSlice = require('./UserPlaceSlice')(sequelize);
const Interest = require('./Interest')(sequelize);
const Auction = require('./Auction')(sequelize);
const Bid = require('./Bid')(sequelize);

// Define associations
Region.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });
Country.hasMany(Region, { foreignKey: 'country_id', as: 'regions' });

Municipality.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });
Region.hasMany(Municipality, { foreignKey: 'region_id', as: 'municipalities' });

Place.belongsTo(Municipality, { foreignKey: 'municipality_id', as: 'municipality' });
Municipality.hasMany(Place, { foreignKey: 'municipality_id', as: 'places' });

Place.belongsTo(User, { foreignKey: 'claimed_by', as: 'claimer' });
User.hasMany(Place, { foreignKey: 'claimed_by', as: 'claimedPlaces' });

PlacePhotoSlice.belongsTo(Place, { foreignKey: 'place_id', as: 'place' });
Place.hasMany(PlacePhotoSlice, { foreignKey: 'place_id', as: 'slices' });

PlacePhotoSlice.belongsTo(User, { foreignKey: 'owned_by', as: 'owner' });
User.hasMany(PlacePhotoSlice, { foreignKey: 'owned_by', as: 'ownedSlices' });

Interest.belongsTo(Place, { foreignKey: 'place_id', as: 'place' });
Place.hasMany(Interest, { foreignKey: 'place_id', as: 'interests' });

Interest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Interest, { foreignKey: 'user_id', as: 'interests' });

Auction.belongsTo(Place, { foreignKey: 'place_id', as: 'place' });
Place.hasMany(Auction, { foreignKey: 'place_id', as: 'auctions' });

Auction.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });
Auction.belongsTo(User, { foreignKey: 'winner_id', as: 'winner' });

Bid.belongsTo(Auction, { foreignKey: 'auction_id', as: 'auction' });
Auction.hasMany(Bid, { foreignKey: 'auction_id', as: 'bids' });

Bid.belongsTo(User, { foreignKey: 'bidder_id', as: 'bidder' });
User.hasMany(Bid, { foreignKey: 'bidder_id', as: 'bids' });

UserPlaceSlice.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(UserPlaceSlice, { foreignKey: 'user_id', as: 'userSlices' });

UserPlaceSlice.belongsTo(Place, { foreignKey: 'place_id', as: 'place' });
Place.hasMany(UserPlaceSlice, { foreignKey: 'place_id', as: 'userSlices' });

UserPlaceSlice.belongsTo(PlacePhotoSlice, { foreignKey: 'slice_id', as: 'slice' });
PlacePhotoSlice.hasMany(UserPlaceSlice, { foreignKey: 'slice_id', as: 'userSlices' });

module.exports = {
  sequelize,
  Sequelize,
  Country,
  Region,
  Municipality,
  User,
  Place,
  PlacePhotoSlice,
  UserPlaceSlice,
  Interest,
  Auction,
  Bid,
};
