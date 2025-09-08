const express = require("express");
const cors = require("cors");
const nano = require("nano")("http://deep:1234@127.0.0.1:5984");
const db = nano.db.use("students");

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(4000, () => console.log("🚀 Server running on http://localhost:4000"));
