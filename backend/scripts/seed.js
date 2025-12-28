/**
 * Database Seed Script
 * Seeds the database with sample data for development/testing
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../src/config');

// Import models
const Country = require('../src/models/Country');
const Region = require('../src/models/Region');
const Municipality = require('../src/models/Municipality');
const Place = require('../src/models/Place');

const sequelize = new Sequelize(config.databaseUrl, {
  logging: false,
});

const seed = async () => {
  console.log('Starting database seed...\n');

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connected.\n');

    // Sync models
    await sequelize.sync({ force: true }); // WARNING: This drops all tables
    console.log('Tables created.\n');

    // Seed Countries
    console.log('Seeding countries...');
    const countries = await Country.bulkCreate([
      { name: 'United States', code: 'US', flag_emoji: '🇺🇸' },
      { name: 'Spain', code: 'ES', flag_emoji: '🇪🇸' },
      { name: 'France', code: 'FR', flag_emoji: '🇫🇷' },
      { name: 'Germany', code: 'DE', flag_emoji: '🇩🇪' },
      { name: 'Italy', code: 'IT', flag_emoji: '🇮🇹' },
    ]);
    console.log(`Created ${countries.length} countries.\n`);

    // Seed Regions
    console.log('Seeding regions...');
    const regions = await Region.bulkCreate([
      // US Regions
      { name: 'California', country_id: countries[0].id },
      { name: 'New York', country_id: countries[0].id },
      { name: 'Texas', country_id: countries[0].id },
      // Spain Regions
      { name: 'Madrid', country_id: countries[1].id },
      { name: 'Catalonia', country_id: countries[1].id },
      { name: 'Andalusia', country_id: countries[1].id },
      // France Regions
      { name: 'Île-de-France', country_id: countries[2].id },
      { name: 'Provence-Alpes-Côte d\'Azur', country_id: countries[2].id },
      // Germany Regions
      { name: 'Bavaria', country_id: countries[3].id },
      { name: 'Berlin', country_id: countries[3].id },
      // Italy Regions
      { name: 'Lazio', country_id: countries[4].id },
      { name: 'Tuscany', country_id: countries[4].id },
    ]);
    console.log(`Created ${regions.length} regions.\n`);

    // Seed Municipalities
    console.log('Seeding municipalities...');
    const municipalities = await Municipality.bulkCreate([
      // California
      { name: 'Los Angeles', code: 'LA', region_id: regions[0].id },
      { name: 'San Francisco', code: 'SF', region_id: regions[0].id },
      // New York
      { name: 'New York City', code: 'NYC', region_id: regions[1].id },
      // Texas
      { name: 'Austin', code: 'AUS', region_id: regions[2].id },
      // Madrid
      { name: 'Madrid City', code: 'MAD', region_id: regions[3].id },
      // Catalonia
      { name: 'Barcelona', code: 'BCN', region_id: regions[4].id },
      // Andalusia
      { name: 'Seville', code: 'SVQ', region_id: regions[5].id },
      // Île-de-France
      { name: 'Paris', code: 'PAR', region_id: regions[6].id },
      // PACA
      { name: 'Nice', code: 'NCE', region_id: regions[7].id },
      // Bavaria
      { name: 'Munich', code: 'MUC', region_id: regions[8].id },
      // Berlin
      { name: 'Berlin City', code: 'BER', region_id: regions[9].id },
      // Lazio
      { name: 'Rome', code: 'ROM', region_id: regions[10].id },
      // Tuscany
      { name: 'Florence', code: 'FLR', region_id: regions[11].id },
    ]);
    console.log(`Created ${municipalities.length} municipalities.\n`);

    // Seed Places
    console.log('Seeding places...');
    const places = await Place.bulkCreate([
      // Los Angeles (municipality_id: 1)
      {
        name: 'Hollywood Sign',
        municipality_id: municipalities[0].id,
        token_id: 1001, // 1 * 1000 + 0 + 1
        location_type: 'premiumlocation',
        category: 'premium',
        pair_count: 4,
        latitude: 34.1341,
        longitude: -118.3215,
        is_minted: false,
      },
      {
        name: 'Santa Monica Pier',
        municipality_id: municipalities[0].id,
        token_id: 1002, // 1 * 1000 + 1 + 1
        location_type: 'pluslocation',
        category: 'plus',
        pair_count: 3,
        latitude: 34.0094,
        longitude: -118.4973,
        is_minted: false,
      },
      // San Francisco (municipality_id: 2)
      {
        name: 'Golden Gate Bridge',
        municipality_id: municipalities[1].id,
        token_id: 2001, // 2 * 1000 + 0 + 1
        location_type: 'premiumlocation',
        category: 'premium',
        pair_count: 4,
        latitude: 37.8199,
        longitude: -122.4783,
        is_minted: false,
      },
      // NYC (municipality_id: 3)
      {
        name: 'Central Park',
        municipality_id: municipalities[2].id,
        token_id: 3000, // 3 * 1000 + 0 + 1
        location_type: 'premiumlocation',
        category: 'premium',
        pair_count: 4,
        latitude: 40.7829,
        longitude: -73.9654,
        is_minted: false,
      },
      {
        name: 'Times Square',
        municipality_id: municipalities[2].id,
        token_id: 3002, // 3 * 1000 + 1 + 1
        location_type: 'pluslocation',
        category: 'plus',
        pair_count: 3,
        latitude: 40.7580,
        longitude: -73.9855,
        is_minted: false,
      },
      {
        name: 'Brooklyn Bridge',
        municipality_id: municipalities[2].id,
        token_id: 3003, // 3 * 1000 + 2 + 1
        location_type: 'standardlocation',
        category: 'standard',
        pair_count: 2,
        latitude: 40.7061,
        longitude: -73.9969,
        is_minted: false,
      },
      // Madrid (municipality_id: 5)
      {
        name: 'Plaza Mayor',
        municipality_id: municipalities[4].id,
        token_id: 5001,
        location_type: 'premiumlocation',
        category: 'premium',
        pair_count: 4,
        latitude: 40.4155,
        longitude: -3.7074,
        is_minted: false,
      },
      // Barcelona (municipality_id: 6)
      {
        name: 'Sagrada Familia',
        municipality_id: municipalities[5].id,
        token_id: 6001,
        location_type: 'premiumlocation',
        category: 'premium',
        pair_count: 4,
        latitude: 41.4036,
        longitude: 2.1744,
        is_minted: false,
      },
      // Paris (municipality_id: 8)
      {
        name: 'Eiffel Tower',
        municipality_id: municipalities[7].id,
        token_id: 8001,
        location_type: 'premiumlocation',
        category: 'premium',
        pair_count: 4,
        latitude: 48.8584,
        longitude: 2.2945,
        is_minted: false,
      },
      // Rome (municipality_id: 12)
      {
        name: 'Colosseum',
        municipality_id: municipalities[11].id,
        token_id: 12001,
        location_type: 'premiumlocation',
        category: 'premium',
        pair_count: 4,
        latitude: 41.8902,
        longitude: 12.4922,
        is_minted: false,
      },
    ]);
    console.log(`Created ${places.length} places.\n`);

    // Summary
    console.log('========================================');
    console.log('SEED COMPLETE');
    console.log('========================================');
    console.log(`Countries: ${countries.length}`);
    console.log(`Regions: ${regions.length}`);
    console.log(`Municipalities: ${municipalities.length}`);
    console.log(`Places: ${places.length}`);
    console.log('========================================\n');

    console.log('Sample token IDs:');
    places.forEach((place) => {
      console.log(`- ${place.name}: Token ID ${place.token_id}`);
    });

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  seed();
}

module.exports = seed;
