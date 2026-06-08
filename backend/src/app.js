import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import passport from "./config/passport.js";
import authRoutes from "./router/auth.routes.js";
import monitorRoutes from "./router/monitor.routes.js";
import paymentRoutes from "./router/payment.routes.js";
import adminRoutes from "./router/admin.routes.js";
import aiRoutes from "./router/ai.routes.js";
import seoRoutes from "./router/seo.routes.js";
import { protect } from "./middlewares/auth.middleware.js";
import Log from "./models/log.model.js";
import Monitor from "./models/monitor.model.js";
import { getAudit, runAudit } from "./controllers/audit.controller.js";

const app = express();
app.set('trust proxy', true);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));


app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());

// Serve frontend build files from public folder
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

app.use("/api/auth", authRoutes);
app.use("/api/monitors", monitorRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/seo", seoRoutes);


app.get("/api/public/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const monitors = await Monitor.find({ user: userId, isPublic: true });
    res.status(200).json({ success: true, data: monitors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get("/api/public/monitor/:monitorId", async (req, res) => {
  try {
    const { monitorId } = req.params;
    const monitor = await Monitor.findOne({ _id: monitorId, isPublic: true });
    if (!monitor) return res.status(404).json({ message: "Monitor not found or not public" });

    const logs = await Log.find({ monitor: monitorId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, data: { monitor, logs } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get("/api/logs/:monitorId", protect, async (req, res) => {
  try {
    const { monitorId } = req.params;
    const limit = parseInt(req.query.limit) || 90;
    const monitor = await Monitor.findOne({ _id: monitorId, user: req.user._id });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    const logs = await Log.find({ monitor: monitorId }).sort("-createdAt").limit(limit);
    res.status(200).json({ success: true, data: { logs } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get("/api/audit/:monitorId", protect, getAudit);
app.post("/api/audit/:monitorId", protect, runAudit);

// Catch-all route: serve frontend for any non-API route (React Router SPA support)
app.get("*", (req, res, next) => {
  // If the request is for a static asset or contains a file extension, skip catch-all
  if (req.path.includes(".") || req.path.startsWith("/assets/")) {
    return next();
  }
  const indexPath = path.join(__dirname, "../public", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ message: "Web Monitor Backend is running. Frontend not built yet." });
  }
});

export default app;
