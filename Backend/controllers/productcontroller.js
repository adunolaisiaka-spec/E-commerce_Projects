import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js"
import Product from "../models/productmodel.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });   
    }
};

export const getFeaturedProducts = async (req, res) => {
    try { 
        let featuredProducts = await redis.get("featured_products");

        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }
         // If not in cache/Redis, fetch from database/MongoDB
         //.lean() is going to return a plain javascript object instead of a mongodb document
         //which is good for performance
        featuredProducts = await Product.find({ isFeatured: true }).lean();   

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        // Store the result in Redis cache for future requests, with an expiration time (e.g., 1 hour)
        await redis.set("featured_products", JSON.stringify(featuredProducts)); // Cache for 1 hour (in seconds)
        

        res.status(200).json(featuredProducts);
    
    
        } catch (error) {
        res.status(500).json({ message: error.message });   
        }
};


export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, stock, category } = req.body;
        //console.log("createProduct image:", image);

        if (!image) {
            return res.status(400).json({ message: "Product image is required" });
        }

        const cloudinaryResponse = await cloudinary.uploader.upload(image, {
            folder: "products",
        });
        console.log("cloudinaryResponse:", cloudinaryResponse);

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse.secure_url,
            category,
        });

        return res.status(201).json(product);
    } catch (error) {
        return res.status(500).json({ message: error.message || error });
    }
};


export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ message: "product not found" });
        }

        if (product.image){
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("deleted image from cloudinary")
            } catch (error) {
                console.log("error deleting image from cloudinary", error)
                return res.status(500).json({ message: error.message })
            }
        }

        await Product.findByIdAndDelete(req.params.id)

        return res.status(200).json({ message: "Product deleted Successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
} 


export const getRecommendedProducts = async (req, res) => {
    
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: 4 },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                    stock: 1,
                },
            },
        ]);

        res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    try{

        const products = await Product.find({category});
        return res.status(200).json({ products });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }    
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message); 
        return res.status(500).json({ message:"Server error", error: error.message })
    }
}

async function updateFeaturedProductsCache() {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("error in update cache function", error.message);
    }
} 