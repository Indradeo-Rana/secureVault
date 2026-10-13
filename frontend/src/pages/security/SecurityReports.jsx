
import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../config/api";
import { AlertTriangle, Bell } from "lucide-react";

const API_ROOT =
    typeof API_BASE_URL === "string"
        ? API_BASE_URL.replace(/\/+$/, "")
        : String(
              API_BASE_URL?.baseURL ??
              API_BASE_URL?.API_BASE_URL ??
              API_BASE_URL?.url ??
              ""
          ).replace(/\/+$/, "");

const formatValue = (value) =>
    value === null || value === undefined ? 0 : value;

const SecurityReports = () => {
    const [range, setRange] = useState("TODAY");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState("");

    const getToken = () => localStorage.getItem("token");

    const fetchReport = useCallback(async () => {
        if (range === "CUSTOM") {
            if (!startDate || !endDate) {
                toast.error("Please select both dates.");
                return;
            }

            if (startDate > endDate) {
                toast.error("Start date cannot be after end date.");
                return;
            }
        }

        const token = getToken();

        if (!token) {
            setReport(null);
            toast.error("Your session has expired. Please login again.");
            return;
        }

        try {
            setLoading(true);

            const body = { range };

            if (range === "CUSTOM") {
                body.startDate = startDate;
                body.endDate = endDate;
            }

            const response = await fetch(
                `${API_ROOT}/api/reports/security`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please login again.");
                }

                if (response.status === 403) {
                    throw new Error("You are not authorized to view this report.");
                }

                throw new Error(
                    await response.text() || "Failed to load security report."
                );
            }

            setReport(await response.json());
        } catch (error) {
            console.error("Security report error:", error);
            setReport(null);
            toast.error(error.message || "Failed to load report.");
        } finally {
            setLoading(false);
        }
    }, [range, startDate, endDate]);

    useEffect(() => {
        if (range === "TODAY" || range === "LAST_7_DAYS") {
            fetchReport();
        }
    }, [range, fetchReport]);

    const buildQuery = () => {
        const params = new URLSearchParams({ range });

        if (range === "CUSTOM") {
            params.set("startDate", startDate);
            params.set("endDate", endDate);
        }

        return params.toString();
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const exportServerReport = async (format) => {
        if (range === "CUSTOM") {
            if (!startDate || !endDate) {
                toast.error("Please select both dates.");
                return;
            }

            if (startDate > endDate) {
                toast.error("Start date cannot be after end date.");
                return;
            }
        }

        const token = getToken();

        if (!token) {
            toast.error("Please login again.");
            return;
        }

        try {
            setExporting(format);

            const response = await fetch(
                `${API_ROOT}/api/reports/SECURITY/export?format=${format}&${buildQuery()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    await response.text() ||
                    `Failed to export ${format.toUpperCase()} report.`
                );
            }

            const blob = await response.blob();
            const extension = format === "excel" ? "xlsx" : "pdf";

            downloadBlob(
                blob,
                `securevault-security-report.${extension}`
            );

            toast.success(`${format.toUpperCase()} report downloaded.`);
        } catch (error) {
            console.error("Report export error:", error);
            toast.error(error.message || "Export failed.");
        } finally {
            setExporting("");
        }
    };

    const exportCSV = () => {
        if (!report) {
            toast.error("Load a report before exporting.");
            return;
        }

        const rows = [
            ["SecureVault Security Report"],
            ["Start Date", report.startDate],
            ["End Date", report.endDate],
            [],
            ["Metric", "Value"],
            ["Successful Logins", formatValue(report.successfulLogins)],
            ["Failed Logins", formatValue(report.failedLogins)],
            ["Suspicious Activities", formatValue(report.suspiciousActivities)],
            ["Active Security Alerts", formatValue(report.activeSecurityAlerts)],
            ["Total Passwords", formatValue(report.totalPasswords)],
            ["Strong Passwords", formatValue(report.strongPasswords)],
            ["Medium Passwords", formatValue(report.mediumPasswords)],
            ["Weak Passwords", formatValue(report.weakPasswords)],
            ["Reused Password Groups", formatValue(report.reusedPasswordGroups)],
        ];

        const csv = rows
            .map((row) =>
                row
                    .map((value) => {
                        let safe = String(value ?? "");

                        // Reduce spreadsheet formula injection risk.
                        if (/^[=+\-@\t\r]/.test(safe)) {
                            safe = `'${safe}`;
                        }

                        return `"${safe.replace(/"/g, '""')}"`;
                    })
                    .join(",")
            )
            .join("\r\n");

        downloadBlob(
            new Blob(["\uFEFF", csv], {
                type: "text/csv;charset=utf-8;",
            }),
            `securevault-security-report-${report.startDate}-to-${report.endDate}.csv`
        );

        toast.success("CSV report downloaded.");
    };

    const changeRange = (value) => {
        setRange(value);
    };

    const metrics = [
        {
            title: "Successful Logins",
            value: report?.successfulLogins,
            description: "Successful authentication attempts",
            color: "text-green-600",
            icon: "✓",
        },
        {
            title: "Failed Logins",
            value: report?.failedLogins,
            description: "Unsuccessful login attempts",
            color: "text-red-600",
            icon: "!",
        },
        {
            title: "Suspicious Activities",
            value: report?.suspiciousActivities,
            description: "Recorded security events",
            color: "text-orange-600",
            icon: <AlertTriangle size={22} aria-hidden="true" />,
        },
        {
            title: "Active Security Alerts",
            value: report?.activeSecurityAlerts,
            description: "Unread security alerts",
            color: "text-purple-600",
            icon: <Bell size={22} aria-hidden="true" />,
        },
        {
            title: "Total Passwords",
            value: report?.totalPasswords,
            description: "Stored password entries",
            color: "text-slate-800",
        },
        {
            title: "Strong Passwords",
            value: report?.strongPasswords,
            description: "Strong password entries",
            color: "text-green-600",
        },
        {
            title: "Medium Passwords",
            value: report?.mediumPasswords,
            description: "Medium-strength entries",
            color: "text-yellow-600",
        },
        {
            title: "Weak Passwords",
            value: report?.weakPasswords,
            description: "Weak password entries",
            color: "text-red-600",
        },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                Security Reports
                            </h1>
                            <p className="mt-2 text-sm text-slate-500 sm:text-base">
                                Review security activity and password health.
                            </p>

                            {report && (
                                <p className="mt-2 text-xs text-slate-500">
                                    Period: {report.startDate} to {report.endDate}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={exportCSV}
                                disabled={!report || loading || !!exporting}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Export CSV
                            </button>

                            <button
                                onClick={() => exportServerReport("pdf")}
                                disabled={loading || !!exporting}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {exporting === "pdf" ? "Exporting..." : "Download PDF"}
                            </button>

                            <button
                                onClick={() => exportServerReport("excel")}
                                disabled={loading || !!exporting}
                                className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                            >
                                {exporting === "excel" ? "Exporting..." : "Download Excel"}
                            </button>
                        </div>
                    </header>

                    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                        <h2 className="mb-4 text-base font-semibold text-slate-900">
                            Report date range
                        </h2>

                        <div className="flex flex-wrap gap-2">
                            {[
                                ["TODAY", "Today"],
                                ["LAST_7_DAYS", "Last 7 Days"],
                                ["CUSTOM", "Custom"],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => changeRange(value)}
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
                                        htmlFor="report-start-date"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Start Date
                                    </label>
                                    <input
                                        id="report-start-date"
                                        type="date"
                                        value={startDate}
                                        max={endDate || undefined}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="report-end-date"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        End Date
                                    </label>
                                    <input
                                        id="report-end-date"
                                        type="date"
                                        value={endDate}
                                        min={startDate || undefined}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={fetchReport}
                                        disabled={loading}
                                        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {loading ? "Loading..." : "Apply Date Range"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {loading && (
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
                                />
                            ))}
                        </div>
                    )}

                    {!loading && !report && (
                        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
                            <p className="font-semibold text-slate-800">
                                Report unavailable
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                Check your connection and try loading the report again.
                            </p>
                            <button
                                onClick={fetchReport}
                                className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && report && (
                        <>
                            <section className="mb-8">
                                <h2 className="mb-4 text-lg font-bold text-slate-900">
                                    Login & Security Overview
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {metrics.slice(0, 4).map((metric) => (
                                        <ReportCard
                                            key={metric.title}
                                            {...metric}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="mb-8">
                                <h2 className="mb-4 text-lg font-bold text-slate-900">
                                    Password Health
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {metrics.slice(4).map((metric) => (
                                        <ReportCard
                                            key={metric.title}
                                            {...metric}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">
                                            Password Reuse
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Reused password groups reported by the password-health service.
                                        </p>
                                    </div>

                                    <span className="inline-flex w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800">
                                        {formatValue(report.reusedPasswordGroups)} group(s)
                                    </span>
                                </div>

                                <p className="mt-4 text-sm text-slate-600">
                                    {Number(report.reusedPasswordGroups || 0) === 0
                                        ? "No password reuse groups were reported."
                                        : "Review reused passwords and replace them with unique passwords."}
                                </p>
                            </section>
                        </>
                    )}
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </Layout>
    );
};

const ReportCard = ({ title, value, description, color = "text-slate-900", icon }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className={`mt-3 break-words text-3xl font-bold ${color}`}>
                    {formatValue(value)}
                </p>
            </div>

            {icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                    {icon}
                </div>
            )}
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-400">{description}</p>
    </div>
);

export default SecurityReports;
