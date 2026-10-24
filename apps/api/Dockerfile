# Build the API into a small container for Cloud Run. Build from the repo root:
#   docker build -f apps/api/Dockerfile .

# ---- build -----------------------------------------------------------------
FROM node:24-slim AS build
ENV CI=true NX_DAEMON=false
RUN corepack enable
WORKDIR /repo

# Install first, from the manifests alone, so this layer is reused until a dependency changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter "@nookbud/api..." --filter "@nookbud/source"

COPY nx.json tsconfig.base.json tsconfig.json ./
COPY apps/api apps/api

# Compile, then collect only the production dependencies the compiled server needs.
RUN pnpm exec nx build api && pnpm --filter @nookbud/api deploy --prod /out

# ---- run -------------------------------------------------------------------
FROM node:24-slim AS runtime
ENV NODE_ENV=production PORT=8080
WORKDIR /app

COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/package.json ./package.json
COPY --from=build --chown=node:node /repo/apps/api/dist ./dist

USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
