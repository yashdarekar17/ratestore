import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ role, children }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            <Header role={role} />
            <div className="flex flex-1">
                <Sidebar role={role} />
                <main className="flex-1 min-h-[calc(100vh-64px)] p-6 md:p-8 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;