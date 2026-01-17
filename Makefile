# Makefile for Portal da Lembrança (Memorial QR MVP)
# Provides commands for testing, debugging, building, and running the application

.PHONY: help install dev build test test-watch test-cov test-mutation clean lint format db-migrate db-push db-studio docker-build docker-run

# Default target - show help
help:
	@echo "Portal da Lembrança - Development Commands"
	@echo ""
	@echo "Installation:"
	@echo "  make install          - Install dependencies with pnpm"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start development server"
	@echo "  make build            - Build for production"
	@echo "  make start            - Start production server"
	@echo ""
	@echo "Testing:"
	@echo "  make test             - Run all tests"
	@echo "  make test-watch       - Run tests in watch mode"
	@echo "  make test-cov         - Run tests with coverage report"
	@echo "  make test-mutation    - Run mutation tests (advanced)"
	@echo "  make test-debug       - Run tests in debug mode"
	@echo "  make test-ui          - Run tests with UI interface"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             - Run linter"
	@echo "  make format           - Format code with Prettier"
	@echo "  make audit            - Run security audit"
	@echo ""
	@echo "Database:"
	@echo "  make db-generate      - Generate database migrations"
	@echo "  make db-migrate       - Run database migrations"
	@echo "  make db-push          - Push schema to database"
	@echo "  make db-studio        - Open Drizzle Studio"
	@echo "  make db-seed          - Seed historical data"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            - Remove build artifacts"
	@echo "  make clean-all        - Remove all generated files and dependencies"

# Installation
install:
	@echo "Installing dependencies..."
	pnpm install

# Development
dev:
	@echo "Starting development server..."
	pnpm run dev

build:
	@echo "Building for production..."
	pnpm run build

build-client:
	@echo "Building client..."
	pnpm run build:client

build-vercel:
	@echo "Building for Vercel..."
	pnpm run build:vercel

start:
	@echo "Starting production server..."
	pnpm run start

# Testing
test:
	@echo "Running tests..."
	pnpm run test

test-watch:
	@echo "Running tests in watch mode..."
	pnpm exec vitest --watch

test-cov:
	@echo "Running tests with coverage..."
	pnpm run test:cov

test-mutation:
	@echo "Running mutation tests (this may take a while)..."
	@echo "Installing Stryker if not present..."
	pnpm add -D @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker || true
	@echo "Running mutation tests..."
	pnpm exec stryker run

test-debug:
	@echo "Running tests in debug mode..."
	@echo "Debugger will attach on port 9229"
	node --inspect-brk ./node_modules/.bin/vitest run

test-ui:
	@echo "Running tests with UI..."
	pnpm exec vitest --ui

test-single:
	@echo "Running single test file (usage: make test-single FILE=path/to/test.ts)..."
	pnpm exec vitest run $(FILE)

# Code Quality
lint:
	@echo "Running linter..."
	pnpm run lint

format:
	@echo "Formatting code..."
	pnpm run format

format-check:
	@echo "Checking code formatting..."
	pnpm exec prettier --check .

audit:
	@echo "Running security audit..."
	pnpm audit

# Database
db-generate:
	@echo "Generating database migrations..."
	pnpm run db:generate

db-migrate:
	@echo "Running database migrations..."
	pnpm run db:migrate

db-migrate-neon:
	@echo "Running migrations on Neon..."
	pnpm run db:migrate:neon

db-push:
	@echo "Pushing schema to database..."
	pnpm run db:push

db-studio:
	@echo "Opening Drizzle Studio..."
	pnpm run db:studio

db-seed:
	@echo "Seeding database with historical data..."
	pnpm run db:seed:historical

# Cleanup
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist build .lint-tmp
	@echo "Cleaned!"

clean-coverage:
	@echo "Cleaning coverage reports..."
	rm -rf coverage .nyc_output
	@echo "Coverage cleaned!"

clean-all: clean clean-coverage
	@echo "Removing node_modules..."
	rm -rf node_modules
	@echo "All cleaned!"

# Docker (if using Docker)
docker-build:
	@echo "Building Docker image..."
	docker build -t memorial-qr-mvp .

docker-run:
	@echo "Running Docker container..."
	docker run -p 3000:3000 --env-file .env memorial-qr-mvp

# Git helpers
git-status:
	@echo "Git status:"
	git status --short

git-staged:
	@echo "Staged changes:"
	git diff --cached --stat

# Health checks
health-check:
	@echo "Checking application health..."
	curl -f http://localhost:3000/api/health || echo "Server not running or health endpoint unavailable"

# Performance
perf-test:
	@echo "Running performance tests..."
	@echo "This would run performance/load tests (not yet implemented)"

# CI/CD helpers
ci-test: lint test-cov
	@echo "CI tests completed!"

ci-build: lint build-vercel
	@echo "CI build completed!"

# Development helpers
dev-reset: clean-all install db-push db-seed
	@echo "Development environment reset complete!"

# Watch for file changes (requires watchman or similar)
watch-test:
	@echo "Watching tests..."
	pnpm exec vitest --watch

watch-types:
	@echo "Watching TypeScript types..."
	pnpm exec tsc --watch --noEmit

# Code coverage helpers
coverage-open:
	@echo "Opening coverage report in browser..."
	@command -v open > /dev/null && open coverage/index.html || \
	command -v xdg-open > /dev/null && xdg-open coverage/index.html || \
	command -v start > /dev/null && start coverage/index.html || \
	echo "Cannot open browser. Please open coverage/index.html manually"

# Mutation testing helpers
mutation-report:
	@echo "Opening mutation test report..."
	@command -v open > /dev/null && open reports/mutation/html/index.html || \
	command -v xdg-open > /dev/null && xdg-open reports/mutation/html/index.html || \
	command -v start > /dev/null && start reports/mutation/html/index.html || \
	echo "Cannot open browser. Please open reports/mutation/html/index.html manually"

# Documentation
docs-serve:
	@echo "Serving documentation..."
	@echo "Opening docs directory..."
	cd docs && python3 -m http.server 8080 || python -m http.server 8080

# Environment setup
env-check:
	@echo "Checking environment variables..."
	@test -f .env && echo "✓ .env file exists" || echo "✗ .env file missing (copy .env.example)"
	@test -n "$$DATABASE_URL" && echo "✓ DATABASE_URL is set" || echo "⚠ DATABASE_URL not set"
	@test -n "$$JWT_SECRET" && echo "✓ JWT_SECRET is set" || echo "⚠ JWT_SECRET not set"

# Quick test shortcuts
t: test
tw: test-watch
tc: test-cov
tm: test-mutation

# Quick build shortcuts
b: build
bc: build-client
bv: build-vercel

# Quick run shortcuts
d: dev
s: start

# All tests
test-all: lint test-cov
	@echo "All tests completed!"
