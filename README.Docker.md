# Docker Setup Guide

This project is dockerized with separate containers for MySQL, Redis, backend, and frontend.

## Prerequisites

- Docker
- Docker Compose

## Project Structure

```
.
├── BE/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── .dockerignore
├── FE/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── docker-compose.yml
├── docker.env.example
└── .env.example
```

## Quick Start

### 1. Setup Environment Variables

Copy `docker.env.example` to `.env` and adjust values:

```bash
cp docker.env.example .env
```

Edit `.env` file with your desired values (especially passwords and secrets).

### 2. Start All Services

```bash
docker-compose up -d
```

This will start:
- **MySQL** on port 3306 (default)
- **Redis** on port 6379 (default)
- **Backend** on port 3001 (default) - automatically seeds database if empty
- **Frontend** on port 80 (default)

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mysql
```

### 4. Stop Services

```bash
docker-compose down
```

To remove volumes (⚠️ deletes database data):

```bash
docker-compose down -v
```

## Services

### MySQL

- **Image**: `mysql:8.0`
- **Port**: `3306` (configurable via `MYSQL_PORT`)
- **Database**: `smarthome` (configurable via `MYSQL_DATABASE`)
- **Root Password**: Set via `MYSQL_ROOT_PASSWORD`
- **Data Persistence**: Volume `mysql_data`
- **Health Check**: MySQL ping
- **Init Scripts**: Place SQL files in `./database/init/` to run on first startup

### Redis

- **Image**: `redis:alpine`
- **Port**: `6379` (configurable via `REDIS_PORT`)
- **Data Persistence**: Volume `redis_data` with AOF enabled
- **Health Check**: Redis ping

### Backend

- **Build**: From `./BE/Dockerfile`
- **Port**: `3001` (configurable via `BACKEND_PORT`)
- **Entrypoint**: `BE/docker-entrypoint.sh` - Automatically:
  1. Waits for MySQL to be ready
  2. Ensures database tables exist
  3. Checks if database is empty
  4. Seeds database if empty (runs `seedPackagesAndTestUsers.js` and `createAdmin.js`)
  5. Starts the application
- **Environment Variables**:
  - `DB_HOST=mysql` (service name)
  - `REDIS_HOST=redis` (service name)
  - Other vars from `.env` file
- **Volumes**:
  - `./BE/uploads` - Uploaded files
  - `./config.env` - Environment config (read-only)
- **Depends On**: MySQL (healthy), Redis (healthy)
- **Health Check**: `/api/test` endpoint

### Frontend

- **Build**: From `./FE/Dockerfile` (multi-stage: Vite build + nginx)
- **Port**: `80` (configurable via `FRONTEND_PORT`)
- **Depends On**: Backend
- **Health Check**: `/health` endpoint
- **Features**:
  - React Router SPA support
  - API proxy to backend
  - WebSocket proxy to backend

## Automatic Database Seeding

The backend container automatically seeds the database on first startup if it's empty:

1. **Checks if database is empty**: Looks for `users` table and counts records
2. **Ensures tables exist**: Runs `database/migrations/ensurePackageTables.js`
3. **Seeds data if empty**:
   - Runs `BE/scripts/seedPackagesAndTestUsers.js` - Creates packages and test users
   - Runs `BE/scripts/createAdmin.js` - Creates admin user

### Default Credentials (After Seeding)

**Admin User:**
- Email: `admin@smarthome.com`
- Password: `Admin@123`

**Test Users:**
- Email: `pro_test@example.com` / Password: `Test@1234` (PRO package)
- Email: `premium_test@example.com` / Password: `Test@1234` (PREMIUM package)

⚠️ **Important**: Change these passwords in production!

## Environment Variables

### Required Variables

Create `.env` file based on `docker.env.example`:

```env
# MySQL
MYSQL_ROOT_PASSWORD=your-root-password
MYSQL_DATABASE=smarthome
MYSQL_USER=appuser
MYSQL_PASSWORD=your-app-password

# Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

### Backend Service Variables

The backend service automatically gets:
- `DB_HOST=mysql` (Docker service name)
- `REDIS_HOST=redis` (Docker service name)
- Other variables from `.env` file

## Networking

All services are on the same bridge network (`home_x_network`), allowing them to communicate using service names:

