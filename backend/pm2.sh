#!/bin/bash

# Build the TypeScript code
echo "Building TypeScript code..."
npm run build

# Start the PM2 processes
echo "Starting PM2 processes..."
pm2 start ecosystem.config.json

# Save the PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

echo "Setup complete! Your upkeep checker is now running with PM2"
echo "To monitor: pm2 monit"
echo "To view logs: pm2 logs"