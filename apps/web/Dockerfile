# Build the web app into a small container for Cloud Run. Build from the repo root:
#   docker build -f apps/web/Dockerfile .
# NEXT_PUBLIC_* values are baked into the build, so each environment needs its own image.

# ---- build -----------------------------------------------------------------
FROM node:24-slim AS build
ENV CI=true NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

# Install first, from the manifests alone, so this layer is reused until a dependency changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter "@nookbud/web..." --filter "@nookbud/source"

COPY tsconfig.base.json tsconfig.json ./
COPY apps/web apps/web

# Public values only. Secrets never go into a build.
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

WORKDIR /repo/apps/web
RUN pnpm exec next build

# ---- run -------------------------------------------------------------------
FROM node:24-slim AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0
WORKDIR /app

# The standalone output holds the server and only the packages it needs. Static files are copied in
# separately, because the standalone output leaves them out.
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public

USER node
EXPOSE 8080
CMD ["node", "apps/web/server.js"]
