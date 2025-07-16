// 1. Required Packages
const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const path = require("path");

// 2. Express App Setup
const app = express();
const port = 3000;

// 3. Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname)));

app.use('/image', express.static(path.join(__dirname, 'image')));

// 4. MongoDB Setup
const client = new MongoClient("mongodb://localhost:27017");
let db;

// 5. Main Function
async function main() {
  await client.connect();
  db = client.db("firstAidDB");
  console.log("✅ Connected to MongoDB");

  // ✅ Insert User
  app.post("/insertuser", async (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, email, and phone are required." });
    }

    const existingUser = await db.collection("users").findOne({ email, phone });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }

    const result = await db.collection("users").insertOne({ name, email, phone });
    res.status(201).json({ message: "✅ User added", userId: result.insertedId });
  });

  // ✅ Get All Users
  app.get("/users", async (req, res) => {
    try {
      const users = await db.collection("users").find({}).toArray();
      res.json(users);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ✅ Insert Symptom Solution
  app.post("/insert-symptom-solution", async (req, res) => {
    const { keyword, solution, related, severity, cause, tips } = req.body;
    if (!keyword || !solution || !severity) {
      return res.status(400).json({ error: "Keyword, solution, and severity are required." });
    }

    try {
      const existing = await db.collection("symptom_solutions").findOne({ keyword });
      if (existing) {
        return res.status(409).json({ error: "Symptom already exists." });
      }

      const result = await db.collection("symptom_solutions").insertOne({
        keyword,
        solution,
        related: related || [],
        severity,
        cause: cause || "",
        tips: tips || []
      });

      res.status(201).json({ message: "✅ Symptom solution inserted", id: result.insertedId });
    } catch (err) {
      console.error("❌ Insert error:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  });

  // ✅ Submit Symptom Report
  app.post("/submit-report", async (req, res) => {
    try {
      const { userId, text_input, image_url } = req.body;

      if (!userId || userId.length !== 24) {
        return res.status(400).json({ error: "❌ Invalid or missing userId." });
      }

      const userObjectId = new ObjectId(userId);
      const symptoms = text_input.toLowerCase();

      // Try full-text match with regex
      const match = await db.collection("symptom_solutions").findOne({
        keyword: { $regex: new RegExp(symptoms, "i") }
      });

      const recommendation = {
        solution: match?.solution || "No recommendation available.",
        relatedSymptoms: match?.related || [],
        severity: match?.severity || "Not specified",
        cause: match?.cause || "No explanation available.",
        tips: match?.tips || []
      };

      const result = await db.collection("symptom_reports").insertOne({
        userId: userObjectId,
        input_type: image_url ? "image" : "text",
        text_input,
        image_url,
        symptoms_detected: symptoms.split(" "),
        severity_score: recommendation.severity,
        recommendation,
        timestamp: new Date()
      });

      res.json({
        reportId: result.insertedId,
        recommendation,
        severity: recommendation.severity
      });
    } catch (err) {
      console.error("❌ Error in /submit-report:", err);
      res.status(500).json({ error: "Failed to submit report." });
    }
  });

  // ✅ Get Report History
  app.get("/reports", async (req, res) => {
    const userId = req.query.userId;

    if (!userId || userId.length !== 24) {
      return res.status(400).json({ error: "Missing or invalid userId." });
    }

    try {
      const reports = await db.collection("symptom_reports")
        .find({ userId: new ObjectId(userId) })
        .sort({ timestamp: -1 })
        .toArray();

      res.json(reports);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      res.status(500).json({ error: "Could not fetch reports." });
    }
  });

  // ✅ Start Server
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

// Start the server
main().catch(console.error);
