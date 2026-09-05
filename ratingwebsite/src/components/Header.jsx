import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Star, Shield, Store } from "lucide-react";

const Header = ({ role }) => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user");
    let user = null;
    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
        user = null;
    }

    const userData = user?.user || user;
    const displayName = userData?.name || userData?.email?.split("@")[0] || "Logged User";
    const currentRole = (role || userData?.role || "USER").toUpperCase();

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const getRoleIcon = () => {
        if (currentRole === "ADMIN") return <Shield className="w-4 h-4 text-sky-200" />;
        if (currentRole === "OWNER") return <Store className="w-4 h-4 text-sky-200" />;
        return <Star className="w-4 h-4 text-sky-200" />;
    };

    const formatRoleName = () => {
        if (currentRole === "ADMIN") return "System Administrator";
        if (currentRole === "OWNER") return "Store Owner";
        return "Normal User";
    };

    return (
        <header className="h-16 bg-sky-500 text-white flex items-center justify-between px-6 shadow-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
                    <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                        RatingStore
                    </h1>
                    <p className="text-xs text-sky-100 font-medium mt-0.5">
                        Store Review Platform
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-5">
                <div className="flex items-center gap-3 bg-sky-600/50 px-3.5 py-1.5 rounded-lg border border-sky-400/40">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                        <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left leading-tight">
                        <p className="text-sm font-semibold text-white">
                            {displayName}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                            {getRoleIcon()}
                            <span className="text-xs text-sky-100 font-medium">
                                {formatRoleName()}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 bg-white text-sky-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-sky-50 hover:shadow transition active:scale-95 cursor-pointer"
                    title="Log out"
                >
                    <LogOut className="w-4 h-4 text-sky-600" />
                    <span className="hidden xs:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;