import { Telegraf } from "telegraf";
import Settings from "../models/settings.model.js";

let botInstance = null;
let currentToken = null;

const getBot = async () => {
  try {
    const settings = await Settings.findOne({});
    const token = settings?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) return null;

    if (!botInstance || currentToken !== token) {
      botInstance = new Telegraf(token);
      currentToken = token;
    }
    return botInstance;
  } catch (error) {
    console.error("Error getting telegram bot:", error);
    return null;
  }
};


export const initBot = async () => {
  const bot = await getBot();
  if (!bot) {
    console.log("Telegram Bot Token not found. Bot interaction disabled.");
    return;
  }

 
  const { default: Monitor } = await import("../models/monitor.model.js");
  const { default: User } = await import("../models/user.model.js");

 
  bot.command("start", (ctx) => {
    ctx.replyWithHTML(
      `<b>Welcome to WebMonitor!</b>\n\n` +
      `Your Telegram ID is: <code>${ctx.from.id}</code>\n\n` +
      `Please copy this ID and paste it in your <b>Profile Settings</b> on our website to link your account.\n\n` +
      `<b>Commands:</b>\n` +
      `/status - Check all monitors\n` +
      `/stats - Get uptime statistics`
    );
  });

 
  bot.command("status", async (ctx) => {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id.toString() });
      if (!user) return ctx.reply("Account not linked. Use /start to get your ID.");

      const monitors = await Monitor.find({ user: user._id });
      if (monitors.length === 0) return ctx.reply("No monitors found.");

      let response = "<b>📊 Your Monitors:</b>\n\n";
      monitors.forEach((m) => {
        const icon = m.status === "up" ? "✅" : "❌";
        response += `${icon} <b>${m.name}</b>\n`;
        response += `Status: ${m.status?.toUpperCase()}\n`;
        response += `URL: ${m.url}\n`;
        response += `Audit: /audit_${m._id}\n\n`;
      });

      ctx.replyWithHTML(response);
    } catch (error) {
      ctx.reply("Error: " + error.message);
    }
  });

  bot.hears(/^\/audit_(.+)$/, async (ctx) => {
    const monitorId = ctx.match[1];
    const { runAudit } = await import("../controllers/audit.controller.js");
    const { default: Monitor } = await import("../models/monitor.model.js");
    const { default: User } = await import("../models/user.model.js");
    
    try {
    
      const user = await User.findOne({ telegramId: ctx.from.id.toString() });
      if (!user) return ctx.reply("Account not linked. Please use /start first.");

      
      const monitor = await Monitor.findOne({ _id: monitorId, user: user._id });
      if (!monitor) return ctx.reply("Monitor not found or access denied.");

      ctx.reply(`🚀 Starting Deep Audit for ${monitor.name}... Please wait (~30s)`);
      
     
      const mockReq = { 
        params: { monitorId: monitorId }, 
        user: { _id: user._id }           
      };
      
      const mockRes = {
        status: (code) => ({
          json: (resData) => {
            if (resData.success && resData.data?.audit) {
              const a = resData.data.audit;
              ctx.replyWithHTML(
                `<b>✅ Audit Complete for ${monitor.name}</b>\n\n` +
                `<b>Scores:</b>\n` +
                `Performance: <b>${a.perfScore}/100</b>\n` +
                `SEO: <b>${a.seoScore}/100</b>\n` +
                `Accessibility: <b>${a.accessScore}/100</b>\n\n` +
                `<b>LCP:</b> ${(a.lcp/1000).toFixed(2)}s\n` +
                `<b>TTFB:</b> ${a.ttfb}ms\n\n` +
                `Full analysis available in your dashboard.`
              );
            } else {
              ctx.reply("❌ Audit failed: " + (resData.message || "Unknown error"));
            }
          }
        })
      };
      
      await runAudit(mockReq, mockRes);
    } catch (err) {
      console.error("Telegram Audit Error:", err);
      ctx.reply("❌ Error: " + err.message);
    }
  });

  bot.command("help", (ctx) => {
    ctx.replyWithHTML(
      "<b>Available Commands:</b>\n\n" +
      "/status - Show all monitors with current status\n" +
      "/stats - Overall uptime statistics\n" +
      "/audit_ID - Trigger a deep SEO audit for a monitor\n" +
      "/start - Get your linking ID"
    );
  });


  bot.command("stats", async (ctx) => {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id.toString() });
      if (!user) return ctx.reply("Account not linked.");

      const monitors = await Monitor.find({ user: user._id });
      const upCount = monitors.filter(m => m.status === "up").length;
      
      ctx.replyWithHTML(
        `<b>Your Monitoring Stats:</b>\n\n` +
        `Total Monitors: ${monitors.length}\n` +
        `✅ Systems Up: ${upCount}\n` +
        `❌ Systems Down: ${monitors.length - upCount}\n` +
        `📈 Overall Uptime: ${monitors.length > 0 ? ((upCount / monitors.length) * 100).toFixed(1) : 0}%`
      );
    } catch (error) {
      ctx.reply("Error: " + error.message);
    }
  });

  bot.launch().then(() => {
    console.log("Telegram Bot is running...");
  }).catch(err => {
    console.error("Failed to launch Telegram bot:", err.message);
  });
};

export const sendTelegramMessage = async (chatId, message) => {
  if (!chatId) return;
  const bot = await getBot();
  if (!bot) return;

  try {
    await bot.telegram.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    console.error("Telegram error:", error.message);
  }
};
