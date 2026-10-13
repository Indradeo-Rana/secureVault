import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { ShieldCheck } from "lucide-react";
 import API_BASE_URL from "../config/api";

function SecuritySettings() {

    const navigate = useNavigate();

    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [secret, setSecret] = useState("");
    const [otpauthUri, setOtpauthUri] = useState("");

    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const setupMfa = async () => {

        if (!token) {
            setError("You are not logged in.");
            return;
        }

        try {

            setLoading(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_BASE_URL}/api/auth/mfa/setup`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load MFA settings."
                );
            }

            /*
             * IMPORTANT:
             * Backend returns:
             * enabled: true  -> MFA enabled
             * enabled: false -> MFA disabled
             */
            setMfaEnabled(Boolean(data.enabled));

            if (data.enabled) {

                // MFA enabled hai.
                // QR/setup data ko hide rakho.
                setSecret("");
                setOtpauthUri("");

            } else {

                // MFA disabled hai.
                // QR/setup data show karo.
                setSecret(data.secret || "");
                setOtpauthUri(data.otpauthUri || "");
            }

        } catch (err) {

            console.error("MFA setup error:", err);

            setError(
                err.message || "Unable to load MFA settings."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        setupMfa();

    }, []);


    const handleEnableMfa = async (e) => {

        e.preventDefault();

        if (!code || code.length !== 6) {

            setError(
                "Please enter the 6-digit authenticator code."
            );

            return;
        }

        try {

            setLoading(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `${API_BASE_URL}/api/auth/mfa/enable`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code: code,
                    }),
                }
            );

            const data = await response.text();

            if (!response.ok) {

                throw new Error(
                    data || "Invalid MFA code."
                );
            }

            setMfaEnabled(true);

            setCode("");
            setSecret("");
            setOtpauthUri("");

            setMessage(
                "MFA has been enabled successfully."
            );

        } catch (err) {

            console.error("Enable MFA error:", err);

            setError(
                err.message || "Unable to enable MFA."
            );

        } finally {

            setLoading(false);
        }
    };


    const handleDisableMfa = async (e) => {

        e.preventDefault();

        if (!code || code.length !== 6) {

            setError(
                "Please enter the current 6-digit authenticator code."
            );

            return;
        }

        try {

            setLoading(true);
            setError("");
            setMessage("");

            const response = await fetch(
                "/api/auth/mfa/disable",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code: code,
                    }),
                }
            );

            const data = await response.text();

            if (!response.ok) {

                throw new Error(
                    data || "Invalid MFA code."
                );
            }

            /*
             * MFA successfully disabled
             */
            setMfaEnabled(false);

            setCode("");

            setSecret("");
            setOtpauthUri("");

            setMessage(
                "MFA has been disabled successfully."
            );

            /*
             * Reload MFA setup information.
             *
             * Backend will generate a new secret because
             * disable() sets mfaSecret = null.
             */
            await setupMfa();

        } catch (err) {

            console.error("Disable MFA error:", err);

            setError(
                err.message || "Unable to disable MFA."
            );

        } finally {

            setLoading(false);
        }
    };


    if (!token) {

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center w-full max-w-md">

                    <h2 className="text-xl font-semibold text-slate-800">
                        Authentication Required
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                        Please login to access Security Settings.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="mt-5 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Login
                    </button>

                </div>

            </div>
        );
    }


    return (

        <Layout>

            <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Header */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                            Security Settings
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Manage your SecureVault account security.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition"
                    >
                        Cancel
                    </button>

                </div>


                {/* Main Card */}

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <ShieldCheck size={22} aria-hidden="true" />
                        </div>

                        <div>

                            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                                Multi-Factor Authentication
                            </h2>

                            <p className="text-sm text-slate-500">
                                Add an extra layer of security to your account.
                            </p>

                        </div>

                    </div>


                    {/* Loading */}

                    {loading && !mfaEnabled && !secret && (

                        <div className="flex items-center justify-center py-8">

                            <div className="text-center">

                                <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>

                                <p className="text-sm text-slate-500">
                                    Loading MFA settings...
                                </p>

                            </div>

                        </div>

                    )}


                    {/* ========================= */}
                    {/* MFA ENABLED */}
                    {/* ========================= */}

                    {mfaEnabled && (

                        <div className="mt-4">

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5">

                                <div className="flex gap-3">

                                    <div className="text-xl">
                                        ✓
                                    </div>

                                    <div>

                                        <h3 className="font-semibold text-green-800">
                                            MFA is enabled
                                        </h3>

                                        <p className="text-sm text-green-700 mt-1">
                                            Your account is protected with multi-factor authentication.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Disable MFA */}

                            <div className="mt-6 border border-red-200 rounded-xl p-4 sm:p-5">

                                <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                                    Disable MFA
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    Enter the current 6-digit code from your authenticator app to disable MFA.
                                </p>


                                <form
                                    onSubmit={handleDisableMfa}
                                    className="mt-5 space-y-4"
                                >

                                    <div>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Authenticator Code
                                        </label>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength="6"
                                            value={code}
                                            onChange={(e) =>
                                                setCode(
                                                    e.target.value.replace(/\D/g, "")
                                                )
                                            }
                                            placeholder="Enter 6-digit code"
                                            className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 tracking-widest text-center text-lg"
                                        />

                                    </div>


                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading
                                            ? "Disabling MFA..."
                                            : "Disable MFA"}
                                    </button>

                                </form>

                            </div>

                        </div>

                    )}


                    {/* ========================= */}
                    {/* MFA DISABLED */}
                    {/* ========================= */}

                    {!mfaEnabled && secret && (

                        <div className="mt-4">

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">

                                <p className="text-sm text-yellow-800">
                                    MFA is currently disabled. Follow the steps below to enable it.
                                </p>

                            </div>


                            {/* QR Code */}

                            {otpauthUri && (

                                <div className="flex flex-col items-center">

                                    <h3 className="font-semibold text-slate-800 mb-4">
                                        1. Scan this QR code
                                    </h3>

                                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

                                        <QRCodeSVG
                                            value={otpauthUri}
                                            size={220}
                                            includeMargin={true}
                                        />

                                    </div>

                                </div>

                            )}


                            {/* Secret */}

                            <div className="mt-6">

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    2. Secret Key
                                </label>

                                <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 break-all text-sm font-mono text-slate-700">
                                    {secret}
                                </div>

                            </div>


                            {/* Enable Form */}

                            <form
                                onSubmit={handleEnableMfa}
                                className="mt-6 space-y-4"
                            >

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        3. Enter Authenticator Code
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength="6"
                                        value={code}
                                        onChange={(e) =>
                                            setCode(
                                                e.target.value.replace(/\D/g, "")
                                            )
                                        }
                                        placeholder="Enter 6-digit code"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tracking-widest text-center text-lg"
                                    />

                                </div>


                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? "Enabling MFA..."
                                        : "Enable MFA"}
                                </button>

                            </form>

                        </div>

                    )}


                    {/* Success Message */}

                    {message && (

                        <div className="mt-5 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm">
                            {message}
                        </div>

                    )}


                    {/* Error Message */}

                    {error && (

                        <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                            {error}
                        </div>

                    )}

                </div>

            </div>

        </Layout>
    );
}

export default SecuritySettings;