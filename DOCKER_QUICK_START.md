# 🐳 Docker Quick Start

Get the Municipal Place NFT application running in 3 minutes with Docker!

## ✅ Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed

**No PostgreSQL installation required!** Docker handles everything.

---

## 🚀 Quick Start (3 Steps)

### 1. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and set these REQUIRED values:
nano .env
```

**Required values to set:**
- `CONTRACT_ADDRESS` - Your deployed contract
- `ADMIN_PRIVATE_KEY` - Admin wallet private key
- `PINATA_JWT` - Pinata JWT token
- `PINATA_API_KEY` - Pinata API key
- `PINATA_SECRET_KEY` - Pinata secret key
- `DB_PASSWORD` - Database password (change from default!)
- `ADMIN_API_KEY` - Admin API key (change from default!)

### 2. Start Application

```bash
# Start all services
docker compose up -d

# View startup logs
docker compose logs -f backend
```

**Wait for this message:**
```
✓ Migrations completed successfully
Starting application...
```

### 3. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 📝 What Happens Automatically

When you run `docker compose up -d`:

1. ✅ PostgreSQL starts in a container
2. ✅ System waits for database to be ready
3. ✅ Validates all required environment variables
4. ✅ Runs database migrations automatically
5. ✅ Backend API starts
6. ✅ Frontend starts

**No manual steps needed!**

---

## 🔧 Common Commands

```bash
# Stop application
docker compose down

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Rebuild containers
docker compose up -d --build

# Run updatePlaceImages script
docker compose exec backend node scripts/updatePlaceImages.js

# Access backend shell
docker compose exec backend sh

# Access database
docker compose exec postgres psql -U postgres -d place_nft_1155
```

---

## 🐛 Troubleshooting

### Container won't start?

```bash
# Check logs
docker compose logs backend

# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :5173
```

### Missing environment variables error?

1. Check `.env` file exists in project root
2. Verify all REQUIRED variables are set
3. Restart: `docker compose restart backend`

### Migration errors?

```bash
# View migration logs
docker compose logs backend | grep migration

# Reset database (WARNING: deletes data!)
docker compose down -v
docker compose up -d
```

---

## 📚 Full Documentation

For complete documentation, see:
- **[docs/DOCKER.md](docs/DOCKER.md)** - Complete Docker guide
- **[.env.example](.env.example)** - All environment variables
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture

---

## 🎯 Ubuntu VM (No PostgreSQL Installed)

Docker works perfectly on Ubuntu VMs without PostgreSQL installed!

```bash
# Install Docker on Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out and log back in

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify
docker --version
docker compose version

# Then follow Quick Start steps above!
```

---

**✅ That's it!** Your application is now running in Docker containers.
