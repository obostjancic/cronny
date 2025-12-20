# Build stage
FROM node:22.14.0-slim AS builder

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Install Playwright browsers (needed for server scraping)
RUN cd packages/server && npx playwright install --with-deps chromium

# Production stage
FROM node:22.14.0-slim

# Install runtime dependencies for Playwright
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libfreetype6 \
    libharfbuzz0b \
    ca-certificates \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Tell Playwright to use installed chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

# Set production environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/app/packages/server/.data/db.sqlite

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/types/package.json ./packages/types/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built artifacts from builder
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/client/dist ./packages/client/dist

# Copy server source files needed at runtime
COPY packages/server/src ./packages/server/src
COPY packages/server/drizzle ./packages/server/drizzle

# Create data directory for SQLite
RUN mkdir -p /app/packages/server/.data

# Create non-root user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home cronny && \
    chown -R cronny:nodejs /app

USER cronny

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["yarn", "start:prod"]
