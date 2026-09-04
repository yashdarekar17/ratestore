import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Star, AlertCircle } from "lucide-react";
import { validateEmail } from "../services/validation";
import api from "../services/api";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [authError, setAuthError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        if (authError) setAuthError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError("");

        // Validate fields first before hitting the API
        const newErrors = {};

        const emailErr = validateEmail(formData.email);
        if (emailErr) newErrors.email = emailErr;

        if (!formData.password) {
            newErrors.password = "Password is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/auth/login", {
                email: formData.email.trim(),
                password: formData.password
            });
            console.log("Login response:", res.data);

            const user = res.data.user || res.data;
            if (!user) {
                setAuthError("Login failed. Please try again.");
                setLoading(false);
                return;
            }

            // Store active session
            localStorage.setItem("user", JSON.stringify(user));

            // Dynamically route based on backend role
            const userRole = (user.role || "USER").toUpperCase();
            if (userRole === "ADMIN") {
                navigate("/admin/dashboard");
            } else if (userRole === "OWNER") {
                navigate("/owner/dashboard");
            } else {
                navigate("/user/dashboard");
            }
        } catch (err) {
            console.error("Login error:", err);
            const msg = err.response?.data?.message || "Invalid email or password. Please check your credentials.";
            setAuthError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-md">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/25 mb-3 text-white">
                        <Star className="w-8 h-8 fill-white text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Rating Platform
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Sign in to access your role-specific dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 border border-sky-100 p-8">
                    {authError && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>{authError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                Email Address <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.email
                                            ? "border-rose-400 bg-rose-50/30 focus:ring-rose-200"
                                            : "border-slate-200 bg-slate-50/50 focus:border-sky-500 focus:ring-sky-200"
                                        } text-sm text-slate-800 outline-none transition focus:ring-2 focus:bg-white`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-11 py-2.5 rounded-xl border ${errors.password
                                            ? "border-rose-400 bg-rose-50/30 focus:ring-rose-200"
                                            : "border-slate-200 bg-slate-50/50 focus:border-sky-500 focus:ring-sky-200"
                                        } text-sm text-slate-800 outline-none transition focus:ring-2 focus:bg-white`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>{loading ? "Signing In..." : "Sign In"}</span>
                            </button>
                        </div>
                    </form>

                    {/* Sign Up Redirect */}
                    <div className="mt-6 text-center text-xs text-slate-500">
                        <span>Don't have an account? </span>
                        <Link
                            to="/signup"
                            className="text-sky-600 font-semibold hover:text-sky-700 transition underline underline-offset-2"
                        >
                            Sign up here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;