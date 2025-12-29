# Backend Dockerfile for Municipal Place NFT Game
# Multi-stage build for production and development

# ============================================
# Base Stage - Common dependencies
# ============================================
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    wget \
    curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# ============================================
# Development Stage
# ============================================
FROM base AS development

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs

EXPOSE 3000

# Development with hot reload
CMD ["npm", "run", "dev"]

# ============================================
# Production Build Stage
# ============================================
FROM base AS production-build

# Install only production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# ============================================
# Production Stage
# ============================================
FROM node:18-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache \
    vips \
    wget

WORKDIR /app

# Copy production dependencies from build stage
COPY --from=production-build /app/node_modules ./node_modules
COPY --from=production-build /app/package*.json ./

# Copy application code
COPY --from=production-build /app/src ./src

# Create necessary directories with proper permissions
RUN mkdir -p uploads logs && \
    chmod 755 uploads logs

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "src/app.js"]