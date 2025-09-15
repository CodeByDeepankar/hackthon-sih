# GYANARATNA Platform - Full-Stack Guide

## System Architecture

This is a comprehensive learning management system built with modern technologies:

### Backend Stack
- **Node.js + Express** - REST API server
- **CouchDB** - NoSQL database with offline sync capabilities
- **Nano** - CouchDB client for Node.js

### Frontend Stack  
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Clerk** - Authentication and user management
- **PouchDB** - Client-side database for offline support

### Database Schema

#### Core Entities

**Subjects Collection (`subjects`)**
```json
{
  "_id": "subject:timestamp:name",
  "name": "Mathematics",
  "class": "10",
  "description": "Algebra and Geometry",
  "createdBy": "user_id",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",
  "type": "subject"
}
```

**Quizzes Collection (`quizzes`)**
```json
{
  "_id": "quiz:timestamp:title",
  "subjectId": "subject:123:math",
  "title": "Chapter 1 Quiz",
  "description": "Basic algebra concepts",
  "difficulty": "medium",
  "timeLimit": 300,
  "createdBy": "user_id",
  "createdAt": "2025-01-01T00:00:00Z",
  "type": "quiz"
}
```

**Questions Collection (`questions`)**
```json
{
  "_id": "question:quiz_id:1",
  "quizId": "quiz:123:chapter1",
  "text": "What is 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": "4",
  "explanation": "Basic addition",
  "order": 1,
  "type": "question"
}
```

**Responses Collection (`responses`)**
```json
{
  "_id": "response:student_id:quiz_id:timestamp",
  "quizId": "quiz:123:chapter1",
  "studentId": "user_123",
  "answers": {
    "question:quiz:123:1": "4",
    "question:quiz:123:2": "option2"
  },
  "score": 85.5,
  "correctAnswers": 17,
  "totalQuestions": 20,
  "timeSpent": 180,
  "submittedAt": "2025-01-01T00:00:00Z",
  "type": "quiz_response"
}
```

**Streaks Collection (`streaks`)**
```json
{
  "_id": "streak:user_id",
  "userId": "user_123",
  "currentStreak": 7,
  "lastCompletionDate": "2025-01-01",
  "updatedAt": "2025-01-01T00:00:00Z",
  "type": "streak_record"
}
```

**Quiz Completions Collection (`quiz_completions`)**
```json
{
  "_id": "completion:user_id:quiz_id:timestamp",
  "userId": "user_123",
  "quizId": "quiz:123:chapter1",
  "score": 85.5,
  "timeSpent": 180,
  "subject": "subject:123:math",
  "completedAt": "2025-01-01T00:00:00Z",
  "type": "quiz_completion"
}
```

## Backend API Endpoints

### Subjects API
- `GET /subjects` - List all subjects (with optional class filter)
- `POST /subjects` - Create new subject (teacher only)
- `PUT /subjects/:id` - Update subject (teacher only)
- `DELETE /subjects/:id` - Delete subject (teacher only)

### Quizzes API
- `GET /quizzes` - List quizzes (with optional filters)
- `GET /quizzes/:id` - Get quiz with questions
- `POST /quizzes` - Create new quiz (teacher only)

### Quiz Responses API
- `POST /responses` - Submit quiz answers
- `GET /responses/student/:studentId` - Get student's quiz history

### Streak & Progress API
- `POST /quiz-completion` - Record quiz completion
- `GET /streak/:userId` - Get user's current streak
- `GET /daily-activity/:userId` - Get daily activity summary
- `GET /quiz-history/:userId` - Get quiz completion history

### Leaderboard API
- `GET /leaderboard` - Get leaderboard data

### User Management API
- `GET /users/:userId/role` - Get user role
- `POST /users/role` - Set user role

### Setup API
- `POST /setup-views` - Create database views

## Frontend Components Architecture

### Pages
- `/student` - Student dashboard with subjects, quizzes, and streak tracking
- `/teacher` - Teacher dashboard for managing subjects and quizzes
- `/role-select` - Role selection for new users

### Key Components

**Student Dashboard Components:**
- `SubjectCard` - Display subject with navigation to quizzes
- `QuizCard` - Display quiz with difficulty and time info
- `QuizAttempt` - Full quiz taking interface with timer
- `StreakWidget` - Real-time streak display and motivation
- `StreakStats` - Daily activity and progress statistics

