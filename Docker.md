# 🐳 Docker Development Setup Guide

## 📋 Prerequisites
- Docker Desktop installed and running
- Docker Compose v2+

## 🚀 Quick Start Commands

### **Start All Services**
```bash
# Start everything (database, server, client)
docker-compose up

# Start in background
docker-compose up -d

# Start with build (after code changes)
docker-compose up --build
```

### **Individual Service Control**
```bash
# Start only database
docker-compose up postgres pgadmin

# Start server + database
docker-compose up postgres server

# Restart specific service
docker-compose restart server

# View logs
docker-compose logs -f server
docker-compose logs -f client
```

### **Stop Services**
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

## 🌐 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Client** | http://localhost:3000 | React frontend |
| **Server** | http://localhost:3001 | Express API |
| **pgAdmin** | http://localhost:8080 | Database admin |
| **PostgreSQL** | localhost:5432 | Direct database access |

## 🔧 Development Workflow

### **1. Initial Setup**
```bash
# Clone and navigate to project
cd fullstack_cryptography

# Start all services
docker-compose up --build
```

### **2. Development**
- **Code Changes**: Automatically reflected via volume mounts
- **Server**: Uses nodemon for auto-restart
- **Client**: Uses Vite HMR for instant updates
- **Database**: Persistent data via volumes

### **3. Debugging**
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f server
docker-compose logs -f client

# Execute commands in running container
docker-compose exec server npm run test
docker-compose exec client npm run build

# Access container shell
docker-compose exec server sh
docker-compose exec client sh
```

## 📁 Volume Mounts (Development)

### **Server**
- `./server/src` → `/app/src` (hot reload)
- `./server/keys` → `/app/keys` (encryption keys)
- `/app/node_modules` (preserved in container)

### **Client**
- `./client/src` → `/app/src` (hot reload)
- `./client/public` → `/app/public` (static assets)
- `/app/node_modules` (preserved in container)

## 🗄️ Database Configuration

### **Connection Details**
- **Host**: `postgres` (from containers) or `localhost` (from host)
- **Port**: `5432`
- **Database**: `crypto_app`
- **Username**: `crypto_user`
- **Password**: `crypto_password`

### **pgAdmin Setup**
1. Go to http://localhost:8080
2. Login: `admin@crypto.local` / `admin123`
3. Add server:
   - Host: `postgres`
   - Port: `5432`
   - Database: `crypto_app`
   - Username: `crypto_user`
   - Password: `crypto_password`

## 🔑 Encryption Keys

### **Key Locations**
- **Server**: `./server/keys/` (mounted to container)
- **Client**: `./client/src/assets/keys/` (bundled)

### **This Solves Your Vite Issues** ✅
- Client runs in its own container with proper file access
- No "outside serving allow list" errors
- Private key import works: `@/assets/keys/client-key.pem?raw`

## 🔧 Environment Variables

### **Server (.env in server/)**
```env
NODE_ENV=development
DATABASE_URL=postgresql://crypto_user:crypto_password@postgres:5432/crypto_app
PORT=3001
```

### **Client (.env in client/)**
```env
VITE_API_URL=http://localhost:3001
```

## 🐛 Troubleshooting

### **Container Issues**
```bash
# Rebuild containers
docker-compose build --no-cache

# Remove all containers and start fresh
docker-compose down -v
docker-compose up --build
```

### **Database Issues**
```bash
# Check database health
docker-compose exec postgres pg_isready -U crypto_user -d crypto_app

# Reset database
docker-compose down -v
docker-compose up postgres
```

### **Key Import Issues**
```bash
# Check if keys exist in containers
docker-compose exec server ls -la /app/keys/
docker-compose exec client ls -la /app/src/assets/keys/
```

## 📦 Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Or add production service to main compose file
```

## Dev commands
```bash
# Start development
npm run dev

# View logs
npm run logs

# Restart server only
npm run restart:server

# Access server shell
npm run shell:server

# Reset database
npm run db:reset
```