# 🚀 Deployment Checklist for Forked Repositories

## ✅ Pre-Deployment Checklist

### 1. System Requirements
- [ ] Node.js v18+ installed
- [ ] CouchDB v3.0+ installed and running
- [ ] Git installed
- [ ] Terminal/Command prompt access

### 2. CouchDB Setup
- [ ] CouchDB service is running
- [ ] Admin panel accessible at http://localhost:5984/_utils
- [ ] Admin user created (default: admin/password)
- [ ] Database server responding to requests

### 3. Environment Configuration
- [ ] Copied `backend/.env.example` to `backend/.env`
- [ ] Updated CouchDB credentials in `.env` file
- [ ] Copied `frontend/.env.local.example` to `frontend/.env.local`
- [ ] Verified API URL in frontend environment

### 4. Dependencies Installation
- [ ] Backend: `cd backend && npm install`
- [ ] Frontend: `cd frontend && npm install`

### 5. Database Initialization
- [ ] Backend server started successfully
- [ ] Health check passes: http://localhost:4000/health
- [ ] Database views created: http://localhost:4000/setup-views

### 6. Application Testing
- [ ] Frontend loads: http://localhost:3000
- [ ] No connection errors in browser console
- [ ] User registration works
- [ ] Role selection (teacher/student) works
- [ ] Basic functionality tested

## 🔧 Common Issues & Solutions

### ❌ "Failed to fetch" Error

**Problem**: Frontend shows "Backend server is not running"

**Solutions**:
1. Check if backend server is running on port 4000
2. Verify COUCHDB_URL in backend/.env
3. Ensure CouchDB is accessible
4. Check firewall/antivirus blocking connections

**Debug Steps**:
```bash
# Test backend health
curl http://localhost:4000/health

# Check CouchDB
curl http://localhost:5984

# Verify environment variables
cd backend && npm run env-check
```

### ❌ Database Connection Failed

**Problem**: Server logs show CouchDB connection errors

**Solutions**:
1. Start CouchDB service
2. Verify credentials in `.env` file
3. Check CouchDB is listening on correct port
4. Test database connection manually

**Debug Steps**:
```bash
# Test CouchDB connection
curl http://admin:password@localhost:5984/_all_dbs

# Check CouchDB logs
# Windows: Check Event Viewer
# Linux: sudo journalctl -u couchdb
# macOS: Check Console.app
```

### ❌ CORS Errors

**Problem**: Browser console shows CORS policy errors

**Solutions**:
1. Verify FRONTEND_URL in backend/.env
2. Check CORS configuration in server.js
3. Ensure both servers are running

### ❌ Database Views Missing

**Problem**: Student progress shows no data

**Solutions**:
1. Visit http://localhost:4000/setup-views
2. Check CouchDB admin panel for design documents
3. Restart backend server

## 🛠️ Environment Configuration Templates

### Backend `.env` File
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

### Frontend `.env.local` File
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🐳 Docker Quick Setup (Alternative)

If you have Docker installed:

```bash
# Start CouchDB in Docker
docker run -d --name couchdb \
  -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  apache/couchdb:3.3

# Verify CouchDB is running
docker logs couchdb
```

## 🌐 Production Deployment Notes

### Environment Variables for Production
```env
NODE_ENV=production
COUCHDB_URL=https://your-couchdb-server.com
COUCHDB_USERNAME=your-username
COUCHDB_PASSWORD=your-secure-password
FRONTEND_URL=https://your-domain.com
```

### Security Checklist
- [ ] Change default CouchDB admin password
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Set up database backups

## 📞 Getting Help

If you're still having issues:

1. **Check Logs**: Look at both frontend and backend console logs
2. **Health Check**: Visit http://localhost:4000/health
3. **Network Tab**: Check browser's Network tab for failed requests
4. **Environment**: Verify all environment variables are set correctly
5. **Ports**: Ensure ports 3000, 4000, and 5984 are available

## 📱 Testing the Application

Once everything is running:

1. **Visit**: http://localhost:3000
2. **Sign Up**: Create a new account
3. **Choose Role**: Select Teacher or Student
4. **Test Features**:
   - Teacher: Create subjects, add quizzes
   - Student: Take quizzes, view progress
5. **Check Progress**: Verify data syncs to CouchDB

## 🔄 Updates and Maintenance

To update the application:
```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install
# Restart both servers
```

Remember to backup your CouchDB data before major updates!
