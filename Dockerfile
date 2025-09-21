# Stage 1: Builder
# Use a specific Node.js LTS version
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
# Choose one of the following sections (npm or yarn)

# --- npm ---
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies including devDependencies needed for build
RUN npm ci --force
# --- End npm ---

# --- yarn ---
# COPY package.json and yarn.lock
# COPY package.json yarn.lock ./
# # Install dependencies including devDependencies needed for build
# RUN yarn install --frozen-lockfile
# --- End yarn ---

# Copy the rest of the application code
COPY . .

# Set build-time environment variables if needed
# ARG NEXT_PUBLIC_SOME_VAR
# ENV NEXT_PUBLIC_SOME_VAR=$NEXT_PUBLIC_SOME_VAR

# Build the Next.js application
# Choose one (npm or yarn)
RUN npm run build
# RUN yarn build

# Stage 2: Production Runner
FROM node:20-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV production
# Optionally disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy the static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy the public folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Change ownership of the working directory
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the default command to start the server
# The standalone output creates a server.js file
CMD ["node", "server.js"] 