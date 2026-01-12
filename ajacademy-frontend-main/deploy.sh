#!/bin/bash

# Production deployment script for AJ Academy Frontend

echo "Starting deployment process for AJ Academy Frontend..."

# Pull latest changes from repository
echo "Pulling latest changes from repository..."
git pull

# Install dependencies
echo "Installing dependencies..."
npm install

# Create production build
echo "Creating production build..."
npm run build

# Stop any running PM2 process
echo "Stopping any running frontend processes..."
pm2 stop aj-academy-frontend || true

# Start with PM2 in production mode
echo "Starting Next.js with PM2..."
pm2 start npm --name "aj-academy-frontend" -- start

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save

# Display status
echo "Deployment completed!"
pm2 status

echo "AJ Academy frontend is now running at: https://ajacademy.co.in" 