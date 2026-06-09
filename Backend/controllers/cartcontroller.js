import Product from "../models/productmodel.js";

const getCartProductId = (item) => {
    if (!item) return null;
    if (item.product) return item.product.toString();
    if (item.id) return item.id.toString();
    if (typeof item === "string") return item;
    if (item._id) return item._id.toString();
    return null;
};

export const getAllCartProducts = async (req, res) => {
    try {
       const cartItems = req.user.cartItems || [];
       const productIds = cartItems
            .map(getCartProductId)
            .filter(Boolean);

       const products = await Product.find({ _id: { $in: productIds } });
       const responseItems = products.map((product) => {
            const item = cartItems.find((cartItem) => getCartProductId(cartItem) === product._id.toString());
            return {
                ...product.toJSON(),
                quantity: item?.quantity || 1,
            };
       });
       return res.status(200).json(responseItems);
    } catch (error) {
        console.log("Error in getAllCartProducts controller", error.message);
        return res.status(500).json({ error: error.message });
    }
};

export const  addToCart = async (req, res) => {
     try {
        const { productId } = req.body || {};
        const user = req.user;
        user.cartItems = user.cartItems || [];

        const existingItem = user.cartItems.find((item) => {
            const itemId = item?.product?.toString() || item?.id?.toString() || item?.toString();
            return itemId === productId;
        });

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ product: productId, quantity: 1 });
        }

        await user.save();
        return res.status(200).json({ message: 'Item added to cart', cartItems: user.cartItems });
     } catch (error) {
        console.log("Error in addToCart controller", error.message);
        return res.status(500).json({error: error.message});
     }
}

export const removeAllFromCart = async (req, res) => {
    try {
        const productId = req.body?.productId || req.query?.productId;
        const user = req.user;
        user.cartItems = user.cartItems || [];

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter((item) => {
                const itemId = item?.product?.toString() || item?.id?.toString() || item?.toString();
                return itemId !== productId;
            });
        }
        await user.save();
        return res.status(200).json({ message: 'Items removed from cart', cartItems: user.cartItems });
    } catch (error) {
        console.log("Error in removeAllFromCart controller", error.message);
        return res.status(500).json({ error: error.message });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const productId = req.params.id;
        const { quantity } = req.body || {};
        const user = req.user;
        user.cartItems = user.cartItems || [];
        const existingItem = user.cartItems.find((item) => getCartProductId(item) === productId);

        if (existingItem) {
           if (quantity === 0) {
            user.cartItems = user.cartItems.filter((item) => getCartProductId(item) !== productId);
            await user.save();
            return res.status(200).json({ message: 'Item removed from cart', cartItems: user.cartItems });
           }
            existingItem.quantity = quantity;
            await user.save();
            return res.status(200).json({ message: 'Cart quantity updated', cartItems: user.cartItems });
        } else {
            return res.status(404).json({ error: 'Product item not found in cart' });
        }
    } catch (error) {
        console.log("Error in updateCartQuantity controller", error.message);
        return res.status(500).json({ error: error.message });
    }
};
