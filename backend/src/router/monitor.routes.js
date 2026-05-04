import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createMonitor,
  getMonitors,
  getMonitorDetails,
  updateMonitor,
  deleteMonitor,
  toggleMonitor,
  refreshSSL,
  downloadReport,
  setMaintenance,
} from "../controllers/monitor.controller.js";

import { getSeoInsights } from "../controllers/seo.controller.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getMonitors).post(createMonitor);
router.route("/:id").get(getMonitorDetails).put(updateMonitor).delete(deleteMonitor);
router.patch("/:id/toggle", toggleMonitor);
router.patch("/:id/maintenance", setMaintenance);
router.post("/:id/check-ssl", refreshSSL);
router.get("/reports/download", downloadReport);
router.get("/:monitorId/seo-insights", getSeoInsights);

export default router;
