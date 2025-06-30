# === Build Stage Using Bun ===
FROM oven/bun:slim AS build

# Set working directory and environment
WORKDIR /app
ENV NODE_ENV=production

# 1. Copy package files and install production dependencies
COPY package.json bun.lockb* ./
RUN bun install --production

# 4. Add dev dependencies needed for the build.
#    (Bun uses the standard CLI; use --dev to add development dependencies.)
RUN bun add --dev tailwindcss@3.4.17 autoprefixer@10.4.20 postcss @vitejs/plugin-react-swc

# 5. Copy the rest of the source files into the container.
COPY . .

# 6. Run the build command (make sure your package.json has a "build" script)
RUN bun --bun run build

# === Production Stage ===
FROM nginx:stable-alpine

# Copy custom Nginx configuration.
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage.
COPY --from=build /app/dist/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80
