# Quick Start Guide - Running Without Docker

## Option 1: Run Course Service Only (Node.js)

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally
- Redis installed and running locally

### Steps

```bash
# Navigate to course service
cd apps/course-service

# Install dependencies
npm install

# Set environment variables (create .env file)
echo "PORT=3000" > .env
echo "NODE_ENV=development" >> .env
echo "MONGODB_URI=mongodb://localhost:27017/courses" >> .env
echo "REDIS_URL=redis://localhost:6379" >> .env

# Run in development mode
npm run dev
```

The service will be available at http://localhost:3000

**Test it:**
```bash
# Health check
curl http://localhost:3000/health

# List courses (will be empty initially)
curl http://localhost:3000/api/courses
```

---

## Option 2: Use Docker Desktop (Recommended)

### Start Docker Desktop:
1. Press Windows key
2. Type "Docker Desktop"
3. Click to open
4. Wait for the whale icon to appear in system tray (30-60 seconds)

### Then run:
```bash
cd C:\Users\ASUS\LEARNING_PROJECT
docker-compose up -d
```

### Access services:
- Frontend: http://localhost:3000
- Course API: http://localhost:3001
- User API: http://localhost:3002
- Notification API: http://localhost:3003
- MailHog UI: http://localhost:8025

---

## Troubleshooting

### "Docker daemon not running"
→ Start Docker Desktop from Windows Start Menu

### "Cannot connect to MongoDB"
→ Install MongoDB: `choco install mongodb` or download from mongodb.com

### "Cannot connect to Redis"
→ Install Redis: Download from https://github.com/microsoftarchive/redis/releases

### "npm: command not found"
→ Install Node.js: Download from nodejs.org

---

## What Would You Like To Do?

**A) Start Docker Desktop** (I'll guide you)  
**B) Run just the Course Service** without Docker (with Node.js + MongoDB + Redis)  
**C) View the project structure** and understand what's available

Let me know!
