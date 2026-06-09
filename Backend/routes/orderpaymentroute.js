import express from "express"
import { checkoutSession, checkoutSuccess } from "../controllers/orderpaymentcontroller.js";
import { protectRoute } from "../middleware/authmiddleware.js";
  
const router = express.Router();

router.post('/create-checkout-session', protectRoute, checkoutSession);
router.post('/create-success', protectRoute, checkoutSuccess)

export default router;