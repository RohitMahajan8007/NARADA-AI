import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    monitor: { type: mongoose.Schema.Types.ObjectId, ref: "Monitor", required: true },
    url: { type: String, required: true },
    perfScore: { type: Number, default: 0 },
    accessScore: { type: Number, default: 0 },
    bestPracticesScore: { type: Number, default: 0 },
    seoScore: { type: Number, default: 0 },
    lcp: { type: Number },    
    fid: { type: Number },    
    cls: { type: Number },    
    fcp: { type: Number },    
    ttfb: { type: Number },   
    si: { type: Number },     
   aiAnalysis: { type: String },
    rawData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Audit = mongoose.model("Audit", auditSchema);
export default Audit;
