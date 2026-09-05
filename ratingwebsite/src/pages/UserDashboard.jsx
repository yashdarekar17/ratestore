import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    Search,
    Store,
    Star,
    MapPin,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    KeyRound,
    CheckCircle2,
    AlertCircle,
    X,
    Clock,
    Eye,
    EyeOff,
    Loader2
} from "lucide-react";
import { apiGetStores, apiSubmitRating, apiGetRatings, apiUpdatePassword } from "../services/api";
import { validatePassword } from "../services/validation";

const UserDashboard = () => {
    // Current user session
    const currentUser = useMemo(() => {
        try {
            const raw = localStorage.getItem("user");
            if (!raw) return { name: "Valued User", email: "alex.smith@example.com" };
            const parsed = JSON.parse(raw);
            return parsed.user || parsed;
        } catch {
            return { name: "Valued User", email: "alex.smith@example.com" };
        }
    }, []);

    // State
    const [stores, setStores] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch backend stores and ratings on load
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [liveStores, liveRatings] = await Promise.all([
                    apiGetStores(),
                    apiGetRatings()
                ]);
                if (liveStores) setStores(liveStores);
                if (liveRatings) setRatings(liveRatings);
            } catch (err) {
                console.warn("Could not load backend stores or ratings:", err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("ALL"); // "ALL" | "RATED" | "UNRATED"
    const [sortState, setSortState] = useState({ field: "name", direction: "asc" });

    // Interactive rating modal / state
    const [ratingStore, setRatingStore] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedScore, setSelectedScore] = useState(0);

    // Password Update Modal
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPass, setShowPass] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // User's rating for a specific store
    const getUserRating = (storeId) => {
        const found = ratings.find(
            (r) =>
                Number(r.store_id || r.storeId) === Number(storeId) &&
                (Number(r.user_id) === Number(currentUser.id) ||
                    r.userEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
                    r.user_email?.toLowerCase() === currentUser.email?.toLowerCase())
        );
        return found ? Number(found.rating) : 0;
    };

    // Open Rating Modal
    const handleOpenRatingModal = (store) => {
        setRatingStore(store);
        const current = getUserRating(store.id);
        setSelectedScore(current || 5);
        setHoverRating(0);
    };

    // Submit or update rating
    const handleSaveRating = async () => {
        if (!ratingStore || selectedScore < 1 || selectedScore > 5) return;

        try {
            if (currentUser.id && ratingStore.id) {
                await apiSubmitRating({
                    user_id: Number(currentUser.id),
                    store_id: Number(ratingStore.id),
                    rating: Number(selectedScore)
                });
            }
            // Refresh stores and ratings to get updated average rating
            const [freshStores, freshRatings] = await Promise.all([
                apiGetStores(),
                apiGetRatings()
            ]);
            if (freshStores) setStores(freshStores);
            if (freshRatings) setRatings(freshRatings);
        } catch (err) {
            console.error("Backend rating submission error:", err);
        }

        setRatingStore(null);
    };

    // Sorting handler
    const handleSort = (field) => {
        setSortState((prev) => ({
            field,
            direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    // Filtered and Sorted stores list
    const filteredStores = useMemo(() => {
        let list = stores.filter((s) => {
            const q = searchQuery.toLowerCase().trim();
            const matchesQuery =
                !q ||
                s.name.toLowerCase().includes(q) ||
                s.address.toLowerCase().includes(q);

            const userRating = getUserRating(s.id);
            if (filterCategory === "RATED") return matchesQuery && userRating > 0;
            if (filterCategory === "UNRATED") return matchesQuery && userRating === 0;
            return matchesQuery;
        });

        list.sort((a, b) => {
            if (sortState.field === "rating") {
                const ratA = Number(a.average_rating) || 0;
                const ratB = Number(b.average_rating) || 0;
                return sortState.direction === "asc" ? ratA - ratB : ratB - ratA;
            }

            if (sortState.field === "myRating") {
                const ratA = getUserRating(a.id);
                const ratB = getUserRating(b.id);
                return sortState.direction === "asc" ? ratA - ratB : ratB - ratA;
            }

            let valA = (a[sortState.field] || "").toLowerCase();
            let valB = (b[sortState.field] || "").toLowerCase();
            if (valA < valB) return sortState.direction === "asc" ? -1 : 1;
            if (valA > valB) return sortState.direction === "asc" ? 1 : -1;
            return 0;
        });

        return list;
    }, [stores, ratings, searchQuery, filterCategory, sortState]);

    // Handle Password Update Form
    const handlePasswordSubmit = async (e) => {
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

        try {
            await apiUpdatePassword({
                email: currentUser.email,
                newPassword: passwordData.newPassword
            });
            setPasswordSuccess(true);
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordSuccess(false);
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }, 1400);
        } catch (err) {
            console.error("Failed to update password:", err);
            const msg = err.response?.data?.message || "Failed to update password. Please try again.";
            setPasswordErrors({ general: msg });
        }
    };

    return (
        <DashboardLayout role="USER">
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
                    <p className="text-sm font-medium text-slate-600">Loading stores & ratings...</p>
                    <p className="text-xs text-slate-400">Please wait a moment</p>
                </div>
            )}
            {!isLoading && (<>
                {/* Top Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                            Explore & Rate Stores
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Find stores by name or address, submit your reviews, and modify previous ratings
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="flex items-center gap-2 bg-white text-sky-600 border border-sky-200 hover:bg-sky-50 px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer"
                        >
                            <KeyRound className="w-4 h-4 text-sky-600" />
                            <span>Update Password</span>
                        </button>
                    </div>
                </div>

                {/* Search & Filter Section */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search by Name and Address */}
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search store by name or address..."
                                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Pills */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFilterCategory("ALL")}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${filterCategory === "ALL"
                                    ? "bg-sky-500 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                All Stores ({stores.length})
                            </button>
                            <button
                                onClick={() => setFilterCategory("RATED")}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${filterCategory === "RATED"
                                    ? "bg-sky-500 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                Rated By Me
                            </button>
                            <button
                                onClick={() => setFilterCategory("UNRATED")}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${filterCategory === "UNRATED"
                                    ? "bg-sky-500 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                Not Rated
                            </button>
                        </div>
                    </div>
                </div>

                {/* Store Listings Table / Cards */}
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden" id="stores">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Available Stores
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Browse registered establishments and cast your 1 to 5 star rating
                            </p>
                        </div>
                        <span className="text-xs bg-sky-50 text-sky-700 px-3 py-1 rounded-full font-medium border border-sky-100">
                            {filteredStores.length} stores found
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1150px] text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <th
                                        className="py-3.5 px-5 w-[32%] cursor-pointer hover:bg-slate-100 transition"
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Store Name</span>
                                            {sortState.field === "name" ? (
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
                                        className="py-3.5 px-5 w-[28%] cursor-pointer hover:bg-slate-100 transition"
                                        onClick={() => handleSort("address")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Address</span>
                                            {sortState.field === "address" ? (
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
                                        className="py-3.5 px-5 w-[15%] cursor-pointer hover:bg-slate-100 transition"
                                        onClick={() => handleSort("rating")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Overall Rating</span>
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
                                        className="py-3.5 px-5 w-[15%] cursor-pointer hover:bg-slate-100 transition"
                                        onClick={() => handleSort("myRating")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Your Rating</span>
                                            {sortState.field === "myRating" ? (
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
                                    <th className="py-3.5 px-5 w-[10%] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {filteredStores.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400">
                                            No stores found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStores.map((s) => {
                                        const myScore = getUserRating(s.id);
                                        return (
                                            <tr key={s.id} className="hover:bg-sky-50/30 transition">
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 shrink-0">
                                                            <Store className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800 truncate"
                                                                title={s.name}
                                                            >
                                                                {s.name}
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                {s.email} {s.owner_name ? `• Owner: ${s.owner_name}` : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 text-slate-600">
                                                    <div className="flex items-start gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                        <span className="truncate" title={s.address}>{s.address}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="flex items-center text-amber-500 font-bold">
                                                            <Star className="w-4 h-4 fill-amber-400 mr-1" />
                                                            <span>{s.average_rating > 0 ? s.average_rating : "0.0"}</span>
                                                        </div>
                                                        <span className="text-slate-400 text-xs">
                                                            ({s.total_ratings || 0} {s.total_ratings === 1 ? "review" : "reviews"})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    {myScore > 0 ? (
                                                        <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                                            <span>Rated {myScore} / 5</span>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs whitespace-nowrap">
                                                            <Clock className="w-3 h-3 shrink-0" />
                                                            <span>Not yet rated</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5 text-right">
                                                    <button
                                                        onClick={() => handleOpenRatingModal(s)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition active:scale-95 cursor-pointer ${myScore > 0
                                                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                            : "bg-sky-500 hover:bg-sky-600 text-white shadow-xs"
                                                            }`}
                                                    >
                                                        <Star className="w-3.5 h-3.5" />
                                                        <span>{myScore > 0 ? "Modify Rating" : "Submit Rating"}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal: Rating Submission & Modification */}
                {ratingStore && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {getUserRating(ratingStore.id) > 0 ? "Modify Your Rating" : "Rate This Store"}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Ratings must range between 1 to 5 stars
                                    </p>
                                </div>
                                <button
                                    onClick={() => setRatingStore(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="text-center py-4">
                                <h4 className="text-base font-semibold text-slate-800">
                                    {ratingStore.name}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {ratingStore.address}
                                </p>

                                {/* Interactive 1 to 5 Star Selector */}
                                <div className="flex items-center justify-center gap-2 my-6">
                                    {[1, 2, 3, 4, 5].map((starIndex) => {
                                        const isFilled = (hoverRating || selectedScore) >= starIndex;
                                        return (
                                            <button
                                                key={starIndex}
                                                type="button"
                                                onClick={() => setSelectedScore(starIndex)}
                                                onMouseEnter={() => setHoverRating(starIndex)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                                            >
                                                <Star
                                                    className={`w-9 h-9 transition-colors ${isFilled
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-slate-200 fill-transparent"
                                                        }`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>

                                <p className="text-sm font-bold text-slate-700">
                                    {selectedScore} of 5 Stars
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {selectedScore === 5 && "Outstanding experience!"}
                                    {selectedScore === 4 && "Very good service!"}
                                    {selectedScore === 3 && "Average service."}
                                    {selectedScore === 2 && "Below expectations."}
                                    {selectedScore === 1 && "Poor experience."}
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setRatingStore(null)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveRating}
                                    className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-sm cursor-pointer"
                                >
                                    Confirm & Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal: Update Password */}
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        Update Password
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Enforce security requirements for your account
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
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>Password updated successfully!</span>
                                </div>
                            )}

                            {passwordErrors.general && (
                                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{passwordErrors.general}</span>
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                                            }
                                            placeholder="Enter new password"
                                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
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
                                        <p className="text-xs text-rose-500 mt-1">{passwordErrors.newPassword}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) =>
                                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                        }
                                        placeholder="Confirm new password"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-xs text-rose-500 mt-1">{passwordErrors.confirmPassword}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
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
            </>)}
        </DashboardLayout>
    );
};

export default UserDashboard;