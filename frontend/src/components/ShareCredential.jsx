import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import API_BASE_URL from "../config/api";

function ShareCredential({ credentialId, onClose }) {

    const [username, setUsername] = useState("");
    const [permission, setPermission] = useState("VIEW");
    const [expiresAt, setExpiresAt] = useState("");
    const [loading, setLoading] = useState(false);

    const handleShare = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/shares`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        credentialId: credentialId,
                        username: username,
                        permission: permission,
                        expiresAt: expiresAt
                            ? expiresAt
                            : null
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to share credential"
                );
            }

            // alert("Credential shared successfully");
            toast.success("Credential shared successfully");

            onClose();

        } catch (error) {

            console.error(
                "Share credential error:",
                error
            );

            // alert(error.message);
            toast.error(
                error.message ||
                "Failed to share credential. Please try again later."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow">

            <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-bold text-slate-800">
                    Share Credential
                </h2>

                <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-800 text-xl"
                >
                    ✕
                </button>

            </div>

            <form onSubmit={handleShare}>

                {/* Username */}

                <label className="block text-sm font-medium mb-1">
                    Username
                </label>

                <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                    placeholder="Enter username"
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                />


                {/* Permission */}

                <label className="block text-sm font-medium mb-1">
                    Access Type
                </label>

                <select
                    value={permission}
                    onChange={(e) =>
                        setPermission(e.target.value)
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                >

                    <option value="VIEW">
                        View Only
                    </option>

                    <option value="EDIT">
                        Edit Access
                    </option>

                    <option value="MANAGE">
                        Full Management
                    </option>

                </select>


                {/* Expiry */}

                <label className="block text-sm font-medium mb-1">
                    Expiry
                </label>

                <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) =>
                        setExpiresAt(e.target.value)
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-5 outline-none focus:ring-2 focus:ring-blue-500"
                />


                {/* Buttons */}

                <div className="flex gap-2">

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading
                            ? "Sharing..."
                            : "Share"}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300"
                    >
                        Cancel
                    </button>

                </div>

            </form>
             < ToastContainer />

        </div>
    );
}

export default ShareCredential;