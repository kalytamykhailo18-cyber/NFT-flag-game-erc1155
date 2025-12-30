# Makefile for NFT Place Game - Docker Operations
# Simplifies Docker Compose commands

.PHONY: help setup build up down restart logs clean rebuild

# Default target
help:
	@echo "NFT Place Game - Docker Commands"
	@echo "================================"
	@echo ""
	@echo "Setup:"
	@echo "  make build       - Build Docker images"
	@echo ""
	@echo "Start/Stop:"
	@echo "  make up          - Start all services (production)"
	@echo "  make up-dev      - Start in development mode"
	@echo "  make up-prod     - Start in production mode"
	@echo "  make up-ipfs     - Start with local IPFS node"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo ""
	@echo "Logs:"
	@echo "  make logs        - View all logs"
	@echo "  make logs-backend  - View backend logs"
	@echo "  make logs-frontend - View frontend logs"
	@echo "  make logs-db     - View database logs"
	@echo "  make status      - Show service status"
	@echo ""
	@echo "Database:"
	@echo "  make db-shell    - Access PostgreSQL shell"
	@echo "  make db-reset    - Reset database (deletes data!)"
	@echo "  make migrate     - Run migrations"
	@echo "  make seed        - Run seeders"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       - Remove containers"
	@echo "  make clean-all   - Remove containers + volumes"
	@echo "  make rebuild     - Rebuild and restart"
	@echo ""
	@echo "Utilities:"
	@echo "  make shell-backend  - Backend shell"
	@echo "  make shell-frontend - Frontend shell"
	@echo "  make update-images  - Run image update script"
	@echo "  make health      - Check service health"

# Build
build:
	docker compose build

# Start services
up:
	docker compose up -d
	@echo ""
	@echo "✓ Services starting..."
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:3000"
	@echo "  Health:   http://localhost:3000/health"
	@echo ""
	@echo "View logs: make logs"

up-dev:
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
	@echo "✓ Development mode: Hot-reload enabled"

up-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "✓ Production mode started"

up-ipfs:
	docker compose --profile with-ipfs up -d
	@echo "✓ Started with local IPFS node"

# Stop services
down:
	@docker compose down

# Restart services
restart:
	@docker compose restart
	@echo "✓ Services restarted"

# Logs
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f postgres

# Status
status:
	@docker compose ps
	@echo ""
	@echo "Health Status:"
	@docker compose ps --format json | grep -q "running" && echo "✓ Services are running" || echo "✗ Some services are not running"

# Database operations
db-shell:
	docker compose exec postgres psql -U postgres -d place_nft_1155

db-reset:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker compose up -d; \
		echo "✓ Database reset complete"; \
	else \
		echo "Cancelled"; \
	fi

migrate:
	docker compose exec backend npx sequelize-cli db:migrate

seed:
	docker compose exec backend npx sequelize-cli db:seed:all

# Clean operations
clean:
	docker compose down --remove-orphans
	@echo "✓ Containers and networks removed"

clean-all:
	@echo "⚠️  WARNING: This will delete all data including database!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v --remove-orphans; \
		echo "✓ Everything cleaned"; \
	else \
		echo "Cancelled"; \
	fi

# Rebuild
rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d
	@echo "✓ Rebuild complete"

update:
	git pull
	docker compose down
	docker compose build
	docker compose up -d
	@echo "✓ Updated and restarted"

# Shell access
shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

# Scripts
update-images:
	docker compose exec backend node scripts/updatePlaceImages.js

# Health checks
health:
	@echo "Checking service health..."
	@echo ""
	@echo "Backend:"
	@curl -s http://localhost:3000/health | grep -q "success" && echo "  ✓ Backend is healthy" || echo "  ✗ Backend is not responding"
	@echo ""
	@echo "Frontend:"
	@curl -s http://localhost:5173 > /dev/null && echo "  ✓ Frontend is accessible" || echo "  ✗ Frontend is not responding"
	@echo ""
	@echo "Database:"
	@docker compose exec -T postgres pg_isready -U postgres > /dev/null && echo "  ✓ Database is ready" || echo "  ✗ Database is not ready"

