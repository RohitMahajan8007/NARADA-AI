import SeoAudit from "../models/seoAudit.model.js";
import { fetchSemrushData } from "../services/semrush.service.js";
import { analyzeSeoData } from "../services/ai.service.js";
import Monitor from "../models/monitor.model.js";

export const getSeoInsights = async (req, res) => {
  try {
    const { monitorId } = req.params;
    
    // 1. Find the monitor
    const monitor = await Monitor.findById(monitorId);
    if (!monitor) return res.status(404).json({ message: "Monitor not found" });

    const url = monitor.url;

    const { refresh } = req.query;

    // 2. Check for existing audit in DB
    let audit = await SeoAudit.findOne({ monitorId });

    const isRefreshRequested = refresh === "true" || refresh === true;

    if (audit && !isRefreshRequested) {
      const now = new Date();
      const lastFetched = new Date(audit.lastFetched);
      const diffInDays = (now - lastFetched) / (1000 * 60 * 60 * 24);

      // If data is less than 5 days old and not forcing refresh, return it
      if (diffInDays < 5) {
        console.log(`[SEO] Returning cached data for ${url} (${Math.floor(diffInDays)} days old)`);
        return res.status(200).json(audit);
      }
    }

    if (isRefreshRequested) {
      console.log(`[SEO] Refresh requested for ${url}. Bypassing cache...`);
    }

    // 3. Fetch fresh data from Semrush Proxy
    console.log(`[SEO] Fetching fresh data for ${url}...`);
    const semData = await fetchSemrushData(url);

    // 4. Get AI Analysis
    console.log(`[SEO] Generating AI Analysis for ${url}...`);
    const aiAnalysis = await analyzeSeoData(url, semData);

    // 5. Update or Create Audit Record
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
