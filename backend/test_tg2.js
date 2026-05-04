import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config({ path: "/Users/sagartiwari/Desktop/web_monitor/backend/.env" });

const token = "8602114294:AAG1tpQNqwU6v6XzI8mAZueku1WlM_rIRSc";
const bot = new Telegraf(token);

bot.telegram.getMe().then((me) => {
  console.log("Bot Info:", me);
}).catch(console.error);

