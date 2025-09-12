const express = require("express");
const cors = require("cors");
const http = require('http');
// Initialize express early so route registrations above later code are safe
const app = express();
const server = http.createServer(app);
let wss; // lazily created after server listen
require('dotenv').config();

// Database configuration
const COUCHDB_URL = process.env.COUCHDB_URL || "http://127.0.0.1:5984";
const COUCHDB_USERNAME = process.env.COUCHDB_USERNAME || "deep";
const COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD || "1234";
const PORT = process.env.PORT || 4000;
const AUTO_PROVISION_ROLES = true;

// Robust CouchDB connection string builder (supports http/https + trailing slash + credential injection)
function buildCouchConnectionString() {
  let raw = COUCHDB_URL.trim();
  // Remove trailing slashes for consistency
  raw = raw.replace(/\/+$/, '');
  let urlObj;
  try {
    urlObj = new URL(raw);
  } catch (e) {
    console.error(`❌ Invalid COUCHDB_URL provided: ${raw}`);
    throw e;
  }
  if (COUCHDB_USERNAME) urlObj.username = COUCHDB_USERNAME;
  if (COUCHDB_PASSWORD) urlObj.password = COUCHDB_PASSWORD;
  // Ensure no path component (root of CouchDB)
  urlObj.pathname = '';
  // Remove any trailing slash nano dislikes
  return urlObj.toString().replace(/\/+$/, '');
}

let couchdbConnectionString;
try {
  couchdbConnectionString = buildCouchConnectionString();
} catch (e) {
  console.error('Failed constructing CouchDB connection URL:', e.message);
  process.exit(1);
}

const sanitizedForLog = couchdbConnectionString.replace(/:\w+@/, ':****@');
console.log(`Connecting to CouchDB at: ${sanitizedForLog}`);

let nano;
try {
  const nanoFactory = require('nano');
  nano = nanoFactory(couchdbConnectionString);
  if (!nano || !nano.db) {
    throw new Error('Nano client missing .db API (likely malformed URL)');
  }
} catch (error) {
  console.error("❌ Failed to initialize CouchDB client:", error.message);
  console.log("Troubleshooting tips:\n 1. Verify CouchDB URL (COUCHDB_URL)\n 2. Remove trailing slash from URL\n 3. Confirm credentials are correct\n 4. If using Railway/Cloud, ensure public access or proper networking");
  process.exit(1);
}

// ---------- CouchDB Diagnostics Helpers ----------
async function lowLevelHttpCheck() {
  const results = {};
  try {
    const rootRes = await fetch(couchdbConnectionString + '/', { method: 'GET' });
    results.root = {
      status: rootRes.status,
      ok: rootRes.ok,
      headers: Object.fromEntries([...rootRes.headers].slice(0, 10)),
      bodySnippet: (await rootRes.text()).slice(0, 200)
    };
  } catch (e) {
    results.root = { error: e.message };
  }
  try {
    const allDbsRes = await fetch(couchdbConnectionString + '/_all_dbs', { method: 'GET' });
    let body; try { body = await allDbsRes.text(); } catch { body = ''; }
    results.all_dbs = {
      status: allDbsRes.status,
      ok: allDbsRes.ok,
      bodySnippet: body.slice(0, 200)
    };
  } catch (e) {
    results.all_dbs = { error: e.message };
  }
  return results;
}

app.get('/diagnostics/couch', async (req, res) => {
  const diag = { connectionString: sanitizedForLog, env: { COUCHDB_URL: COUCHDB_URL, COUCHDB_USERNAME: COUCHDB_USERNAME ? '[set]' : '[empty]' }, timestamp: new Date().toISOString() };
  try {
    const dbs = await nano.db.list();
    diag.nano = { ok: true, dbCount: dbs.length, sample: dbs.slice(0, 10) };
  } catch (e) {
    diag.nano = { ok: false, error: e.message };
  }
  diag.rawHttp = await lowLevelHttpCheck();
  res.json(diag);
});

