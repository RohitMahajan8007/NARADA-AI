import SeoAudit from "../models/seoAudit.model.js";
import { fetchSemrushData } from "../services/semrush.service.js";
import { analyzeSeoData } from "../services/ai.service.js";
import Monitor from "../models/monitor.model.js";

export const getSeoInsights = async (req, res) => {
  try {
    const { monitorId } = req.params;
    
    
    const monitor = await Monitor.findById(monitorId);
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    const url = monitor.url;

    const { refresh } = req.query;

    
    let audit = await SeoAudit.findOne({ monitorId });

    const isRefreshRequested = refresh === "true" || refresh === true;

    if (audit && !isRefreshRequested) {
      const now = new Date();
      const lastFetched = new Date(audit.lastFetched);
      const diffInDays = (now - lastFetched) / (1000 * 60 * 60 * 24);

    
      if (diffInDays < 5) {
        console.log(`[SEO] Returning cached data for ${url} (${Math.floor(diffInDays)} days old)`);
        return res.status(200).json(audit);
      }
    }

    if (isRefreshRequested) {
      console.log(`[SEO] Refresh requested for ${url}. Bypassing cache...`);
    }

    
    console.log(`[SEO] Fetching fresh data for ${url}...`);
    const semData = await fetchSemrushData(url);

    
    console.log(`[SEO] Generating AI Analysis for ${url}...`);
    const aiAnalysis = await analyzeSeoData(url, semData);

    
    if (audit) {
      audit.authorityScore = semData.authorityScore;
      audit.backlinks = semData.backlinks;
      audit.organicData = semData.organicData;
      audit.topKeywords = semData.topKeywords;
      audit.aiAnalysis = aiAnalysis;
      audit.lastFetched = new Date();
      await audit.save();
    } else {
      audit = await SeoAudit.create({
        monitorId,
        url,
        ...semData,
        aiAnalysis,
        lastFetched: new Date(),
      });
    }

    res.status(200).json(audit);
  } catch (error) {
    console.error("SEO Insight error:", error.message);
    res.status(500).json({ message: error.message || "Failed to fetch SEO insights" });
  }
};
