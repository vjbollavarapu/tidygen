# TidyGen ERP Deployment Infrastructure

This directory contains all deployment configurations for the TidyGen ERP system, including Docker, Kubernetes, and CI/CD configurations.

## 🏗️ Infrastructure Overview

### Domains
- **Production**: `api.tidygen.com`, `app.tidygen.com`
- **Staging**: `staging.tidygen.com`
- **Development**: `localhost:8000`

### Environments
- **Development**: Local development with hot reloading
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

## 📁 Directory Structure

```
infra/
├── docker/
│   ├── development/
│   │   ├── docker-compose.yml          # Development environment
│   │   └── docker-compose.prod.yml     # Production-like development
│   ├── staging/
│   │   ├── docker-compose.yml          # Staging environment
│   │   ├── staging.env                 # Staging environment variables
│   │   └── nginx/
│   │       └── nginx.staging.conf      # Staging Nginx configuration
│   └── production/
│       ├── docker-compose.yml          # Production environment
│       ├── production.env              # Production environment variables
│       └── nginx/
│           └── nginx.prod.conf         # Production Nginx configuration
├── k8s/
│   ├── namespace.yaml                  # Kubernetes namespace
│   ├── configmap.yaml                  # Configuration map
│   ├── secret.yaml                     # Secrets (update with actual values)
│   ├── postgres.yaml                   # PostgreSQL deployment
│   ├── redis.yaml                      # Redis deployment
│   ├── backend.yaml                    # Backend application deployment
│   └── ingress.yaml                    # Ingress configuration
├── deploy.sh                           # Deployment script
└── README.md                           # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Kubernetes cluster (for K8s deployment)
- Domain names configured with DNS
- SSL certificates

### Development Environment
```bash
# Start development environment
./deploy.sh development deploy

# Check status
./deploy.sh development status

# View logs
./deploy.sh development logs

# Stop services
./deploy.sh development stop
```

### Staging Environment
```bash
# Deploy to staging
./deploy.sh staging deploy

# Check status
./deploy.sh staging status
```

### Production Environment
```bash
# Deploy to production
./deploy.sh production deploy

# Check status
./deploy.sh production status
```

## 🐳 Docker Deployment

### Development
The development environment includes:
- PostgreSQL database
- Redis cache
- Django backend with hot reloading
- Celery worker and beat scheduler
- Ganache (Ethereum testnet)
- Nginx reverse proxy

**Container Names:**
- `tidygen_db_dev`
- `tidygen_redis_dev`
- `tidygen_backend_dev`
- `tidygen_celery_dev`
- `tidygen_celery_beat_dev`
- `tidygen_ganache_dev`
- `tidygen_nginx_dev`

### Staging
The staging environment is production-like but with:
- Test database
- Staging domain configuration
- More lenient rate limiting
- Test Web3 network (Goerli)

**Container Names:**
- `tidygen_db_staging`
- `tidygen_redis_staging`
- `tidygen_backend_staging`
- `tidygen_celery_staging`
- `tidygen_celery_beat_staging`
- `tidygen_nginx_staging`

### Production
The production environment includes:
- Production database with backups
- Production Redis with persistence
- Multiple backend replicas
- Production Web3 network (Ethereum mainnet)
- SSL termination
- Rate limiting and security headers

**Container Names:**
- `tidygen_db_prod`
- `tidygen_redis_prod`
- `tidygen_backend_prod`
- `tidygen_celery_prod`
- `tidygen_celery_beat_prod`
- `tidygen_nginx_prod`

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (v1.20+)
- kubectl configured
- cert-manager for SSL certificates
- nginx-ingress controller

### Deploy to Kubernetes
```bash
# Apply all configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n tidygen-erp

# Check services
kubectl get services -n tidygen-erp

# Check ingress
kubectl get ingress -n tidygen-erp
```

### Update Secrets
Before deploying, update the secrets in `k8s/secret.yaml`:
```bash
# Encode your secrets
echo -n "your-secret-key" | base64
echo -n "postgresql://user:pass@host:5432/db" | base64

