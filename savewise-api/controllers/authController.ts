import User from "../modules/User";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { UserType } from "../../types";
import { generateVerificationOtp } from "../utils";

export const signup = async (req: express.Request, res: express.Response) => {
  try {
    const { name, email, password, role, imageUrl } = req.body;
    const profilePictureUrl = imageUrl
      ? imageUrl
      : req.file && `/assets/${req.file.originalname}`;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "user already exists" });
      return;
    }

    let passwordHashed: string | undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHashed = await bcrypt.hash(password, salt);
    }

    const otp = generateVerificationOtp();
    const user = new User({
      name,
      email,
      profilePictureUrl,
      role: role?.toLowerCase() ?? "user",
      balance: 0,
      ...(passwordHashed && { passwordHash: passwordHashed }),
      otp: otp,
      isVerified: false,
      isBankConnected:false,
      contributions:null
    });

    await user.save();
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(201).json({ user: userObj });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "invalid credentials" });
      return;
    }
    if (password) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ message: "invalid credentials" });
        return;
      }
    }
    const otp = generateVerificationOtp();
    user.otp = otp;
    await user.save();
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(201).json({ user: userObj });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const verifyOtp = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    if (Date.now() > user.otp.expiresAt.getTime()) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }
    if (otp !== user?.otp?.code) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(201).json({ user: userObj, token: token });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
