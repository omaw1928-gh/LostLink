# ─────────────────────────────────────────────────────────────
#  LostLink Backend — Hardened Multi-Stage Dockerfile (Part 2c)
#  Security Controls:
#    1. Multi-stage build separates build tooling from runtime
#    2. OS-level security patch upgrade (apk update && apk upgrade)
#    3. Least-privilege: non-root 'node' user execution
#    4. Minimal footprint: clean npm cache & production-only modules
#    5. Proper ownership permissions on /app
# ─────────────────────────────────────────────────────────────

# Stage 1: Dependency resolution and caching
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Hardened, minimal production runtime
FROM node:20-alpine AS release

# Apply security patches to Alpine OS packages (libcrypto3, libssl3, etc.)
RUN apk update && \
    apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy production dependencies from build stage
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules

# Copy application source code
COPY --chown=node:node . .

# Explicitly ensure node user ownership
RUN chown -R node:node /app

# Switch to unprivileged user (least privilege principle)
USER node

# Expose backend service port
EXPOSE 5000

# Health check instruction inside container
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:5000/api/health || exit 1

# Start server as node user
CMD ["node", "server.js"]
