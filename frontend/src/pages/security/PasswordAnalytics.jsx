import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {ToastContainer, toast } from "react-toastify";
import API_BASE_URL from "../../config/api";

function PasswordAnalytics() {
  const [health, setHealth] = useState(null);
  const [reuse, setReuse] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [healthResponse, reuseResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/analytics/password-health`, {
          headers,
        }),

        fetch(`${API_BASE_URL}/api/analytics/password-reuse`, {
          headers,
        }),
      ]);

      if (!healthResponse.ok || !reuseResponse.ok) {
        throw new Error("Failed to load analytics");
      }

      const healthData = await healthResponse.json();
      const reuseData = await reuseResponse.json();

    //   console.log("HEALTH:", healthData);
    //   console.log("REUSE:", reuseData);

      setHealth(healthData[0]);
      setReuse(reuseData);

    } catch (error) {
      console.error(error);

      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">Loading analytics...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Password Analytics
        </h1>

        <p className="text-slate-500 mt-1">
          Understand the health of your stored passwords.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Total</p>

          <p className="text-3xl font-bold mt-2">
            {health?.totalPasswords ?? 0}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Strong</p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {health?.strongPasswords ?? 0}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Medium</p>

          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {health?.mediumPasswords ?? 0}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Weak</p>

          <p className="text-3xl font-bold text-red-600 mt-2">
            {health?.weakPasswords ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-xl font-bold mb-4">Password Reuse</h2>

        {reuse.length === 0 ? (
          <p className="text-slate-500">No password reuse detected.</p>
        ) : (
          <div className="space-y-3">
            {reuse.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-red-50">
                <p className="font-semibold text-red-700">
                  Password reused in {item.count} credentials
                </p>

                <ul className="list-disc ml-5 mt-2 text-sm text-slate-600">
                  {(item.credentialTitles ??[]).map((title, i) => (
                    <li key={i}>{title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        < ToastContainer />
      </div>
    </Layout>
  );
}

export default PasswordAnalytics;
