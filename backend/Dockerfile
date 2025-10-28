# Base image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies separately for better caching
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src

# Expose port (matches PORT=3000 inside container)
EXPOSE 3000

# Run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the server
ENV NODE_ENV=production
ENV NODE_OPTIONS=--no-deprecation
CMD ["node", "src/server.js"]

# Healthcheck to help orchestrators know when the app is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD wget -qO- http://127.0.0.1:3000/ready || exit 1
