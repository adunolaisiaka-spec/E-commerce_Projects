import express from "express";
import { signup, login, logout, refreshToken , getProfile } from "../controllers/authcontroller.js";
// import { get } from "mongoose";
import { protectRoute } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
// //router.get('/profile/:id', getProfile); // This route will be protected by authentication middleware to ensure only authenticated users can access it
router.get('/profile', protectRoute, getProfile)

// module.exports = router;
export default router;

// 