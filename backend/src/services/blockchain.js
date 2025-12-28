/**
 * Blockchain Service
 * Ethers.js contract interactions for ERC-1155
 */
const { ethers } = require('ethers');
const config = require('../config');

// ERC-1155 PlaceNFT ABI (minimal for required functions)
const PLACE_NFT_ABI = [
  'function mintPlace(uint256 tokenId, string memory tokenUri, string memory metadataHash) external',
  'function claimPlace(uint256 tokenId, address to) external',
  'function setPlaceURI(uint256 tokenId, string memory newUri, string memory newHash) external',
  'function isPlaceMinted(uint256 tokenId) public view returns (bool)',
  'function isPlaceClaimed(uint256 tokenId) public view returns (bool)',
  'function getPlaceClaimedBy(uint256 tokenId) public view returns (address)',
  'function getPlaceMetadataHash(uint256 tokenId) public view returns (string memory)',
  'function uri(uint256 tokenId) public view returns (string memory)',
  'function balanceOf(address account, uint256 id) public view returns (uint256)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external',
  'event PlaceMinted(uint256 indexed tokenId, string uri, string metadataHash)',
  'event PlaceClaimed(uint256 indexed tokenId, address indexed claimedBy)',
];

let provider = null;
let wallet = null;
let contract = null;

/**
 * Initialize provider, wallet, and contract
 */
const initialize = () => {
  if (!config.rpcUrl) {
    throw new Error('RPC_URL not configured');
  }

  provider = new ethers.JsonRpcProvider(config.rpcUrl);

  if (config.adminPrivateKey) {
    wallet = new ethers.Wallet(config.adminPrivateKey, provider);
  }

  if (config.contractAddress && config.contractAddress !== '0x...') {
    contract = new ethers.Contract(
      config.contractAddress,
      PLACE_NFT_ABI,
      wallet || provider
    );
  }

  return { provider, wallet, contract };
};

/**
 * Get contract instance
 */
const getContract = () => {
  if (!contract) {
    initialize();
  }
  if (!contract) {
    throw new Error('Contract not initialized. Check CONTRACT_ADDRESS in .env');
  }
  return contract;
};

/**
 * Mint a new place NFT
 */
const mintPlace = async (tokenId, metadataUri, metadataHash) => {
  try {
    const contract = getContract();

    // Check if already minted
    const isMinted = await contract.isPlaceMinted(tokenId);
    if (isMinted) {
      throw new Error('Place is already minted');
    }

    const tx = await contract.mintPlace(tokenId, metadataUri, metadataHash || '');
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      tokenId,
    };
  } catch (error) {
    console.error('Mint error:', error);
    throw new Error(`BLOCKCHAIN_ERROR: ${error.message}`);
  }
};

/**
 * Claim a place (transfer from admin to user)
 */
const claimPlace = async (tokenId, userAddress) => {
  try {
    const contract = getContract();

    // Check if place is minted
    const isMinted = await contract.isPlaceMinted(tokenId);
    if (!isMinted) {
      throw new Error('Place is not minted');
    }

    // Check if already claimed
    const isClaimed = await contract.isPlaceClaimed(tokenId);
    if (isClaimed) {
      throw new Error('Place is already claimed');
    }

    const tx = await contract.claimPlace(tokenId, userAddress);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      tokenId,
      claimedBy: userAddress,
    };
  } catch (error) {
    console.error('Claim error:', error);
    throw new Error(`BLOCKCHAIN_ERROR: ${error.message}`);
  }
};

/**
 * Check if a place is minted
 */
const isPlaceMinted = async (tokenId) => {
  try {
    const contract = getContract();
    return await contract.isPlaceMinted(tokenId);
  } catch (error) {
    console.error('Check minted error:', error);
    return false;
  }
};

/**
 * Check if a place is claimed
 */
const isPlaceClaimed = async (tokenId) => {
  try {
    const contract = getContract();
    return await contract.isPlaceClaimed(tokenId);
  } catch (error) {
    console.error('Check claimed error:', error);
    return false;
  }
};

/**
 * Get place claimer address
 */
const getPlaceClaimedBy = async (tokenId) => {
  try {
    const contract = getContract();
    return await contract.getPlaceClaimedBy(tokenId);
  } catch (error) {
    console.error('Get claimer error:', error);
    return null;
  }
};

/**
 * Get place metadata URI
 */
const getPlaceUri = async (tokenId) => {
  try {
    const contract = getContract();
    return await contract.uri(tokenId);
  } catch (error) {
    console.error('Get URI error:', error);
    return null;
  }
};

/**
 * Get balance of a token for an address
 */
const getBalance = async (address, tokenId) => {
  try {
    const contract = getContract();
    const balance = await contract.balanceOf(address, tokenId);
    return balance.toString();
  } catch (error) {
    console.error('Get balance error:', error);
    return '0';
  }
};

module.exports = {
  initialize,
  getContract,
  mintPlace,
  claimPlace,
  isPlaceMinted,
  isPlaceClaimed,
  getPlaceClaimedBy,
  getPlaceUri,
  getBalance,
};
