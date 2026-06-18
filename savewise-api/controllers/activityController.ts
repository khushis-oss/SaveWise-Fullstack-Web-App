import Activity from "../modules/Activity";
import { eventBus } from "../eventBus";
import { CustomEvents } from "../utils";
import { Request, Response } from "express";

const logActivity = async ({
  type,
  description,
  id,
  model,
  userId,
}: {
  type: string;
  description: string;
  id: string;
  model: string;
  userId: string;
}) => {
  const newActivity = new Activity({
    userId,
    type,
    description,
    referenceId: id,
    referenceModel: model,
  });
  await newActivity.save();
  return newActivity._id;
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const activities = await Activity.find({ userId }).sort({ createdAt: -1 });
    res.json({ activities });
  } catch {
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

Object.values(CustomEvents).forEach((event) => {
  eventBus.on(event, async (payload) => {
    try {
      const { id, description, model, userId } = payload;

      await logActivity({
        type: event,
        description,
        id,
        model,
        userId,
      });
    } catch (err) {
      console.error("Activity logging failed:", err);
    }
  });
});
