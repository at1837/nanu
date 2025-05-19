import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  date: { type: Date, required: true }, 
  content: { type: String, required: true },
}, { timestamps: true });

const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

export { Log };
