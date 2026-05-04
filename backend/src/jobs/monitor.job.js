import cron from "node-cron";
import axios from "axios";
import tls from "tls";
import { whoisDomain } from "whoiser";
import Monitor from "../models/monitor.model.js";
import Log from "../models/log.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendTelegramMessage } from "../utils/telegram.util.js";
import { analyzeDowntime } from "../services/ai.service.js";

/* ─────────────────────────────────────────────
   SSL Check Helper
───────────────────────────────────────────── */
const checkSSL = (url) => {
  return new Promise((resolve) => {
    try {
      const hostname = new URL(url).hostname;
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
    } catch {
      resolve(null);
    }
  });
};

/* ── Domain Expiry Helper (WHOIS) ── */
export const checkDomainExpiry = async (url) => {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    // whoisDomain returns an object keyed by WHOIS server
    const info = await whoisDomain(domain);
    let expiryDate = null;

    // whoiser returns a nested object depending on the TLD
    for (const key in info) {
      const reg = info[key];
      if (typeof reg !== "object") continue;
      const dateStr =
        reg["Expiry Date"] ||
        reg["Registry Expiry Date"] ||
        reg["Expiration Date"] ||
        reg["expires"] ||
        reg["domain_datebilleduntil"];
      if (dateStr) {
        expiryDate = Array.isArray(dateStr) ? new Date(dateStr[0]) : new Date(dateStr);
        break;
      }
    }

    if (!expiryDate || isNaN(expiryDate.getTime())) return null;

    const daysLeft = Math.floor((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
    return { expiryDate, daysLeft };
  } catch (error) {
    console.error("WHOIS error:", error.message);
    return null;
  }
};

export const startMonitoring = () => {

  /* ── Every minute: uptime check ── */
  cron.schedule("*/1 * * * *", async () => {
    const allActive = await Monitor.find({ isActive: true });
    const now = new Date();

    const monitorsToCheck = allActive.filter(monitor => {
      if (!monitor.lastChecked) return true; // Never checked before
      
      const lastCheckTime = new Date(monitor.lastChecked).getTime();
      const intervalMs = (monitor.interval || 5) * 60 * 1000;
      
      return (now.getTime() - lastCheckTime) >= intervalMs;
    });

    if (monitorsToCheck.length > 0) {
      console.log(`[JOB] Starting uptime check for ${monitorsToCheck.length} monitors...`);
      for (const monitor of monitorsToCheck) {
        await performSingleCheck(monitor);
      }
    }
  });

  /* ── Every 6 hours: SSL certificate check ── */
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running SSL certificate check...");
    const monitors = await Monitor.find({
      isActive: true,
      $or: [{ type: "https" }, { url: /^https:\/\//i }],
    });

    for (const monitor of monitors) {
      try {
        const ssl = await checkSSL(monitor.url);
        if (ssl) {
          await Monitor.updateOne(
            { _id: monitor._id },
            {
              $set: {
                sslExpiry:  ssl.expiry,
                sslIssuer:  ssl.issuer,
                sslDaysLeft: ssl.daysLeft,
              },
            },
            { runValidators: false }
          );
          console.log(`SSL ✓ ${monitor.name}: expires ${ssl.expiry.toDateString()} (${ssl.daysLeft}d left)`);

          if (ssl.daysLeft <= 14) {
            const user = await User.findById(monitor.user);
            if (user?.notificationPreferences?.email) {
              await sendEmail({
                email:   user.email,
                subject: `⚠️ SSL Expiring Soon: ${monitor.name}`,
                message: `SSL certificate for ${monitor.url} expires in ${ssl.daysLeft} days (${ssl.expiry.toDateString()}).`,
                html:    `<h3>SSL Expiry Warning</h3><p><b>${monitor.name}</b> (${monitor.url})<br>Certificate expires in <b style="color:red">${ssl.daysLeft} days</b>.</p>`,
              });
            }
          }
        }
      } catch (err) {
        console.error(`SSL check error for ${monitor._id}:`, err.message);
      }
    }
  });

  /* ── Every 12 hours: Domain Expiry check ── */
  cron.schedule("0 */12 * * *", async () => {
    console.log("Running Domain Expiry check...");
    const monitors = await Monitor.find({ isActive: true });

    for (const monitor of monitors) {
      try {
        const domainData = await checkDomainExpiry(monitor.url);
        if (domainData) {
          await Monitor.updateOne(
            { _id: monitor._id },
            {
              $set: {
                domainExpiry: domainData.expiryDate,
                domainDaysLeft: domainData.daysLeft
              }
            },
            { runValidators: false }
          );

          if (domainData.daysLeft <= 30) {
            const user = await User.findById(monitor.user);
            if (user?.notificationPreferences?.email) {
              await sendEmail({
                email: user.email,
                subject: `⚠️ Domain Expiring Soon: ${monitor.name}`,
                message: `Your domain ${monitor.url} expires in ${domainData.daysLeft} days.`,
                html: `<h3>Domain Expiry Warning</h3><p>Domain for <b>${monitor.name}</b> expires in <b style="color:red">${domainData.daysLeft} days</b>.</p>`
              });
            }
          }
        }
      } catch (err) {
        console.error(`Domain check error for ${monitor.name}:`, err.message);
      }
    }
  });

  /* ── Daily: SEO audit placeholder ── */
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily SEO audit check...");
  });

  /* ── Weekly (Monday 00:00): PDF Report ── */
  cron.schedule("0 0 * * 1", async () => {
    console.log("Generating Weekly PDF Reports...");
    const { generateWeeklyReport } = await import("../services/report.service.js");
    const users = await User.find({});

    for (const user of users) {
      try {
        const pdfBuffer = await generateWeeklyReport(user);
        if (pdfBuffer) {
          await sendEmail({
            email: user.email,
            subject: `📊 Weekly Performance Report - Narada AI`,
            message: `Hi ${user.fullname}, please find your weekly uptime report attached.`,
            html: `<h3>Weekly Status Report</h3><p>Attached is the performance summary of your monitors for the past 7 days.</p>`,
            attachments: [{
              filename: `weekly-report-${new Date().toISOString().split('T')[0]}.pdf`,
              content: pdfBuffer
            }]
          });
          console.log(`Weekly report sent to ${user.email}`);
        }
      } catch (err) {
        console.error(`Failed to send weekly report to ${user.email}:`, err.message);
      }
    }
  });
};

