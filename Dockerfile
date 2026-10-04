# ===== Build Stage =====
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --no-audit

# Copy source code
COPY . .

# Build Strapi frontend AND compile TypeScript
RUN npm run build

# ===== Production Stage =====
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --no-audit --omit=dev

# Copy built files
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/src ./src
COPY --from=build /app/types ./types
COPY --from=build /app/.strapi-updater.json .

# Copy config files (keep .ts, Strapi will compile them)
COPY --from=build /app/config ./config

# Copy server.js for TypeScript support
COPY server.js .

# Create data directory and set permissions
RUN mkdir -p /app/data && chown -R node:node /app

# Use non-root user
USER node

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1337/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start Strapi with distDir for TypeScript support
CMD ["node", "server.js"]
