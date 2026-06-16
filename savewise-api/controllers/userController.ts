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

    if (!amount || amount <= 0) {
      res.status(400).json({ message: "Amount must be greater than 0" });
      return;
    }

    const bank = await BankAccount.findOne({ ownerId: userId });
    if (!bank) {
      res.status(404).json({ message: "Bank account not found" });
      return;
    }

    if (type === "deposit") {
      if (amount > bank.balance) {
        res
          .status(400)
          .json({ message: "Amount exceeds available bank balance" });
        return;
      }

      bank.balance = bank.balance - amount;
    } else {
      bank.balance = bank.balance + amount;
    }

    await bank.save();

    const contribution = new Contribution({
      amount,
      userId,
      bankAccount: bank._id,
      type: type,
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
        (acc, i) => (i.type === "deposit" ? acc + i.amount : acc - i.amount),
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
