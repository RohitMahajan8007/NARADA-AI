import mongoose from "mongoose";

const monitorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["http", "https", "ping", "keyword"],
      default: "https",
    },
    interval: {
      type: Number,
      default: 5, 
    },
    status: {
      type: String,
      enum: ["up", "down", "paused", "pending"],
      default: "pending",
    },
    lastChecked: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uptimePercentage: {
      type: Number,
      default: 100,
    },
    
    sslExpiry: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    regions: [
      {
        name: String,
        status: String,
        responseTime: Number
      }
    ],
    sslDaysLeft: {
      type: Number,
      default: null,
    },
    
    lastResponseTime: {
      type: Number,
      default: null,
    },
    lastAiAnalysis: {
      type: String,
      default: null,
    },
    
    keyword: {
      type: String,
      default: null,
    },
    domainExpiry: {
      type: Date,
      default: null,
    },
    domainDaysLeft: {
      type: Number,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isMaintenance: {
      type: Boolean,
      default: false,
    },
    downSince: {
      type: Date,
      default: null,
    },
    lastEscalationSent: {
      type: Date,
      default: null,
    },
    maintenanceUntil: {
      type: Date,
      default: null,
    },
    regions: [
      {
        name: { type: String, default: "US-East" },
        status: { type: String, enum: ["up", "down", "unknown"], default: "unknown" },
        responseTime: { type: Number, default: 0 },
      },
      {
        name: { type: String, default: "Europe-West" },
        status: { type: String, enum: ["up", "down", "unknown"], default: "unknown" },
        responseTime: { type: Number, default: 0 },
      },
      {
        name: { type: String, default: "Asia-Pacific" },
        status: { type: String, enum: ["up", "down", "unknown"], default: "unknown" },
        responseTime: { type: Number, default: 0 },
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Monitor = mongoose.model("Monitor", monitorSchema);
export default Monitor;
