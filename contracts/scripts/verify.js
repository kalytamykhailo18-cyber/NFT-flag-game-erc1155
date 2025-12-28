/**
 * Verify PlaceNFT Contract on Polygonscan
 *
 * Usage: npx hardhat run scripts/verify.js --network amoy
 *
 * Make sure CONTRACT_ADDRESS is set in .env
 */
const hre = require('hardhat');
require('dotenv').config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error('Error: CONTRACT_ADDRESS not set in .env');
    process.exit(1);
  }

  console.log('Verifying PlaceNFT contract at:', contractAddress);

  try {
    await hre.run('verify:verify', {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log('Contract verified successfully!');
  } catch (error) {
    if (error.message.includes('Already Verified')) {
      console.log('Contract is already verified.');
    } else {
      console.error('Verification failed:', error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
