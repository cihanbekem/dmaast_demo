#!/bin/bash

# DMaaST Value Chain Digital Twin - Docker Start Script

echo "🚀 Starting DMaaST Digital Twin..."
echo ""

# Build and start containers
docker-compose up -d --build

echo ""
echo "✅ Containers started successfully!"
echo ""
echo "📊 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop:          docker-compose down"
echo "   Restart:       docker-compose restart"
echo ""

