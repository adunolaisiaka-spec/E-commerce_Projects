// const exprees = require('express');
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();


import authRoutes from './routes/authRouth.js';
import productRoutes from './routes/productroute.js';
import cartRoutes from "./routes/cartroute.js";
import couponRoutes from "./routes/couponroute.js";
import paymentRoutes from "./routes/orderpaymentroute.js" 
import analyticsRoutes from "./routes/analyticroute.js"

import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser';


const app =express();
const PORT = process.env.PORT;

app.use(express.json({ limit: "10mb" })); // allow you to parse the body of the request
app.use(cookieParser()); //allow you to parse the cookies in the request
// Enable CORS to allow requests from the frontend and allow credentials (cookies)
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);


app.listen(PORT, () => {
    console.log('Server is running on port');

    connectDB();
});