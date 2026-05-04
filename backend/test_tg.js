import mongoose from "mongoose";
import Settings from "./src/models/settings.model.js";
import { sendTelegramMessage } from "./src/utils/telegram.util.js";
import dotenv from "dotenv";

dotenv.config({ path: "/Users/sagartiwari/Desktop/web_monitor/backend/.env" });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  
  const s = await Settings.findOne({});
  console.log("Token in DB:", s?.telegramBotToken);
  
  await sendTelegramMessage("7092054171", "✅ This is a test message from WebMonitor!");
  console.log("Message sent?");
  process.exit(0);
};

run().catch(console.error);