/* ── Status change handler (returns aiAnalysis string or null) ── */
const handleStatusChange = async (monitor, status, error) => {
  console.log(`[DEBUG] handleStatusChange called for ${monitor.name}. New status: ${status}`);
  const user = await User.findById(monitor.user);
  if (!user) {
    console.log(`[DEBUG] User not found for monitor ${monitor.name}`);
    return null;
  }

  console.log(`[DEBUG] User prefs: Email=${user.notificationPreferences?.email}, Telegram=${user.notificationPreferences?.telegram}, TgID=${user.telegramId}`);

  const subject = `Monitor ${status.toUpperCase()}: ${monitor.name}`;
  const message = `Your monitor ${monitor.name} (${monitor.url}) is now ${status.toUpperCase()}.\n${
    status === "down" ? `Error: ${error}` : "It's back online!"
  }`;

  let aiAnalysis = null;
  if (status === "down") {
    aiAnalysis = await analyzeDowntime(monitor, error);
  }

  const html = `
    <h3>Monitor Alert</h3>
    <p><b>Name:</b> ${monitor.name}</p>
    <p><b>URL:</b> ${monitor.url}</p>
    <p><b>Status:</b> <span style="color: ${status === "up" ? "green" : "red"}">${status.toUpperCase()}</span></p>
    ${aiAnalysis ? `<div style="background: #f4f4f4; padding: 10px; border-radius: 5px;">
      <h4>AI Root Cause Analysis:</h4>
      <p>${aiAnalysis.replace(/\n/g, "<br>")}</p>
    </div>` : ""}
  `;

  if (user.notificationPreferences?.email) {
    console.log(`[DEBUG] Attempting to send email to ${user.email}`);
    await sendEmail({ email: user.email, subject, message, html });
  }

  if (user.notificationPreferences?.telegram && user.telegramId) {
    console.log(`[DEBUG] Attempting to send Telegram message to ${user.telegramId}`);
    await sendTelegramMessage(
      user.telegramId,
      `<b>${subject}</b>\n\n${message}${aiAnalysis ? `\n\n<b>AI Analysis:</b>\n${aiAnalysis}` : ""}`
    );
  }

  return aiAnalysis;
};

