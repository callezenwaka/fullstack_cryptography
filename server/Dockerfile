# Development Dockerfile for Server
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install nodemon globally for development
RUN npm install -g nodemon ts-node typescript

# Copy source code (will be overridden by volume mount in dev)
COPY . .

# Create keys directory if it doesn't exist
RUN mkdir -p keys

# Expose port
EXPOSE 3001

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]