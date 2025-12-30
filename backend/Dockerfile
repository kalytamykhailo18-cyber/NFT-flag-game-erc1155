# Backend Dockerfile - Multi-stage build
# Supports both development and production environments

# ============================================
# Base Stage - Common setup
# ============================================
FROM node:18-alpine AS base

# Install system dependencies for native modules (sharp, etc.)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    wget

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# ============================================
# Development Stage
# ============================================
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy application source
COPY . .

# Create required directories
RUN mkdir -p uploads logs

EXPOSE 3000

# Use nodemon for hot-reload in development
CMD ["npm", "run", "dev"]

# ============================================
# Production Dependencies Stage
# ============================================
FROM base AS prod-deps

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# ============================================
# Production Stage
# ============================================
FROM node:18-alpine AS production

# Install minimal runtime dependencies
RUN apk add --no-cache \
    vips \
    wget \
    postgresql-client

WORKDIR /app

# Copy production dependencies from previous stage
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy application code
COPY src ./src
COPY database ./database
COPY scripts ./scripts

# Set up entrypoint script
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create directories
RUN mkdir -p uploads logs && \
    chmod 755 uploads logs

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Entrypoint handles DB migrations
ENTRYPOINT ["docker-entrypoint.sh"]

# Start Node.js application
CMD ["node", "src/app.js"]