// Database connections (lazy ensure)
function bindDb(name) {
  try {
    return nano.db.use(name);
  } catch (e) {
    console.warn(`⚠️  Could not bind database '${name}': ${e.message}`);
    return null;
  }
}
let db = bindDb('students');
let usersDb = bindDb('users');
let streaksDb = bindDb('streaks');
let quizCompletionsDb = bindDb('quiz_completions');
let subjectsDb = bindDb('subjects');
let quizzesDb = bindDb('quizzes');
let questionsDb = bindDb('questions');
let responsesDb = bindDb('responses');
// Raw body for webhook signature verification
const bodyParser = require('body-parser');
app.use('/clerk/webhook', bodyParser.raw({ type: 'application/json' }));

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

// ==============================
// Simple Server-Sent Events (SSE)
// ==============================
const sseClients = new Set();
const wsClients = new Set();
app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': corsOptions.origin[0]
  });
  res.write(`event: ping\ndata: {"t":${Date.now()}}\n\n`);
  const client = { res };
  sseClients.add(client);
  req.on('close', () => sseClients.delete(client));
});

function broadcast(event, data) {
  const payload = { event, data, ts: Date.now() };
  const sseFormatted = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const c of sseClients) {
    try { c.res.write(sseFormatted); } catch {}
  }
  for (const ws of wsClients) {
    if (ws.readyState === 1) {
      try { ws.send(JSON.stringify(payload)); } catch {}
    }
  }
}

// Ensure databases exist (best-effort)
async function ensureDatabases() {
  console.log('Checking CouchDB connection...');
  let existing = [];
  try {
    existing = await nano.db.list();
  } catch (e) {
    console.error('❌ Failed listing databases:', e.message);
    return;
  }
  const required = [
    'students','users','streaks','quiz_completions',
    'subjects','quizzes','questions','responses'
  ];
  for (const name of required) {
    if (existing.includes(name)) {
      console.log(`✅ DB present: ${name}`);
      continue;
    }
    try {
      await nano.db.create(name);
      console.log(`✅ Created DB: ${name}`);
    } catch (e) {
      // Remote hosted Couch (Railway / Cloudant) may block creation without admin perms
      console.warn(`⚠️  Could not create DB '${name}': ${e.message}`);
    }
  }
}

ensureDatabases().then(()=>{
  // Re-bind in case some were just created
  db = bindDb('students');
  usersDb = bindDb('users');
  streaksDb = bindDb('streaks');
  quizCompletionsDb = bindDb('quiz_completions');
  subjectsDb = bindDb('subjects');
  quizzesDb = bindDb('quizzes');
  questionsDb = bindDb('questions');
  responsesDb = bindDb('responses');
}).catch(e=>console.warn('DB ensure error', e.message));

