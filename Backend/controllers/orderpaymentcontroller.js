import Coupon  from "../models/couponmodel.js";
import { stripe } from "../lib/stripe.js";
import Order from "../models/orderpaymentmodel.js"


export const checkoutSession = async (req, res) => {
    try {
        const {products, couponcode} =  req.body;

        if (!Array.isArray(products) || products.length ===0) {
            return res.status(400).json({ error: "Invalid or empty products array" })
        }

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100); // Convert to cents
            totalAmount += amount * product.quantity;
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image]
                    },
                    unit_amount: amount
                },
                quantity: product.quantity || 1,
            };
        });

            // Apply coupon code if provided
            let coupon = null;
            if (couponcode) {
                // Fetch coupon details from the database
                coupon = await Coupon.findOne({ code: couponcode, userId: req.user._id ,isActive: true });
                if (coupon) {
                    totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
                }
            }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/checkout-cancelled`,
            discounts: coupon 
            ? [
                {
                coupon: await createStripeCoupon(coupon.discountPercentage),
                }
            ] 
            : [],
            metadata:{
                userId: req.user._id.toString(),
                couponCode: couponcode || "No Coupon",
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity:p.quantity,
                        price: p.price,
                    }))
                ),
            },
        });

        if(totalAmount >= 20000){
            await createNewCoupon(req.user._id);
        }
        res.status(200).json({ sessionId: session.id, sessionUrl: session.url, sessionUrl: session.url, totalAmount: totalAmount / 100 });

    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Internal server error" });
    };
};


async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once"
    });
    return coupon.id;
}

async function createNewCoupon(userId) {
    const existingCoupon = await Coupon.findOne({ userId, isActive: true });
    if (existingCoupon) {
        return existingCoupon;
    }

    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
        userId,
        isActive: true
    });
    await newCoupon.save();
    return newCoupon;
}


export const checkoutSuccess = async(req, res) => {
    try {
        const { sessionId } = req.body || {};
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {

            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode, userId: session.metadata.userId
                }, {
                    isActive: false
                });
            }

            const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
            if (existingOrder) {
                return res.status(200).json({
                    success: true,
                    message: "Order already exists for this checkout session.",
                    orderId: existingOrder._id,
                });
            }

            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map(product => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price
                })),
                totalAmount: session.amount_total / 100, //convert from cents to dollars
                stripeSessionId: sessionId
            });

            await newOrder.save();

            res.status(200).json({
                success: true,
                message: "payment successful, order created, and coupon deactivated if used.",
                orderId: newOrder._id,
            });
        }
    } catch (error) {
        console.error("Error processing successful checkout:", error);
        res.status(500).json({ message: "Error procession successful checkout", error: error.message });
    }
};

export default Order;