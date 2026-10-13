import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";

function AuditLogs() {

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/audit-logs`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load audit logs"
                );
            }

            setLogs(
                await response.json()
            );

        } catch (error) {

            // console.error(error);

            // alert(
            //     "Failed to load audit logs"
            // );
            toast.error(
                "Failed to load audit logs. Please try again later."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <Layout>

            <div className="mb-6">

                <h1 className="text-3xl font-bold text-slate-800">
                    Audit Logs
                </h1>

                <p className="text-slate-500 mt-1">
                    Track important actions performed in your vault.
                </p>

            </div>


            {loading ? (

                <div className="text-center py-20">
                    Loading audit logs...
                </div>

            ) : logs.length === 0 ? (

                <div className="bg-white border rounded-xl p-10 text-center">

                    <p className="text-slate-500">
                        No audit activity found.
                    </p>

                </div>

            ) : (

                <div className="bg-white border rounded-xl overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-slate-50">

                                <tr>

                                    <th className="text-left px-5 py-4">
                                        Action
                                    </th>

                                    <th className="text-left px-5 py-4">
                                        Resource
                                    </th>

                                    <th className="text-left px-5 py-4">
                                        Description
                                    </th>

                                    <th className="text-left px-5 py-4">
                                        Time
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {logs.map(log => (

                                    <tr
                                        key={log.id}
                                        className="border-t"
                                    >

                                        <td className="px-5 py-4">

                                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                                                {log.action}
                                            </span>

                                        </td>

                                        <td className="px-5 py-4 text-sm">

                                            {log.resourceType}

                                            {log.resourceId &&
                                                ` #${log.resourceId}`
                                            }

                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {log.description}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-500">
                                            {new Date(
                                                log.timestamp
                                            ).toLocaleString()}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </Layout>
    );
}

export default AuditLogs;