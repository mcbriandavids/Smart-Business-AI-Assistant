# Base image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies separately for better caching
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src

# Expose port
EXPOSE 5000

# Run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the server
ENV NODE_ENV=production
ENV NODE_OPTIONS=--no-deprecation
CMD ["node", "src/server.js"]
