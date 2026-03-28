FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy monorepo root files
COPY package.json yarn.lock .yarnrc ./
COPY .yarn ./.yarn
COPY nx.json tsconfig.base.json ./

# Copy only what landing needs
COPY apps/landing ./apps/landing
COPY libs ./libs

# Install dependencies
RUN yarn install --frozen-lockfile --ignore-scripts

# Build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
WORKDIR /app/apps/landing
RUN ../../node_modules/.bin/next build

# Verify standalone output
RUN ls -la .next/standalone/ && find .next/standalone -name "server.js" | head -5

# Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (server.js ends up at /app/server.js)
COPY --from=base --chown=nextjs:nodejs /app/apps/landing/.next/standalone ./
# Copy static assets to the path Next.js expects
COPY --from=base --chown=nextjs:nodejs /app/apps/landing/.next/static ./apps/landing/.next/static
COPY --from=base --chown=nextjs:nodejs /app/apps/landing/public ./apps/landing/public

USER nextjs
EXPOSE 3000

# server.js is at /app/server.js after standalone copy
CMD ["node", "server.js"]
