import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import {ToastContainer, toast } from "react-toastify";
import API_BASE_URL from "../../config/api";

function ViewCredential() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [credential, setCredential] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchCredential();
    }, [id]);

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

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load credential"
                );

            }

            setCredential(data);

        } catch (error) {

            // console.error(error);
            // alert(error.message);
            toast.error(
                error.message ||
                "Failed to load credential. Please try again later."
            );

            navigate("/shared-with-me");

        } finally {

            setLoading(false);

        }
    };

    if (loading) {

        return (
            <Layout>
                <div className="text-center py-20">
                    Loading credential...
                </div>
            </Layout>
        );
    }

    if (!credential) {
        return null;
    }

    return (

        <Layout>

            <div className="max-w-2xl mx-auto">

                <button
                    onClick={() =>
                        navigate("/vault")
                    }
                    className="mb-5 text-blue-600 hover:underline"
                >
                    ← Back
                </button>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">

                    <div className="flex justify-between items-start">

                        <div>

                            <h1 className="text-2xl font-bold text-slate-800">
                                {credential.title}
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                {credential.username}
                            </p>

                        </div>

                    </div>

                    <div className="mt-6 space-y-5">

                        {/* Username */}

                        <div>

                            <p className="text-xs text-slate-400 uppercase">
                                Username
                            </p>

                            <p className="mt-1 text-slate-700">
                                {credential.username}
                            </p>

                        </div>

                        {/* Password */}

                        <div>

                            <p className="text-xs text-slate-400 uppercase">
                                Password
                            </p>

                            <div className="flex items-center gap-3 mt-1">

                                <p className="font-mono text-slate-700">
                                    {showPassword
                                        ? credential.password
                                        : "••••••••••••"}
                                </p>

                                <button
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="text-blue-600 text-sm hover:underline"
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        {/* Website */}

                        <div>

                            <p className="text-xs text-slate-400 uppercase">
                                Website
                            </p>

                            <p className="mt-1 text-blue-600">
                                {credential.website ||
                                    "No website"}
                            </p>

                        </div>

                        {/* Notes */}

                        <div>

                            <p className="text-xs text-slate-400 uppercase">
                                Notes
                            </p>

                            <p className="mt-1 text-slate-600">
                                {credential.notes ||
                                    "No notes"}
                            </p>

                        </div>

                    </div>

                </div>
                 < ToastContainer />

            </div>

        </Layout>
    );
}

export default ViewCredential;