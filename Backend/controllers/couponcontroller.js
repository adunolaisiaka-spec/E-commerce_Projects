import Coupon from "../models/couponmodel.js";

export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findOne({userId: req.user._id, isActive: true});
        res.json(coupons || null);
    } catch (error) {
        console.log( "Error in getCoupons controller", error.message);
        res.status(500).json({message: 'Server error', error: error.message});
    }
};


export const validateCoupon = async (req, res) => {
    try {
        const code = req.body?.code || req.query?.code;
        const coupons = await Coupon.findOne({code, userId: req.user._id, isActive: true});

        if (!coupons) { 
            return res.status(404).json({message: 'Invalid coupon code'});
        }

        if (coupons.expiryDate < new Date()) {
            coupons.isActive = false;
            await coupons.save();
            return res.status(404).json({message: 'Coupon expired'});
        }

        res.json({ 
            //message: "Coupon is valid", 
            code: coupons.code,
            isValid: true, 
            discountPercentage: coupons.discountPercentage
        });
    } catch (error) {
        console.log( "Error in validateCoupon controller", error.message);
        res.status(500).json({message: 'Server error', error: error.message});
    }
};