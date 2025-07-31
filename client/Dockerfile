# Use standard Node.js image instead of Alpine
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (will be overridden by volume mount in dev)
COPY . .

# Expose port
EXPOSE 3000

# Start with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]