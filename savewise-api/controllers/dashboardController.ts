import express from "express";
import User from "../modules/User";
import Allocation from "../modules/Allocation";

export const getAllocatedFunds = async (
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

    const userAllocations = await Allocation.find({ user: user._id });
    const totalAmountAllocated = userAllocations.reduce(
      (acc, i) => acc + i.totalAmount,
      0,
    );

    const allocatedFunds = await Allocation.aggregate([
      { $match: { user: user._id } },
      { $unwind: "$allocations" },
      {
        $group: {
          _id: "$allocations.fund",
          totalAmountAllocated: { $sum: "$allocations.amount" },
        },
      },
      {
        $lookup: {
          from: "funds",
          localField: "_id",
          foreignField: "_id",
          as: "fund",
        },
      },
      { $unwind: "$fund" },
      {
        $project: {
          _id: 0,
          fundId: "$_id",
          name: "$fund.name",
          totalAmountAllocated: 1,
        },
      },
    ]);

    res.status(200).json({ allocatedFunds, totalAmountAllocated });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const getUserAllocations = async (
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

    const userAllocations = await Allocation.find({ user: user._id }).populate("allocations.fund", "name");

    res.status(200).json({ allocations: userAllocations });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};
