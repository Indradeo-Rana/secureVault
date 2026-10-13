import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import API_BASE_URL from "../config/api";

function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);
    const [open, setOpen] = useState(false);

    const token = localStorage.getItem("token");

    const loadNotifications = async () => {

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load notifications"
                );
            }

            const data = await response.json();

            setNotifications(data);

            const unread =
                data.filter(
                    notification =>
                        !notification.read
                ).length;

            setCount(unread);

        } catch (error) {

            console.error(
                "Notification error:",
                error
            );
        }
    };

    useEffect(() => {

        loadNotifications();

        const interval =
            setInterval(
                loadNotifications,
                30000
            );

        return () =>
            clearInterval(interval);

    }, []);

    const markAsRead = async (id) => {

        try {

            await fetch(
                `${API_BASE_URL}/api/notifications/${id}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            loadNotifications();

        } catch (error) {

            console.error(error);
        }
    };

    const markAllAsRead = async () => {

        try {

            await fetch(
                `${API_BASE_URL}/api/notifications/read-all`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            loadNotifications();

        } catch (error) {

            console.error(error);
        }
    };

    return (
        <div className="relative">

            <button
                onClick={() =>
                    setOpen(!open)
                }
                className="relative p-2 rounded-lg hover:bg-slate-100"
            >

                <Bell size={21} aria-hidden="true" />

                {count > 0 && (
                    <span
                        className="
                            absolute
                            -top-1
                            -right-1
                            bg-red-500
                            text-white
                            text-xs
                            rounded-full
                            min-w-[20px]
                            h-5
                            flex
                            items-center
                            justify-center
                        "
                    >
                        {count > 99 ? "99+" : count}
                    </span>
                )}

            </button>

            {open && (

                <div
                    className="
                        absolute
                        right-0
                        mt-2
                        w-96
                        max-w-[90vw]
                        bg-white
                        border
                        border-slate-200
                        rounded-xl
                        shadow-xl
                        z-50
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            p-4
                            border-b
                        "
                    >

                        <h3 className="font-semibold">
                            Notifications
                        </h3>

                        {count > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="
                                    text-sm
                                    text-blue-600
                                    hover:underline
                                "
                            >
                                Mark all read
                            </button>
                        )}

                    </div>

                    <div className="max-h-96 overflow-y-auto">

                        {notifications.length === 0 ? (

                            <div
                                className="
                                    p-6
                                    text-center
                                    text-slate-500
                                "
                            >
                                No notifications
                            </div>

                        ) : (

                            notifications.map(
                                notification => (

                                    <div
                                        key={
                                            notification.id
                                        }
                                        onClick={() =>
                                            markAsRead(
                                                notification.id
                                            )
                                        }
                                        className={`
                                            p-4
                                            border-b
                                            cursor-pointer
                                            hover:bg-slate-50
                                            ${
                                                !notification.read
                                                    ? "bg-blue-50"
                                                    : ""
                                            }
                                        `}
                                    >

                                        <div
                                            className="
                                                flex
                                                justify-between
                                                gap-3
                                            "
                                        >

                                            <h4
                                                className="
                                                    font-medium
                                                    text-slate-800
                                                "
                                            >
                                                {
                                                    notification.title
                                                }
                                            </h4>

                                            {!notification.read && (
                                                <span
                                                    className="
                                                        w-2
                                                        h-2
                                                        bg-blue-600
                                                        rounded-full
                                                        mt-2
                                                        flex-shrink-0
                                                    "
                                                />
                                            )}

                                        </div>

                                        <p
                                            className="
                                                text-sm
                                                text-slate-600
                                                mt-1
                                            "
                                        >
                                            {
                                                notification.message
                                            }
                                        </p>

                                        <p
                                            className="
                                                text-xs
                                                text-slate-400
                                                mt-2
                                            "
                                        >
                                            {
                                                new Date(
                                                    notification.createdAt
                                                ).toLocaleString()
                                            }
                                        </p>

                                    </div>
                                )
                            )
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}

export default NotificationBell;