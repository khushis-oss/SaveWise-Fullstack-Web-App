import {Router} from "express";
import { getAllocatedFunds, getUserAllocations } from "../controllers/dashboardController";

const router = Router();

router.get("/allocatedFunds", getAllocatedFunds);
router.get("/getUserAllocations", getUserAllocations);

export default router;