# Update the secret.yaml file with encoded values
kubectl apply -f k8s/secret.yaml
```

## 🔧 Configuration

### Environment Variables

#### Required for All Environments
- `SECRET_KEY`: Django secret key
- `POSTGRES_PASSWORD`: Database password
- `DATABASE_URL`: Full database connection string

#### Production Specific
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: CORS allowed origins
- `EMAIL_HOST_PASSWORD`: Email service password
- `WEB3_PRIVATE_KEY`: Web3 private key for automated operations
- `AWS_ACCESS_KEY_ID`: AWS access key for file storage
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `SENTRY_DSN`: Sentry DSN for error monitoring

### Domain Configuration

#### DNS Setup
Configure your DNS to point to your server:
```
api.tidygen.com     -> YOUR_SERVER_IP
app.tidygen.com     -> YOUR_SERVER_IP
staging.tidygen.com -> YOUR_SERVER_IP
```

#### SSL Certificates
Place SSL certificates in the appropriate nginx directories:
- Production: `infra/docker/production/nginx/ssl/`
- Staging: `infra/docker/staging/nginx/ssl/`

## 🔄 CI/CD Pipeline

### GitHub Actions
The CI/CD pipeline is configured in `.github/workflows/backend-ci.yml`:

1. **Test**: Run tests, linting, and security checks
2. **Build**: Build and push Docker images to GitHub Container Registry
3. **Deploy Staging**: Deploy to staging on `develop` branch
4. **Deploy Production**: Deploy to production on `main` branch

### Image Registry
Images are pushed to GitHub Container Registry:
- `ghcr.io/vcsmy/tidygen-erp/tidygen-backend:latest` (production)
- `ghcr.io/vcsmy/tidygen-erp/tidygen-backend:develop` (staging)

## 📊 Monitoring and Logging

### Health Checks
- Backend: `GET /api/health/`
- Database: PostgreSQL health check
- Redis: Redis ping check

### Logs
- Application logs: `/app/logs/` in containers
- Nginx logs: `/var/log/nginx/` in nginx containers
- Docker logs: `docker-compose logs [service]`

### Monitoring
- Sentry integration for error tracking
- Health check endpoints for monitoring
- Resource limits and requests in Kubernetes

## 🔒 Security

### Production Security Features
- SSL/TLS termination
- Security headers (HSTS, X-Frame-Options, etc.)
- Rate limiting on API endpoints
- CORS configuration
- Secret management
- Non-root containers

### Network Security
- Internal Docker networks
- Firewall configuration (ports 80, 443)
- SSL certificate management

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose exec db pg_isready -U tidygen_user -d tidygen_erp

# Check database logs
docker-compose logs db
```

#### Backend Issues
```bash
# Check backend logs
docker-compose logs backend

# Check backend health
curl http://localhost:8000/api/health/
```

#### Redis Issues
```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Check Redis logs
docker-compose logs redis
```

#### Nginx Issues
```bash
# Check Nginx configuration
docker-compose exec nginx nginx -t

# Check Nginx logs
docker-compose logs nginx
```

### Performance Issues
- Check resource usage: `docker stats`
- Monitor database performance
- Check Redis memory usage
- Review application logs for errors

## 📝 Maintenance

### Database Backups
```bash
# Create backup
docker-compose exec db pg_dump -U tidygen_user tidygen_erp > backup.sql

# Restore backup
docker-compose exec -T db psql -U tidygen_user tidygen_erp < backup.sql
```

### Updates
```bash
# Update images
docker-compose pull

# Restart services
docker-compose restart

# Run migrations
docker-compose exec backend python manage.py migrate
```

### Scaling
- **Horizontal**: Increase replicas in Kubernetes
- **Vertical**: Increase resource limits
- **Database**: Use read replicas for read-heavy workloads

## 📞 Support

For deployment issues:
1. Check the logs: `./deploy.sh [env] logs`
2. Verify configuration files
3. Check DNS and SSL certificate setup
4. Review this documentation

For TidyGen ERP support: support@tidygen.com