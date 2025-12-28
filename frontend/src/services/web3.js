/**
 * Web3 Service - Wallet connection and contract interactions
 * Uses config for blockchain settings - NEVER hardcode
 */
import { ethers } from 'ethers';
import config from '../config';

// PlaceNFT ABI (relevant functions only)
const PLACE_NFT_ABI = [
  // View functions
  'function uri(uint256 tokenId) view returns (string)',
  'function isPlaceMinted(uint256 tokenId) view returns (bool)',
  'function isPlaceClaimed(uint256 tokenId) view returns (bool)',
  'function getPlaceClaimedBy(uint256 tokenId) view returns (address)',
  'function getPlaceMetadataHash(uint256 tokenId) view returns (string)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  // Events
  'event PlaceMinted(uint256 indexed tokenId, string uri, string metadataHash)',
  'event PlaceClaimed(uint256 indexed tokenId, address indexed claimedBy)',
  'event SlicePurchased(uint256 indexed tokenId, uint256 pairNumber, uint256 sliceId, address indexed user)',
  'event SlicePairCompleted(uint256 indexed tokenId, uint256 pairNumber, address indexed user)',
];

// Chain configuration
const CHAIN_CONFIG = {
  chainId: `0x${config.CHAIN_ID.toString(16)}`,
  chainName: config.CHAIN_NAME,
  rpcUrls: [config.RPC_URL],
  blockExplorerUrls: [config.BLOCK_EXPLORER],
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
};

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Get current provider
 */
export const getProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Get signer for transactions
 */
export const getSigner = async () => {
  const provider = getProvider();
  return provider.getSigner();
};

/**
 * Connect wallet
 */
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request accounts
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Switch to correct network
    await switchNetwork();

    return accounts[0];
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

/**
 * Disconnect wallet (clear state only, no actual disconnect)
 */
export const disconnectWallet = () => {
  // MetaMask doesn't have a true disconnect - we just clear our state
  return true;
};

/**
 * Get connected accounts
 */
export const getAccounts = async () => {
  if (!isMetaMaskInstalled()) return [];

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts;
  } catch (error) {
    console.error('Get accounts error:', error);
    return [];
  }
};

/**
 * Get current chain ID
 */
export const getChainId = async () => {
  if (!isMetaMaskInstalled()) return null;

  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error('Get chain ID error:', error);
    return null;
  }
};

/**
 * Switch to correct network
 */
export const switchNetwork = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_CONFIG.chainId }],
    });
  } catch (switchError) {
    // Chain doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CHAIN_CONFIG],
        });
      } catch (addError) {
        console.error('Add network error:', addError);
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
};

/**
 * Get PlaceNFT contract instance
 */
export const getContract = async (withSigner = false) => {
  if (!config.CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  const provider = getProvider();
  const signerOrProvider = withSigner ? await getSigner() : provider;
  return new ethers.Contract(config.CONTRACT_ADDRESS, PLACE_NFT_ABI, signerOrProvider);
};

/**
 * Check if place is minted
 */
export const isPlaceMinted = async (tokenId) => {
  try {
    const contract = await getContract();
    return await contract.isPlaceMinted(tokenId);
  } catch (error) {
    console.error('isPlaceMinted error:', error);
    return false;
  }
};

/**
 * Check if place is claimed
 */
export const isPlaceClaimed = async (tokenId) => {
  try {
    const contract = await getContract();
    return await contract.isPlaceClaimed(tokenId);
  } catch (error) {
    console.error('isPlaceClaimed error:', error);
    return false;
  }
};

/**
 * Get who claimed a place
 */
export const getPlaceClaimedBy = async (tokenId) => {
  try {
    const contract = await getContract();
    return await contract.getPlaceClaimedBy(tokenId);
  } catch (error) {
    console.error('getPlaceClaimedBy error:', error);
    return null;
  }
};

/**
 * Get place metadata hash
 */
export const getPlaceMetadataHash = async (tokenId) => {
  try {
    const contract = await getContract();
    return await contract.getPlaceMetadataHash(tokenId);
  } catch (error) {
    console.error('getPlaceMetadataHash error:', error);
    return null;
  }
};

/**
 * Get user's balance for a token
 */
export const getBalance = async (address, tokenId) => {
  try {
    const contract = await getContract();
    const balance = await contract.balanceOf(address, tokenId);
    return balance.toString();
  } catch (error) {
    console.error('getBalance error:', error);
    return '0';
  }
};

/**
 * Get token URI
 */
export const getTokenUri = async (tokenId) => {
  try {
    const contract = await getContract();
    return await contract.uri(tokenId);
  } catch (error) {
    console.error('getTokenUri error:', error);
    return null;
  }
};

/**
 * Subscribe to account changes
 */
export const onAccountsChanged = (callback) => {
  if (!isMetaMaskInstalled()) return () => {};

  window.ethereum.on('accountsChanged', callback);
  return () => window.ethereum.removeListener('accountsChanged', callback);
};

/**
 * Subscribe to chain changes
 */
export const onChainChanged = (callback) => {
  if (!isMetaMaskInstalled()) return () => {};

  window.ethereum.on('chainChanged', callback);
  return () => window.ethereum.removeListener('chainChanged', callback);
};

/**
 * Format address for display
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format MATIC amount
 */
export const formatMatic = (amount) => {
  if (!amount) return '0';
  return parseFloat(ethers.formatEther(amount)).toFixed(4);
};

/**
 * Parse MATIC to wei
 */
export const parseMaticToWei = (amount) => {
  return ethers.parseEther(amount.toString());
};

export default {
  isMetaMaskInstalled,
  getProvider,
  getSigner,
  connectWallet,
  disconnectWallet,
  getAccounts,
  getChainId,
  switchNetwork,
  getContract,
  isPlaceMinted,
  isPlaceClaimed,
  getPlaceClaimedBy,
  getPlaceMetadataHash,
  getBalance,
  getTokenUri,
  onAccountsChanged,
  onChainChanged,
  formatAddress,
  formatMatic,
  parseMaticToWei,
};