// Utility: ensure design documents exist (auto instead of manual /setup-views requirement)
async function ensureDesignDocs() {
  const designDocs = [
    { db: quizCompletionsDb, id: '_design/completions', doc: { _id: '_design/completions', views: { by_user_date: { map: "function(doc){ if(doc.type==='quiz_completion'){ var date=doc.completedAt.split('T')[0]; emit([doc.userId,date],doc); } }" }, by_date: { map: "function(doc){ if(doc.type==='quiz_completion'){ var date=doc.completedAt.split('T')[0]; emit(date,doc); } }" } } } },
    { db: subjectsDb, id: '_design/subjects', doc: { _id: '_design/subjects', views: { all: { map: "function(doc){ if(doc.type==='subject'){ emit(doc.name,doc); } }" }, by_class: { map: "function(doc){ if(doc.type==='subject'){ emit(doc.class,doc); } }" } } } },
    { db: quizzesDb, id: '_design/quizzes', doc: { _id: '_design/quizzes', views: { all: { map: "function(doc){ if(doc.type==='quiz'){ emit(doc.createdAt,doc); } }" }, by_subject: { map: "function(doc){ if(doc.type==='quiz'){ emit(doc.subjectId,doc); } }" } } } },
    { db: questionsDb, id: '_design/questions', doc: { _id: '_design/questions', views: { by_quiz: { map: "function(doc){ if(doc.type==='question'){ emit(doc.quizId,doc); } }" } } } },
    { db: usersDb, id: '_design/users', doc: { _id: '_design/users', views: { all: { map: "function(doc){ if(doc.type==='userRole'){ emit(doc.userId,doc); } }" }, by_school: { map: "function(doc){ if(doc.type==='userRole' && doc.schoolId){ emit(doc.schoolId,doc); } }" }, by_role: { map: "function(doc){ if(doc.type==='userRole'){ emit(doc.role,doc); } }" } } } },
    { db: responsesDb, id: '_design/responses', doc: { _id: '_design/responses', views: { all: { map: "function(doc){ if(doc.type==='quiz_response'){ emit(doc.submittedAt,doc); } }" }, by_student: { map: "function(doc){ if(doc.type==='quiz_response'){ emit(doc.studentId,doc); } }" }, by_quiz: { map: "function(doc){ if(doc.type==='quiz_response'){ emit(doc.quizId,doc); } }" } } } }
  ];
  for (const item of designDocs) {
    try { await item.db.get(item.id); } catch (e) {
      if (e.statusCode === 404) {
        try { await item.db.insert(item.doc); console.log(`✅ Created design doc ${item.id}`); } catch (ie) { console.warn(`⚠️  Failed creating design doc ${item.id}:`, ie.message); }
      }
    }
  }
}

ensureDesignDocs().catch(e=>console.warn('Design doc init error', e.message));

