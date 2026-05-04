import mongoose from "mongoose";

const seoAuditSchema = new mongoose.Schema(
  {
    monitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    authorityScore: {
      type: Number,
      default: 0,
    },
    backlinks: {
      total: { type: Number, default: 0 },
      referringDomains: { type: Number, default: 0 },
      follow: { type: Number, default: 0 },
      nofollow: { type: Number, default: 0 },
    },
    organicData: {
      traffic: { type: Number, default: 0 },
      keywords: { type: Number, default: 0 },
      trafficCost: { type: Number, default: 0 },
    },
    topKeywords: [
      {
        phrase: String,
        position: Number,
        volume: Number,
        trafficPercent: Number,
        url: String,
      },
    ],
    aiAnalysis: {
      type: String,
      default: "",
    },
    lastFetched: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexing for faster lookups by URL
seoAuditSchema.index({ url: 1 });

const SeoAudit = mongoose.model("SeoAudit", seoAuditSchema);
export default SeoAudit;
