import Activity from "../modules/Activity";
import { eventBus } from "../eventBus";
import { CustomEvents } from "../utils";
import { Request, Response } from "express";

const logActivity = async ({
  type,
  description,
  id,
  model,
}: {
  type: string;
  description: string;
  id: string;
  model: string;
}) => {
  const newActivity = new Activity({
    type: type,
    description: description,
    referenceId: id,
    referenceModel: model,
  });
  await newActivity.save();
  return newActivity._id;
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const activities = await getAllActivities();
    res.json({ activities });
  } catch {
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

export const getAllActivities = async () => {
  const activities = await Activity.find().sort({ createdAt: -1 });

  const modelGroups = ["User", "Contribution", "Allocation"] as const;
  for (const model of modelGroups) {
    const group = activities.filter((a) => a.referenceModel === model);
    if (group.length > 0) {
      await Activity.populate(group, { path: "referenceId", model });
    }
  }

  return activities;
};

Object.values(CustomEvents).forEach((event) => {
  eventBus.on(event, async (payload) => {
    try {
      const { id, description, model } = payload;

      await logActivity({
        type: event,
        description,
        id,
        model,
      });
    } catch (err) {
      console.error("Activity logging failed:", err);
    }
  });
});