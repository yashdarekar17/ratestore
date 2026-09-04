// Validation Helpers: Data type and empty/required field checks only

export const validateName = (name) => {
    if (!name || !String(name).trim()) return "Name is required.";
    return "";
};

export const validateEmail = (email) => {
    if (!email || !String(email).trim()) return "Email address is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
        return "Please enter a valid email address.";
    }
    return "";
};

export const validatePassword = (password) => {
    if (!password || !String(password).trim()) return "Password is required.";
    return "";
};

export const validateAddress = (address) => {
    if (!address || !String(address).trim()) return "Address is required.";
    return "";
};

export const VALIDATION_RULES = {};

// Safe fallback helpers
export const getStoreStats = (storeId) => {
    return { averageRating: 0, totalRatings: 0, ratings: [] };
};

export const getStoredUsers = () => [];
export const saveUser = (user) => user;
export const getStoredStores = () => [];
export const saveStore = (store) => store;
export const getStoredRatings = () => [];
export const submitOrUpdateRating = () => [];
export const getOwnerStore = () => null;
export const updatePassword = () => true;

export default {
    validateName,
    validateEmail,
    validatePassword,
    validateAddress,
    VALIDATION_RULES,
    getStoreStats,
    getStoredUsers,
    saveUser,
    getStoredStores,
    saveStore,
    getStoredRatings,
    submitOrUpdateRating,
    getOwnerStore,
    updatePassword
};
