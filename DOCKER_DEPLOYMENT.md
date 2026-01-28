# Docker Deployment Guide for CHUTKI

Complete guide to deploying CHUTKI using Docker and Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) installed (version 2.0+)
- At least 2GB of free disk space

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Bil-2/CHUTKI-IMAGE-TOOL.git
cd CHUTKI
```

### 2. Configure Environment Variables (Optional)

Create a `.env` file in the project root for custom configuration:

```bash
# Security (IMPORTANT: Change these in production!)
JWT_SECRET=your-super-secure-jwt-secret-here
SESSION_SECRET=your-super-secure-session-secret-here

# Client URL (update for production)
CLIENT_URL=http://localhost:5001

# Optional: Google OAuth
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Email Service (SendGrid)
# SENDGRID_API_KEY=your-sendgrid-api-key
# FROM_EMAIL=your-verified-email@example.com
```

### 3. Build and Run with Docker Compose

```bash
# Build and start all services (MongoDB + CHUTKI app)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove all data (including database)
docker-compose down -v
```

### 4. Access the Application

- **Frontend + Backend**: http://localhost:5001
- **MongoDB**: localhost:27017

## Manual Docker Build

If you want to build and run the Docker image separately:

```bash
# Build the Docker image
docker build -t chutki:latest .

# Run the container (requires MongoDB)
docker run -d \
  --name chutki-app \
  -p 5001:5001 \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/chutki \
  -e JWT_SECRET=your-jwt-secret \
  -e SESSION_SECRET=your-session-secret \
  -e CLIENT_URL=http://localhost:5001 \
  chutki:latest
```

## Architecture

The Docker setup includes:

1. **Multi-stage Build**:
   - Stage 1: Builds frontend (React + Vite)
   - Stage 2: Sets up backend with frontend assets

2. **Services**:
   - `mongodb`: MongoDB 7.0 database
   - `chutki-app`: CHUTKI application (backend serving frontend)

3. **Networking**:
   - Custom bridge network for container communication
   - Only port 5001 exposed to host

4. **Data Persistence**:
   - MongoDB data persisted in `mongodb_data` volume
   - Uploaded files can be persisted via volume mount

## Environment Variables

### Required

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production | Node environment |
| `PORT` | 5001 | Application port |
| `MONGODB_URI` | auto-configured | MongoDB connection string |
| `JWT_SECRET` | (required) | JWT signing secret |
| `SESSION_SECRET` | (required) | Session secret |
| `CLIENT_URL` | http://localhost:5001 | Frontend URL for CORS |

### Optional

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SENDGRID_API_KEY` | SendGrid API key for emails |
| `FROM_EMAIL` | Verified sender email address |

## Health Checks

Both containers have health checks configured:

- **MongoDB**: Checked every 10s using `mongosh`
- **CHUTKI App**: Checked every 30s via `/api/health` endpoint

Check health status:
```bash
docker ps
# Look for "healthy" in STATUS column

# Or detailed health check
docker inspect --format='{{json .State.Health}}' chutki-app
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs chutki-app
docker-compose logs mongodb

# Check if port 5001 is in use
lsof -i :5001

# Restart containers
docker-compose restart
```

### Database Connection Issues

```bash
# Verify MongoDB is running
docker-compose ps

# Test MongoDB connection
docker exec -it chutki-mongodb mongosh -u admin -p password123

# Check MongoDB logs
docker-compose logs mongodb
```

### Clear All Data and Restart

```bash
# Stop everything and remove volumes
docker-compose down -v

# Remove images (optional)
docker rmi chutki-chutki-app

# Rebuild and start
docker-compose up -d --build
```

### Permission Issues

The application runs as a non-root user (nodejs:1001) for security. If you encounter permission issues with uploads:

```bash
# Fix permissions on host
chmod -R 777 backend/uploads
```

## Production Deployment

For production deployment:

1. **Change default credentials**:
   - Update MongoDB username and password
   - Set strong JWT_SECRET and SESSION_SECRET
   - Update CLIENT_URL to your domain

2. **Use environment file**:
   ```bash
   docker-compose --env-file .env.production up -d
   ```

3. **Enable HTTPS**:
   - Use a reverse proxy (nginx, Caddy, Traefik)
   - Obtain SSL certificates (Let's Encrypt)

4. **Monitor resources**:
   ```bash
   docker stats chutki-app
   ```

5. **Regular backups**:
   ```bash
   # Backup MongoDB data
   docker exec chutki-mongodb mongodump --out /data/backup
   ```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Remove old images
docker image prune -f
```

## Resource Usage

Typical resource consumption:
- **Memory**: 512MB - 1GB
- **CPU**: 0.5 - 1 core
- **Disk**: 2-5GB (depending on database size)

## Security Features

- ✅ Non-root user in container
- ✅ Health checks enabled
- ✅ Network isolation
- ✅ Volume mounts for data persistence
- ✅ Environment variable support for secrets

## Support

For issues or questions:
- [GitHub Issues](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues)
- [Documentation](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL)

---

**CHUTKI** - Professional Image Processing in Docker 🐳
