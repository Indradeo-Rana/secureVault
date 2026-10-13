import React, { useEffect, useState } from "react";
import SharedCredentialCard from "../../components/SharedCredentialCard";
import Layout from "../../components/Layout";
import { Inbox } from "lucide-react";
import API_BASE_URL from "../../config/api";

function ReceivedShares() {

    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchReceivedCredentials();
    }, []);

    const fetchReceivedCredentials = async () => {

        try {

            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Please login again.");
            }

            const response = await fetch(
                `${API_BASE_URL}/api/shares/received`,
                {
                    method: "GET",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load received credentials"
                );
            }

            setShares(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Received credentials error:",
                error
            );

            setError(
                error.message ||
                "Unable to load received credentials"
            );

        } finally {

            setLoading(false);

        }
    };



    /* ---------------- LOADING ---------------- */

    if (loading) {

        return (
            <div className="p-5 text-center text-slate-500">

                Loading received credentials...

            </div>
        );

    }

    /* ---------------- ERROR ---------------- */

    if (error) {

        return (
            <div className="p-5">

                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">

                    {error}

                </div>

                <button
                    type="button"
                    onClick={fetchReceivedCredentials}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>

            </div>
        );

    }

    /* ---------------- EMPTY ---------------- */

    if (shares.length === 0) {

        return (
            <div className="p-5">

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">

                    <Inbox className="mx-auto mb-3 text-slate-400" size={40} aria-hidden="true" />

                    <h2 className="text-lg font-semibold text-slate-700">
                        No Shared Credentials
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        No credentials have been shared with you yet.
                    </p>

                </div>

            </div>
        );

    }

    /* ---------------- SUCCESS ---------------- */

    return (
        <Layout >
        <div className="p-5">

            <div className="flex items-center justify-between mb-5">

                <div>

                    <h1 className="text-2xl font-bold text-slate-800">
                        Received Credentials
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Credentials shared with you
                    </p>

                </div>

                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">

                    {shares.length}{" "}

                    {shares.length === 1
                        ? "Credential"
                        : "Credentials"}

                </span>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {shares.map((share) => (

                    <SharedCredentialCard
                        key={share.id}
                        share={share}
                    />

                ))}

            </div>

        </div>
        </Layout>
    );
}

export default ReceivedShares;

