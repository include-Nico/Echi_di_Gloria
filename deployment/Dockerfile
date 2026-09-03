# Dockerfile for Signaling Server
# Build: docker build -t echi-signaling .
# Run: docker run -p 3001:3001 echi-signaling

FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source
COPY src/server/signalingServer.ts ./
COPY tsconfig.json ./

# Compile TypeScript
RUN npm install -g ts-node typescript
RUN npx tsc signalingServer.ts --outDir dist/

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist/signalingServer.js"]
