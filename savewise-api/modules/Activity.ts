import mongoose from "mongoose";

export const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceModel: {
      type: String,
      enum: ["User", "Contribution", "Allocation"],
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Activity", ActivitySchema);
