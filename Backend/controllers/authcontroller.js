import { redis } from "../lib/redis.js";
import User from "../models/usermodel.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
    // Implement your token generation logic here (e.g., using JWT)
    // Return an object containing the accessToken and refreshToken
    return {
        accessToken,
        refreshToken
    };
};


const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refreshToken:${userId.toString()}`, refreshToken, "EX", 7 * 24 * 60 * 60); // Set the refresh token with an expiration time of 7 days (in seconds)
};


const setCookie = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // This makes the cookie inaccessible to JavaScript on the client side, enhancing security or it prevents xss attacks, cross site scripting attack.
        secure: process.env.NODE_ENV === "production",// This ensures the cookie is only sent over HTTPS in production
        sameSite: "strict",// This prevents the cookie from being sent in cross-site requests forgery attack, providing additional protection against CSRF attacks 
        // maxAge: process.env.JWT_EXPIRES_IN,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        // maxAge: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
};


export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try{
        const userExists = await User.findOne({ email });

    if ( userExists ) {    
        return res.status(400).json({ message: "User already exists"});
    }
    const user = await User.create({ name, email, password })

    //authentication token can be generated here and sent to the client for future authenticated requests
    const {accessToken, refreshToken} = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookie(res, accessToken, refreshToken);
    // setCookie(res, "refreshToken", refreshToken);

    res.status(201).json({
        user:{
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
    }, message: "User created successfully"});

    } catch (error) {
     res.status(500).json({ message: "Email not created", message: error.message });
     console.log( "Email not created")
    }
};


export const login = async (req, res) => {
    try{
        const { email, password} = req.body;
        const emailExists = await User.findOne({ email });
        if (emailExists && (await emailExists.comparePassword(password))) {
            // Generate tokens and store refresh token
            const {accessToken, refreshToken} = generateTokens(emailExists._id);
            await storeRefreshToken(emailExists._id, refreshToken);

            // Set cookies
            setCookie(res, accessToken, refreshToken);

            return res.status(200).json({
                    _id: emailExists._id,
                    name: emailExists.name,
                    email: emailExists.email,
                    role: emailExists.role,
                message: "Login successful"
            });
        } else {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};


export const logout = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
            await redis.del(`refreshToken:${decoded.userId.toString()}`);
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(200).json({ message: "Logged out successfully" });
        }
    } catch(error){
        res.status(500).json({ message: "Error occurred while logging out", error: error.message });
    }
};


// Implement the refresh token logic here
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        } 
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
        const storedRefreshToken = await redis.get(`refreshToken:${decoded.userId.toString()}`); 

        if ( storedRefreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(200).json({ message: "Access token refreshed successfully" });
    } catch (error) {
        console.error("Error refreshing token:", error.message);
        res.status(500).json({ message: "Error occurred while refreshing token", error: error.message });
    }   
};

// Implement the getProfile logic here
export const getProfile = async (req, res) => {
    try { 
        res.json(req.user);
    } catch(error) {
        res.status(500).json({ message: "Error occurred while fetching profile", error: error.message });   
    }
};