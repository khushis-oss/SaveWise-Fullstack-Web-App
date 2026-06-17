import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    allocations: [
      {
        fund: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Fund",
          required: true,
        },

        percentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Allocation", allocationSchema);