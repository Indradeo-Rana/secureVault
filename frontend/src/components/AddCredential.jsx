import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import PasswordGenerator from "../components/PasswordGenerator";
import PasswordStrength from "../components/PasswordStrength";
import { ToastContainer, toast } from "react-toastify";
import API_BASE_URL from "../config/api";

function AddCredential() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [website, setWebsite] = useState("");
    const [notes, setNotes] = useState("");

    // Task 7 fields
    const [category, setCategory] = useState("Website");
    const [credentialType, setCredentialType] = useState("LOGIN");
    const [favorite, setFavorite] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        // Basic validation
        if (!title.trim()) {
            toast.error("Please enter a title.");
            return;
        }

        if (credentialType === "LOGIN") {

            if (!username.trim()) {
                toast.error("Please enter a username.");
                return;
            }

            if (!password.trim()) {
                toast.error("Please enter a password.");
                return;
            }
        }

        if (credentialType === "SECURE_NOTE" && !notes.trim()) {
            toast.error("Please enter your secure note.");
            return;
        }

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/credential`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title,
                        username:
                            credentialType === "SECURE_NOTE"
                                ? ""
                                : username,
                        password:
                            credentialType === "SECURE_NOTE"
                                ? ""
                                : password,
                        website:
                            credentialType === "SECURE_NOTE"
                                ? ""
                                : website,
                        notes,
                        category,
                        credentialType,
                        favorite
                    })
                }
            );

            if (!response.ok) {

                let errorMessage =
                    "Failed to add credential.";

                try {
                    const errorData =
                        await response.json();

                    if (errorData?.message) {
                        errorMessage =
                            errorData.message;
                    }
                } catch {
                    // Backend did not return JSON
                }

                throw new Error(errorMessage);
            }

            toast.success(
                "Credential added successfully."
            );

            setTimeout(() => {
                navigate("/vault");
            }, 700);

        } catch (error) {

            console.error(
                "Add credential error:",
                error
            );

            toast.error(
                error.message ||
                "Failed to add credential. Please try again."
            );
        }
    };

    return (
        <Layout>

            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-6">

                    <button
                        onClick={() => navigate("/vault")}
                        className="text-blue-600 hover:underline mb-3"
                    >
                        ← Back to Vault
                    </button>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Add Credential
                    </h1>

                    <p className="text-slate-500 mt-1">
                        Store a new credential securely.
                    </p>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-7"
                >

                    {/* Title */}
                    <div className="mb-5">

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Title
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Google"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    {/* Credential Type */}
                    <div className="mb-5">

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Credential Type
                        </label>

                        <select
                            value={credentialType}
                            onChange={(e) =>
                                setCredentialType(
                                    e.target.value
                                )
                            }
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        >

                            <option value="LOGIN">
                                Login
                            </option>

                            <option value="SECURE_NOTE">
                                Secure Note
                            </option>

                        </select>

                    </div>


                    {/* Category */}
                    <div className="mb-5">

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Category
                        </label>

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(
                                    e.target.value
                                )
                            }
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        >

                            <option value="Website">
                                Website
                            </option>

                            <option value="Social">
                                Social
                            </option>

                            <option value="Email">
                                Email
                            </option>

                            <option value="Banking">
                                Banking
                            </option>

                            <option value="API Keys">
                                API Keys
                            </option>

                            <option value="Secure Notes">
                                Secure Notes
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>

                    </div>


                    {/* Username */}
                    {credentialType === "LOGIN" && (
                        <div className="mb-5">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Username
                            </label>

                            <input
                                type="text"
                                placeholder="Username or email"
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>
                    )}


                    {/* Password */}
                    {credentialType === "LOGIN" && (
                        <div className="mb-5">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>

                            <div className="flex gap-2">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="px-4 border border-slate-300 rounded-lg hover:bg-slate-100"
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>


                            <PasswordGenerator
                                setPassword={setPassword}
                            />

                            <PasswordStrength
                                password={password}
                            />

                        </div>
                    )}


                    {/* Website */}
                    {credentialType === "LOGIN" && (
                        <div className="mb-5">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Website
                            </label>

                            <input
                                type="text"
                                placeholder="https://example.com"
                                value={website}
                                onChange={(e) =>
                                    setWebsite(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>
                    )}


                    {/* Notes */}
                    <div className="mb-5">

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            {credentialType === "SECURE_NOTE"
                                ? "Secure Note"
                                : "Notes"}
                        </label>

                        <textarea
                            rows="5"
                            placeholder={
                                credentialType === "SECURE_NOTE"
                                    ? "Write your secure note..."
                                    : "Additional notes..."
                            }
                            value={notes}
                            onChange={(e) =>
                                setNotes(
                                    e.target.value
                                )
                            }
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    {/* Favorite */}
                    <div className="mb-6">

                        <label className="flex items-center gap-3 cursor-pointer">

                            <input
                                type="checkbox"
                                checked={favorite}
                                onChange={(e) =>
                                    setFavorite(
                                        e.target.checked
                                    )
                                }
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                            />

                            <span className="text-sm font-medium text-slate-700">
                                Add to favorites
                            </span>

                        </label>

                    </div>


                    {/* Buttons */}
                    <div className="flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/vault")
                            }
                            className="px-5 py-3 border border-slate-300 rounded-lg hover:bg-slate-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            Save Credential
                        </button>

                    </div>

                </form>

                <ToastContainer />

            </div>

        </Layout>
    );
}

export default AddCredential;

