import Allocation from "../modules/Allocation";
import BankAccount from "../modules/BankAccount";
import Contribution from "../modules/Contribution";
import Funds from "../modules/Funds";
import User from "../modules/User";
import { generateAccountNumber, CustomEvents } from "../utils";
import { eventBus } from "../eventBus";
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

    const [bank, user] = await Promise.all([
      BankAccount.findOne({ ownerId: userId }),
      User.findById(userId),
    ]);

    if (!bank) {
      res.status(404).json({ message: "Bank account not found" });
      return;
    }
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const currentSavewiseBalance = Number(user.balance) || 0;

    if (status === "RECORDED") {
      if (amount > bank.balance) {
        res.status(400).json({ message: "Amount exceeds available bank balance" });
        return;
      }
      bank.balance = bank.balance - amount;
      user.balance = currentSavewiseBalance + amount;
    } else {
      if (amount > currentSavewiseBalance) {
        res.status(400).json({ message: "Amount exceeds available SaveWise balance" });
        return;
      }
      bank.balance = bank.balance + amount;
      user.balance = currentSavewiseBalance - amount;
    }

    await Promise.all([bank.save(), user.save()]);

    const contribution = new Contribution({
      amount,
      userId,
      bankAccount: bank._id,
      type,
      status,
      taxYear: taxY,
    });
    await contribution.save();

    eventBus.emit(CustomEvents.CONTRIBUTION_MADE, {
      id: contribution._id,
      description: `User ${status === "RECORDED" ? "contributed" : "withdrew"} $${amount} (${type})`,
      model: "Contribution",
      userId,
    });

    res.status(200).json({ bankDetails: bank, contribution, user });
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
    const [user, allocations] = await Promise.all([
      User.findById(userId),
      Allocation.find({ user: userId }),
    ]);
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    const allocatedBalance = allocations.reduce(
      (sum, a) => sum + (Number(a.totalAmount) || 0),
      0,
    );
    const totalContributedBalance = (Number(user.balance) || 0) + allocatedBalance;
    res.status(200).json({ user, totalContributedBalance });
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

export const getFunds = async (req: express.Request, res: express.Response) => {
  try {
    const funds = await Funds.find();
    res.status(200).json({ funds: funds });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const allocateContributionFunds = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "not found" });
      return;
    }
    const allocations = req.body.allocations;
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      res.status(400).json({ message: "A valid amount is required" });
      return;
    }

    if (amount > user.balance) {
      res.status(400).json({ message: "Amount exceeds available balance" });
      return;
    }

    const newAllocation = new Allocation({
      user: user._id,
      totalAmount: amount,
      allocations: allocations,
    });
    await newAllocation.save();

    user.balance = user.balance - amount;
    await user.save();

    eventBus.emit(CustomEvents.ALLOCATED_FUNDS, {
      id: newAllocation._id,
      description: `User allocated $${amount} across ${allocations.length} fund(s)`,
      model: "Allocation",
      userId,
    });

    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};
