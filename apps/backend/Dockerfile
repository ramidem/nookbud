FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy monorepo root files
COPY package.json yarn.lock .yarnrc ./
COPY .yarn ./.yarn
COPY nx.json tsconfig.base.json ./

# Copy only what backend needs
COPY apps/backend ./apps/backend
COPY libs ./libs

# Install dependencies
RUN yarn install --frozen-lockfile --ignore-scripts

# Build — call webpack directly, bypass NX
ENV NODE_ENV=production
WORKDIR /app/apps/backend
RUN ../../node_modules/.bin/webpack-cli build --node-env=production

# Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=base --chown=nestjs:nodejs /app/dist/apps/backend ./

USER nestjs
EXPOSE 3000
CMD ["node", "main.js"]
