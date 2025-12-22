# DMaaST Value Chain Digital Twin - Docker Commands
.PHONY: build up down logs restart clean dev

# Build all containers
build:
	docker-compose build

# Start all containers
up:
	docker-compose up -d

# Start with build
up-build:
	docker-compose up -d --build

# Stop all containers
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# View backend logs only
logs-backend:
	docker-compose logs -f backend

# View frontend logs only
logs-frontend:
	docker-compose logs -f frontend

# Restart all containers
restart:
	docker-compose restart

# Stop and remove containers, networks, volumes
clean:
	docker-compose down -v --rmi local

# Development mode (without Docker)
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@cd backend && source venv/bin/activate && uvicorn main:app --reload &
	@cd frontend && npm run dev

# Check container status
status:
	docker-compose ps

# Shell into backend container
shell-backend:
	docker-compose exec backend /bin/bash

# Shell into frontend container
shell-frontend:
	docker-compose exec frontend /bin/sh

