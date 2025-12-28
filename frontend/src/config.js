/**
 * Frontend Configuration
 * ALL environment variables accessed through this file
 * NEVER use import.meta.env directly in other files
 */

const config = {
  // API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',

  // Blockchain
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS || '',
  CHAIN_ID: parseInt(import.meta.env.VITE_CHAIN_ID || '80002'),
  CHAIN_NAME: import.meta.env.VITE_CHAIN_NAME || 'Polygon Amoy Testnet',
  RPC_URL: import.meta.env.VITE_RPC_URL || 'https://rpc-amoy.polygon.technology',
  BLOCK_EXPLORER: import.meta.env.VITE_BLOCK_EXPLORER || 'https://amoy.polygonscan.com',

  // IPFS
  IPFS_GATEWAY: import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs',

  // Utility functions
  truncateAddress: (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  formatPrice: (price) => {
    if (!price) return '0';
    return parseFloat(price).toFixed(4);
  },

  ipfsToHttp: (uri) => {
    if (!uri) return '';
    if (uri.startsWith('ipfs://')) {
      return `${config.IPFS_GATEWAY}/${uri.replace('ipfs://', '')}`;
    }
    return uri;
  },
};

export default config;
