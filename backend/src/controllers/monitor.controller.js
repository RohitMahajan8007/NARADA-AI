import Monitor from "../models/monitor.model.js";
import Log from "../models/log.model.js";
import { performSingleCheck, checkDomainExpiry } from "../jobs/monitor.job.js";

const PLAN_LIMITS = {
  free: 3,
  basic: 10,
  pro: 50,
  elite: 200,
};

export const createMonitor = async (req, res) => {
  try {
    const { name, url, type, interval, keyword, isPublic, isMaintenance, maintenanceUntil } = req.body;
    const user = req.user;

    const userPlan = typeof user.plan === 'object' ? (user.plan?.type || 'free') : (user.plan || 'free');
    const count = await Monitor.countDocuments({ user: user._id });
    if (count >= PLAN_LIMITS[userPlan]) {
      return res.status(400).json({ message: `Plan limit reached for ${userPlan} plan.` });
    }

    const monitor = await Monitor.create({
      user: user._id,
      name,
      url,
      type,
      interval,
      keyword,
      isPublic: !!isPublic,
      isMaintenance: !!isMaintenance,
      maintenanceUntil
    });

    // Run initial check immediately without waiting for cron
    performSingleCheck(monitor).catch(err => console.error("Initial check error:", err.message));

    // Also check domain expiry immediately
    checkDomainExpiry(monitor.url).then(async (domainData) => {
      if (domainData) {
        await Monitor.updateOne(
          { _id: monitor._id },
          { $set: { domainExpiry: domainData.expiryDate, domainDaysLeft: domainData.daysLeft } }
        );
      }
    }).catch(err => console.error("Initial domain check error:", err.message));

    res.status(201).json({ success: true, data: { monitor } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonitors = async (req, res) => {
  try {
    const monitors = await Monitor.find({ user: req.user._id });
    res.status(200).json({ success: true, data: monitors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonitorDetails = async (req, res) => {
  try {
    const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user._id });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    const logs = await Log.find({ monitor: monitor._id }).sort("-createdAt").limit(100);
    
    res.status(200).json({ success: true, data: { monitor, logs } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    res.status(200).json({ success: true, data: monitor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    await Log.deleteMany({ monitor: monitor._id });
    res.status(200).json({ success: true, message: "Monitor deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user._id });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });
    monitor.isActive = !monitor.isActive;
    await monitor.save();
    res.status(200).json({ success: true, data: monitor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ── Manual SSL refresh ── */
export const refreshSSL = async (req, res) => {
  try {
    const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user._id });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    // Inline TLS check (same logic as job)
    const { default: tls } = await import("tls");
    const result = await new Promise((resolve) => {
      try {
        const hostname = new URL(monitor.url).hostname;
        const socket = tls.connect(
          { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
          () => {
            const cert = socket.getPeerCertificate();
            socket.destroy();
            if (!cert || !cert.valid_to) return resolve(null);
            const expiry   = new Date(cert.valid_to);
            const daysLeft = Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24));
            const issuer   = cert.issuer?.O || cert.issuer?.CN || "Unknown";
            resolve({ expiry, issuer, daysLeft });
          }
        );
        socket.on("error", () => resolve(null));
        socket.setTimeout(8000, () => { socket.destroy(); resolve(null); });
      } catch { resolve(null); }
    });

    if (!result) {
      return res.status(200).json({ success: false, message: "SSL check failed or site doesn't use HTTPS on port 443." });
    }

    await Monitor.updateOne(
      { _id: monitor._id },
      { $set: { sslExpiry: result.expiry, sslIssuer: result.issuer, sslDaysLeft: result.daysLeft } },
      { runValidators: false }
    );

    res.status(200).json({
      success: true,
      data: { sslExpiry: result.expiry, sslIssuer: result.issuer, sslDaysLeft: result.daysLeft },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ── Immediate PDF Report Download ── */
export const downloadReport = async (req, res) => {
  try {
    const { generateWeeklyReport } = await import("../services/report.service.js");
    const pdfBuffer = await generateWeeklyReport(req.user);

    if (!pdfBuffer) {
      return res.status(404).json({ message: "No monitor data found to generate report." });
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=narada-ai-report-${Date.now()}.pdf`,
    });

    return res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error("Download Report Error:", error);
    res.status(500).json({ message: "Failed to generate PDF report." });
  }
};

export const setMaintenance = async (req, res) => {
  try {
    const { duration } = req.body; // duration in minutes
    const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user._id });
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    if (duration === 0) {
      monitor.isMaintenance = false;
      monitor.maintenanceUntil = null;
    } else {
      monitor.isMaintenance = true;
      monitor.maintenanceUntil = new Date(Date.now() + duration * 60 * 1000);
    }

    await monitor.save();
    res.status(200).json({ success: true, data: monitor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

