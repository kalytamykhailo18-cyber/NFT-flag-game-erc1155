/**
 * Database Seed Script
 * Seeds the database with sample data matching Section 8 requirements:
 * - 4 countries: Spain, France, Germany, Italy
 * - 1 region per country = 4 regions
 * - 2 municipalities per region = 8 municipalities
 * - 8 places per municipality = 64 places (4 standard, 2 plus, 2 premium)
 * - Each place has slices created (pair_count * 2)
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../src/config');

const sequelize = new Sequelize(config.databaseUrl, {
  logging: false,
});

// Import models after sequelize is initialized
const Country = require('../src/models/Country')(sequelize);
const Region = require('../src/models/Region')(sequelize);
const Municipality = require('../src/models/Municipality')(sequelize);
const Place = require('../src/models/Place')(sequelize);
const PlacePhotoSlice = require('../src/models/PlacePhotoSlice')(sequelize);

// Define associations
Region.belongsTo(Country, { foreignKey: 'country_id' });
Municipality.belongsTo(Region, { foreignKey: 'region_id' });
Place.belongsTo(Municipality, { foreignKey: 'municipality_id' });
PlacePhotoSlice.belongsTo(Place, { foreignKey: 'place_id' });

/**
 * Generate placeholder slice URI
 */
const generateSliceUri = (placeName, pairNum, slicePos) => {
  const slug = placeName.toLowerCase().replace(/\s+/g, '_');
  return `ipfs://placeholder/${slug}_pair${pairNum}_slice${slicePos}.jpg`;
};

/**
 * Generate placeholder SHA256
 */
const generateSha256 = (placeId, pairNum, slicePos) => {
  const hash = `${placeId}${pairNum}${slicePos}`.padStart(64, '0');
  return `0x${hash.slice(0, 64)}`;
};

