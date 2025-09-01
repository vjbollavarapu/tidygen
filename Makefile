.PHONY: help install dev build test lint format clean docker-up docker-down docker-build

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev: ## Start development environment
	docker-compose up -d db redis
	cd backend && python manage.py runserver &
	cd frontend && npm run dev

build: ## Build production images
	docker-compose -f docker-compose.prod.yml build

test: ## Run all tests
	cd backend && python -m pytest
	cd frontend && npm run test

lint: ## Run linting
	cd backend && flake8 . && black --check .
	cd frontend && npm run lint

format: ## Format code
	cd backend && black . && isort .
	cd frontend && npm run format

clean: ## Clean up containers and volumes
	docker-compose down -v
	docker system prune -f

docker-up: ## Start all services with Docker
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-build: ## Build Docker images
	docker-compose build

migrate: ## Run database migrations
	cd backend && python manage.py migrate

makemigrations: ## Create database migrations
	cd backend && python manage.py makemigrations

superuser: ## Create Django superuser
	cd backend && python manage.py createsuperuser

shell: ## Open Django shell
	cd backend && python manage.py shell

logs: ## View Docker logs
	docker-compose logs -f
