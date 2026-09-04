import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, Star } from "lucide-react";
import { validateName, validateEmail } from "../services/validation";
import api from "../services/api";

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [serverError, setServerError] = useState("");

    const validatePasswordField = (val) => {
        if (!val || !val.trim()) {
            return "Password is required";
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (serverError) setServerError("");

        if (touched[name]) {
            let err = "";
            if (name === "name") err = validateName(value);
            if (name === "email") err = validateEmail(value);
            if (name === "password") err = validatePasswordField(value);
            setErrors((prev) => ({ ...prev, [name]: err }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        let err = "";
        if (name === "name") err = validateName(value);
        if (name === "email") err = validateEmail(value);
        if (name === "password") err = validatePasswordField(value);
        setErrors((prev) => ({ ...prev, [name]: err }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setTouched({ name: true, email: true, password: true });

        const nameErr = validateName(formData.name);
        const emailErr = validateEmail(formData.email);
        const passErr = validatePasswordField(formData.password);

        if (nameErr || emailErr || passErr) {
            setErrors({
                name: nameErr,
                email: emailErr,
                password: passErr
            });
            return;
        }

        try {
            const res = await api.post("/auth/signup", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            const user = res.data?.user;
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                navigate("/user/dashboard");
            } else {
                navigate("/login");
            }
        } catch (err) {
            console.error("Signup error:", err);
            const msg = err.response?.data?.message || "Registration failed. Please try again.";
            setServerError(msg);
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
                        Create Your Account
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Register as a Normal User to explore and rate registered stores
                    </p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-sky-950/5 border border-sky-100 p-8">
                    {serverError && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>{serverError}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                Full Name <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter your full name"
                                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${touched.name && errors.name
                                            ? "border-rose-400 bg-rose-50/30 focus:ring-rose-200"
                                            : "border-slate-200 bg-slate-50/50 focus:border-sky-500 focus:ring-sky-200"
                                        } text-sm text-slate-800 outline-none transition focus:ring-2 focus:bg-white`}
                                />
                            </div>
                            {touched.name && errors.name && (
                                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

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
                                    onBlur={handleBlur}
                                    placeholder="user@example.com"
                                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${touched.email && errors.email
                                            ? "border-rose-400 bg-rose-50/30 focus:ring-rose-200"
                                            : "border-slate-200 bg-slate-50/50 focus:border-sky-500 focus:ring-sky-200"
                                        } text-sm text-slate-800 outline-none transition focus:ring-2 focus:bg-white`}
                                />
                            </div>
                            {touched.email && errors.email && (
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
                                    onBlur={handleBlur}
                                    placeholder="Enter your password"
                                    className={`w-full pl-11 pr-11 py-2.5 rounded-xl border ${touched.password && errors.password
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
                            {touched.password && errors.password && (
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
                                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Create Account</span>
                            </button>
                        </div>
                    </form>

                    {/* Login Redirect */}
                    <div className="mt-6 text-center text-xs text-slate-500">
                        <span>Already registered? </span>
                        <Link
                            to="/login"
                            className="text-sky-600 font-semibold hover:text-sky-700 transition underline underline-offset-2"
                        >
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;