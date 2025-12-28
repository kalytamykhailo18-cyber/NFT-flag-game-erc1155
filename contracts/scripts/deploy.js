/**
 * Deploy PlaceNFT Contract
 *
 * Usage: npx hardhat run scripts/deploy.js --network amoy
 */
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

/**
 * Update .env file with new contract address
 */
function updateEnvFile(envPath, key, value) {
  try {
    if (!fs.existsSync(envPath)) {
      console.log(`Creating ${envPath}`);
      fs.writeFileSync(envPath, '');
    }

    let content = fs.readFileSync(envPath, 'utf8');
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }

    fs.writeFileSync(envPath, content.trim() + '\n');
    console.log(`Updated ${envPath}: ${key}=${value}`);
  } catch (error) {
    console.error(`Failed to update ${envPath}:`, error.message);
  }
}

async function main() {
  console.log('Deploying PlaceNFT contract...');

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', hre.ethers.formatEther(balance), 'MATIC');

  // Deploy contract
  const PlaceNFT = await hre.ethers.getContractFactory('PlaceNFT');
  const placeNFT = await PlaceNFT.deploy();

  await placeNFT.waitForDeployment();

  const contractAddress = await placeNFT.getAddress();
  console.log('PlaceNFT deployed to:', contractAddress);

  // Verify roles
  console.log('\n--- Verifying Roles ---');
  const MINTER_ROLE = await placeNFT.MINTER_ROLE();
  const CURATOR_ROLE = await placeNFT.CURATOR_ROLE();
  const PAUSER_ROLE = await placeNFT.PAUSER_ROLE();
  const ADMIN_ROLE = await placeNFT.ADMIN_ROLE();

  console.log('MINTER_ROLE:', MINTER_ROLE);
  console.log('CURATOR_ROLE:', CURATOR_ROLE);
  console.log('PAUSER_ROLE:', PAUSER_ROLE);
  console.log('ADMIN_ROLE:', ADMIN_ROLE);

  console.log('\nDeployer has MINTER_ROLE:', await placeNFT.hasRole(MINTER_ROLE, deployer.address));
  console.log('Deployer has CURATOR_ROLE:', await placeNFT.hasRole(CURATOR_ROLE, deployer.address));
  console.log('Deployer has PAUSER_ROLE:', await placeNFT.hasRole(PAUSER_ROLE, deployer.address));
  console.log('Deployer has ADMIN_ROLE:', await placeNFT.hasRole(ADMIN_ROLE, deployer.address));

  // Update .env files automatically
  console.log('\n--- Updating .env files ---');

  const contractsEnv = path.join(__dirname, '..', '.env');
  const backendEnv = path.join(__dirname, '..', '..', 'backend', '.env');
  const frontendEnv = path.join(__dirname, '..', '..', 'frontend', '.env');

  updateEnvFile(contractsEnv, 'CONTRACT_ADDRESS', contractAddress);
  updateEnvFile(backendEnv, 'CONTRACT_ADDRESS', contractAddress);
  updateEnvFile(frontendEnv, 'VITE_CONTRACT_ADDRESS', contractAddress);

  console.log('\n--- Deployment Complete ---');
  console.log('Contract Address:', contractAddress);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
