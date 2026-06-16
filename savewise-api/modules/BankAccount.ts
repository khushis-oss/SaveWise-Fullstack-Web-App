import mongoose from "mongoose";

const BankAccountSchema = new mongoose.Schema({
  institutionName: {
    type: String,
    required: true,
  },

  accountNumber: {
    type: String,
    required: true,
  },

  transitNumber: {
    type: String,
    required: true,
  },

  institutionNumber: {
    type: String,
    required: true,
  },

  balance: {
    type: Number,
    default: 10000,
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default mongoose.model("BankAccount",BankAccountSchema);