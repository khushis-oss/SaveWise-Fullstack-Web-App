import BankAccount from "../modules/BankAccount";
import Contribution from "../modules/Contribution";
import User from "../modules/User";
import { generateAccountNumber } from "../utils";
import express from "express";
export const connectBankAccount = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    const existingAccount = await BankAccount.findOne({
      ownerId: userId,
    });

    if (existingAccount) {
      return res.status(400).json({
        message: "Bank account already connected",
      });
    }
    const { email, password } = req.body;
    console.log(email, password);
    if (email !== "user_good" || password !== "pass_good") {
      res.status(400).json({ message: "Invalid Credentials" });
      return;
    }
    let allAccountsLength = await BankAccount.countDocuments();
    if (allAccountsLength == 0) {
      allAccountsLength++;
    }

    const newAccount = new BankAccount({
      institutionName: "Mock Bank",
      accountNumber: generateAccountNumber(),
      transitNumber: "12345",
      institutionNumber: "001",
      balance: 10000 * allAccountsLength,
      ownerId: userId,
    });

    await newAccount.save();
    user.isBankConnected = true;
    await user.save();
    res.status(200).json({ bankDetails: newAccount, user: user });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const getBankDetails = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId = req.user.userId;
    const bankDetails = await BankAccount.findOne({ ownerId: userId });
    if (!bankDetails) {
      res.status(404).json({ message: "not found" });
      return;
    }
    res.status(200).json({ bankDetails: bankDetails });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const makeContribution = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId = req.user.userId;
    const amount = Number(req.body.amount);
    const type = req.body.type;
    const status = req.body.status;
    const taxY = Number(req.body.taxY);

    if (!amount || amount <= 0) {
      res.status(400).json({ message: "Amount must be greater than 0" });
      return;
    }

    if (!["TRADITIONAL", "ROTH"].includes(type)) {
      res.status(400).json({ message: "Invalid contribution type" });
      return;
    }

    if (!["RECORDED", "WITHDRAWN"].includes(status)) {
      res.status(400).json({ message: "Invalid contribution status" });
      return;
    }

    const bank = await BankAccount.findOne({ ownerId: userId });
    if (!bank) {
      res.status(404).json({ message: "Bank account not found" });
      return;
    }

    if (status === "RECORDED") {
      if (amount > bank.balance) {
        res
          .status(400)
          .json({ message: "Amount exceeds available bank balance" });
        return;
      }

      bank.balance = bank.balance - amount;
    } else {
      const contributions = await Contribution.find({ userId });
      const savewiseBalance = contributions.reduce(
        (acc, c) => (c.status === "RECORDED" ? acc + c.amount : acc - c.amount),
        0,
      );
      if (amount > savewiseBalance) {
        res
          .status(400)
          .json({ message: "Amount exceeds available SaveWise balance" });
        return;
      }
      bank.balance = bank.balance + amount;
    }

    await bank.save();

    const contribution = new Contribution({
      amount,
      userId,
      bankAccount: bank._id,
      type: type,
      status: status,
      taxYear: taxY,
    });
    await contribution.save();

    res.status(200).json({ bankDetails: bank, contribution });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const getContributionBalance = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    const contributions = await Contribution.find({ userId });
    let balance = user.balance;
    if (contributions.length > 0) {
      balance = contributions.reduce(
        (acc, i) => (i.status === "RECORDED" ? acc + i.amount : acc - i.amount),
        0,
      );
      user.balance = balance;
      await user.save();
    }
    res.status(200).json({ user: user, contributionBalance: balance });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const getAllUserContributions = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    const contributions = await Contribution.find({ userId });
    if (contributions.length > 0) {
      res.status(200).json({ contributions: contributions });
    } else {
      res.status(200).json({ message: "no contributions made" });
    }
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const getUser = async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "not found" });
      return;
    }
    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};
