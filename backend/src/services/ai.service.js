import { GoogleGenerativeAI } from "@google/generative-ai";
import Settings from "../models/settings.model.js";

const getAIModel = async () => {
  const settings = await Settings.findOne({});
  const apiKey = settings?.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

export const analyzeDowntime = async (monitor, error) => {
  try {
    const model = await getAIModel();
    const prompt = `
      As a DevOps expert, analyze this website downtime:
      Monitor Name: ${monitor.name}
      URL: ${monitor.url}
      Error: ${error}
      
      Provide a brief root cause analysis and possible solutions in 3-4 bullet points.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Analysis error:", error.message);
    return "AI Analysis unavailable at the moment.";
  }
};

export const chatWithAI = async (message, context) => {
  try {
    const model = await getAIModel();
    const prompt = `
      User is asking: "${message}"
      Context about user's monitors: ${JSON.stringify(context)}
      Be a helpful assistant for a Web Monitoring SaaS.
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Chat error:", error.message);
    if (error.message === "GEMINI_API_KEY_MISSING") {
      return "System Error: Gemini API Key is not configured in Admin Settings.";
    }
    return "Sorry, I'm having trouble thinking right now. Please check if your Gemini API key is valid.";
  }        
};
export const analyzeSeoData = async (url, semData) => {
  try {
    const model = await getAIModel(); // Using dynamic key
    const prompt = `
      You are an elite SEO & Growth Marketing Expert. Analyze this Semrush data for the website: ${url}
      
      DATA:
      - Authority Score: ${semData.authorityScore}/100
      - Total Backlinks: ${semData.backlinks.total} (${semData.backlinks.follow} Follow, ${semData.backlinks.nofollow} Nofollow)
      - Organic Monthly Traffic: ${semData.organicData.traffic}
      - Ranking Keywords: ${semData.organicData.keywords}
      - Top 5 Keywords: ${semData.topKeywords.slice(0, 5).map(k => `${k.phrase} (Pos: ${k.position})`).join(", ")}
      - Semrush AI Insights: ${semData.aiSeoSummary || "N/A"}
      
      TASK:
      1. Briefly evaluate their current SEO health.
      2. Identify 3 critical missed opportunities.
      3. Give a 3-step concrete Action Plan to grow traffic.
      
      Format your response with clear headings and bullet points. Be concise but highly professional.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI SEO Analysis error:", error.message);
    return "AI SEO Analysis unavailable. Please focus on building high-quality backlinks and optimizing your top keywords.";
  }
};
