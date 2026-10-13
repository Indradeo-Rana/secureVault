import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API_BASE_URL from "../config/api";

function Settings() {

    const [profile, setProfile] = useState({
        username: "",
        email: "",
        mfaEnabled: false,
        role: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    // Fetch Profile
    useEffect(() => {

        const fetchProfile = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE_URL}/api/profile`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {

                    if (response.status === 401) {
                        throw new Error(
                            "Your session has expired. Please login again."
                        );
                    }

                    throw new Error(
                        "Failed to fetch profile"
                    );
                }

                const data = await response.json();

                setProfile({
                    username: data.username || "",
                    email: data.email || "",
                    mfaEnabled: data.mfaEnabled || false,
                    role: data.role || ""
                });

            } catch (err) {

                setError(err.message);

            } finally {

                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        } else {
            setError("Please login first.");
            setLoading(false);
        }

    }, [token]);

    // Handle Input
    const handleChange = (event) => {

        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));

        setMessage("");
        setError("");
    };


    // Update Profile
    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setMessage("");
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        username: profile.username,
                        email: profile.email
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update profile"
                );
            }

            setProfile((previous) => ({
                ...previous,
                username: data.username || previous.username,
                email: data.email || previous.email,
                mfaEnabled: data.mfaEnabled || false,
                role: data.role || previous.role
            }));

            setMessage("Profile updated successfully.");

        } catch (err) {

            setError(err.message);

        } finally {

            setSaving(false);
        }
    };

    // loading state
    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">
                    Loading profile...
                </p>
            </div>
        );
    }

    return (
        <Layout>
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-3xl mx-auto">

                <div className="bg-white rounded-xl shadow-md p-6">

                    {/* Header */}

                    <div className="mb-6">

                        <h1 className="text-2xl font-bold text-gray-800">
                            Profile & Settings
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Manage your account information
                        </p>

                    </div>


                    {/* Success Message */}

                    {message && (
                        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700">
                            {message}
                        </div>
                    )}


                    {/* Error Message */}

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">
                            {error}
                        </div>
                    )}


                    {/* Profile Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Username */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>

                            <input
                                type="text"
                                name="username"
                                value={profile.username}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />

                        </div>


                        {/* Email */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />

                        </div>


                        {/* Role */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>

                            <input
                                type="text"
                                value={profile.role}
                                disabled
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                            />

                        </div>


                        {/* MFA Status */}

                        <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">

                            <div>

                                <p className="font-medium text-gray-800">
                                    Multi-Factor Authentication
                                </p>

                                <p className="text-sm text-gray-500">
                                    Add an additional layer of security to your account.
                                </p>

                            </div>

                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    profile.mfaEnabled
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {profile.mfaEnabled
                                    ? "Enabled"
                                    : "Disabled"}
                            </span>

                        </div>


                        {/* Save Button */}

                        <div className="pt-2">

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
        </Layout>
    );
}

export default Settings;