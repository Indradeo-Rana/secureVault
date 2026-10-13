
import Layout from "../../components/Layout";
import { useState, useEffect } from "react";
import {ToastContainer, toast } from "react-toastify";
import API_BASE_URL from "../../config/api";


function LoginHistory() {

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoginHistory();
    }, []);

    const fetchLoginHistory = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/security/login-history`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch login history"
                );
            }

            const data =
                await response.json();

            setActivities(data);

        } catch (error) {

            // console.error(
            //     "Login history error:",
            //     error
            // );

            // alert(
            //     "Failed to load login history"
            // );
            toast.error(
                "Failed to load login history. Please try again later."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <Layout>

            <div className="mb-6">

                <h1 className="text-3xl font-bold text-slate-800">
                    Login History
                </h1>

                <p className="text-slate-500 mt-1">
                    Monitor your recent login activity.
                </p>

            </div>


            {loading ? (

                <div className="text-center py-20">
                    Loading login history...
                </div>

            ) : activities.length === 0 ? (

                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">

                    <p className="text-slate-500">
                        No login activity found.
                    </p>

                </div>

            ) : (

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-slate-50">

                                <tr>

                                    <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                                        Username
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                                        Status
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                                        IP Address
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">
                                        Date & Time
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {activities.map(
                                    (activity) => (

                                        <tr
                                            key={activity.id}
                                            className="border-t border-slate-100"
                                        >

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                {activity.username}
                                            </td>

                                            <td className="px-5 py-4">

                                                {activity.success ? (

                                                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                                        Successful
                                                    </span>

                                                ) : (

                                                    <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                                                        Failed
                                                    </span>

                                                )}

                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600 font-mono">
                                                {activity.ipAddress}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {new Date(
                                                    activity.timestamp
                                                ).toLocaleString()}
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                     < ToastContainer />

                </div>

            )}

        </Layout>
    );
}

export default LoginHistory;
