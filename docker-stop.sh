#!/bin/bash

# DMaaST Value Chain Digital Twin - Docker Stop Script

echo "🛑 Stopping DMaaST Digital Twin..."
echo ""

docker-compose down

echo ""
echo "✅ Containers stopped successfully!"
echo ""

