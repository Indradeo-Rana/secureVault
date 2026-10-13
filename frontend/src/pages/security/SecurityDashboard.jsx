
import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../config/api";
import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";

const API_ROOT =
    typeof API_BASE_URL === "string"
        ? API_BASE_URL.replace(/\/+$/, "")
        : String(
              API_BASE_URL?.baseURL ??
              API_BASE_URL?.API_BASE_URL ??
              API_BASE_URL?.url ??
              ""
          ).replace(/\/+$/, "");

const SecurityDashboard = () => {
    const [range, setRange] = useState("TODAY");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAnalytics = useCallback(async () => {
        if (range === "CUSTOM") {
            if (!startDate || !endDate) {
                setError("Please select both start date and end date.");
                return;
            }

            if (startDate > endDate) {
                setError("Start date cannot be after end date.");
                return;
            }
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please login again.");
            setAnalytics(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const requestBody = { range };

            if (range === "CUSTOM") {
                requestBody.startDate = startDate;
                requestBody.endDate = endDate;
            }

            const response = await fetch(
                `${API_ROOT}/api/analytics/security`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Your session has expired. Please login again.");
                }

                if (response.status === 403) {
                    throw new Error("You are not authorized to view security analytics.");
                }

                throw new Error(
                    await response.text() || "Failed to load security analytics."
                );
            }

            setAnalytics(await response.json());
        } catch (err) {
            console.error("Security analytics error:", err);
            setAnalytics(null);
            setError(err.message || "Unable to load security analytics.");
            toast.error(err.message || "Unable to load analytics.");
        } finally {
            setLoading(false);
        }
    }, [range, startDate, endDate]);

    useEffect(() => {
        if (range === "TODAY" || range === "LAST_7_DAYS") {
            fetchAnalytics();
        }
    }, [range, fetchAnalytics]);

    const handleRangeChange = (selectedRange) => {
        setRange(selectedRange);
        setError("");
    };

    const handleCustomDateApply = () => {
        if (!startDate || !endDate) {
            setError("Please select both start date and end date.");
            return;
        }

        if (startDate > endDate) {
            setError("Start date cannot be after end date.");
            return;
        }

        fetchAnalytics();
    };

    const exportCSV = () => {
        if (!analytics) {
            toast.error("Load analytics before exporting.");
            return;
        }

        const rows = [
            ["SecureVault Security Analytics"],
            ["Start Date", analytics.startDate],
            ["End Date", analytics.endDate],
            [],
            ["Metric", "Value"],
            ["Successful Logins", analytics.successfulLogins ?? 0],
            ["Failed Logins", analytics.failedLogins ?? 0],
            ["Suspicious Activities", analytics.suspiciousActivities ?? 0],
            ["Active Security Alerts", analytics.activeSecurityAlerts ?? 0],
            [],
            ["Timestamp", "Activity Type", "Description"],
            ...(analytics.recentSecurityActivity || []).map((activity) => [
                activity.timestamp ?? "",
                activity.type ?? "",
                activity.description ?? "",
            ]),
        ];

        const csv = rows
            .map((row) =>
                row
                    .map((value) => {
                        let safe = String(value ?? "");

                        if (/^[=+\-@\t\r]/.test(safe)) {
                            safe = `'${safe}`;
                        }

                        return `"${safe.replace(/"/g, '""')}"`;
                    })
                    .join(",")
            )
            .join("\r\n");

        const blob = new Blob(["\uFEFF", csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `securevault-analytics-${analytics.startDate}-to-${analytics.endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success("Analytics CSV downloaded.");
    };

    const getActivityIcon = (type) => {
        const styles = {
            LOGIN_SUCCESS: "bg-green-100 text-green-700",
            LOGIN_FAILURE: "bg-red-100 text-red-700",
            SECURITY_ALERT: "bg-orange-100 text-orange-700",
            AUDIT: "bg-blue-100 text-blue-700",
        };

        const symbols = {
            LOGIN_SUCCESS: <CheckCircle2 size={18} aria-hidden="true" />,
            LOGIN_FAILURE: <XCircle size={18} aria-hidden="true" />,
            SECURITY_ALERT: <AlertTriangle size={18} aria-hidden="true" />,
            AUDIT: <Info size={18} aria-hidden="true" />,
        };

        return (
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    styles[type] || "bg-slate-100 text-slate-600"
                }`}
                aria-label={getActivityLabel(type)}
            >
                {symbols[type] || <Info size={18} aria-hidden="true" />}
            </div>
        );
    };

    const getActivityLabel = (type) => {
        const labels = {
            LOGIN_SUCCESS: "Successful Login",
            LOGIN_FAILURE: "Failed Login",
            SECURITY_ALERT: "Security Alert",
            AUDIT: "Audit Activity",
        };

        return labels[type] || "Security Activity";
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "Time unavailable";

        const date = new Date(timestamp);

        return Number.isNaN(date.getTime())
            ? String(timestamp)
            : date.toLocaleString();
    };

    const metricCards = [
        {
            title: "Successful Logins",
            value: analytics?.successfulLogins,
            description: "Authentication completed successfully",
            color: "text-green-700",
            icon: <CheckCircle2 size={22} aria-hidden="true" />,
            iconStyle: "bg-green-100",
        },
        {
            title: "Failed Logins",
            value: analytics?.failedLogins,
            description: "Unsuccessful login attempts",
            color: "text-red-700",
            icon: <XCircle size={22} aria-hidden="true" />,
            iconStyle: "bg-red-100",
        },
        {
            title: "Suspicious Activities",
            value: analytics?.suspiciousActivities,
            description: "Recorded security events",
            color: "text-orange-700",
            icon: <AlertTriangle size={22} aria-hidden="true" />,
            iconStyle: "bg-orange-100",
        },
        {
            title: "Active Security Alerts",
            value: analytics?.activeSecurityAlerts,
            description: "Alerts currently requiring attention",
            color: "text-purple-700",
            icon: <Bell size={22} aria-hidden="true" />,
            iconStyle: "bg-purple-100",
        },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Security Dashboard
                            </h1>

                            <p className="mt-2 text-sm text-slate-500 sm:text-base">
                                Monitor account security and recent activity.
                            </p>

                            {analytics && (
                                <p className="mt-2 text-xs text-slate-500">
                                    Showing {analytics.startDate} to {analytics.endDate}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={exportCSV}
                            disabled={!analytics || loading}
                            className="w-full rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            Export Analytics CSV
                        </button>
                    </header>

                    {/* Date range */}
                    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                        <h2 className="mb-4 text-base font-semibold text-slate-900">
                            Select reporting period
                        </h2>

                        <div className="flex flex-wrap gap-2">
                            {[
                                ["TODAY", "Today"],
                                ["LAST_7_DAYS", "Last 7 Days"],
                                ["CUSTOM", "Custom"],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => handleRangeChange(value)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        range === value
                                            ? "bg-slate-900 text-white"
                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {range === "CUSTOM" && (
                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label
                                        htmlFor="analytics-start-date"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Start Date
                                    </label>

                                    <input
                                        id="analytics-start-date"
                                        type="date"
                                        value={startDate}
                                        max={endDate || undefined}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="analytics-end-date"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        End Date
                                    </label>

                                    <input
                                        id="analytics-end-date"
                                        type="date"
                                        value={endDate}
                                        min={startDate || undefined}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleCustomDateApply}
                                        disabled={loading}
                                        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {loading ? "Loading..." : "Apply Date Range"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Error state */}
                    {error && !loading && (
                        <section
                            role="alert"
                            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <p className="text-sm font-medium text-red-700">
                                {error}
                            </p>

                            <button
                                onClick={fetchAnalytics}
                                className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </section>
                    )}

                    {/* Loading state */}
                    {loading && (
                        <section
                            aria-label="Loading security analytics"
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                        >
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-36 animate-pulse rounded-2xl border border-slate-100 bg-white"
                                />
                            ))}
                        </section>
                    )}

                    {/* Analytics */}
                    {!loading && analytics && (
                        <>
                            <section>
                                <h2 className="mb-4 text-lg font-bold text-slate-900">
                                    Security Overview
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {metricCards.map((metric) => (
                                        <div
                                            key={metric.title}
                                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-500">
                                                        {metric.title}
                                                    </p>

                                                    <p className={`mt-3 break-words text-3xl font-bold ${metric.color}`}>
                                                        {metric.value ?? 0}
                                                    </p>
                                                </div>

                                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${metric.iconStyle}`}>
                                                    {metric.icon}
                                                </div>
                                            </div>

                                            <p className="mt-3 text-xs leading-5 text-slate-400">
                                                {metric.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Recent activity */}
                            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Recent Security Activity
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Recent events for the selected period.
                                    </p>
                                </div>

                                {Array.isArray(analytics.recentSecurityActivity) &&
                                analytics.recentSecurityActivity.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {analytics.recentSecurityActivity.map(
                                            (activity, index) => (
                                                <article
                                                    key={`${activity.type || "activity"}-${activity.timestamp || index}-${index}`}
                                                    className="flex items-start gap-3 px-4 py-4 transition hover:bg-slate-50 sm:items-center sm:gap-4 sm:px-6"
                                                >
                                                    {getActivityIcon(activity.type)}

                                                    <div className="min-w-0 flex-1">
                                                        <p className="break-words text-sm font-semibold text-slate-900">
                                                            {activity.description || getActivityLabel(activity.type)}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {getActivityLabel(activity.type)}
                                                        </p>

                                                        <p className="mt-2 text-xs text-slate-400 sm:hidden">
                                                            {formatTimestamp(activity.timestamp)}
                                                        </p>
                                                    </div>

                                                    <time className="hidden shrink-0 text-xs text-slate-400 sm:block">
                                                        {formatTimestamp(activity.timestamp)}
                                                    </time>
                                                </article>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="px-5 py-14 text-center sm:px-6">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500">
                                            ✓
                                        </div>

                                        <h3 className="mt-4 font-semibold text-slate-900">
                                            No security activity
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                            No events were recorded for the selected date range.
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Security status */}
                            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="font-semibold text-slate-900">
                                            Account Security Status
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Based on the active alert count returned by the backend.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2.5 w-2.5 rounded-full ${
                                                Number(analytics.activeSecurityAlerts || 0) > 0
                                                    ? "bg-orange-500"
                                                    : "bg-green-500"
                                            }`}
                                        />

                                        <span className="text-sm font-semibold text-slate-700">
                                            {Number(analytics.activeSecurityAlerts || 0) > 0
                                                ? "Attention required"
                                                : "No active alerts"}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {!loading && !analytics && !error && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                            <p className="font-semibold text-slate-800">
                                No analytics available
                            </p>
                            <button
                                onClick={fetchAnalytics}
                                className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
                            >
                                Load Analytics
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </Layout>
    );
};

export default SecurityDashboard;
