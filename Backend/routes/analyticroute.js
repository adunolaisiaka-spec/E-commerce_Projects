import express from "express";
import { adminRoute, protectRoute } from "../middleware/authmiddleware.js";
import { getAnalyticsData } from "../controllers/analyticcontroller.js";
import { getDailySalesData } from "../controllers/analyticcontroller.js";
import { getDatesInRange } from "../controllers/analyticcontroller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, async(req, res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); //7 days ago

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.json({
            analyticsData,
            dailySalesData
        });
    } catch (error) {
        console.error("Error fetching analytics data:", error.message);
        res.status(500).json({ message: "Error fetching analytics data" });
    }
})

export default router;