- Backend → MySQL: `mysql:3306`
- Backend → Redis: `redis:6379`
- Frontend → Backend: `backend:3001`

## Data Persistence

### MySQL Data

Stored in Docker volume `mysql_data`. To backup:

```bash
docker run --rm -v home_x_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

To restore:

```bash
docker run --rm -v home_x_mysql_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/mysql-backup.tar.gz"
```

### Redis Data

Stored in Docker volume `redis_data` with AOF (Append Only File) persistence.

### Uploads

Backend uploads are stored in `./BE/uploads` directory (mounted as volume).

## Database Initialization

### Automatic (Recommended)

The backend entrypoint script automatically:
1. Waits for MySQL to be ready
2. Ensures tables exist (runs migration scripts)
3. Checks if database is empty
4. Seeds data if empty

### Manual Initialization

To manually initialize the database:

1. Place SQL scripts in `./database/init/` directory
2. They will be executed automatically when MySQL container starts for the first time
3. Scripts are executed in alphabetical order

### Manual Seeding

To manually seed the database:

```bash
docker-compose exec backend node BE/scripts/seedPackagesAndTestUsers.js
docker-compose exec backend node BE/scripts/createAdmin.js
```

## Troubleshooting

### Backend can't connect to MySQL

1. Check MySQL is healthy: `docker-compose ps mysql`
2. Check logs: `docker-compose logs mysql`
3. Verify environment variables: `docker-compose exec backend env | grep DB_`
4. Test connection: `docker-compose exec backend mysqladmin ping -h mysql -u root -p`

### Backend can't connect to Redis

1. Check Redis is healthy: `docker-compose ps redis`
2. Check logs: `docker-compose logs redis`
3. Verify environment variables: `docker-compose exec backend env | grep REDIS_`

### Database seeding not working

1. Check backend logs: `docker-compose logs backend`
2. Verify scripts exist: `docker-compose exec backend ls -la BE/scripts/`
3. Check database connection: `docker-compose exec backend node -e "require('./BE/mysql.js')"`
4. Manually run seed: `docker-compose exec backend node BE/scripts/seedPackagesAndTestUsers.js`

### Frontend not loading

1. Check build: `docker-compose logs frontend`
2. Verify nginx: `docker-compose exec frontend nginx -t`
3. Check if backend is accessible: `docker-compose exec frontend wget -O- http://backend:3001/api/test`

### Port conflicts

If ports are already in use, change them in `.env`:

```env
MYSQL_PORT=3307
REDIS_PORT=6380
BACKEND_PORT=3002
FRONTEND_PORT=8080
```

### Reset Everything

⚠️ **Warning**: This deletes all data!

```bash
docker-compose down -v
docker-compose up -d
```

## Development

### Access MySQL

```bash
docker-compose exec mysql mysql -u root -p
# Password: from MYSQL_ROOT_PASSWORD in .env
```

### Access Redis CLI

```bash
docker-compose exec redis redis-cli
```

### Run Backend Commands

```bash
docker-compose exec backend node BE/scripts/your-script.js
```

### View Backend Logs

```bash
docker-compose logs -f backend
```

### Force Re-seed Database

To force re-seed (⚠️ this will add duplicate data if not empty):

```bash
docker-compose exec backend node BE/scripts/seedPackagesAndTestUsers.js
docker-compose exec backend node BE/scripts/createAdmin.js
```

## Production Considerations

1. **Change all default passwords** in `.env`
2. **Use strong JWT_SECRET and SESSION_SECRET**
3. **Enable SSL/TLS** for nginx (add SSL certificates)
4. **Use secrets management** (Docker secrets, AWS Secrets Manager, etc.)
5. **Set resource limits** in docker-compose.yml
6. **Enable logging** to external service
7. **Regular backups** of MySQL and Redis volumes
8. **Monitor** services with health checks
9. **Review and update** default credentials in seed scripts

## Building Individual Services

### Backend Only

```bash
docker build -f BE/Dockerfile -t home_x_backend .
docker run -p 3001:3001 \
  --env-file .env \
  -e DB_HOST=mysql \
  -e REDIS_HOST=redis \
  --network home_x_network \
  home_x_backend
```

### Frontend Only

```bash
docker build -f FE/Dockerfile -t home_x_frontend .
docker run -p 80:80 \
  --network home_x_network \
  home_x_frontend
```
