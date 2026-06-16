import mongoose, { Model } from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    profilePictureUrl: { type: String },
    contributions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Contribution" },
    ],
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    isVerified: {
      type: Boolean,
    },
    isBankConnected: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

const User: Model<any> =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
