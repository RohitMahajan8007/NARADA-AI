import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    appName: String,
    telegramBotToken: String,
    telegramBotUsername: String,
    telegramEnabled: { type: Boolean, default: false },
    geminiApiKey: String,
    geminiModel: String,
    pagespeedApiKey: String,
    upiEnabled: { type: Boolean, default: false },
    upiId: String,
    upiPayeeName: String,
    planLimits: mongoose.Schema.Types.Mixed,
    pricing: mongoose.Schema.Types.Mixed,
    
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