const seed = async () => {
  console.log('Starting database seed...\n');
  console.log('Requirements:');
  console.log('- 4 countries: Spain, France, Germany, Italy');
  console.log('- 1 region per country = 4 regions');
  console.log('- 2 municipalities per region = 8 municipalities');
  console.log('- 8 places per municipality = 64 places');
  console.log('- Each place has slices (pair_count * 2)\n');

  try {
    await sequelize.authenticate();
    console.log('Database connected.\n');

    await sequelize.sync({ force: true });
    console.log('Tables created.\n');

    // ==================== COUNTRIES (4) ====================
    console.log('Seeding countries...');
    const countries = await Country.bulkCreate([
      { name: 'Spain', code: 'ES', flag_emoji: '🇪🇸' },
      { name: 'France', code: 'FR', flag_emoji: '🇫🇷' },
      { name: 'Germany', code: 'DE', flag_emoji: '🇩🇪' },
      { name: 'Italy', code: 'IT', flag_emoji: '🇮🇹' },
    ]);
    console.log(`Created ${countries.length} countries.\n`);

    // ==================== REGIONS (1 per country = 4) ====================
    console.log('Seeding regions...');
    const regions = await Region.bulkCreate([
      { name: 'Madrid', country_id: countries[0].id },
      { name: 'Île-de-France', country_id: countries[1].id },
      { name: 'Bavaria', country_id: countries[2].id },
      { name: 'Lazio', country_id: countries[3].id },
    ]);
    console.log(`Created ${regions.length} regions.\n`);

    // ==================== MUNICIPALITIES (2 per region = 8) ====================
    console.log('Seeding municipalities...');
    const municipalities = await Municipality.bulkCreate([
      // Spain - Madrid region
      { name: 'Madrid City', code: 'MAD', region_id: regions[0].id },
      { name: 'Alcala de Henares', code: 'ALC', region_id: regions[0].id },
      // France - Île-de-France region
      { name: 'Paris', code: 'PAR', region_id: regions[1].id },
      { name: 'Versailles', code: 'VER', region_id: regions[1].id },
      // Germany - Bavaria region
      { name: 'Munich', code: 'MUC', region_id: regions[2].id },
      { name: 'Nuremberg', code: 'NUR', region_id: regions[2].id },
      // Italy - Lazio region
      { name: 'Rome', code: 'ROM', region_id: regions[3].id },
      { name: 'Tivoli', code: 'TIV', region_id: regions[3].id },
    ]);
    console.log(`Created ${municipalities.length} municipalities.\n`);

    // ==================== PLACES (8 per municipality = 64) ====================
    // Per municipality: 4 standard, 2 plus, 2 premium
    // Naming: standard_location_1, plus_location_1, premium_location_1
    console.log('Seeding places...');

    const placeConfigs = [
      // 4 standard (pair_count: 2)
      { type: 'standard', category: 'standard', pair_count: 2, count: 4 },
      // 2 plus (pair_count: 3)
      { type: 'plus', category: 'plus', pair_count: 3, count: 2 },
      // 2 premium (pair_count: 4)
      { type: 'premium', category: 'premium', pair_count: 4, count: 2 },
    ];

    const allPlaces = [];
    let placeIndex = 0;

    for (const municipality of municipalities) {
      let standardCount = 0;
      let plusCount = 0;
      let premiumCount = 0;

      for (const config of placeConfigs) {
        for (let i = 0; i < config.count; i++) {
          let locationNumber;
          if (config.type === 'standard') {
            standardCount++;
            locationNumber = standardCount;
          } else if (config.type === 'plus') {
            plusCount++;
            locationNumber = plusCount;
          } else {
            premiumCount++;
            locationNumber = premiumCount;
          }

          // Token ID formula: municipality_id * 1000 + place_index + 1
          const tokenId = municipality.id * 1000 + placeIndex + 1;
          placeIndex++;

          allPlaces.push({
            name: `${config.type}_location_${locationNumber}`,
            municipality_id: municipality.id,
            token_id: tokenId,
            location_type: `${config.type}location`,
            category: config.category,
            pair_count: config.pair_count,
            latitude: 40.0 + Math.random() * 10,
            longitude: 2.0 + Math.random() * 10,
            is_minted: false,
          });
        }
      }
    }

    const places = await Place.bulkCreate(allPlaces);
    console.log(`Created ${places.length} places.\n`);

    // ==================== SLICES (pair_count * 2 per place) ====================
    console.log('Seeding slices...');

    const allSlices = [];

    for (const place of places) {
      for (let pairNum = 1; pairNum <= place.pair_count; pairNum++) {
        for (let slicePos = 1; slicePos <= 2; slicePos++) {
          allSlices.push({
            place_id: place.id,
            pair_number: pairNum,
            slice_position: slicePos,
            slice_uri: generateSliceUri(place.name, pairNum, slicePos),
            image_sha256: generateSha256(place.id, pairNum, slicePos),
            latitude: place.latitude,
            longitude: place.longitude,
            price: 0.005,
            is_owned: false,
          });
        }
      }
    }

    const slices = await PlacePhotoSlice.bulkCreate(allSlices);
    console.log(`Created ${slices.length} slices.\n`);

    // ==================== SUMMARY ====================
    console.log('========================================');
    console.log('SEED COMPLETE');
    console.log('========================================');
    console.log(`Countries: ${countries.length} (expected: 4)`);
    console.log(`Regions: ${regions.length} (expected: 4)`);
    console.log(`Municipalities: ${municipalities.length} (expected: 8)`);
    console.log(`Places: ${places.length} (expected: 64)`);
    console.log(`Slices: ${slices.length}`);
    console.log('========================================\n');

    // Sample output
    console.log('Sample places by municipality:');
    for (const municipality of municipalities) {
      const municipalityPlaces = places.filter(p => p.municipality_id === municipality.id);
      console.log(`\n${municipality.name} (${municipalityPlaces.length} places):`);
      municipalityPlaces.slice(0, 3).forEach(p => {
        console.log(`  - ${p.name} (Token ID: ${p.token_id}, Pairs: ${p.pair_count})`);
      });
      console.log('  ...');
    }

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
