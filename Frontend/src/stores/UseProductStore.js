import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast"
//import { response } from "express";
//import { set } from "mongoose";
//import { deleteProduct, toggleFeaturedProduct } from "../../../Backend/controllers/productcontroller.js";
//import { User } from "lucide-react";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,
    
    setProducts: (products) => set ({products}),

    createProduct: async (productData) => {
        set({ loading: true });
        try {
            const res = await axios.post("/products", productData);
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false,
            }))
        } catch (error) {
                toast.error(error.response?.data?.error || error.message || "Failed to create product");
            set({ loading: false});
        }
    }, 

    fetchAllProducts: async() => {
        set({ loading: true });
        try {
            const response = await axios.get('/products');
            set({ products: response.data, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch products", loading: false });
            toast.error(error.response?.data?.error || error.message || "Failed to fetch products");
        }
    },

    fetchProductsByCategory: async (category) => {
        set({ loading:true });
        try {
            const response = await axios.get(`/products/category/${category}`);
            set({ products: response.data?.products ?? response.data, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch products", loading: false});
            toast.error(error.response?.data?.error || error.message || "Failed to fetch products");
        }
    },

    deleteProduct: async (productId) => {
        set ({ loading: true });
        try {
            await axios.delete(`/products/${productId}`);
            //this will delete the product
            set((prevProducts) => ({
                products: prevProducts.products.filter((product) => product._id !== productId),
                loading: false,
            }));
        } catch (error) {
            set ({loading: false });
            toast.error(error.response?.data?.error || error.message || "failed to delete product");
        }
    },

    toggleFeaturedProduct: async (productId) => {
        set ({ loading: true });
        try {
            const response = await axios.patch(`/products/${productId}`);
            //this will update the isFetured prop of the product
            set((prevProducts) => ({
                products: prevProducts.products.map((product) =>
                    product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
                ),
                loading: false,
            }));
        } catch (error) {
            set ({loading: false });
            toast.error(error.response?.data?.error || error.message || "failed to update product");
        }
    }, 
    
    fetchFeaturedProducts: async () => {
        set({ loading: true });
        try {
            const response = await axios.get('/products/featured');
            set({ products: response.data, loading: false });
        } catch (error) {
            set({ error: "Failed to fetch featured products", loading: false });
            toast.error(error.response?.data?.error || error.message || "Failed to fetch featured products");
        }
    },
}))