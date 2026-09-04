import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Store, KeyRound, Star, ShieldCheck, UserCheck } from "lucide-react";

const Sidebar = ({ role }) => {
    const getLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm ${
            isActive
                ? "bg-white text-sky-600 font-semibold shadow-sm"
                : "text-white/90 hover:bg-sky-400/60 hover:text-white"
        }`;

    return (
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-sky-500 p-4 flex flex-col justify-between border-r border-sky-400/30">
            <div>
                <div className="mb-6 px-3 py-2 bg-sky-600/40 rounded-xl border border-sky-400/30">
                    <p className="text-xs uppercase font-bold tracking-wider text-sky-200">
                        Portal View
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        {role === "ADMIN" && <ShieldCheck className="w-4 h-4 text-white" />}
                        {role === "USER" && <UserCheck className="w-4 h-4 text-white" />}
                        {role === "OWNER" && <Store className="w-4 h-4 text-white" />}
                        <h2 className="text-sm font-semibold text-white">
                            {role === "ADMIN" && "System Administrator"}
                            {role === "USER" && "Normal User"}
                            {role === "OWNER" && "Store Owner"}
                        </h2>
                    </div>
                </div>

                {/* Admin Navigation */}
                {role === "ADMIN" && (
                    <nav className="space-y-1.5">
                        <NavLink to="/admin/dashboard" end className={getLinkClass}>
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink to="/admin/dashboard#users" className={getLinkClass}>
                            <Users className="w-4 h-4" />
                            <span>Manage Users</span>
                        </NavLink>

                        <NavLink to="/admin/dashboard#stores" className={getLinkClass}>
                            <Store className="w-4 h-4" />
                            <span>Manage Stores</span>
                        </NavLink>
                    </nav>
                )}

                {/* Normal User Navigation */}
                {role === "USER" && (
                    <nav className="space-y-1.5">
                        <NavLink to="/user/dashboard" end className={getLinkClass}>
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Explore Stores</span>
                        </NavLink>

                        <NavLink to="/user/dashboard#ratings" className={getLinkClass}>
                            <Star className="w-4 h-4" />
                            <span>My Ratings</span>
                        </NavLink>

                        <NavLink to="/user/dashboard#password" className={getLinkClass}>
                            <KeyRound className="w-4 h-4" />
                            <span>Change Password</span>
                        </NavLink>
                    </nav>
                )}

                {/* Store Owner Navigation */}
                {role === "OWNER" && (
                    <nav className="space-y-1.5">
                        <NavLink to="/owner/dashboard" end className={getLinkClass}>
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Store Overview</span>
                        </NavLink>

                        <NavLink to="/owner/dashboard#ratings" className={getLinkClass}>
                            <Star className="w-4 h-4" />
                            <span>Customer Reviews</span>
                        </NavLink>

                        <NavLink to="/owner/dashboard#password" className={getLinkClass}>
                            <KeyRound className="w-4 h-4" />
                            <span>Change Password</span>
                        </NavLink>
                    </nav>
                )}
            </div>

            <div className="pt-4 border-t border-sky-400/40 px-3">
                <div className="flex items-center justify-between text-xs text-sky-100">
                    <span>Role-Based Access</span>
                    <span className="font-semibold text-white bg-sky-600/60 px-2 py-0.5 rounded-full border border-sky-400/40">
                        {role || "USER"}
                    </span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;