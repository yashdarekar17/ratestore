import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    Store,
    Star,
    Users,
    KeyRound,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Calendar,
    Mail,
    MapPin,
    CheckCircle2,
    AlertCircle,
    X,
    Eye,
    EyeOff,
    TrendingUp
} from "lucide-react";
import { apiGetStores, apiGetRatings } from "../services/api";

const OwnerDashboard = () => {
    // Current owner session
    const currentUser = useMemo(() => {
        try {
            const raw = localStorage.getItem("user");
            if (!raw) return { name: "Store Owner", email: "benjamin@apexcoffee.com" };
            const parsed = JSON.parse(raw);
            return parsed.user || parsed;
        } catch {
            return { name: "Store Owner", email: "benjamin@apexcoffee.com" };
        }
    }, []);

    const [stores, setStores] = useState([]);
    const [ratings, setRatings] = useState([]);

    useEffect(() => {
        const load = async () => {
            const [list, fetchedRatings] = await Promise.all([
                apiGetStores(),
                apiGetRatings()
            ]);
            if (list) setStores(list);
            if (fetchedRatings) setRatings(fetchedRatings);
        };
        load();
    }, []);

    // Get owner's assigned store
    const store = useMemo(() => {
        if (stores.length === 0) return null;
        return (
            stores.find(
                (s) =>
                    (currentUser.id && Number(s.owner_id) === Number(currentUser.id)) ||
                    (currentUser.email && s.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
                    (currentUser.email && s.owner_email?.toLowerCase() === currentUser.email?.toLowerCase())
            ) || stores[0]
        );
    }, [stores, currentUser]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortState, setSortState] = useState({ field: "date", direction: "desc" });

    // Password Modal
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [showPass, setShowPass] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Compute store stats
    const storeStats = useMemo(() => {
        if (!store) return { averageRating: 0, totalRatings: 0, ratings: [] };
        return {
            averageRating: Number(store.average_rating) || 0,
            totalRatings: Number(store.total_ratings) || 0,
            ratings: ratings.filter((r) => Number(r.store_id || r.storeId) === Number(store.id))
        };
    }, [store, ratings]);

    // Star breakdown distribution
    const ratingDistribution = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        storeStats.ratings.forEach((r) => {
            if (counts[r.rating] !== undefined) counts[r.rating]++;
        });
        return counts;
    }, [storeStats]);

    // Handle sort
    const handleSort = (field) => {
        setSortState((prev) => ({
            field,
            direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    // Filtered and Sorted Ratings
    const filteredRatings = useMemo(() => {
        let list = storeStats.ratings.filter((r) => {
            const q = searchQuery.toLowerCase().trim();
            const name = (r.user_name || r.userName || "").toLowerCase();
            const email = (r.user_email || r.userEmail || "").toLowerCase();
            return !q || name.includes(q) || email.includes(q);
        });

        list.sort((a, b) => {
            if (sortState.field === "rating") {
                return sortState.direction === "asc" ? a.rating - b.rating : b.rating - a.rating;
            }
            if (sortState.field === "date") {
                const dateA = new Date(a.created_at || a.date || 0).getTime();
                const dateB = new Date(b.created_at || b.date || 0).getTime();
                return sortState.direction === "asc" ? dateA - dateB : dateB - dateA;
            }

            let valA = (a.user_name || a.userName || "").toLowerCase();
            let valB = (b.user_name || b.userName || "").toLowerCase();
            if (valA < valB) return sortState.direction === "asc" ? -1 : 1;
            if (valA > valB) return sortState.direction === "asc" ? 1 : -1;
            return 0;
        });

        return list;
    }, [storeStats, searchQuery, sortState]);

    // Handle password update
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setPasswordErrors({});
        setPasswordSuccess(false);

        const passErr = validatePassword(passwordData.newPassword);
        if (passErr) {
            setPasswordErrors({ newPassword: passErr });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordErrors({ confirmPassword: "Passwords do not match." });
            return;
        }

        const success = updatePassword(currentUser.email, passwordData.newPassword);
        if (success) {
            setPasswordSuccess(true);
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordSuccess(false);
                setPasswordData({ newPassword: "", confirmPassword: "" });
            }, 1400);
        }
    };

    return (
        <DashboardLayout role="OWNER">
            {/* Header Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                        Store Owner Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Track customer satisfaction, review ratings, and monitor store performance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-sky-600 border border-sky-200 hover:bg-sky-50 px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer"
                    >
                        <KeyRound className="w-4 h-4 text-sky-600" />
                        <span>Change Password</span>
                    </button>
                </div>
            </div>

            {/* Store Information Card */}
            {store && (
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 shrink-0">
                            <Store className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {store.name}
                                </h2>
                                <span className="bg-sky-50 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-sky-100">
                                    Active Store
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {store.address}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    {store.email}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Average Rating */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Average Rating
                            </p>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                                <Star className="w-5 h-5 fill-amber-400" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-3">
                            <h2 className="text-4xl font-black text-slate-800">
                                {storeStats.averageRating > 0 ? storeStats.averageRating : "0.0"}
                            </h2>
                            <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>Calculated across all customer reviews</span>
                    </div>
                </div>

                {/* Total Ratings Count */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Total Ratings
                            </p>
                            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-3">
                            <h2 className="text-4xl font-black text-slate-800">
                                {storeStats.totalRatings}
                            </h2>
                            <span className="text-sm font-semibold text-slate-400">Submissions</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <span>Unique normal users who rated your store</span>
                    </div>
                </div>

                {/* Star Distribution Summary */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                        Rating Breakdown
                    </p>
                    <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const count = ratingDistribution[stars] || 0;
                            const pct = storeStats.totalRatings > 0 ? (count / storeStats.totalRatings) * 100 : 0;
                            return (
                                <div key={stars} className="flex items-center gap-2 text-xs">
                                    <div className="flex items-center gap-1 w-12 text-slate-600 font-medium">
                                        <span>{stars}</span>
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    </div>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-sky-500 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-slate-400 font-medium">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Users Who Rated Table */}
            <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden" id="ratings">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Users Who Rated Your Store
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Detailed list of all registered normal users and the ratings they submitted
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative min-w-[220px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by user or email..."
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th
                                    className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition"
                                    onClick={() => handleSort("userName")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>User Name</span>
                                        {sortState.field === "userName" ? (
                                            sortState.direction === "asc" ? (
                                                <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                                            ) : (
                                                <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                                            )
                                        ) : (
                                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition"
                                    onClick={() => handleSort("userEmail")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>User Email</span>
                                        {sortState.field === "userEmail" ? (
                                            sortState.direction === "asc" ? (
                                                <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                                            ) : (
                                                <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                                            )
                                        ) : (
                                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition"
                                    onClick={() => handleSort("rating")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>Submitted Rating</span>
                                        {sortState.field === "rating" ? (
                                            sortState.direction === "asc" ? (
                                                <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                                            ) : (
                                                <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                                            )
                                        ) : (
                                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition"
                                    onClick={() => handleSort("date")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>Date Submitted</span>
                                        {sortState.field === "date" ? (
                                            sortState.direction === "asc" ? (
                                                <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                                            ) : (
                                                <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                                            )
                                        ) : (
                                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {filteredRatings.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-400">
                                        No ratings recorded yet for this store.
                                    </td>
                                </tr>
                            ) : (
                                filteredRatings.map((r) => (
                                    <tr key={r.id} className="hover:bg-sky-50/30 transition">
                                        <td className="py-4 px-5 font-semibold text-slate-800">
                                            {r.user_name || r.userName || "Customer"}
                                        </td>
                                        <td className="py-4 px-5 text-slate-600">
                                            {r.user_email || r.userEmail || "-"}
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                <span>{r.rating} / 5 Stars</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5 text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{r.created_at ? new Date(r.created_at).toLocaleDateString() : (r.date || "Recent")}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Update Password */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Change Store Owner Password
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Enforce security requirements for your store account
                                </p>
                            </div>
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {passwordSuccess && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Password updated successfully!</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) =>
                                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                                        }
                                        placeholder="Enter new password"
                                        className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 shrink-0" />
                                        {passwordErrors.newPassword}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type={showPass ? "text" : "password"}
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                    }
                                    placeholder="Re-enter new password"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                                {passwordErrors.confirmPassword && (
                                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 shrink-0" />
                                        {passwordErrors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-sm cursor-pointer"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default OwnerDashboard;