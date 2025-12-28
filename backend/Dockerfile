# Backend Dockerfile for Place NFT Game
# Compatible with Linux, Windows, macOS

FROM node:18-alpine

# Install build dependencies for native modules (sharp)
RUN apk add --no-cache python3 make g++ vips-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/countries || exit 1

# Start command
CMD ["node", "src/app.js"]