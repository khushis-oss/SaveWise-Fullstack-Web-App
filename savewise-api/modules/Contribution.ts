import mongoose from "mongoose";

const ContributionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["TRADITIONAL", "ROTH"],
      required: true,
    },
    status: {
      type: String,
      enum: ["RECORDED", "WITHDRAWN"],
      required: true,
    },
    taxYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    bankAccount: { type: mongoose.Schema.ObjectId, ref: "BankAccount" },
  },
  { timestamps: true },
);

export default mongoose.model("Contribution", ContributionSchema);
