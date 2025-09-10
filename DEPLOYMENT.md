# 🎯 Gamified STEM Learning Platform - Deployment Guide

## 🚀 Quick Setup for New Machines

### Prerequisites
- Node.js (v18 or higher)
- CouchDB (v3.0 or higher)
- Git

### 1. Clone and Setup
```bash
git clone https://github.com/CodeByDeepankar/hackthon-sih.git
cd hackthon-sih
node setup.js
```

### 2. Configure CouchDB

#### Option A: Default CouchDB Setup
1. Install CouchDB on your machine
2. Start CouchDB service
3. Access CouchDB admin panel: http://localhost:5984/_utils
4. Create admin user (recommended: admin/password)

#### Option B: Docker CouchDB (Recommended)
```bash
# Run CouchDB in Docker
docker run -d --name couchdb \
  -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  apache/couchdb:3.3
```

### 3. Configure Environment Variables

Copy the example environment file and update with your settings:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# Database Configuration
COUCHDB_URL=http://127.0.0.1:5984
COUCHDB_USERNAME=admin
COUCHDB_PASSWORD=password

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Start the Services

#### Terminal 1 - Backend
```bash
cd backend
npm install
npm start
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Initialize Database
Visit: http://localhost:4000/setup-views to create database views

### 6. Health Check
Visit: http://localhost:4000/health to verify everything is working

## 🔧 Troubleshooting

### "Failed to fetch" Error
This usually means:
1. **Backend not running**: Make sure backend server is running on port 4000
2. **CouchDB not accessible**: Check if CouchDB is running and credentials are correct
3. **CORS issues**: Ensure frontend URL is in CORS configuration

### Database Connection Issues
1. Check CouchDB is running: `curl http://localhost:5984`
2. Verify credentials in `.env` file
3. Check database logs for connection errors

### Port Already in Use
```bash
# Kill process using port 4000
npx kill-port 4000

# Kill process using port 3000
npx kill-port 3000
```

## 🏢 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
COUCHDB_URL=https://your-couchdb-server.com
COUCHDB_USERNAME=your-username
COUCHDB_PASSWORD=your-secure-password
FRONTEND_URL=https://your-domain.com
PORT=4000
```

### Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  couchdb:
    image: apache/couchdb:3.3
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=password
    ports:
      - "5984:5984"
    volumes:
      - couchdb_data:/opt/couchdb/data

  backend:
    build: ./backend
    environment:
      - COUCHDB_URL=http://couchdb:5984
      - COUCHDB_USERNAME=admin
      - COUCHDB_PASSWORD=password
    ports:
      - "4000:4000"
    depends_on:
      - couchdb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  couchdb_data:
```

## 📊 Database Schema

The application creates these databases automatically:
- `users` - User roles and school information
- `subjects` - Educational subjects
- `quizzes` - Quiz definitions
- `questions` - Quiz questions
- `responses` - Student quiz responses
- `streaks` - Daily streak tracking
- `quiz_completions` - Quiz completion records

## 🔐 Security Notes

1. Change default CouchDB admin password
2. Use environment variables for all credentials
3. Enable HTTPS in production
4. Configure proper CORS origins
5. Use secure session management

## 📱 Features

- **Role-based Access**: Teacher and Student dashboards
- **Real-time Progress Tracking**: Live student analytics
- **Offline Support**: PWA with offline capabilities
- **Quiz Management**: Create and manage educational content
- **School-wide Analytics**: Track performance across students
- **Daily Streaks**: Gamified learning engagement

## 🆘 Support

If you encounter issues:
1. Check the health endpoint: http://localhost:4000/health
2. Review server logs for errors
3. Verify CouchDB connectivity
4. Ensure all environment variables are set correctly

## 🔄 Updates

To update the application:
```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install
```

Remember to backup your CouchDB data before updates!
