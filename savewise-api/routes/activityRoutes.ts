import { Router } from "express";
import { getActivities } from "../controllers/activityController";
import { verifyToken } from "../middlewear/authMiddlewear";

const router = Router();

router.get("/all", verifyToken, getActivities);

export default router;
