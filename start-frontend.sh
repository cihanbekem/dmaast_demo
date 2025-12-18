#!/bin/bash

# Start Frontend Server
echo "Starting Digital Twin Frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Start dev server
echo "Starting Vite dev server on http://localhost:5173"
npm run dev

