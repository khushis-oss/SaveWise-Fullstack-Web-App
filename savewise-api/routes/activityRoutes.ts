import { Router } from "express";
import { getActivities } from "../controllers/activityController";

const router = Router();

router.get("/all", getActivities);

export default router;
