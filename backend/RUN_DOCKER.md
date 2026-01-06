# Running Guri24 with Docker

This guide explain how to start the backend infrastructure, including the API, Database, Redis, and MinIO storage using Docker Compose.

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Getting Started

### 1. Environment Configuration
Ensure your `.env` file in the `backend` folder contains the following S3/MinIO variables (refer to `.env.example` if missing):

```env
# MinIO / S3 Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=guri24
S3_USE_SSL=false
S3_REGION=us-east-1
S3_PUBLIC_URL_OVERRIDE=http://localhost:9000
```

### 2. Start the Services
Open your terminal in the `backend` directory and run:

```bash
docker-compose up --build -d
```

This command will:
- Build the **API** container.
- Start **PostgreSQL** (Database) and **Redis** (Cache).
- Start **MinIO** (Storage).
- Run a configuration tool (`mc`) that automatically creates the `guri24` bucket and sets it to public.

### 3. Verify the Setup
Once started, you can access the following:

- **FastAPI Documentation**: [http://localhost:8001/api/docs](http://localhost:8001/api/docs)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (User: `minioadmin`, Pass: `minioadmin`)
- **API Health**: [http://localhost:8001/health](http://localhost:8001/health)

## Common Commands

### View Logs
```bash
docker-compose logs -f api
```

### Stop Everything
```bash
docker-compose down
```

### Stop & Remove Data (Fresh Start)
```bash
docker-compose down -v
```

## Troubleshooting
- **Port Conflicts**: Ensure ports `8001`, `5433`, `6380`, `9000`, and `9001` are not being used by other applications.
- **Connection Error**: If the API fails to connect to the DB, wait a few seconds and restart the API container with `docker-compose restart api`.
