# Stage 1: Build
FROM oven/bun:latest AS build-stage

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy project files
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom nginx config
# We will create this file in the next step
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
