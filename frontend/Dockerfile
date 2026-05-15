# Use Node.js Alpine for building the frontend
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend code
COPY . .

# Build the frontend for production
RUN npm run build

# Stage 2: Use lightweight Node image to serve built files
FROM node:20-alpine

WORKDIR /app

# Install curl (required by wait-for-backend.sh)
RUN apk add --no-cache curl

# Install serve for serving production files
RUN npm install -g serve

# Copy the build output from the previous stage
COPY --from=build /app/dist ./dist
COPY wait-for-backend.sh ./

# Make sure the script is executable
RUN chmod +x wait-for-backend.sh

# Expose the port used by serve
EXPOSE 3000

# Start the frontend after backend is ready
ENTRYPOINT ["./wait-for-backend.sh"]
