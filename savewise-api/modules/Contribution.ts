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
      enum: ["deposit", "withdrawal"],
      required: true,
    },
    date: { type: Date, default: Date.now },
    bankAccount: {type:mongoose.Schema.ObjectId,ref:"BankAccount"}
  },
  { timestamps: true },
);

export default mongoose.model("Contribution", ContributionSchema);
