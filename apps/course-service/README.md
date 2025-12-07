# Course Service

REST API for managing courses in the learning platform.

## Features

- ✅ CRUD operations for courses
- ✅ Redis caching for performance
- ✅ MongoDB for persistence
- ✅ Prometheus metrics
- ✅ Health check endpoints
- ✅ Input validation with Joi
- ✅ TypeScript for type safety

## API Endpoints

### Courses

- `GET /api/courses` - Get all courses (with pagination and filtering)
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Health

- `GET /health` - Overall health status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Metrics

- `GET /metrics` - Prometheus metrics

## Running Locally

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run production build
npm start

# Run tests
npm test
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/courses
REDIS_URL=redis://localhost:6379
CACHE_TTL=300
```

## Docker

```bash
# Build image
docker build -t course-service:latest .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/courses \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  course-service:latest
```