// Clerk user deletion webhook
// Set CLERK_WEBHOOK_SECRET in .env (from Clerk dashboard) for verification
app.post('/clerk/webhook', async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('Missing CLERK_WEBHOOK_SECRET environment variable');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  let payloadString = req.body.toString('utf8');
  const svixId = req.header('svix-id');
  const svixTimestamp = req.header('svix-timestamp');
  const svixSignature = req.header('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing Svix headers' });
  }
  const { Webhook } = require('svix');
  const wh = new Webhook(secret);
  let evt;
  try {
    evt = wh.verify(payloadString, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Webhook verification failed', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }
  const eventType = evt.type;
  try {
    if (eventType === 'user.deleted') {
      const userId = evt.data.id;
      // Delete role/user doc
      try {
        const userDoc = await usersDb.get(`user:${userId}`);
        await usersDb.destroy(userDoc._id, userDoc._rev);
        console.log(`Deleted user role doc for ${userId}`);
      } catch (e) { if (e.statusCode !== 404) console.warn('User doc delete error', e.message); }
      // Delete streak doc
      try {
        const streakDoc = await streaksDb.get(`streak:${userId}`);
        await streaksDb.destroy(streakDoc._id, streakDoc._rev);
      } catch (e) { if (e.statusCode !== 404) console.warn('Streak doc delete error', e.message); }
      // Delete quiz completions
      try {
        const completions = await quizCompletionsDb.list({ include_docs: true });
        const toDelete = completions.rows.filter(r => r.doc?.userId === userId).map(r => ({ _id: r.doc._id, _rev: r.doc._rev, _deleted: true }));
        if (toDelete.length) await quizCompletionsDb.bulk({ docs: toDelete });
      } catch (e) { console.warn('Completion cleanup error', e.message); }
      // Delete responses
      try {
        const responses = await responsesDb.list({ include_docs: true });
        const toDelete = responses.rows.filter(r => r.doc?.studentId === userId).map(r => ({ _id: r.doc._id, _rev: r.doc._rev, _deleted: true }));
        if (toDelete.length) await responsesDb.bulk({ docs: toDelete });
      } catch (e) { console.warn('Responses cleanup error', e.message); }
      console.log(`✅ Fully cleaned data for deleted user ${userId}`);
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Webhook processing error', e);
    res.status(500).json({ error: 'Internal error' });
  }
});

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
  if (!db) return res.status(503).json({ error: 'students DB not available' });
  try {
    const response = await db.insert(req.body);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all progress
app.get("/progress", async (req, res) => {
  if (!db) return res.status(503).json({ error: 'students DB not available' });
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
    if (err.statusCode === 404) {
      if (!AUTO_PROVISION_ROLES) return res.status(404).json({ error: "Not Found" });
      // Auto provision placeholder role requiring onboarding
      try {
        const now = new Date().toISOString();
        const provisional = {
          _id: docId,
          userId,
          role: 'unassigned',
          provisional: true,
          name: null,
          schoolId: null,
          class: null,
          createdAt: now,
          updatedAt: now,
          type: 'userRole'
        };
        await usersDb.insert(provisional);
        broadcast('user.provisioned', { userId, role: 'unassigned' });
        return res.status(404).json({ error: 'Not Onboarded', provisional: true });
      } catch (pErr) {
        return res.status(500).json({ error: pErr.message });
      }
    }
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
  provisional: false,
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
    const { class: classFilter, schoolId, debug } = req.query;

    let rows = [];
    try {
      const viewResult = await subjectsDb.view('subjects', 'all', { include_docs: true });
      rows = viewResult.rows;
    } catch (e) {
      // Fallback: full scan if design doc/view not ready yet
      const all = await subjectsDb.list({ include_docs: true }).catch(() => ({ rows: [] }));
      rows = all.rows.filter(r => r.doc?.type === 'subject');
    }

    let subjects = rows.map(row => ({
      id: row.doc._id,
      name: row.doc.name,
      class: row.doc.class,
      description: row.doc.description,
      createdBy: row.doc.createdBy,
      schoolId: row.doc.schoolId || null,
      createdAt: row.doc.createdAt,
      updatedAt: row.doc.updatedAt
    }));

    if (classFilter) subjects = subjects.filter(s => s.class == classFilter);
    if (schoolId) {
      subjects = subjects.filter(s => !s.schoolId || s.schoolId === schoolId);
    }

    if (debug === 'true') {
      console.log('[DEBUG /subjects] count=%d classFilter=%s schoolId=%s', subjects.length, classFilter, schoolId);
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
      schoolId: userDoc.schoolId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "subject"
    };

  const response = await subjectsDb.insert(subjectDoc);
  broadcast('subject.created', { id: response.id, name: subjectDoc.name, class: subjectDoc.class, schoolId: subjectDoc.schoolId, description: subjectDoc.description });
    
    res.json({
      success: true,
      id: response.id,
      subject: {
        id: response.id,
        name: subjectDoc.name,
        class: subjectDoc.class,
        description: subjectDoc.description,
        createdBy: subjectDoc.createdBy,
        schoolId: subjectDoc.schoolId,
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

// GET /subjects/stats - subjects with quizCount, attempts, progress%
app.get('/subjects/stats', async (req, res) => {
  try {
    const { class: classFilter, schoolId, studentId } = req.query;
    // Reuse subjects logic by calling internal handler (duplicated small portion for clarity)
    let rows = [];
    try {
      const viewResult = await subjectsDb.view('subjects','all',{ include_docs:true });
      rows = viewResult.rows;
    } catch {
      const all = await subjectsDb.list({ include_docs:true }).catch(()=>({ rows:[] }));
      rows = all.rows.filter(r => r.doc?.type==='subject');
    }
    let subjects = rows.map(r => r.doc).filter(Boolean);
    if (classFilter) subjects = subjects.filter(s => s.class == classFilter);
    if (schoolId) subjects = subjects.filter(s => !s.schoolId || s.schoolId === schoolId);

    // Quizzes
    let quizRows = [];
    try {
      const qv = await quizzesDb.view('quizzes','all',{ include_docs:true });
      quizRows = qv.rows;
    } catch {
      const allQ = await quizzesDb.list({ include_docs:true }).catch(()=>({ rows:[] }));
      quizRows = allQ.rows.filter(r => r.doc?.type==='quiz');
    }
    let quizzes = quizRows.map(r => r.doc).filter(Boolean);
    if (schoolId) quizzes = quizzes.filter(q => !q.schoolId || q.schoolId === schoolId);
    const quizCountBySubject = quizzes.reduce((acc,q)=>{ acc[q.subjectId]=(acc[q.subjectId]||0)+1; return acc; },{});

    // Attempts by student (optional)
    let attemptsBySubject = {};
    if (studentId) {
      let responseRows = [];
      try {
        const rv = await responsesDb.view('responses','by_student',{ key: studentId, include_docs:true });
        responseRows = rv.rows;
      } catch {}
      const responses = responseRows.map(r => r.doc).filter(Boolean);
      const quizLookup = quizzes.reduce((m,q)=>{ m[q._id]=q; return m;},{});
      for (const resp of responses) {
        const q = quizLookup[resp.quizId];
        if (q) attemptsBySubject[q.subjectId]=(attemptsBySubject[q.subjectId]||0)+1;
      }
    }
    const enriched = subjects.map(s => {
      const total = quizCountBySubject[s._id]||0;
      const attempted = attemptsBySubject[s._id]||0;
      const progress = total>0? Math.round((attempted/total)*100) : 0;
      return {
        id: s._id,
        name: s.name,
        class: s.class,
        schoolId: s.schoolId||null,
        description: s.description||'',
        quizCount: total,
        attempted,
        progress
      };
    });
    res.json({ count: enriched.length, subjects: enriched });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===========================================
// QUIZZES API ENDPOINTS
// ===========================================

// GET /quizzes - List quizzes (with optional subject filter); fallback if view missing
app.get("/quizzes", async (req, res) => {
  try {
    const { subjectId, createdBy, schoolId } = req.query;
    let rows = [];
    try {
      const result = await quizzesDb.view('quizzes', 'all', { include_docs: true });
      rows = result.rows;
    } catch (e) {
      // Fallback: full scan (only if view not ready)
      const all = await quizzesDb.list({ include_docs: true });
      rows = all.rows.filter(r => r.doc?.type === 'quiz');
    }
    let quizzes = rows.map(row => ({
      id: row.doc._id,
      subjectId: row.doc.subjectId,
      title: row.doc.title,
      description: row.doc.description,
      difficulty: row.doc.difficulty,
      timeLimit: row.doc.timeLimit,
      createdBy: row.doc.createdBy,
      schoolId: row.doc.schoolId || null,
      createdAt: row.doc.createdAt,
      updatedAt: row.doc.updatedAt
    }));
    if (subjectId) quizzes = quizzes.filter(q => q.subjectId === subjectId);
    if (createdBy) quizzes = quizzes.filter(q => q.createdBy === createdBy);
    if (schoolId) quizzes = quizzes.filter(q => q.schoolId === schoolId);
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

    // Verify subject exists (by id or by name fallback)
    let subjectDoc;
    try {
      subjectDoc = await subjectsDb.get(subjectId);
    } catch (e) {
      // Fallback: search by name if user passed name/slug instead of id
      try {
        const subjView = await subjectsDb.view('subjects','all',{ include_docs:true });
        const match = subjView.rows.find(r => [r.doc.name.toLowerCase(), r.doc.name.toLowerCase().replace(/\s+/g,'-')].includes(subjectId.toLowerCase()));
        if (match) subjectDoc = match.doc; else throw e;
      } catch(inner){
        return res.status(400).json({ error: 'Subject not found. Provide valid subjectId.' });
      }
    }

  const quizId = `quiz:${Date.now()}:${title.toLowerCase().replace(/\s+/g, '-')}`;
    const quizDoc = {
      _id: quizId,
      subjectId,
      title,
      description: description || "",
      difficulty,
      timeLimit,
      createdBy,
      schoolId: userDoc.schoolId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "quiz"
    };

    const response = await quizzesDb.insert(quizDoc);
  broadcast('quiz.created', { id: response.id, subjectId: quizDoc.subjectId, schoolId: quizDoc.schoolId });

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
  // Broadcast quiz attempt event (without leaking answers)
  broadcast('quiz.attempted', { quizId, studentId, score: scorePercentage, correctAnswers, totalQuestions, submittedAt: responseDoc.submittedAt });
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

// Removed duplicate listen (handled at bottom)

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
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🗄️  CouchDB URL: ${COUCHDB_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  // Init WebSocket server after HTTP server is listening
  const { WebSocketServer } = require('ws');
  wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (socket) => {
    wsClients.add(socket);
    socket.send(JSON.stringify({ event: 'connected', data: { message: 'ws connection established' }, ts: Date.now() }));
    socket.on('message', (msg) => {
      // Optional ping/pong or future client messages
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === 'ping') socket.send(JSON.stringify({ event: 'pong', data: {}, ts: Date.now() }));
      } catch {}
    });
    socket.on('close', () => wsClients.delete(socket));
  });
  console.log('🔌 WebSocket endpoint available at /ws');
});

// ==============================
// AI STUDY BUDDY (Gemini) API
// ==============================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';
const aiRate = new Map();
function aiRateGuard(req,res,next){
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const rec = aiRate.get(ip) || { count:0, start: now };
  if (now - rec.start > 60000){ rec.count = 0; rec.start = now; }
  rec.count++; aiRate.set(ip, rec);
  if (rec.count > 30) return res.status(429).json({ error: 'Too many AI requests, slow down.' });
  next();
}

async function callGemini(prompt, history=[]) {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');
  const contents = [
    ...history.slice(-8).map(m => ({ role: m.role === 'user' ? 'user':'model', parts:[{ text: m.content.slice(0,4000) }] })),
    { role:'user', parts:[{ text: prompt.slice(0,8000) }] }
  ];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ contents, generationConfig:{ temperature:0.7, topK:40, topP:0.95, maxOutputTokens:512 } })
  });
  if (!response.ok){
    const t = await response.text();
    throw new Error(`Gemini error ${response.status}: ${t.slice(0,200)}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';
}

app.post('/ai/study-buddy', aiRateGuard, async (req,res) => {
  try {
    const { question, mode='answer', history=[] } = req.body || {};
    if (!question || !question.trim()) {
      return res.status(400).json({ error:'Please enter a question.' });
    }
    // Light normalization (allow very short queries, but encourage detail)
    if (question.trim().length < 3) {
      return res.status(400).json({ error:'Add a little more detail so I can help (min 3 characters).' });
    }

    console.log(`[AI] mode=${mode} len=${question.length} sample="${question.slice(0,40).replace(/\n/g,' ')}`);

    const prefixMap = {
      answer: 'You are a concise STEM tutor. Provide a direct answer first, then a short explanation.',
      explain: 'You are a patient STEM instructor. Explain the concept step-by-step with a simple analogy.',
      practice: 'You are a STEM coach. Provide the solution then 2 follow-up practice questions (hide answers after a label like Answer: ).'
    };
    const system = prefixMap[mode] || prefixMap.answer;
    const fullPrompt = `${system}\n\nStudent question: ${question}`;
    const answer = await callGemini(fullPrompt, history);
    res.json({ answer, mode });
  } catch (e) {
    console.error('AI error', e);
    const msg = e.message || 'Unknown AI error';
    if (/Gemini error/i.test(msg)) {
      return res.status(502).json({ error: msg });
    }
    if (/not configured/i.test(msg)) {
      return res.status(503).json({ error: 'AI service not configured' });
    }
    res.status(500).json({ error: msg });
  }
});