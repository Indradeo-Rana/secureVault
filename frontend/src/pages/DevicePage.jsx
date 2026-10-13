import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

const API = `${API_BASE_URL}`;
const DAY = 24 * 60 * 60 * 1000;

const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "-");

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // change "token" if you store the JWT under another localStorage key
    const token = localStorage.getItem("token");

    axios
      .get(`${API}/api/security/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDevices(res.data))
      .catch(() => setError("Could not load your devices."))
      .finally(() => setLoading(false));
  }, []);

  // "New" = first seen in the last 24h AND the account already had an older device
  const oldest = devices.length
    ? Math.min(...devices.map((d) => new Date(d.firstSeenAt).getTime()))
    : 0;
  const isNew = (d) => {
    const first = new Date(d.firstSeenAt).getTime();
    return first > oldest && Date.now() - first < DAY;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Devices</h1>
      <p className="text-sm text-slate-500 mb-5">
        Browsers and devices that have logged in to your account.
      </p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        {loading && <p className="p-5 text-slate-500">Loading...</p>}
        {error && <p className="p-5 text-red-600">{error}</p>}
        {!loading && !error && devices.length === 0 && (
          <p className="p-5 text-slate-500">No devices recorded yet.</p>
        )}

        {devices.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b">
              <tr>
                <th className="p-3">Device</th>
                <th className="p-3">IP address</th>
                <th className="p-3">Location</th>
                <th className="p-3">First seen</th>
                <th className="p-3">Last active</th>
                <th className="p-3">Logins</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="p-3 font-medium text-slate-900">
                    {d.deviceName}
                    {isNew(d) && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </td>
                  <td className="p-3">{d.ipAddress || "-"}</td>
                  <td className="p-3">{d.location || "-"}</td>
                  <td className="p-3">{fmt(d.firstSeenAt)}</td>
                  <td className="p-3">{fmt(d.lastSeenAt)}</td>
                  <td className="p-3">{d.loginCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
