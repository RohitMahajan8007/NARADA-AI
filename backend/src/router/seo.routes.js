import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getSeoInsights } from "../controllers/seo.controller.js";

const router = express.Router();
router.post("/audit", protect, getSeoInsights);
export default router;
