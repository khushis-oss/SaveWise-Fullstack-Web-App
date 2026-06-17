import { Router } from "express";
import {
  connectBankAccount,
  getAllUserContributions,
  getBankDetails,
  getContributionBalance,
  getFunds,
  getUser,
  makeContribution,
  allocateContributionFunds,
} from "../controllers/userController";
import { verifyAuthority, verifyHMAC } from "../middlewear/authMiddlewear";

const router = Router();

router.post("/connectAccount", verifyHMAC, verifyAuthority, connectBankAccount);
router.get("/bankDetails", getBankDetails);
router.get("/get", getUser);
router.post("/contribute", verifyHMAC, verifyAuthority, makeContribution);
router.get("/contributionBalance", getContributionBalance);
router.get("/allContributions", getAllUserContributions);
router.get("/funds", getFunds);
router.post("/allocate", verifyHMAC, verifyAuthority, allocateContributionFunds);
export default router;
