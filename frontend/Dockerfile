# Frontend Dockerfile - Multi-stage build
# Supports both development and production environments

# ============================================
# Development Stage
# ============================================
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

EXPOSE 5173

# Vite dev server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ============================================
# Build Stage (Production)
# ============================================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_CONTRACT_ADDRESS
ARG VITE_CHAIN_ID=80002
ARG VITE_CHAIN_NAME=Polygon Amoy Testnet
ARG VITE_RPC_URL=https://rpc-amoy.polygon.technology
ARG VITE_BLOCK_EXPLORER=https://amoy.polygonscan.com
ARG VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# Set environment variables for Vite build
ENV VITE_API_URL=$VITE_API_URL \
    VITE_CONTRACT_ADDRESS=$VITE_CONTRACT_ADDRESS \
    VITE_CHAIN_ID=$VITE_CHAIN_ID \
    VITE_CHAIN_NAME=$VITE_CHAIN_NAME \
    VITE_RPC_URL=$VITE_RPC_URL \
    VITE_BLOCK_EXPLORER=$VITE_BLOCK_EXPLORER \
    VITE_IPFS_GATEWAY=$VITE_IPFS_GATEWAY

# Build application
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM nginx:alpine AS production

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
