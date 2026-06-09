import express from 'express';
import {  getCoupons, validateCoupon } from '../controllers/couponcontroller.js';
import { protectRoute } from '../middleware/authmiddleware.js';

const router = express.Router();


router.get('/', protectRoute, getCoupons);
router.post('/validate', protectRoute, validateCoupon);

export default router;