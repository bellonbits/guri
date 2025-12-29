# Guri24 Backend - Quick Start Guide

## Prerequisites

- Python 3.10+
- PostgreSQL 15+

## Quick Setup (5 Steps)

### 1. Install Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (CMD)
venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 2. Setup PostgreSQL Database

**Option A: Using psql**
```bash
psql -U postgres
```

Then run:
```sql
CREATE DATABASE guri24;
CREATE USER admin WITH PASSWORD 'admin123';
GRANT ALL PRIVILEGES ON DATABASE guri24 TO admin;
\q
```

**Option B: Using pgAdmin**
- Create database: `guri24`
- Create user: `admin` / `admin123`
- Grant privileges

### 3. Configure Environment

The `.env` file is already created with your email credentials. Verify it contains:

```env
# Email is already configured
SMTP_HOST=mail.privateemail.com
SMTP_USER=gatitu@evidflow.com
SMTP_PASSWORD=gatitu@evidflow132
EMAIL_FROM=gatitu@evidflow.com

# Database (update if different)
DATABASE_URL=postgresql+asyncpg://admin:admin123@localhost:5432/guri24
```

### 4. Create Database Tables

```bash
# Generate migration
alembic revision --autogenerate -m "Initial migration with users table"

# Apply migration
alembic upgrade head
```

### 5. Start Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be running at: **http://localhost:8000**

## Test the API

### 1. Register a User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"name\":\"Test User\",\"phone\":\"+254712345678\"}"
```

### 2. Check Email

You should receive a verification email at the registered address. Click the link or copy the token.

### 3. Verify Email

```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"YOUR_TOKEN_HERE\"}"
```

### 4. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\"}" \
  -c cookies.txt
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Health Check**: http://localhost:8000/health

## Available Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/resend-verification` - Resend verification
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

## Troubleshooting

### Database Connection Error

If you get a database connection error:

1. Check PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Verify credentials in `.env` match your PostgreSQL setup

3. Test connection:
   ```bash
   psql -U admin -d guri24 -h localhost
   ```

### Email Not Sending

1. Check `.env` has correct SMTP credentials
2. Set `EMAILS_ENABLED=false` to disable emails during testing
3. Check logs for email errors

### Alembic Errors

If migrations fail:

```bash
# Reset migrations
alembic downgrade base

# Recreate migration
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Port Already in Use

If port 8000 is busy:

```bash
# Use different port
uvicorn app.main:app --reload --port 8001
```

## Project Structure

```
backend/
├── app/
│   ├── api/v1/
│   │   └── auth.py          # Auth endpoints
│   ├── core/
│   │   └── security.py      # JWT, password hashing
│   ├── models/
│   │   └── user.py          # User model
│   ├── schemas/
│   │   └── user.py          # Pydantic schemas
│   ├── services/
│   │   └── email_service.py # Email service
│   ├── config.py            # Settings
│   ├── database.py          # DB connection
│   └── main.py              # FastAPI app
├── alembic/                 # Migrations
├── requirements.txt
├── .env                     # Configuration
└── README.md
```

## Next Steps

1. ✅ Backend is running
2. Connect frontend to backend API
3. Add property management endpoints
4. Implement admin dashboard API
5. Add file upload for images
6. Deploy to production

## Security Notes

⚠️ **Before Production:**

1. Change `SECRET_KEY` and `JWT_SECRET_KEY` in `.env`
2. Set `DEBUG=false`
3. Set `COOKIE_SECURE=true`
4. Update `CORS_ORIGINS` to your domain
5. Use strong database password
6. Enable HTTPS

## Support

For issues or questions, check:
- API docs: http://localhost:8000/api/docs
- Backend documentation: `backend_documentation.md`
- Logs in terminal
