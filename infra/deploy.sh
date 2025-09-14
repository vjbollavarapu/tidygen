#!/bin/bash

# TidyGen ERP Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Environment: development, staging, production
# Action: deploy, stop, restart, logs, status

set -e

ENVIRONMENT=${1:-development}
ACTION=${2:-deploy}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[TidyGen ERP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if required files exist
check_files() {
    local env_dir="infra/docker/${ENVIRONMENT}"
    
    if [ ! -f "${env_dir}/docker-compose.yml" ]; then
        print_error "Docker compose file not found: ${env_dir}/docker-compose.yml"
        exit 1
    fi
    
    if [ -f "${env_dir}/${ENVIRONMENT}.env" ] && [ ! -f "${env_dir}/.env" ]; then
        print_warning "Environment file not found. Copying from template..."
        cp "${env_dir}/${ENVIRONMENT}.env" "${env_dir}/.env"
        print_warning "Please update the .env file with your actual configuration values."
    fi
}

# Function to deploy
deploy() {
    print_status "Deploying TidyGen ERP to ${ENVIRONMENT} environment..."
    
    local env_dir="infra/docker/${ENVIRONMENT}"
    cd "${env_dir}"
    
    # Pull latest images
    print_status "Pulling latest images..."
    docker-compose pull
    
    # Build and start services
    print_status "Building and starting services..."
    docker-compose up -d --build
    
    # Wait for services to be healthy
    print_status "Waiting for services to be healthy..."
    sleep 10
    
    # Run migrations
    print_status "Running database migrations..."
    docker-compose exec backend python manage.py migrate
    
    # Collect static files
    print_status "Collecting static files..."
    docker-compose exec backend python manage.py collectstatic --noinput
    
    print_success "TidyGen ERP deployed successfully to ${ENVIRONMENT}!"
    print_status "Services are starting up. Check status with: ./deploy.sh ${ENVIRONMENT} status"
}

# Function to stop services
stop() {
    print_status "Stopping TidyGen ERP services in ${ENVIRONMENT} environment..."
    
    local env_dir="infra/docker/${ENVIRONMENT}"
    cd "${env_dir}"
    
    docker-compose down
    
    print_success "TidyGen ERP services stopped in ${ENVIRONMENT}!"
}

# Function to restart services
restart() {
    print_status "Restarting TidyGen ERP services in ${ENVIRONMENT} environment..."
    
    local env_dir="infra/docker/${ENVIRONMENT}"
    cd "${env_dir}"
    
    docker-compose restart
    
    print_success "TidyGen ERP services restarted in ${ENVIRONMENT}!"
}

# Function to show logs
logs() {
    local env_dir="infra/docker/${ENVIRONMENT}"
    cd "${env_dir}"
    
    docker-compose logs -f
}

# Function to show status
status() {
    print_status "TidyGen ERP services status in ${ENVIRONMENT} environment:"
    
    local env_dir="infra/docker/${ENVIRONMENT}"
    cd "${env_dir}"
    
    docker-compose ps
}

# Function to show help
show_help() {
    echo "TidyGen ERP Deployment Script"
    echo ""
    echo "Usage: $0 [environment] [action]"
    echo ""
    echo "Environments:"
    echo "  development  - Local development environment"
    echo "  staging      - Staging environment"
    echo "  production   - Production environment"
    echo ""
    echo "Actions:"
    echo "  deploy       - Deploy/update services (default)"
    echo "  stop         - Stop all services"
    echo "  restart      - Restart all services"
    echo "  logs         - Show logs from all services"
    echo "  status       - Show status of all services"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 development deploy"
    echo "  $0 staging status"
    echo "  $0 production logs"
}

# Main script logic
main() {
    # Check if help is requested
    if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_help
        exit 0
    fi
    
    # Validate environment
    if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
        print_error "Invalid environment: $ENVIRONMENT"
        print_error "Valid environments: development, staging, production"
        exit 1
    fi
    
    # Validate action
    if [[ ! "$ACTION" =~ ^(deploy|stop|restart|logs|status)$ ]]; then
        print_error "Invalid action: $ACTION"
        print_error "Valid actions: deploy, stop, restart, logs, status"
        exit 1
    fi
    
    # Check prerequisites
    check_docker
    check_files
    
    # Execute action
    case $ACTION in
        deploy)
            deploy
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs
            ;;
        status)
            status
            ;;
    esac
}

# Run main function
main "$@"
