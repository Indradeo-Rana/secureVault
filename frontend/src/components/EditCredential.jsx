import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import PasswordGenerator from "../components/PasswordGenerator";
import PasswordStrength from "../components/PasswordStrength";
import { ToastContainer,toast } from "react-toastify";
import API_BASE_URL from "../config/api";

function EditCredential() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [website, setWebsite] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const fetchCredential = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_BASE_URL}/api/credential/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch credential"
                    );
                }

                const data = await response.json();

                setTitle(data.title || "");
                setUsername(data.username || "");
                setPassword(data.password || "");
                setWebsite(data.website || "");
                setNotes(data.notes || "");

            } catch (error) {

                console.error(error);

                // alert("Failed to load credential");
                toast.error(
                    error.message ||
                    "Failed to load credential. Please try again later."
                );

                navigate("/vault");

            } finally {

                setLoading(false);

            }

        };

        fetchCredential();

    }, [id, navigate]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/credential/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title,
                        username,
                        password,
                        website,
                        notes
                    })
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to update credential"
                );
            }

            // alert("Credential updated successfully");
            toast.success("Credential updated successfully");

            navigate("/vault");

        } catch (error) {

            console.error(error);

            // alert("Failed to update credential");
            toast.error(
                error.message ||
                "Failed to update credential. Please try again later."
            );

        }

    };


    if (loading) {

        return (
            <Layout>
                <div className="text-center py-20">
                    Loading...
                </div>
            </Layout>
        );

    }


    return (
        <Layout>

            <div className="max-w-3xl mx-auto">

                <div className="mb-6">

                    <button
                        onClick={() => navigate("/vault")}
                        className="text-blue-600 hover:underline mb-3"
                    >
                        ← Back to Vault
                    </button>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Edit Credential
                    </h1>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-7"
                >

                    <div className="mb-5">

                        <label className="block text-sm font-medium mb-2">
                            Title
                        </label>

                        <input
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    <div className="mb-5">

                        <label className="block text-sm font-medium mb-2">
                            Username
                        </label>

                        <input
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    <div className="mb-5">

                        <label className="block text-sm font-medium mb-2">
                            Password
                        </label>

                        <div className="flex gap-2">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="px-4 border border-slate-300 rounded-lg"
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


                    <div className="mb-5">

                        <label className="block text-sm font-medium mb-2">
                            Website
                        </label>

                        <input
                            value={website}
                            onChange={(e) =>
                                setWebsite(e.target.value)
                            }
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    <div className="mb-6">

                        <label className="block text-sm font-medium mb-2">
                            Notes
                        </label>

                        <textarea
                            rows="4"
                            value={notes}
                            onChange={(e) =>
                                setNotes(e.target.value)
                            }
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    <div className="flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={() => navigate("/vault")}
                            className="px-5 py-3 border rounded-lg hover:bg-slate-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Update Credential
                        </button>

                    </div>

                </form>
                 < ToastContainer />

            </div>

        </Layout>
    );
}

export default EditCredential;