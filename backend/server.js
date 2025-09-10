const express = require("express");
const cors = require("cors");
require('dotenv').config();

// Database configuration
const COUCHDB_URL = process.env.COUCHDB_URL || "http://127.0.0.1:5984";
const COUCHDB_USERNAME = process.env.COUCHDB_USERNAME || "deep";
const COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD || "1234";
const PORT = process.env.PORT || 4000;

// Construct CouchDB connection string
const couchdbConnectionString = COUCHDB_USERNAME && COUCHDB_PASSWORD 
  ? `http://${COUCHDB_USERNAME}:${COUCHDB_PASSWORD}@${COUCHDB_URL.replace('http://', '')}`
  : COUCHDB_URL;

console.log(`Connecting to CouchDB at: ${COUCHDB_URL}`);

let nano;
try {
  nano = require("nano")(couchdbConnectionString);
} catch (error) {
  console.error("Failed to connect to CouchDB:", error.message);
  console.log("Please ensure CouchDB is running and credentials are correct");
  process.exit(1);
}

// Database connections
const db = nano.db.use("students");
const usersDb = nano.db.use("users");
const streaksDb = nano.db.use("streaks");
const quizCompletionsDb = nano.db.use("quiz_completions");
const subjectsDb = nano.db.use("subjects");
const quizzesDb = nano.db.use("quizzes");
const questionsDb = nano.db.use("questions");
const responsesDb = nano.db.use("responses");

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Ensure databases exist (best-effort)
(async () => {
  try {
    console.log("Checking CouchDB connection...");
    
    // Test connection
    await nano.db.list();
    console.log("✅ CouchDB connection successful");
    
    const dbs = await nano.db.list();
    const requiredDbs = [
      "students", "users", "streaks", "quiz_completions", 
      "subjects", "quizzes", "questions", "responses"
    ];
    
    for (const dbName of requiredDbs) {
      if (!dbs.includes(dbName)) {
        await nano.db.create(dbName);
        console.log(`✅ Created database: ${dbName}`);
      } else {
        console.log(`✅ Database exists: ${dbName}`);
      }
    }
    
    console.log("🎉 All databases are ready!");
  } catch (e) {
    console.error("❌ Database initialization failed:", e.message);
    console.log("Please check:");
    console.log("1. CouchDB is running");
    console.log("2. Credentials are correct");
    console.log("3. Connection URL is accessible");
    
    // Don't exit in development, but log the warning
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await nano.db.list();
    res.json({ 
      status: "healthy", 
      database: "connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({ 
      status: "unhealthy", 
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add student progress
app.post("/progress", async (req, res) => {
  try {
    const response = await db.insert(req.body);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all progress
app.get("/progress", async (req, res) => {
  try {
    const docs = await db.list({ include_docs: true });
    res.json(docs.rows.map(r => r.doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get role for a user
app.get("/users/:userId/role", async (req, res) => {
  const { userId } = req.params;
  const docId = `user:${userId}`;
  try {
    const doc = await usersDb.get(docId);
    res.json({
      userId: doc.userId,
      role: doc.role,
      name: doc.name || null,
      class: doc.class || null,
      schoolId: doc.schoolId || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    if (err.statusCode === 404) return res.status(404).json({ error: "Not Found" });
    res.status(500).json({ error: err.message });
  }
});

// Save role for a user (idempotent upsert)
app.post("/users/role", async (req, res) => {
  const { userId, role, name, schoolId, class: klass } = req.body || {};
  if (!userId || !role) return res.status(400).json({ error: "userId and role are required" });
  const docId = `user:${userId}`;
  try {
    let existing;
    try {
      existing = await usersDb.get(docId);
    } catch {}
    const payload = {
      _id: docId,
      ...(existing ? { _rev: existing._rev } : {}),
      userId,
      role,
      name: name ?? existing?.name ?? null,
      schoolId: schoolId ?? existing?.schoolId ?? null,
      class: typeof klass !== 'undefined' ? klass : (existing?.class ?? null),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "userRole",
    };
    const response = await usersDb.insert(payload);
    res.json({
      ok: true,
      id: response.id,
      rev: response.rev,
      userId,
      role,
      name: payload.name,
      schoolId: payload.schoolId,
      class: payload.class,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================================
// MIDDLEWARE FOR ROLE-BASED ACCESS CONTROL
// ===========================================

// Middleware to verify user role
const requireRole = (allowedRoles) => async (req, res, next) => {
  try {
    const { userId } = req.body || req.query || req.params;
    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }

    const docId = `user:${userId}`;
    const userDoc = await usersDb.get(docId);
    
    if (!allowedRoles.includes(userDoc.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    req.user = userDoc;
    next();
  } catch (err) {
    res.status(403).json({ error: "Access denied" });
  }
};

// ===========================================
// SUBJECTS API ENDPOINTS
// ===========================================

// GET /subjects - List all subjects
app.get("/subjects", async (req, res) => {
  try {
    const { class: classFilter } = req.query;
    
    const result = await subjectsDb.view('subjects', 'all', {
      include_docs: true
    }).catch(() => ({ rows: [] }));

    let subjects = result.rows.map(row => ({
      id: row.doc._id,
      name: row.doc.name,
      class: row.doc.class,
      description: row.doc.description,
      createdBy: row.doc.createdBy,
      createdAt: row.doc.createdAt,
      updatedAt: row.doc.updatedAt
    }));

    // Filter by class if specified
    if (classFilter) {
      subjects = subjects.filter(s => s.class === classFilter);
    }

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /subjects - Add new subject (teacher only)
app.post("/subjects", async (req, res) => {
  try {
    const { name, class: subjectClass, description, createdBy } = req.body;
    
    if (!name || !subjectClass || !createdBy) {
      return res.status(400).json({ 
        error: "name, class, and createdBy are required" 
      });
    }

    // Verify user is teacher/admin
    const userDoc = await usersDb.get(`user:${createdBy}`);
    if (!['teacher', 'admin'].includes(userDoc.role)) {
      return res.status(403).json({ error: "Only teachers can create subjects" });
    }

    const subjectDoc = {
      _id: `subject:${Date.now()}:${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      class: subjectClass,
      description: description || "",
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "subject"
    };

    const response = await subjectsDb.insert(subjectDoc);
    
    res.json({
      success: true,
      id: response.id,
      subject: {
        id: response.id,
        name: subjectDoc.name,
        class: subjectDoc.class,
        description: subjectDoc.description,
        createdBy: subjectDoc.createdBy,
        createdAt: subjectDoc.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /subjects/:id - Update subject (teacher only)
app.put("/subjects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, class: subjectClass, description, updatedBy } = req.body;

    // Verify user is teacher/admin
    const userDoc = await usersDb.get(`user:${updatedBy}`);
    if (!['teacher', 'admin'].includes(userDoc.role)) {
      return res.status(403).json({ error: "Only teachers can update subjects" });
    }

    const existing = await subjectsDb.get(id);
    const updated = {
      ...existing,
      name: name || existing.name,
      class: subjectClass || existing.class,
      description: description !== undefined ? description : existing.description,
      updatedAt: new Date().toISOString()
    };

    const response = await subjectsDb.insert(updated);
    res.json({ success: true, id: response.id, rev: response.rev });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /subjects/:id - Delete subject (teacher only)
app.delete("/subjects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy } = req.body;

    // Verify user is teacher/admin
    const userDoc = await usersDb.get(`user:${deletedBy}`);
    if (!['teacher', 'admin'].includes(userDoc.role)) {
      return res.status(403).json({ error: "Only teachers can delete subjects" });
    }

    const existing = await subjectsDb.get(id);
    await subjectsDb.destroy(id, existing._rev);
    
    res.json({ success: true, message: "Subject deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================================
// QUIZZES API ENDPOINTS
// ===========================================

// GET /quizzes - List quizzes (with optional subject filter)
app.get("/quizzes", async (req, res) => {
  try {
    const { subjectId, createdBy } = req.query;

    const result = await quizzesDb.view('quizzes', 'all', {
      include_docs: true
    }).catch(() => ({ rows: [] }));

    let quizzes = result.rows.map(row => ({
      id: row.doc._id,
      subjectId: row.doc.subjectId,
      title: row.doc.title,
      description: row.doc.description,
      difficulty: row.doc.difficulty,
      timeLimit: row.doc.timeLimit,
      createdBy: row.doc.createdBy,
      createdAt: row.doc.createdAt,
      updatedAt: row.doc.updatedAt
    }));

    // Filter by subject if specified
    if (subjectId) {
      quizzes = quizzes.filter(q => q.subjectId === subjectId);
    }

    // Filter by creator if specified
    if (createdBy) {
      quizzes = quizzes.filter(q => q.createdBy === createdBy);
    }

    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /quizzes - Add quiz (teacher only)
app.post("/quizzes", async (req, res) => {
  try {
    const { 
      subjectId, 
      title, 
      description, 
      difficulty = 'medium',
      timeLimit = 300, // 5 minutes default
      createdBy,
      questions = []
    } = req.body;
    
    if (!subjectId || !title || !createdBy) {
      return res.status(400).json({ 
        error: "subjectId, title, and createdBy are required" 
      });
    }

    // Verify user is teacher/admin
    const userDoc = await usersDb.get(`user:${createdBy}`);
    if (!['teacher', 'admin'].includes(userDoc.role)) {
      return res.status(403).json({ error: "Only teachers can create quizzes" });
    }

    // Verify subject exists
    await subjectsDb.get(subjectId);

    const quizId = `quiz:${Date.now()}:${title.toLowerCase().replace(/\s+/g, '-')}`;
    const quizDoc = {
      _id: quizId,
      subjectId,
      title,
      description: description || "",
      difficulty,
      timeLimit,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "quiz"
    };

    const response = await quizzesDb.insert(quizDoc);

    // Add questions if provided
    const questionDocs = [];
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionDoc = {
        _id: `question:${quizId}:${i + 1}`,
        quizId,
        text: question.text,
        options: question.options || [],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || "",
        order: i + 1,
        createdAt: new Date().toISOString(),
        type: "question"
      };
      questionDocs.push(questionDoc);
    }

    if (questionDocs.length > 0) {
      await questionsDb.bulk({ docs: questionDocs });
    }
    
    res.json({
      success: true,
      id: response.id,
      quiz: {
        id: response.id,
        subjectId: quizDoc.subjectId,
        title: quizDoc.title,
        description: quizDoc.description,
        difficulty: quizDoc.difficulty,
        timeLimit: quizDoc.timeLimit,
        createdBy: quizDoc.createdBy,
        createdAt: quizDoc.createdAt,
        questionsCount: questionDocs.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /quizzes/:id - Get quiz details with questions
app.get("/quizzes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { includeAnswers = false } = req.query;

    // Get quiz details
    const quiz = await quizzesDb.get(id);

    // Get questions for this quiz
    const questionsResult = await questionsDb.view('questions', 'by_quiz', {
      key: id,
      include_docs: true
    }).catch(() => ({ rows: [] }));

    const questions = questionsResult.rows.map(row => {
      const question = {
        id: row.doc._id,
        text: row.doc.text,
        options: row.doc.options,
        order: row.doc.order,
        explanation: row.doc.explanation
      };

      // Only include correct answer if explicitly requested (for teachers)
      if (includeAnswers === 'true') {
        question.correctAnswer = row.doc.correctAnswer;
      }

      return question;
    }).sort((a, b) => a.order - b.order);

    res.json({
      id: quiz._id,
      subjectId: quiz.subjectId,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt,
      questions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===========================================
// QUIZ RESPONSES API ENDPOINTS
// ===========================================

// POST /responses - Submit quiz responses
app.post("/responses", async (req, res) => {
  try {
    const { quizId, studentId, answers, timeSpent = 0 } = req.body;

    if (!quizId || !studentId || !answers) {
      return res.status(400).json({ 
        error: "quizId, studentId, and answers are required" 
      });
    }

    // Get quiz and questions
    const quiz = await quizzesDb.get(quizId);
    const questionsResult = await questionsDb.view('questions', 'by_quiz', {
      key: quizId,
      include_docs: true
    });

    const questions = questionsResult.rows.map(row => row.doc);
    
    // Calculate score
    let correctAnswers = 0;
    const detailedResults = [];

    questions.forEach(question => {
      const studentAnswer = answers[question._id];
      const isCorrect = studentAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;

      detailedResults.push({
        questionId: question._id,
        questionText: question.text,
        studentAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });

    const totalQuestions = questions.length;
    const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Save response
    const responseDoc = {
      _id: `response:${studentId}:${quizId}:${Date.now()}`,
      quizId,
      studentId,
      answers,
      score: scorePercentage,
      correctAnswers,
      totalQuestions,
      timeSpent,
      submittedAt: new Date().toISOString(),
      type: "quiz_response"
    };

    const response = await responsesDb.insert(responseDoc);

    // Record quiz completion for streak tracking
    await fetch('http://localhost:4000/quiz-completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: studentId,
        quizId,
        score: scorePercentage,
        timeSpent,
        subject: quiz.subjectId
      })
    }).catch(console.error);

    res.json({
      success: true,
      responseId: response.id,
      score: scorePercentage,
      correctAnswers,
      totalQuestions,
      results: detailedResults,
      message: `Quiz completed! You scored ${Math.round(scorePercentage)}%`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /responses/student/:studentId - Get student's quiz history
app.get("/responses/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit = 50 } = req.query;

    const result = await responsesDb.view('responses', 'by_student', {
      key: studentId,
      include_docs: true,
      limit: parseInt(limit),
      descending: true
    }).catch(() => ({ rows: [] }));

    const responses = result.rows.map(row => ({
      id: row.doc._id,
      quizId: row.doc.quizId,
      score: row.doc.score,
      correctAnswers: row.doc.correctAnswers,
      totalQuestions: row.doc.totalQuestions,
      timeSpent: row.doc.timeSpent,
      submittedAt: row.doc.submittedAt
    }));

    res.json({
      studentId,
      responses,
      total: responses.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /leaderboard - Get leaderboard data
app.get("/leaderboard", async (req, res) => {
  try {
    const { subjectId, timeframe = 'all' } = req.query;

    // Get all responses
    const result = await responsesDb.view('responses', 'all', {
      include_docs: true
    }).catch(() => ({ rows: [] }));

    // Group by student and calculate stats
    const studentStats = {};
    
    result.rows.forEach(row => {
      const doc = row.doc;
      const studentId = doc.studentId;
      
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          studentId,
          totalQuizzes: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0
        };
      }
      
      const stats = studentStats[studentId];
      stats.totalQuizzes++;
      stats.totalScore += doc.score;
      stats.bestScore = Math.max(stats.bestScore, doc.score);
      stats.averageScore = stats.totalScore / stats.totalQuizzes;
    });

    // Convert to array and sort by average score
    const leaderboard = Object.values(studentStats)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 100); // Top 100

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log("🚀 Server running on http://localhost:4000"));

// Helper function to get today's date string
function getTodayDateString() {
  return new Date().toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Helper function to get yesterday's date string
function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Helper function to calculate streak
async function calculateStreak(userId) {
  try {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    
    // Get all quiz completions for this user, sorted by date
    const result = await quizCompletionsDb.view('completions', 'by_user_date', {
      startkey: [userId],
      endkey: [userId, {}],
      include_docs: true
    }).catch(() => ({ rows: [] }));

    if (result.rows.length === 0) return 0;

    // Group completions by date
    const completionsByDate = {};
    result.rows.forEach(row => {
      const date = row.doc.completedAt.split('T')[0];
      if (!completionsByDate[date]) {
        completionsByDate[date] = [];
      }
      completionsByDate[date].push(row.doc);
    });

    // Calculate streak by going backwards from today
    let streak = 0;
    let currentDate = today;
    
    // Check if user completed a quiz today
    if (completionsByDate[currentDate]) {
      streak = 1;
      currentDate = yesterday;
    } else {
      // If no completion today, check yesterday to continue existing streak
      currentDate = yesterday;
    }

    // Count consecutive days with quiz completions
    while (completionsByDate[currentDate]) {
      streak++;
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = prevDate.toISOString().split('T')[0];
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

// Record quiz completion
app.post("/quiz-completion", async (req, res) => {
  try {
    const { userId, quizId, score, timeSpent, subject } = req.body;
    
    if (!userId || !quizId) {
      return res.status(400).json({ error: "userId and quizId are required" });
    }

    const completionDoc = {
      _id: `completion:${userId}:${quizId}:${Date.now()}`,
      userId,
      quizId,
      score: score || 0,
      timeSpent: timeSpent || 0,
      subject: subject || null,
      completedAt: new Date().toISOString(),
      type: "quiz_completion"
    };

    // Save the completion
    const response = await quizCompletionsDb.insert(completionDoc);
    
    // Calculate updated streak
    const newStreak = await calculateStreak(userId);
    
    // Update user's streak record
    const streakDocId = `streak:${userId}`;
    try {
      let existingStreak;
      try {
        existingStreak = await streaksDb.get(streakDocId);
      } catch (e) {
        // Document doesn't exist, will create new one
      }

      const streakDoc = {
        _id: streakDocId,
        ...(existingStreak ? { _rev: existingStreak._rev } : {}),
        userId,
        currentStreak: newStreak,
        lastCompletionDate: getTodayDateString(),
        updatedAt: new Date().toISOString(),
        type: "streak_record"
      };

      await streaksDb.insert(streakDoc);
    } catch (streakError) {
      console.error('Error updating streak:', streakError);
    }

    res.json({
      success: true,
      completionId: response.id,
      currentStreak: newStreak,
      message: `Quiz completed! Your current streak is ${newStreak} days.`
    });

  } catch (err) {
    console.error('Quiz completion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's current streak
app.get("/streak/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const streak = await calculateStreak(userId);
    
    res.json({
      userId,
      currentStreak: streak,
      lastCalculated: new Date().toISOString()
    });
  } catch (err) {
    console.error('Get streak error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's quiz completion history
app.get("/quiz-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, startDate, endDate } = req.query;

    let startkey = [userId];
    let endkey = [userId, {}];
    
    if (startDate) {
      startkey = [userId, startDate];
    }
    if (endDate) {
      endkey = [userId, endDate];
    }

    const result = await quizCompletionsDb.view('completions', 'by_user_date', {
      startkey,
      endkey,
      include_docs: true,
      limit: parseInt(limit),
      descending: true
    }).catch(() => ({ rows: [] }));

    const completions = result.rows.map(row => ({
      id: row.doc._id,
      quizId: row.doc.quizId,
      score: row.doc.score,
      timeSpent: row.doc.timeSpent,
      subject: row.doc.subject,
      completedAt: row.doc.completedAt
    }));

    res.json({
      userId,
      completions,
      total: completions.length
    });
  } catch (err) {
    console.error('Get quiz history error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get daily activity summary
app.get("/daily-activity/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { date = getTodayDateString() } = req.query;

    // Get quiz completions for the specific date
    const result = await quizCompletionsDb.view('completions', 'by_user_date', {
      startkey: [userId, date],
      endkey: [userId, date + '\ufff0'],
      include_docs: true
    }).catch(() => ({ rows: [] }));

    const completions = result.rows.map(row => row.doc);
    const totalQuizzes = completions.length;
    const totalTimeSpent = completions.reduce((sum, comp) => sum + (comp.timeSpent || 0), 0);
    const averageScore = completions.length > 0 
      ? completions.reduce((sum, comp) => sum + (comp.score || 0), 0) / completions.length 
      : 0;

    const hasCompletedDaily = totalQuizzes > 0;
    const currentStreak = await calculateStreak(userId);

    res.json({
      userId,
      date,
      totalQuizzes,
      totalTimeSpent,
      averageScore: Math.round(averageScore * 100) / 100,
      hasCompletedDaily,
      currentStreak,
      completions: completions.map(comp => ({
        quizId: comp.quizId,
        score: comp.score,
        timeSpent: comp.timeSpent,
        subject: comp.subject,
        completedAt: comp.completedAt
      }))
    });
  } catch (err) {
    console.error('Get daily activity error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===========================================
// STUDENT PROGRESS AND SCHOOL API ENDPOINTS
// ===========================================

// GET /students/school/:schoolId - Get all students in a school
app.get("/students/school/:schoolId", async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    // Get all users with the specified schoolId and student role
    const result = await usersDb.view('users', 'by_school', {
      key: schoolId,
      include_docs: true
    }).catch(() => ({ rows: [] }));

    const students = result.rows
      .map(row => row.doc)
      .filter(doc => doc.role === 'student')
      .map(doc => ({
        id: doc._id,
        userId: doc.userId,
        name: doc.name,
        class: doc.class,
        schoolId: doc.schoolId,
        createdAt: doc.createdAt
      }));

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /students/:studentId/progress - Get detailed student progress
app.get("/students/:studentId/progress", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit = 50 } = req.query;

    // Get student's quiz responses
    const responsesResult = await responsesDb.view('responses', 'by_student', {
      key: studentId,
      include_docs: true,
      limit: parseInt(limit),
      descending: true
    }).catch(() => ({ rows: [] }));

    // Get quiz and subject details for each response
    const progressData = [];
    
    for (const row of responsesResult.rows) {
      const response = row.doc;
      try {
        const quiz = await quizzesDb.get(response.quizId);
        const subject = await subjectsDb.get(quiz.subjectId);
        
        progressData.push({
          id: response._id,
          quizId: response.quizId,
          quizTitle: quiz.title,
          subjectName: subject.name,
          subjectClass: subject.class,
          score: response.score,
          correctAnswers: response.correctAnswers,
          totalQuestions: response.totalQuestions,
          timeSpent: response.timeSpent,
          submittedAt: response.submittedAt,
          difficulty: quiz.difficulty
        });
      } catch (err) {
        // Skip if quiz or subject not found
        console.warn(`Missing quiz/subject for response ${response._id}`);
      }
    }

    // Calculate summary statistics
    const totalQuizzes = progressData.length;
    const averageScore = totalQuizzes > 0 
      ? progressData.reduce((sum, item) => sum + item.score, 0) / totalQuizzes 
      : 0;
    const bestScore = totalQuizzes > 0 
      ? Math.max(...progressData.map(item => item.score)) 
      : 0;

    res.json({
      studentId,
      summary: {
        totalQuizzes,
        averageScore: Math.round(averageScore * 100) / 100,
        bestScore: Math.round(bestScore * 100) / 100
      },
      recentActivity: progressData,
      total: totalQuizzes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /progress/school/:schoolId - Get progress overview for all students in school
app.get("/progress/school/:schoolId", async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Get all students in the school
    const studentsResult = await usersDb.view('users', 'by_school', {
      key: schoolId,
      include_docs: true
    }).catch(() => ({ rows: [] }));

    const students = studentsResult.rows
      .map(row => row.doc)
      .filter(doc => doc.role === 'student');

    // Get progress for each student
    const schoolProgress = [];
    
    for (const student of students) {
      // Get student's quiz responses
      const responsesResult = await responsesDb.view('responses', 'by_student', {
        key: student.userId,
        include_docs: true
      }).catch(() => ({ rows: [] }));

      const responses = responsesResult.rows.map(row => row.doc);
      const totalQuizzes = responses.length;
      const averageScore = totalQuizzes > 0 
        ? responses.reduce((sum, r) => sum + r.score, 0) / totalQuizzes 
        : 0;
      const bestScore = totalQuizzes > 0 
        ? Math.max(...responses.map(r => r.score)) 
        : 0;
      const lastActivity = totalQuizzes > 0 
        ? Math.max(...responses.map(r => new Date(r.submittedAt).getTime()))
        : null;

      schoolProgress.push({
        studentId: student.userId,
        name: student.name,
        class: student.class,
        totalQuizzes,
        averageScore: Math.round(averageScore * 100) / 100,
        bestScore: Math.round(bestScore * 100) / 100,
        lastActivity: lastActivity ? new Date(lastActivity).toISOString() : null
      });
    }

    // Sort by average score descending
    schoolProgress.sort((a, b) => b.averageScore - a.averageScore);

    res.json({
      schoolId,
      totalStudents: students.length,
      studentsWithActivity: schoolProgress.filter(s => s.totalQuizzes > 0).length,
      schoolAverage: schoolProgress.length > 0 
        ? schoolProgress.reduce((sum, s) => sum + s.averageScore, 0) / schoolProgress.length 
        : 0,
      students: schoolProgress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create CouchDB views for efficient querying
app.post("/setup-views", async (req, res) => {
  try {
    // Quiz completions views
    const completionsView = {
      _id: "_design/completions",
      views: {
        by_user_date: {
          map: `function(doc) {
            if (doc.type === 'quiz_completion') {
              var date = doc.completedAt.split('T')[0];
              emit([doc.userId, date], doc);
            }
          }`
        },
        by_date: {
          map: `function(doc) {
            if (doc.type === 'quiz_completion') {
              var date = doc.completedAt.split('T')[0];
              emit(date, doc);
            }
          }`
        }
      }
    };

    // Subjects views
    const subjectsView = {
      _id: "_design/subjects",
      views: {
        all: {
          map: `function(doc) {
            if (doc.type === 'subject') {
              emit(doc.name, doc);
            }
          }`
        },
        by_class: {
          map: `function(doc) {
            if (doc.type === 'subject') {
              emit(doc.class, doc);
            }
          }`
        }
      }
    };

    // Quizzes views
    const quizzesView = {
      _id: "_design/quizzes",
      views: {
        all: {
          map: `function(doc) {
            if (doc.type === 'quiz') {
              emit(doc.createdAt, doc);
            }
          }`
        },
        by_subject: {
          map: `function(doc) {
            if (doc.type === 'quiz') {
              emit(doc.subjectId, doc);
            }
          }`
        }
      }
    };

    // Questions views
    const questionsView = {
      _id: "_design/questions",
      views: {
        by_quiz: {
          map: `function(doc) {
            if (doc.type === 'question') {
              emit(doc.quizId, doc);
            }
          }`
        }
      }
    };

    // Users views
    const usersView = {
      _id: "_design/users",
      views: {
        all: {
          map: `function(doc) {
            if (doc.type === 'userRole') {
              emit(doc.userId, doc);
            }
          }`
        },
        by_school: {
          map: `function(doc) {
            if (doc.type === 'userRole' && doc.schoolId) {
              emit(doc.schoolId, doc);
            }
          }`
        },
        by_role: {
          map: `function(doc) {
            if (doc.type === 'userRole') {
              emit(doc.role, doc);
            }
          }`
        }
      }
    };

    // Responses views
    const responsesView = {
      _id: "_design/responses",
      views: {
        all: {
          map: `function(doc) {
            if (doc.type === 'quiz_response') {
              emit(doc.submittedAt, doc);
            }
          }`
        },
        by_student: {
          map: `function(doc) {
            if (doc.type === 'quiz_response') {
              emit(doc.studentId, doc);
            }
          }`
        },
        by_quiz: {
          map: `function(doc) {
            if (doc.type === 'quiz_response') {
              emit(doc.quizId, doc);
            }
          }`
        }
      }
    };

    // Insert all views
    await quizCompletionsDb.insert(completionsView);
    await subjectsDb.insert(subjectsView);
    await quizzesDb.insert(quizzesView);
    await questionsDb.insert(questionsView);
    await usersDb.insert(usersView);
    await responsesDb.insert(responsesView);
    
    res.json({ message: "All views created successfully" });
  } catch (err) {
    // Views might already exist
    res.json({ message: "Views setup completed", error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🗄️  CouchDB URL: ${COUCHDB_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});