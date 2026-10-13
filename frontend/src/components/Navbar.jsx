import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import API_BASE_URL from "../config/api";
import { Bell, Search } from "lucide-react";

function Navbar() {

    const navigate = useNavigate();

    const username = localStorage.getItem("username") || "User";
    const token = localStorage.getItem("token");

    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread notification count
    const fetchUnreadCount = async () => {

        if (!token) {
            return;
        }

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/notifications/count`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                return;
            }

            const count = await response.json();

            setUnreadCount(count);

        } catch (error) {

            console.error(
                "Failed to fetch notification count:",
                error
            );

        }
    };

    useEffect(() => {

        fetchUnreadCount();

        // Refresh notification count every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);

    }, []);

    const handleNotificationClick = () => {
        navigate("/notifications");
    };

    return (
        <header className="min-h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-4">

            {/* Search */}
            <div className="flex-1 max-w-96">

                <div className="relative">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />

                    <input
                        type="text"
                        placeholder="Search credentials..."
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />

                </div>

            </div>


            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">

                {/* Notification Bell */}
                <button
                    type="button"
                    onClick={handleNotificationClick}
                    className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Notifications"
                >

                    <Bell size={21} aria-hidden="true" />

                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}

                </button>


                {/* User */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Avatar */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                        {username.charAt(0).toUpperCase()}
                    </div>

                    {/* User information */}
                    <div className="hidden sm:block cursor-pointer" 
                       onClick={() => navigate("/settings")}
                     >

                        <p className="text-sm font-semibold text-slate-800  "
                           
                        >
                            {username}
                        </p>

                        <p className="text-xs text-slate-500">
                            Secure Account
                        </p>

                    </div>

                </div>

            </div>

            <ToastContainer />

        </header>
    );
}

export default Navbar;