# Build stage
FROM node:20-slim AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build server and client bundles
RUN npm run build && npm run build:client

# Prepare static assets for the production server
RUN mkdir -p server/public && \
    cp -r dist/public/. server/public/

# Runtime stage
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output and runtime files
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

EXPOSE 3000
CMD ["node", "dist/server.js"]
