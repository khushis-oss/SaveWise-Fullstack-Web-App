import {Router} from "express";
import { connectBankAccount, getBankDetails, getContributionBalance, getUser, makeContribution } from "../controllers/userController";

const router = Router();

router.post("/connectAccount", connectBankAccount);
router.get("/bankDetails", getBankDetails);
router.get("/get", getUser);
router.post("/contribute", makeContribution);
router.get("/contributionBalance", getContributionBalance);
export default router;