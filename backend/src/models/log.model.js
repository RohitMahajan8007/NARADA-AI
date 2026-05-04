import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    monitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    responseTime: {
      type: Number,
      default: 0,
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
    ]
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);
export default Log;
