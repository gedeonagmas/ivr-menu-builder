FROM node:22.12.0-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.9.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/types/package.json ./apps/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY apps/types ./apps/types

WORKDIR /app/apps/backend

# Generate Prisma client
RUN pnpm db:generate

# Build
RUN pnpm build

# Production stage
FROM node:22.12.0-alpine AS production

WORKDIR /app

# Copy built files and node_modules
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/backend/dist ./dist
COPY --from=base /app/apps/backend/package.json ./
COPY --from=base /app/apps/backend/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/index.js"]

