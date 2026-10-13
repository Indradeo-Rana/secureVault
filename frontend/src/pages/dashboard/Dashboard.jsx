import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { getFirebaseToken } from "./../../firebase";
import API_BASE_URL from "../../config/api";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  KeyRound,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

const API_BASE = `${API_BASE_URL}`;

function Dashboard() {
  const navigate = useNavigate();

  const [health, setHealth] = useState({
    totalPasswords: 0,
    strongPasswords: 0,
    mediumPasswords: 0,
    weakPasswords: 0,
  });

  const [reuse, setReuse] = useState([]);

  const [security, setSecurity] = useState({
    successfulLogins: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    activeSecurityAlerts: 0,
    recentSecurityActivity: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    registerPushToken(); // Register the push token when the component mounts
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Password Health
      const healthResponse = await fetch(
        `${API_BASE}/api/analytics/password-health`,
        {
          method: "GET",
          headers,
        }
      );

      if (!healthResponse.ok) {
        throw new Error("Failed to load password health.");
      }

      const healthData = await healthResponse.json();

      // Your current backend returns an array
      setHealth(
        healthData?.[0] || {
          totalPasswords: 0,
          strongPasswords: 0,
          mediumPasswords: 0,
          weakPasswords: 0,
        }
      );

      // Password Reuse
      const reuseResponse = await fetch(
        `${API_BASE}/api/analytics/password-reuse`,
        {
          method: "GET",
          headers,
        }
      );

      if (!reuseResponse.ok) {
        throw new Error("Failed to load password reuse data.");
      }

      const reuseData = await reuseResponse.json();

      setReuse(Array.isArray(reuseData) ? reuseData : []);

      // Security Analytics - TODAY
      const securityResponse = await fetch(
        `${API_BASE}/api/analytics/security`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            range: "TODAY",
          }),
        }
      );

      if (!securityResponse.ok) {
        throw new Error("Failed to load security analytics.");
      }

      const securityData = await securityResponse.json();

      setSecurity({
        successfulLogins: securityData?.successfulLogins ?? 0,
        failedLogins: securityData?.failedLogins ?? 0,
        suspiciousActivities: securityData?.suspiciousActivities ?? 0,
        activeSecurityAlerts: securityData?.activeSecurityAlerts ?? 0,
        recentSecurityActivity:
          securityData?.recentSecurityActivity ?? [],
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // Calculations
  // ------------------------------------

  const totalPasswords = health.totalPasswords ?? 0;
  const strongPasswords = health.strongPasswords ?? 0;
  const mediumPasswords = health.mediumPasswords ?? 0;
  const weakPasswords = health.weakPasswords ?? 0;

  const reusedPasswordGroups = reuse.length;

  const weakOrReused = weakPasswords + reusedPasswordGroups;

  // Password health score
  let healthScore = 0;

  if (totalPasswords > 0) {
    healthScore = Math.round(
      ((strongPasswords * 100 +
        mediumPasswords * 60 +
        weakPasswords * 20) /
        totalPasswords)
    );
  }

  // ------------------------------------
  // Helpers
  // ------------------------------------

  const getActivityIcon = (type) => {
    if (!type) return <ShieldCheck size={17} aria-hidden="true" />;

    const value = type.toLowerCase();

    if (value.includes("login")) {
      return <LockKeyhole size={17} aria-hidden="true" />;
    }

    if (value.includes("alert")) {
      return <AlertTriangle size={17} aria-hidden="true" />;
    }

    if (value.includes("suspicious")) {
      return <AlertTriangle size={17} aria-hidden="true" />;
    }

    if (value.includes("audit")) {
      return <ClipboardList size={17} aria-hidden="true" />;
    }

    if (value.includes("credential")) {
      return <KeyRound size={17} aria-hidden="true" />;
    }

    return <ShieldCheck size={17} aria-hidden="true" />;
  };

  const formatActivityType = (type) => {
    if (!type) return "Security activity";

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // notification registration token
  const registerPushToken = async () => {
    try {
        const token = await getFirebaseToken();

        if (!token) {
            return;
        }

        const jwt = localStorage.getItem("token");

        if (!jwt) {
            console.log("JWT token not found");
            return;
        }

        const response = await fetch(
            `${API_BASE_URL}/api/notifications/device`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    token: token
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to register push token"
            );
        }

        console.log(
            "Firebase push token registered successfully"
        );

    } catch (error) {
        console.error(
            "Push token registration failed:",
            error
        );
    }
};

  // ------------------------------------
  // Loading
  // ------------------------------------

  if (loading) {
    return (
      
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
            <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Error
  // ------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-700">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              onClick={loadDashboard}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
      {/* -------------------------------- */}
      {/* Main Content */}
      {/* -------------------------------- */}

      <main className="mx-auto max-w-7xl p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Overview
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Password health, activity and alerts at a glance.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="w-fit rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ↻ Refresh
          </button>
        </div>

        {/* -------------------------------- */}
        {/* Summary Cards */}
        {/* -------------------------------- */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Password Health */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Password health score
            </p>

            <div className="mt-2 flex items-end gap-1">
              <span className="text-3xl font-bold text-slate-900">
                {healthScore}
              </span>

              <span className="mb-1 text-lg text-slate-400">
                /100
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.min(healthScore, 100)}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Based on your current passwords
            </p>
          </div>

          {/* Total Credentials */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total credentials
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalPasswords}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Stored in your vault
            </p>
          </div>

          {/* Weak / Reused */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Weak / reused
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {weakOrReused}
            </p>

            {weakOrReused > 0 ? (
              <p className="mt-2 text-xs font-medium text-red-500">
                Needs attention
              </p>
            ) : (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                Everything looks good
              </p>
            )}
          </div>

          {/* Active Alerts */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Active security alerts
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {security.activeSecurityAlerts}
            </p>

            {security.activeSecurityAlerts > 0 ? (
              <p className="mt-2 text-xs font-medium text-red-500">
                Review security alerts
              </p>
            ) : (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                No active alerts
              </p>
            )}
          </div>
        </div>

        {/* -------------------------------- */}
        {/* Middle Section */}
        {/* -------------------------------- */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Password Health */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Password health
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Overview of the strength of your stored passwords.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/security/password-analytics")
                }
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View details →
              </button>
            </div>

            {/* Strong */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Strong
                </span>

                <span className="text-slate-500">
                  {strongPasswords}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width:
                      totalPasswords > 0
                        ? `${(strongPasswords / totalPasswords) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Medium
                </span>

                <span className="text-slate-500">
                  {mediumPasswords}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{
                    width:
                      totalPasswords > 0
                        ? `${(mediumPasswords / totalPasswords) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* Weak */}
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Weak
                </span>

                <span className="text-slate-500">
                  {weakPasswords}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{
                    width:
                      totalPasswords > 0
                        ? `${(weakPasswords / totalPasswords) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* Reuse */}
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Reused password groups
                </span>

                <span className="text-sm font-bold text-slate-900">
                  {reusedPasswordGroups}
                </span>
              </div>

              {reusedPasswordGroups === 0 ? (
                <p className="mt-1 text-xs text-emerald-600">
                  No password reuse detected.
                </p>
              ) : (
                <p className="mt-1 text-xs text-red-500">
                  Some passwords are being reused.
                </p>
              )}
            </div>
          </div>

          {/* Security Today */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Security today
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Today's security activity.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Successful logins
                  </p>
                </div>

                <span className="text-xl font-bold text-emerald-600">
                  {security.successfulLogins}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Failed logins
                  </p>
                </div>

                <span className="text-xl font-bold text-red-600">
                  {security.failedLogins}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Suspicious activities
                  </p>
                </div>

                <span className="text-xl font-bold text-amber-600">
                  {security.suspiciousActivities}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/security")}
              className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Open Security Dashboard
            </button>
          </div>
        </div>

        {/* -------------------------------- */}
        {/* Recent Activity + Quick Actions */}
        {/* -------------------------------- */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent activity
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Recent security events from today.
                </p>
              </div>

              <button
                onClick={() => navigate("/security")}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View all →
              </button>
            </div>

            {security.recentSecurityActivity.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                <ShieldCheck className="mx-auto text-slate-400" size={32} aria-hidden="true" />

                <p className="mt-3 font-medium text-slate-700">
                  No recent activity
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Your security activity will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {security.recentSecurityActivity
                  .slice(0, 6)
                  .map((activity, index) => (
                    <div
                      key={`${activity.timestamp}-${index}`}
                      className="flex gap-4 py-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {activity.description ||
                            formatActivityType(activity.type)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatActivityType(activity.type)}
                          {" • "}
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Quick actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Common SecureVault actions.
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => navigate("/add-credential")}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                + Add credential
              </button>

              <button
                onClick={() => navigate("/password-generator")}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <KeyRound size={17} aria-hidden="true" />
                Generate password
              </button>

              <button
                onClick={() => navigate("/shared-with-me")}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Users size={17} aria-hidden="true" />
                Shared With Me
              </button>

              <button
                onClick={() => navigate("/security/reports")}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <BarChart3 size={17} aria-hidden="true" />
                Security reports
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </Layout>
  );
}

export default Dashboard;