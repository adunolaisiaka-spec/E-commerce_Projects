import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { useProductStore } from "./UseProductStore";
//import { response } from "express";
//import { refreshToken } from "../../../Backend/controllers/authcontroller";
// import { get } from "mongoose";
// import { User } from "lucide-react";
 
export const useUserStore = create((set, get) => ({ 
    User:null,
    loading:false,
    checkingAuth: true,

    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });

        if(password !== confirmPassword){
            set({ loading: false });
            return toast.error("Password does not match")
        } try {
            const res = await axios.post('/auth/signup', {name, email, password });
            set({ user: res.data, loading: false });
            toast.success("Signup successful!");
        } catch (error) {  
            set({ loading: false });
            toast.error(error.response?.data?.message || error.message || "An error occurred"); 
        }
    },


    login: async ({ email, password }) => {
        set({ loading: true });

        try {
            const res = await axios.post('/auth/login', { email, password });
            set({ user: res.data, loading: false });
            toast.success("Login successful!");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || error.message || "Login failed"); 
        }
    },
  
    logout: async () => {
        try {
            await axios.post('/auth/logout');
            set({ user: null });
        } catch (error) {
            toast.error(error.response.data.message || "An error occured during logout");
        }
    }, 

    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const res = await axios.get('/auth/profile');
            set({ user: res.data, checkingAuth: false });
        } catch (error) {
            console.log("Error in checkAuth", error.message);
            set({ user: null, checkingAuth: false });
            toast.error(error.response?.data?.message || "Failed to load profile");
        }
    },

    refreshToken: async () => {
        //prevent multiple simultaneous refresh attempts
        if (get().checkingAuth) return;

        set({ checkingAuth: true });
        try {
            const response = await axios.post('/auth/refresh-token');
            set({ checkingAuth: false });
            return response.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    }
}))

//todo implement the axios instance with interceptors torefresh the access token or handle token and errors globally, and also consider using localStorage or cookies to persist user session across page reloads.

//Axios interceptor example (to be implemented in a separate file, e.g., src/lib/axios.js):
let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // if a referesh is already in process, await for it to complete
                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                //start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);
            } catch (error) {
                //if refresh fails, redirech to login or handle as needed
                useUserStore.getState().logout();
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error);

    }
)