const express = require("express");
const cors = require("cors");
const nano = require("nano")("http://deep:1234@127.0.0.1:5984");
const db = nano.db.use("students");
const usersDb = nano.db.use("users");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure databases exist (best-effort)
(async () => {
  try {
    const dbs = await nano.db.list();
    if (!dbs.includes("students")) await nano.db.create("students");
    if (!dbs.includes("users")) await nano.db.create("users");
  } catch (e) {
    console.warn("DB init warning:", e.message);
  }
})();

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

app.listen(4000, () => console.log("🚀 Server running on http://localhost:4000"));
