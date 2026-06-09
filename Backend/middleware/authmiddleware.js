import jwt from "jsonwebtoken";
import User from "../models/usermodel.js";

export const protectRoute = async (req, res, next) => {
    try{
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - No access token provided" }) ;
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            //req.user = decoded; // Attach user info to the request object for use in subsequent middleware or route handlers
            const user = await User.findById(decoded.userId).select("-password"); // Fetch user details from the database, excluding the password

            if (!user) {
                return res.status(401).json({ message: "Unauthorized - User not found" });
            }

            req.user = user; // Attach user info to the request object for use in subsequent middleware or route handlers

            next();
            } catch (error) {
                if (error.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "Unauthorized - Access token expired" });
                }
                throw error; // For other errors, let the catch block handle it
            }

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized - Invalid access token" });  
    }
};

export const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
    }
};
