import express from "express";
import http from "http"; 
import cors from "cors";
import articlesRoutes from "./routes/articles.js";
import pool from "./db.js";
import { isDbSetUp, setupDb, retrieveDataFromDb } from "./services/articleService.js";
import { startArticleScheduler } from "./services/articleJob.js";
import { initWebSocketServer } from "./ws/socketServer.js";
import healthRouter, { setDbReady } from "./routes/health.js";

const app = express();
const server = http.createServer(app);
const port = 8080;
const allowedOrigins = [
  "http://localhost:3000", 
  "http://frontend:3000",  
  "http://localhost:5173" ,
  // ADD YOUR PUBLIC FRONTEND DOMAIN HERE:
  "http://16.16.67.98:3000"

  // In production mode make sure to allow inbound origin
];

app.use(cors({
  origin: function (origin, callback) {
    if(!origin) return callback(null, true); 
    if(allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy does not allow this origin';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());
app.use("/articles", articlesRoutes);
// Mount the health route , 
app.use("/health", healthRouter);

initWebSocketServer(server);

async function initializeDatabase() {
  console.log("🔍 Checking database...");

  const tableExists = await isDbSetUp();

  if (!tableExists) {
    console.log("📄 Table missing — creating it and inserting initial articles...");

    console.log("Please wait...")
    const initialArticles = await setupDb();

    if (!initialArticles || initialArticles.length === 0) {
      console.error("❌ Initial article setup failed. Stopping server.");
      process.exit(1);
    }

    console.log("✅ Initial articles inserted successfully.");
  } else {
    console.log("📄 Table already exists — skipping insertion.");
  }

  // Sanity check
  const articles = await retrieveDataFromDb();
  if (!articles || articles.length === 0) {
    console.error("❌ DB empty after setup. Refusing to start.");
    process.exit(1);
  }

  console.log(`📚 DB ready with ${articles.length} articles.`);
}

server.listen(port, async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ DB connection successful");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }

  await initializeDatabase();
  setDbReady(true); //  mark backend as ready
  console.log(`🚀 Server running on port ${port}`);

  startArticleScheduler();
});
