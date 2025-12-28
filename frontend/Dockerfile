# Frontend Dockerfile for Place NFT Game
# Compatible with Linux, Windows, macOS

# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_CONTRACT_ADDRESS=
ARG VITE_CHAIN_ID=80002
ARG VITE_CHAIN_NAME=Polygon Amoy Testnet
ARG VITE_RPC_URL=https://rpc-amoy.polygon.technology
ARG VITE_BLOCK_EXPLORER=https://amoy.polygonscan.com
ARG VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CONTRACT_ADDRESS=$VITE_CONTRACT_ADDRESS
ENV VITE_CHAIN_ID=$VITE_CHAIN_ID
ENV VITE_CHAIN_NAME=$VITE_CHAIN_NAME
ENV VITE_RPC_URL=$VITE_RPC_URL
ENV VITE_BLOCK_EXPLORER=$VITE_BLOCK_EXPLORER
ENV VITE_IPFS_GATEWAY=$VITE_IPFS_GATEWAY

# Build the application
RUN npm run build

# Production stage - using nginx for static files
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]

# Development stage
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
