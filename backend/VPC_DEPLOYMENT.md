# VPC Deployment Guide for Guri24

This guide provides the commands to deploy the dockerized Guri24 backend to your VPC (Ubuntu/Debian).

## 1. Prepare the Server
Update packages and install Docker + Docker Compose.

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose-v2

# Add your user to the docker group (optional, requires relogin)
sudo usermod -aG docker $USER
```

## 2. Deploy Code
Clone your repository (replace with your actual repo URL).

```bash
git clone <your-repo-url>
cd guri/backend
```

## 3. Configure Environment
Create and edit your `.env` file. **IMPORTANT**: Change `S3_PUBLIC_URL_OVERRIDE` to your VPC IP.

```bash
cp .env.example .env
nano .env
```

Set these specific variables for production:
```env
# Replace with your actual VPC Public IP
S3_PUBLIC_URL_OVERRIDE=http://143.198.30.249:9000
ALLOWED_HOSTS=*
CORS_ORIGINS=http://localhost:5173,http://143.198.30.249,http://guri24.com,https://guri24.com,http://www.guri24.com,https://www.guri24.com
DEBUG=false
```

## 4. Open Firewall Ports
Ensure your cloud provider (AWS/GCP/DigitalOcean) and `ufw` allow the following ports:

```bash
sudo ufw allow 8001/tcp   # API
sudo ufw allow 9000/tcp   # MinIO API
sudo ufw allow 9001/tcp   # MinIO Console
sudo ufw allow 5433/tcp   # Postgres (Optional, if external access needed)
```

## 5. Run with Docker
Start everything in the background.

```bash
docker compose up --build -d
```

## 6. Useful Production Commands

### Check Status
```bash
docker compose ps
```

### View API Logs
```bash
docker compose logs -f api
```

### Database Maintenance
If you need to run migrations inside the container:
```bash
docker compose exec api alembic upgrade head
```

### Scale API (Optional)
```bash
docker compose up -d --scale api=3
```

## 7. Troubleshooting CORS Errors

If you still see CORS errors (e.g., "must not be the wildcard '*'"), follow these steps on your VPC:

1. **Pull Latest Code**:
   (Assuming you are using git)
   ```bash
   git pull
   ```

2. **Rebuild & Restart API**:
   ```bash
   docker-compose up --build -d api
   ```

3. **Check API Logs**:
   ```bash
   docker-compose logs api | grep "CORS allowed origins"
   ```
   *You should now see the list of allowed domains in the logs.*

4. **Verify Environment Variables**:
   ```bash
   docker-compose exec api env | grep CORS
   ```

5. **Hard Reset (If needed)**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```