/* ── Perform a single check for one monitor ── */
export const performSingleCheck = async (monitor) => {
  const startTime = Date.now();
  let status = "up";
  let responseTime = 0;
  let statusCode = 200;
  let errorMessage = "";

  try {
    try {
      const response = await axios.get(monitor.url, { timeout: 10000 });
      responseTime = Date.now() - startTime;
      statusCode = response.status;

      // Keyword Monitoring Check
      if (monitor.keyword && !response.data.includes(monitor.keyword)) {
        status = "down";
        errorMessage = `Keyword "${monitor.keyword}" not found on page`;
      }
    } catch (error) {
      status = "down";
      statusCode = error.response ? error.response.status : 500;
      errorMessage = error.message;
      responseTime = Date.now() - startTime;
    }

    let aiAnalysis = monitor.lastAiAnalysis || null;

    // ── Maintenance Mode Check ──
    const isUnderMaintenance = monitor.isMaintenance || (monitor.maintenanceUntil && new Date(monitor.maintenanceUntil) > new Date());
    
    if (isUnderMaintenance) {
      console.log(`[DEBUG] ${monitor.name} is in Maintenance Mode. Skipping alerts.`);
    } else if (monitor.status !== status || status === "down" || (monitor.status === "pending" && status === "down")) {
      console.log(`[DEBUG] Triggering handleStatusChange (Status is ${status})...`);
      aiAnalysis = await handleStatusChange(monitor, status, errorMessage);
    }

    // ── Escalation Logic (30 mins downtime) ──
    let downSince = monitor.downSince;
    let lastEscalationSent = monitor.lastEscalationSent;

    if (status === "down") {
      if (!downSince) downSince = new Date();
      
      const minsDown = Math.floor((new Date() - new Date(downSince)) / (1000 * 60));
      if (minsDown >= 30 && !lastEscalationSent && !isUnderMaintenance) {
        console.log(`[DEBUG] Escalating outage for ${monitor.name} (Down for ${minsDown}m)`);
        const user = await User.findById(monitor.user);
        if (user) {
          const subject = `🚨 URGENT: ${monitor.name} is down for 30+ minutes!`;
          const msg = `CRITICAL ALERT: ${monitor.name} (${monitor.url}) has been DOWN for ${minsDown} minutes. Please take immediate action.`;
          
          if (user.notificationPreferences?.email) await sendEmail({ email: user.email, subject, message: msg, html: `<h3>Critical Outage Escalation</h3><p style="color:red; font-size:18px;"><b>${monitor.name}</b> has been down for <b>${minsDown} minutes</b>.</p>` });
          if (user.notificationPreferences?.telegram && user.telegramId) await sendTelegramMessage(user.telegramId, `🚨 <b>URGENT ESCALATION</b>\n\n${msg}`);
          
          lastEscalationSent = new Date();
        }
      }
    } else {
      downSince = null;
      lastEscalationSent = null;
    }

    // Simulate Multi-Region Results
    const regions = [
      { 
        name: "US-East (N. Virginia)", 
        status: status, 
        responseTime: status === 'up' ? responseTime + Math.floor(Math.random() * 50 + 150) : 0 
      },
      { 
        name: "Europe (London)", 
        status: status, 
        responseTime: status === 'up' ? responseTime + Math.floor(Math.random() * 30 + 80) : 0 
      },
      { 
        name: "Asia (Singapore)", 
        status: status, 
        responseTime: status === 'up' ? responseTime + Math.floor(Math.random() * 40 + 20) : 0 
      }
    ];

    // Create Log with regions
    await Log.create({
      monitor: monitor._id,
      status,
      responseTime,
      statusCode,
      message: errorMessage || "OK",
      regions
    });

    await Monitor.updateOne(
      { _id: monitor._id },
      {
        $set: {
          status,
          lastChecked: new Date(),
          lastResponseTime: responseTime,
          downSince,
          lastEscalationSent,
          regions,
          ...(aiAnalysis !== null && { lastAiAnalysis: aiAnalysis }),
        },
      },
      { runValidators: false }
    );
  } catch (jobError) {
    console.error(`Error processing monitor ${monitor._id}:`, jobError.message);
  }
};
