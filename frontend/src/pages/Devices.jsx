import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDeviceId } from "../utils/deviceId";
import Layout from "../components/Layout";
import API_BASE_URL from "../config/api";

export default function Devices() {

    const navigate = useNavigate();

    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const token =
        localStorage.getItem("token");

    const loadDevices = async () => {

        setLoading(true);
        setError("");

        try {

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/devices`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,
                        "X-Device-Id":
                            getDeviceId()
                    }
                }
            );

            if (response.status === 401) {

                localStorage.removeItem("token");

                navigate("/login");

                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to load devices."
                );
            }

            const data =
                await response.json();

            setDevices(data);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load devices."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadDevices();
    }, []);

    const handleRevoke = async (deviceId) => {

        setActionLoading(deviceId);

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/devices/${deviceId}/revoke`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,
                        "X-Device-Id":
                            getDeviceId()
                    }
                }
            );

            if (response.status === 401) {

                localStorage.removeItem("token");

                navigate("/login");

                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to revoke device."
                );
            }

            await loadDevices();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to revoke device."
            );

        } finally {

            setActionLoading(null);
        }
    };

    const handleRestore = async (deviceId) => {

        setActionLoading(deviceId);

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/devices/${deviceId}/restore`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,
                        "X-Device-Id":
                            getDeviceId()
                    }
                }
            );

            if (response.status === 401) {

                localStorage.removeItem("token");

                navigate("/login");

                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to restore device."
                );
            }

            await loadDevices();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to restore device."
            );

        } finally {

            setActionLoading(null);
        }
    };

    const formatDate = (date) => {

        if (!date) {
            return "Unknown";
        }

        return new Date(date).toLocaleString();
    };

    if (loading) {

        return (
            <div className="p-6">
                <p className="text-slate-600">
                    Loading devices...
                </p>
            </div>
        );
    }

    return (
        <Layout>    
        <div className="p-6">

            <div className="max-w-5xl mx-auto">

                <div className="flex items-center justify-between mb-6">

                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            My Devices
                        </h1>

                        <p className="text-slate-500 mt-1">
                            Manage devices that have accessed your SecureVault account.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        Back
                    </button>

                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                        {error}
                    </div>
                )}

                {devices.length === 0 ? (

                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">

                        <h2 className="text-xl font-semibold text-slate-700">
                            No devices found
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Your authenticated devices will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {devices.map((device) => {

                            const isRevoked =
                                device.revoked === true;

                            const isCurrentDevice =
                                device.deviceId ===
                                getDeviceId();

                            return (
                                <div
                                    key={device.id}
                                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                                >

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                        <div>

                                            <div className="flex items-center gap-3">

                                                <h2 className="text-lg font-semibold text-slate-800">
                                                    {device.deviceName ||
                                                        "Unknown Device"}
                                                </h2>

                                                {isCurrentDevice && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                        Current Device
                                                    </span>
                                                )}

                                                {isRevoked ? (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                                        Revoked
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                        Active
                                                    </span>
                                                )}

                                            </div>

                                            <div className="mt-3 space-y-1 text-sm text-slate-600">

                                                <p>
                                                    <strong>Type:</strong>{" "}
                                                    {device.deviceType || "Unknown"}
                                                </p>

                                                <p>
                                                    <strong>Browser:</strong>{" "}
                                                    {device.browser || "Unknown"}
                                                </p>

                                                <p>
                                                    <strong>Operating System:</strong>{" "}
                                                    {device.operatingSystem || "Unknown"}
                                                </p>

                                                <p>
                                                    <strong>IP Address:</strong>{" "}
                                                    {device.ipAddress || "Unknown"}
                                                </p>

                                                <p>
                                                    <strong>First Seen:</strong>{" "}
                                                    {formatDate(device.firstSeen)}
                                                </p>

                                                <p>
                                                    <strong>Last Seen:</strong>{" "}
                                                    {formatDate(device.lastSeen)}
                                                </p>

                                            </div>

                                        </div>

                                        <div>

                                            {isRevoked ? (

                                                <button
                                                    onClick={() =>
                                                        handleRestore(
                                                            device.id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        device.id
                                                    }
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                                >
                                                    {actionLoading === device.id
                                                        ? "Restoring..."
                                                        : "Restore"}
                                                </button>

                                            ) : (

                                                <button
                                                    onClick={() =>
                                                        handleRevoke(
                                                            device.id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        device.id
                                                    }
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                                                >
                                                    {actionLoading === device.id
                                                        ? "Revoking..."
                                                        : "Revoke"}
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
        </Layout>
    );
}