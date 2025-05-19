import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    setting: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    }
  },
  {
    timestamps: true, 
  }
);

const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema);

export { Setting };
