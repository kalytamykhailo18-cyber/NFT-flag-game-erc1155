/**
 * Centralized configuration - ALL environment variables accessed through this file
 * NEVER use process.env directly in other files
 */
require('dotenv').config();

module.exports = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Admin
  adminApiKey: process.env.ADMIN_API_KEY,

  // Blockchain
  contractAddress: process.env.CONTRACT_ADDRESS,
  adminPrivateKey: process.env.ADMIN_PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
  chainId: parseInt(process.env.CHAIN_ID || '80002'),

  // IPFS (Pinata)
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretKey: process.env.PINATA_SECRET_KEY,

  // Image Search
  serpApiKey: process.env.SERP_API_KEY,

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Community
  telegramGroupUrl: process.env.TELEGRAM_GROUP_URL || 'https://t.me/PlaceNFTGame',
};
