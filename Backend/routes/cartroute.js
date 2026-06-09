import express from "express";
import { getAllCartProducts, addToCart, removeAllFromCart, updateCartQuantity } from "../controllers/cartcontroller.js"
import { protectRoute } from "../middleware/authmiddleware.js"
 
const router = express.Router();

router.get("/", protectRoute, getAllCartProducts)
router.post("/", protectRoute, addToCart)
router.delete("/", protectRoute, removeAllFromCart)
router.put("/:id", protectRoute, updateCartQuantity)

export default router;