**Teacher Dashboard Components:**
- `SubjectManagementCard` - Subject CRUD operations
- `QuizManagementCard` - Quiz overview and actions
- `CreateSubjectForm` - Form to create new subjects
- `CreateQuizForm` - Form to create quizzes with questions

**Shared Components:**
- `OnlineBadge` - Network status indicator
- `OfflineNotice` - Offline mode notification
- `LanguageToggle` - Multi-language support
- `FooterNav` - Bottom navigation

### Custom Hooks

**API Hooks (`/hooks/useApi.js`):**
- `useSubjects()` - Manage subjects data and CRUD operations
- `useQuizzes()` - Manage quizzes data and creation
- `useQuiz(id)` - Fetch single quiz with questions
- `useQuizResponses()` - Handle quiz submissions
- `useDailyActivity()` - Track daily learning activity
- `useLeaderboard()` - Leaderboard data management
- `useUserRole()` - User role management

**Streak Hook (`/hooks/useStreak.js`):**
- Real-time streak tracking
- Daily quiz completion monitoring
- Motivational messaging
- Progress analytics

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- CouchDB 3.x
- Git

### 1. Clone and Setup Backend

```bash
# Clone repository
git clone <repository-url>
cd gamified-stem-learning

# Setup backend
cd backend
npm install

# Create .env file
echo "COUCHDB_URL=http://deep:1234@127.0.0.1:5984" > .env

# Start backend server
npm start
# Server will run on http://localhost:4000
```

### 2. Setup CouchDB

Install CouchDB and create admin user:
- URL: http://127.0.0.1:5984
- Username: `deep`
- Password: `1234`

Required databases will be created automatically by the backend.

### 3. Setup Frontend

```bash
# Setup frontend
cd ../frontend
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF

# Start development server
npm run dev
# Frontend will run on http://localhost:3000
```

### 4. Initialize Database Views

```bash
# Create CouchDB views for efficient querying
curl -X POST http://localhost:4000/setup-views
```

## Usage Guide

### For Teachers

1. **Sign up** with teacher role at `/role-select`
2. **Create subjects** in teacher dashboard
3. **Add quizzes** with multiple-choice questions
4. **Monitor student progress** through analytics

### For Students

1. **Sign up** with student role at `/role-select`
2. **Browse subjects** on student dashboard
3. **Take quizzes** with real-time timer
4. **Track daily streaks** and maintain learning momentum
5. **View progress** and achievements

### Real-time Streak System

The streak system automatically:
- ✅ Tracks daily quiz completions
- 🔥 Maintains streak counters
- 📊 Provides daily activity summaries
- 🎯 Motivates consistent learning
- 📈 Shows progress analytics

Students must complete at least one quiz daily to maintain their streak.

## Offline Support

The system supports offline learning through:
- **PouchDB** sync with CouchDB
- **Service Worker** caching
- **Progressive Web App** features
- **Local data storage**

## Production Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Set environment variables
export NODE_ENV=production
export COUCHDB_URL=your_production_couchdb_url

# Start production server
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify/your platform
npm run start
```

### Database Backup
```bash
# Backup CouchDB databases
curl -X GET http://admin:password@localhost:5984/subjects/_all_docs?include_docs=true > subjects_backup.json
curl -X GET http://admin:password@localhost:5984/quizzes/_all_docs?include_docs=true > quizzes_backup.json
# Repeat for all databases
```

## Key Features Implemented

✅ **Complete CRUD for subjects and quizzes**
✅ **Real-time streak tracking with daily requirements**
✅ **Offline-first architecture with CouchDB sync**
✅ **Role-based access control (Student/Teacher/Admin)**
✅ **Responsive design with dark mode support**
✅ **Multi-language support**
✅ **Progressive Web App capabilities**
✅ **Comprehensive analytics and leaderboards**
✅ **Timed quiz system with auto-submission**
✅ **Gamification with streaks and achievements**

## Performance Optimizations

- **Database Views** for efficient querying
- **React Query/SWR** for data caching
- **Lazy Loading** of components
- **Image Optimization** with Next.js
- **Bundle Splitting** for faster loads
- **Service Worker** caching

## Security Features

- **Clerk Authentication** with role-based access
- **Input Validation** on all forms
- **SQL Injection Prevention** (NoSQL)
- **CORS Configuration** for API security
- **Environment Variables** for sensitive data

## Monitoring and Analytics

- Quiz completion rates
- Daily active users
- Streak distributions
- Subject popularity
- Performance metrics
- Error tracking

This system provides a complete learning management platform with real-time engagement tracking and offline support, ready for educational institutions to deploy and scale.
