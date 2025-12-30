# 🐳 Docker Quick Start

Run the NFT Place Game on Ubuntu VM in minutes with Docker.

**No dependencies needed** - Docker handles PostgreSQL, Node.js, and everything else!

---

## 🚀 Quick Start

### 1. Install Docker (Ubuntu VM Only)

```bash
# Check if already installed
docker --version

# If not installed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker compose version
```

### 2. Configure Environment

```bash
# Copy example to create .env file
cp .env.example .env

# Edit and set ALL required values
nano .env
```

**Required values in .env:**
- `CONTRACT_ADDRESS` - Your deployed contract address
- `ADMIN_PRIVATE_KEY` - Admin wallet private key
- `PINATA_JWT` - Pinata JWT token
- `PINATA_API_KEY` - Pinata API key
- `PINATA_SECRET_KEY` - Pinata secret key
- `DB_PASSWORD` - Change from default!
- `ADMIN_API_KEY` - Change from default!

### 3. Start Application

```bash
# Start all services
make up

# Watch logs
make logs-backend
```

**Wait for:** `✓ Migrations completed successfully`

### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 🔧 Common Commands

```bash
# Start/Stop
make up          # Start all services
make down        # Stop all services
make restart     # Restart services
make rebuild     # Rebuild and restart

# Monitoring
make logs        # All logs
make logs-backend   # Backend only
make logs-frontend  # Frontend only
make status      # Service status
make health      # Health checks

# Database
make db-shell    # PostgreSQL shell
make db-reset    # Reset DB (WARNING: deletes data!)
make migrate     # Run migrations
make seed        # Run seeders

# Utilities
make shell-backend   # Backend container shell
make update-images   # Update place images script

# Help
make help        # Show all commands
```

---

## 🐛 Troubleshooting

**Services won't start?**
```bash
make logs-backend       # Check backend logs
make logs-db            # Check database logs
sudo lsof -i :3000      # Check if port in use
```

**Missing environment variables?**
```bash
# Verify .env exists and has required values
ls -la .env
make restart
```

**Database migration errors?**
```bash
make db-reset    # WARNING: Deletes all data
make up
```

**Port already in use?**
```bash
# Stop conflicting service or change port in .env
# Example: BACKEND_PORT=3001, FRONTEND_PORT=5174
```

---

## 📦 What's Included

Docker runs these services in isolated containers:
- **PostgreSQL 15** - Database
- **Node.js 18** - Backend runtime
- **Vite** - Frontend development server (dev mode)
- **Nginx** - Frontend static server (production mode)

Your Ubuntu VM stays clean - no manual installation needed!
