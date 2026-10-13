import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({ children }) {

    return (
        <div className="min-h-screen bg-slate-100">

            <Sidebar />

            <div className="ml-20 lg:ml-64">

                <Navbar />

                <main className="p-4 sm:p-6">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default Layout;