import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    Users,
    Store,
    Star,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
    Eye,
    Shield,
    UserCheck,
    Loader2,
    RefreshCw
} from "lucide-react";
import {
    validateName,
    validateEmail,
    validatePassword,
    validateAddress
} from "../services/validation";
import {
    apiGetUsers,
    apiGetStores,
    apiGetAdminDashboard,
    apiAddUser,
    apiAddStore,
    apiGetRatings
} from "../services/api";

const AdminDashboard = () => {
    // Data states
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [dashboardMetrics, setDashboardMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch live backend data on component load
    useEffect(() => {
        const loadBackendData = async () => {
            setIsLoading(true);
            try {
                const [backendUsers, backendStores, metrics, backendRatings] = await Promise.all([
                    apiGetUsers(),
                    apiGetStores(),
                    apiGetAdminDashboard(),
                    apiGetRatings()
                ]);
                if (backendUsers && backendUsers.length > 0) {
                    setUsers(backendUsers);
                }
                if (backendStores && backendStores.length > 0) {
                    setStores(backendStores);
                }
                if (metrics) {
                    setDashboardMetrics(metrics);
                }
                if (backendRatings && backendRatings.length > 0) {
                    setRatings(backendRatings);
                }
            } catch (err) {
                console.warn("Backend loading notice:", err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadBackendData();
    }, []);

    // Navigation tab
    const [activeTab, setActiveTab] = useState("users"); // "users" | "stores"

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    // Sorting states
    const [userSort, setUserSort] = useState({ field: "name", direction: "asc" });
    const [storeSort, setStoreSort] = useState({ field: "name", direction: "asc" });

    // Modals
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);

    // Add User Form State
    const [newUserForm, setNewUserForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "USER"
    });
    const [userFormErrors, setUserFormErrors] = useState({});

    // Add Store Form State
    const [newStoreForm, setNewStoreForm] = useState({
        name: "",
        email: "",
        address: "",
        owner_id: ""
    });
    const [storeFormErrors, setStoreFormErrors] = useState({});

    // Refresh data
    const refreshData = async () => {
        setIsLoading(true);
        try {
            const [backendUsers, backendStores, metrics, backendRatings] = await Promise.all([
                apiGetUsers(),
                apiGetStores(),
                apiGetAdminDashboard(),
                apiGetRatings()
            ]);
            if (backendUsers) setUsers(backendUsers);
            if (backendStores) setStores(backendStores);
            if (metrics) setDashboardMetrics(metrics);
            if (backendRatings) setRatings(backendRatings);
        } catch (err) {
            console.warn("Refresh error:", err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate Store Ratings helper
    const getStoreRating = (storeId) => {
        const found = stores.find((item) => Number(item.id) === Number(storeId));
        return Number(found?.average_rating) || 0;
    };

    // Get owner rating if user is owner
    const getUserOwnerRating = (user) => {
        if (user.role !== "OWNER") return null;
        const matchingStore = stores.find(
            (s) => s.ownerEmail?.toLowerCase() === user.email?.toLowerCase() || s.id === user.storeId
        );
        if (!matchingStore) return 0;
        return getStoreRating(matchingStore.id);
    };

    // Sorting Handlers
    const handleUserSort = (field) => {
        setUserSort((prev) => ({
            field,
            direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const handleStoreSort = (field) => {
        setStoreSort((prev) => ({
            field,
            direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    // Filtered & Sorted Users
    const filteredUsers = useMemo(() => {
        let result = users.filter((u) => {
            const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                (u.name || "").toLowerCase().includes(q) ||
                (u.email || "").toLowerCase().includes(q) ||
                (u.address || "").toLowerCase().includes(q) ||
                (u.role || "").toLowerCase().includes(q);
            return matchesRole && matchesSearch;
        });

        result.sort((a, b) => {
            let valA = a[userSort.field] || "";
            let valB = b[userSort.field] || "";

            if (userSort.field === "rating") {
                valA = getUserOwnerRating(a) || 0;
                valB = getUserOwnerRating(b) || 0;
                return userSort.direction === "asc" ? valA - valB : valB - valA;
            }

            if (typeof valA === "string") {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return userSort.direction === "asc" ? -1 : 1;
            if (valA > valB) return userSort.direction === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [users, roleFilter, searchQuery, userSort, stores]);

    // Filtered & Sorted Stores
    const filteredStores = useMemo(() => {
        let result = stores.filter((s) => {
            const q = searchQuery.toLowerCase().trim();
            return (
                !q ||
                s.name.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                s.address.toLowerCase().includes(q)
            );
        });

        result.sort((a, b) => {
            if (storeSort.field === "rating") {
                const ratA = getStoreRating(a.id);
                const ratB = getStoreRating(b.id);
                return storeSort.direction === "asc" ? ratA - ratB : ratB - ratA;
            }

            let valA = a[storeSort.field] || "";
            let valB = b[storeSort.field] || "";
            if (typeof valA === "string") {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return storeSort.direction === "asc" ? -1 : 1;
            if (valA > valB) return storeSort.direction === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [stores, searchQuery, storeSort]);

    // Handle Create User
    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        
        const errs = {};
        const nameErr = validateName(newUserForm.name);
        if (nameErr) errs.name = nameErr;

        const emailErr = validateEmail(newUserForm.email);
        if (emailErr) errs.email = emailErr;

        const passErr = validatePassword(newUserForm.password);
        if (passErr) errs.password = passErr;

        if (Object.keys(errs).length > 0) {
            setUserFormErrors(errs);
            return;
        }

        try {
            await apiAddUser({
                name: newUserForm.name.trim(),
                email: newUserForm.email.trim(),
                password: newUserForm.password,
                role: newUserForm.role
            });
            await refreshData();
            setIsAddUserOpen(false);
            setNewUserForm({ name: "", email: "", password: "", role: "USER" });
            setUserFormErrors({});
        } catch (err) {
            console.error("API Add User error:", err);
            const msg = err.response?.data?.message || "Failed to add user. Please try again.";
            setUserFormErrors({ form: msg });
        }
    };

    // Handle Create Store
    const handleAddStoreSubmit = async (e) => {
        e.preventDefault();
        
        const errs = {};
        if (!newStoreForm.name.trim()) errs.name = "Store name is required.";
        const emailErr = validateEmail(newStoreForm.email);
        if (emailErr) errs.email = emailErr;
        const addressErr = validateAddress(newStoreForm.address);
        if (addressErr) errs.address = addressErr;
        if (!newStoreForm.owner_id) errs.owner_id = "Store owner is required.";

        if (Object.keys(errs).length > 0) {
            setStoreFormErrors(errs);
            return;
        }

        try {
            await apiAddStore({
                name: newStoreForm.name.trim(),
                email: newStoreForm.email.trim(),
                address: newStoreForm.address.trim(),
                owner_id: Number(newStoreForm.owner_id)
            });
            const freshStores = await apiGetStores();
            if (freshStores) {
                setStores(freshStores);
            }
            setIsAddStoreOpen(false);
            setNewStoreForm({ name: "", email: "", address: "", owner_id: "" });
            setStoreFormErrors({});
        } catch (err) {
            console.error("API Add Store error:", err);
            const msg = err.response?.data?.message || "Failed to add store to database.";
            setStoreFormErrors({ form: msg });
        }
    };

    return (
        <DashboardLayout role="ADMIN">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                        System Administrator Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Monitor stores, oversee user registrations, and manage submitted ratings
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshData}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-medium text-sm shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-60"
                        title="Refresh data from database"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-500" : "text-slate-500"}`} />
                        <span className="hidden sm:inline">{isLoading ? "Refreshing..." : "Refresh"}</span>
                    </button>
                    <button
                        onClick={() => setIsAddUserOpen(true)}
                        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm shadow-sky-500/20 transition active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New User</span>
                    </button>
                    <button
                        onClick={() => setIsAddStoreOpen(true)}
                        className="flex items-center gap-2 bg-white hover:bg-sky-50 text-sky-600 border border-sky-200 px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition active:scale-95 cursor-pointer"
                    >
                        <Store className="w-4 h-4 text-sky-600" />
                        <span>Add New Store</span>
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Users
                        </p>
                        {isLoading ? (
                            <div className="flex items-center gap-2 mt-2">
                                <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                                <span className="text-xs text-slate-400">Loading...</span>
                            </div>
                        ) : (
                            <h2 className="text-3xl font-bold text-slate-800 mt-1">
                                {users.length}
                            </h2>
                        )}
                        <span className="text-xs text-sky-600 font-medium inline-block mt-1">
                            Admins, Users & Owners
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Stores */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Stores
                        </p>
                        {isLoading ? (
                            <div className="flex items-center gap-2 mt-2">
                                <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                                <span className="text-xs text-slate-400">Loading...</span>
                            </div>
                        ) : (
                            <h2 className="text-3xl font-bold text-slate-800 mt-1">
                                {stores.length}
                            </h2>
                        )}
                        <span className="text-xs text-sky-600 font-medium inline-block mt-1">
                            Registered businesses
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500">
                        <Store className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Ratings */}
                <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Ratings
                        </p>
                        {isLoading ? (
                            <div className="flex items-center gap-2 mt-2">
                                <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                                <span className="text-xs text-slate-400">Loading...</span>
                            </div>
                        ) : (
                            <h2 className="text-3xl font-bold text-slate-800 mt-1">
                                {dashboardMetrics?.total_ratings !== undefined ? Number(dashboardMetrics.total_ratings) : ratings.length}
                            </h2>
                        )}
                        <span className="text-xs text-amber-500 font-medium inline-block mt-1">
                            Customer feedback submitted
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                        <Star className="w-6 h-6 fill-amber-400" />
                    </div>
                </div>
            </div>

            {/* Tabs & Search Filter Controls */}
            <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "users"
                                    ? "bg-white text-sky-600 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Users ({filteredUsers.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("stores")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "stores"
                                    ? "bg-white text-sky-600 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Store className="w-4 h-4" />
                            <span>Stores ({filteredStores.length})</span>
                        </button>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative min-w-[240px] flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, address..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Role Filter (only relevant when tab is users) */}
                        {activeTab === "users" && (
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                <Filter className="w-3.5 h-3.5 text-slate-500" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="bg-transparent text-xs sm:text-sm font-medium text-slate-700 outline-none cursor-pointer"
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="ADMIN">Administrator</option>
                                    <option value="USER">Normal User</option>
                                    <option value="OWNER">Store Owner</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Tables */}
            {activeTab === "users" ? (
                /* Users Table */
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden" id="users">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                User Accounts
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Showing registered administrators, normal users, and store owners
                            </p>
                        </div>
                        <span className="text-xs bg-sky-50 text-sky-700 px-3 py-1 rounded-full font-medium border border-sky-100">
                            {filteredUsers.length} records found
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <th
                                        className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition"
                                        onClick={() => handleUserSort("name")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Name</span>
                                            {userSort.field === "name" ? (
                                                userSort.direction === "asc" ? (
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
                                        onClick={() => handleUserSort("email")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Email</span>
                                            {userSort.field === "email" ? (
                                                userSort.direction === "asc" ? (
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
                                        onClick={() => handleUserSort("role")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Role</span>
                                            {userSort.field === "role" ? (
                                                userSort.direction === "asc" ? (
                                                    <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                                                ) : (
                                                    <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2.5">
                                                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                                <p className="text-sm font-medium text-slate-600">
                                                    Fetching user records from database...
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Please wait a moment
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-400">
                                            No users found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => {
                                        return (
                                            <tr key={u.id || u.email} className="hover:bg-sky-50/30 transition">
                                                <td className="py-4 px-5 font-semibold text-slate-800">
                                                    {u.name}
                                                </td>
                                                <td className="py-4 px-5 text-slate-600">
                                                    {u.email}
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === "ADMIN"
                                                                ? "bg-purple-100 text-purple-700"
                                                                : u.role === "OWNER"
                                                                    ? "bg-amber-100 text-amber-800"
                                                                    : "bg-sky-100 text-sky-700"
                                                            }`}
                                                    >
                                                        {u.role === "ADMIN" && <Shield className="w-3 h-3" />}
                                                        {u.role === "OWNER" && <Store className="w-3 h-3" />}
                                                        {u.role === "USER" && <UserCheck className="w-3 h-3" />}
                                                        <span>{u.role}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-right">
                                                    <button
                                                        onClick={() => setSelectedUser(u)}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Details</span>
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
            ) : (
                /* Stores Table */
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden" id="stores">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Registered Stores
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                List of registered store facilities and overall user rating scores
                            </p>
                        </div>
                        <span className="text-xs bg-sky-50 text-sky-700 px-3 py-1 rounded-full font-medium border border-sky-100">
                            {filteredStores.length} stores listed
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <th
                                        className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition"
                                        onClick={() => handleStoreSort("name")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Store Name</span>
                                            {storeSort.field === "name" ? (
                                                storeSort.direction === "asc" ? (
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
                                        onClick={() => handleStoreSort("email")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Contact Email</span>
                                            {storeSort.field === "email" ? (
                                                storeSort.direction === "asc" ? (
                                                    <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                                                ) : (
                                                    <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-5">Owner</th>
                                    <th
                                        className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition"
                                        onClick={() => handleStoreSort("address")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Address</span>
                                            {storeSort.field === "address" ? (
                                                storeSort.direction === "asc" ? (
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
                                        onClick={() => handleStoreSort("rating")}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Overall Rating</span>
                                            {storeSort.field === "rating" ? (
                                                storeSort.direction === "asc" ? (
                                                    <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                                                ) : (
                                                    <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2.5">
                                                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                                <p className="text-sm font-medium text-slate-600">
                                                    Fetching store records from database...
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Please wait a moment
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStores.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400">
                                            No stores found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStores.map((s) => {
                                        return (
                                            <tr key={s.id} className="hover:bg-sky-50/30 transition">
                                                <td className="py-4 px-5 font-semibold text-slate-800">
                                                    {s.name}
                                                </td>
                                                <td className="py-4 px-5 text-slate-600">
                                                    {s.email}
                                                </td>
                                                <td className="py-4 px-5 text-slate-700 font-medium">
                                                    <div>{s.owner_name || "Assigned Owner"}</div>
                                                    {s.owner_email && (
                                                        <div className="text-[11px] text-slate-400">{s.owner_email}</div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5 text-slate-600 max-w-xs truncate" title={s.address}>
                                                    {s.address}
                                                </td>
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center text-amber-500 font-bold">
                                                            <Star className="w-4 h-4 fill-amber-400 mr-1" />
                                                            <span>{s.average_rating > 0 ? s.average_rating : "0.0"}</span>
                                                        </div>
                                                        <span className="text-slate-400 text-xs">
                                                            ({s.total_ratings !== undefined ? s.total_ratings : 0} ratings)
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 text-right">
                                                    <button
                                                        onClick={() => setSelectedStore(s)}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Details</span>
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
            )}

            {/* Modal: Add New User */}
            {isAddUserOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Add New User
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Create normal user, admin, or store owner account
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddUserOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddUserSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newUserForm.name}
                                    onChange={(e) =>
                                        setNewUserForm({ ...newUserForm, name: e.target.value })
                                    }
                                    placeholder="Enter full name"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                                {userFormErrors.name && (
                                    <p className="text-xs text-rose-500 mt-1">{userFormErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={newUserForm.email}
                                    onChange={(e) =>
                                        setNewUserForm({ ...newUserForm, email: e.target.value })
                                    }
                                    placeholder="user@example.com"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                                {userFormErrors.email && (
                                    <p className="text-xs text-rose-500 mt-1">{userFormErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Password <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={newUserForm.password}
                                    onChange={(e) =>
                                        setNewUserForm({ ...newUserForm, password: e.target.value })
                                    }
                                    placeholder="Enter password"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                                {userFormErrors.password && (
                                    <p className="text-xs text-rose-500 mt-1">{userFormErrors.password}</p>
                                )}
                            </div>

                            {userFormErrors.form && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                                    {userFormErrors.form}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    User Role
                                </label>
                                <select
                                    value={newUserForm.role}
                                    onChange={(e) =>
                                        setNewUserForm({ ...newUserForm, role: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
                                >
                                    <option value="USER">Normal User</option>
                                    <option value="ADMIN">System Administrator</option>
                                    <option value="OWNER">Store Owner</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUserOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-sm"
                                >
                                    Save User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add New Store */}
            {isAddStoreOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sky-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    Add New Store
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Register a new store on the platform
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddStoreOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddStoreSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Store Name
                                </label>
                                <input
                                    type="text"
                                    value={newStoreForm.name}
                                    onChange={(e) =>
                                        setNewStoreForm({ ...newStoreForm, name: e.target.value })
                                    }
                                    placeholder="e.g. Apex Artisan Coffee"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                                {storeFormErrors.name && (
                                    <p className="text-xs text-rose-500 mt-1">{storeFormErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Store Email
                                </label>
                                <input
                                    type="email"
                                    value={newStoreForm.email}
                                    onChange={(e) =>
                                        setNewStoreForm({ ...newStoreForm, email: e.target.value })
                                    }
                                    placeholder="contact@store.com"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                                />
                                {storeFormErrors.email && (
                                    <p className="text-xs text-rose-500 mt-1">{storeFormErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Store Address <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    required
                                    value={newStoreForm.address}
                                    onChange={(e) =>
                                        setNewStoreForm({ ...newStoreForm, address: e.target.value })
                                    }
                                    placeholder="Street, City, Zip Code"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none resize-none"
                                />
                                {storeFormErrors.address && (
                                    <p className="text-xs text-rose-500 mt-1">{storeFormErrors.address}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                                    Store Owner <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={newStoreForm.owner_id}
                                    onChange={(e) =>
                                        setNewStoreForm({ ...newStoreForm, owner_id: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
                                >
                                    <option value="">Select a registered owner</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email}) - {u.role}
                                        </option>
                                    ))}
                                </select>
                                {storeFormErrors.owner_id && (
                                    <p className="text-xs text-rose-500 mt-1">{storeFormErrors.owner_id}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddStoreOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-sm"
                                >
                                    Register Store
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: View User Details */}
            {selectedUser && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <h3 className="text-lg font-bold text-slate-800">
                                User Profile Details
                            </h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Name
                                </span>
                                <p className="text-base font-semibold text-slate-800 mt-0.5">
                                    {selectedUser.name}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Email
                                </span>
                                <p className="text-sm text-slate-700 mt-0.5">
                                    {selectedUser.email}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Address
                                </span>
                                <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">
                                    {selectedUser.address}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Role
                                </span>
                                <div className="mt-1">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.role === "ADMIN"
                                                ? "bg-purple-100 text-purple-700"
                                                : selectedUser.role === "OWNER"
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-sky-100 text-sky-700"
                                            }`}
                                    >
                                        {selectedUser.role}
                                    </span>
                                </div>
                            </div>

                            {selectedUser.role === "OWNER" && (
                                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                                        Store Owner Rating
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                        <span className="text-lg font-bold text-amber-900">
                                            {getUserOwnerRating(selectedUser) > 0
                                                ? `${getUserOwnerRating(selectedUser)} / 5.0`
                                                : "No ratings yet"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: View Store Details */}
            {selectedStore && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <h3 className="text-lg font-bold text-slate-800">
                                Store Information
                            </h3>
                            <button
                                onClick={() => setSelectedStore(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Store Name
                                </span>
                                <p className="text-lg font-bold text-slate-800 mt-0.5">
                                    {selectedStore.name}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Contact Email
                                </span>
                                <p className="text-sm text-slate-700 mt-0.5">
                                    {selectedStore.email}
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Address
                                </span>
                                <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">
                                    {selectedStore.address}
                                </p>
                            </div>

                            {/* Store Rating Overview */}
                            {(() => {
                                const storeRatings = ratings.filter(
                                    (r) => Number(r.store_id) === Number(selectedStore.id)
                                );
                                return (
                                    <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">
                                                    Average Score
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                                    <span className="text-2xl font-black text-slate-800">
                                                        {selectedStore.average_rating > 0 ? selectedStore.average_rating : "0.0"}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">
                                                    Total Reviews
                                                </span>
                                                <p className="text-2xl font-black text-slate-800 mt-1">
                                                    {selectedStore.total_ratings !== undefined ? selectedStore.total_ratings : storeRatings.length}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Ratings list breakdown */}
                                        {storeRatings.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-sky-200/60 space-y-2">
                                                <p className="text-xs font-semibold text-slate-600">
                                                    Recent Customer Submissions:
                                                </p>
                                                {storeRatings.map((r) => (
                                                    <div
                                                        key={r.id}
                                                        className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-sky-100"
                                                    >
                                                        <span className="font-medium text-slate-700 truncate max-w-[200px]">
                                                            {r.user_name || r.userName || "Customer"}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                            <span>{r.rating} / 5</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedStore(null)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminDashboard;