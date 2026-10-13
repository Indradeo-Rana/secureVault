import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API_BASE_URL from "../config/api";
import { AlertTriangle, Bell, Handshake, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

function Notifications() {

    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    // Fetch all notifications
    const fetchNotifications = async () => {

        if (!token) {
            setError("You are not logged in.");
            setLoading(false);
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/notifications`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch notifications");
            }

            const data = await response.json();

            setNotifications(data);

        } catch (error) {

            console.error(
                "Notification fetch error:",
                error
            );

            setError(
                "Unable to load notifications. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        fetchNotifications();
    }, []);


    // Mark single notification as read
    const markAsRead = async (id) => {

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/notifications/${id}/read`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to mark notification as read");
            }

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === id
                        ? {
                              ...notification,
                              read: true
                          }
                        : notification
                )
            );

        } catch (error) {

            console.error(
                "Mark as read error:",
                error
            );

        }
    };


    // Mark all notifications as read
    const markAllAsRead = async () => {

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/notifications/read-all`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to mark all notifications as read"
                );
            }

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    read: true
                }))
            );

        } catch (error) {

            console.error(
                "Mark all as read error:",
                error
            );

        }
    };


    // Notification icon
    const getNotificationIcon = (type) => {

        switch (type) {

            case "LOGIN_ALERT":
                return <LockKeyhole size={18} aria-hidden="true" />;

            case "SECURITY_NOTIFICATION":
                return <ShieldCheck size={18} aria-hidden="true" />;

            case "SHARING_NOTIFICATION":
                return <Handshake size={18} aria-hidden="true" />;

            case "PASSWORD_EXPIRATION_ALERT":
                return <KeyRound size={18} aria-hidden="true" />;

            case "RISK_ALERT":
                return <AlertTriangle size={18} aria-hidden="true" />;

            default:
                return <Bell size={18} aria-hidden="true" />;
        }
    };


    // Notification type label
    const getNotificationType = (type) => {

        switch (type) {

            case "LOGIN_ALERT":
                return "Login Alert";

            case "SECURITY_NOTIFICATION":
                return "Security Notification";

            case "SHARING_NOTIFICATION":
                return "Sharing Notification";

            case "PASSWORD_EXPIRATION_ALERT":
                return "Password Expiration";

            case "RISK_ALERT":
                return "Risk Alert";

            default:
                return "Notification";
        }
    };


    // Format date
    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    };


    // Loading state
    if (loading) {

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

                <div className="text-center">

                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-slate-600 text-sm sm:text-base">
                        Loading notifications...
                    </p>

                </div>

            </div>
        );
    }


    return (
        <Layout>
        <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

            <div className="max-w-5xl mx-auto">


                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <div>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-sm text-blue-600 hover:text-blue-800 mb-2"
                        >
                            ← Back
                        </button>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                            Notifications
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Stay updated with your SecureVault security activity.
                        </p>

                    </div>


                    {/* Mark all button */}
                    {notifications.some(
                        (notification) => !notification.read
                    ) && (

                        <button
                            type="button"
                            onClick={markAllAsRead}
                            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                            Mark all as read
                        </button>

                    )}

                </div>


                {/* Error */}
                {error && (

                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
                        {error}
                    </div>

                )}


                {/* Empty state */}
                {!error && notifications.length === 0 && (

                    <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center shadow-sm">

                        <Bell className="mx-auto mb-4 text-slate-400" size={48} aria-hidden="true" />

                        <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                            No notifications
                        </h2>

                        <p className="text-sm text-slate-500 mt-2">
                            You're all caught up. New security and sharing
                            notifications will appear here.
                        </p>

                    </div>

                )}


                {/* Notifications */}
                {notifications.length > 0 && (

                    <div className="space-y-3">

                        {notifications.map((notification) => (

                            <div
                                key={notification.id}
                                className={`bg-white border rounded-xl p-4 sm:p-5 shadow-sm transition ${
                                    notification.read
                                        ? "border-slate-200"
                                        : "border-blue-200 bg-blue-50/40"
                                }`}
                            >

                                <div className="flex gap-3 sm:gap-4">

                                    {/* Icon */}
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-xl sm:text-2xl">
                                        {getNotificationIcon(
                                            notification.type
                                        )}
                                    </div>


                                    {/* Content */}
                                    <div className="flex-1 min-w-0">

                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <h2 className="font-semibold text-slate-800 text-sm sm:text-base">
                                                        {notification.title}
                                                    </h2>

                                                    {!notification.read && (

                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-semibold rounded-full">
                                                            NEW
                                                        </span>

                                                    )}

                                                </div>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    {getNotificationType(
                                                        notification.type
                                                    )}
                                                </p>

                                            </div>


                                            <span className="text-[11px] sm:text-xs text-slate-400 whitespace-nowrap">
                                                {formatDate(
                                                    notification.createdAt
                                                )}
                                            </span>

                                        </div>


                                        {/* Message */}
                                        <p className="text-sm text-slate-600 mt-3 leading-relaxed break-words">
                                            {notification.message}
                                        </p>


                                        {/* Mark read */}
                                        {!notification.read && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    markAsRead(
                                                        notification.id
                                                    )
                                                }
                                                className="mt-3 text-xs sm:text-sm text-blue-600 font-medium hover:text-blue-800"
                                            >
                                                Mark as read
                                            </button>

                                        )}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
        </Layout>
    );
}

export default Notifications;