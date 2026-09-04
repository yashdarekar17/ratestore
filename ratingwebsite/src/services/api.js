import axios from "axios";

const rawBaseUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
    (typeof process !== "undefined" && process.env?.API_BASE_URL) ||
    "https://ratestore-eow7.onrender.com";

// Sanitize URL: Strip any accidental quotes ("), ('), semicolons (;), or trailing slashes

const API_BASE_URL = String(rawBaseUrl || "")
    .trim()
    .replace(/^["'\s]+|["';\s]+$/g, "")
    .replace(/\/+$/, "") || "https://ratestore-eow7.onrender.com";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// ==================== AUTH APIS ====================

export const apiSignup = async (userData) => {
    const res = await api.post("/auth/signup", {
        name: userData.name,
        email: userData.email,
        password: userData.password
    });
    return res.data;
};

export const apiLogin = async (credentials) => {
    const res = await api.post("/auth/login", {
        email: credentials.email,
        password: credentials.password
    });
    return res.data;
};

export const apiUpdatePassword = async ({ email, newPassword }) => {
    const res = await api.post("/auth/update-password", {
        email: email.trim(),
        newPassword
    });
    return res.data;
};

// ==================== ADMIN APIS ====================

export const apiGetAdminDashboard = async () => {
    try {
        const res = await api.get("/admin/getdashboard");
        return res.data?.dashboard || null;
    } catch (err) {
        console.warn("Failed to fetch dashboard stats:", err.message);
        return null;
    }
};

export const apiGetUsers = async () => {
    try {
        const res = await api.get("/admin/getusers");
        return res.data?.users || [];
    } catch (err) {
        console.warn("Failed to fetch users from backend:", err.message);
        return [];
    }
};

export const apiGetStores = async () => {
    try {
        // Try /stores/getstores first, fallback to /admin/getstores
        const res = await api.get("/stores/getstores").catch(() => api.get("/admin/getstores"));
        return res.data?.stores || [];
    } catch (err) {
        console.warn("Failed to fetch stores from backend:", err.message);
        return [];
    }
};

export const apiAddStore = async (storeData) => {
    // Can call /stores/create or /admin/addstore
    const res = await api.post("/stores/create", {
        name: storeData.name,
        email: storeData.email,
        address: storeData.address,
        owner_id: storeData.owner_id || null
    });
    return res.data;
};

export const apiAddUser = async (userData) => {
    // Uses /admin/adduser to support role assignment (USER, ADMIN, OWNER)
    const res = await api.post("/admin/adduser", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || "USER"
    });
    return res.data;
};

export const apiGetUserDetails = async (id) => {
    const res = await api.get(`/admin/getuserdetails/${id}`);
    return res.data?.user || null;
};

// ==================== RATINGS APIS ====================

export const apiSubmitRating = async ({ user_id, store_id, rating }) => {
    const res = await api.post("/ratings/submitrating", {
        user_id,
        store_id,
        rating: Number(rating)
    });
    return res.data;
};

export const apiGetRatings = async () => {
    try {
        const res = await api.get("/ratings/getratings");
        return res.data?.ratings || [];
    } catch (err) {
        console.warn("Failed to fetch ratings from backend:", err.message);
        return [];
    }
};

export default api;
