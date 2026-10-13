import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PasswordGenerator from "../../components/PasswordGenerator";
import PasswordStrength from "../../components/PasswordStrength";
import {ToastContainer, toast } from "react-toastify";
import API_BASE_URL from "../../config/api";

function EditTeamCredential() {

    const {
        teamId,
        teamCredentialId
    } = useParams();

    const navigate = useNavigate();

    const [title, setTitle] = useState("");

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [website, setWebsite] = useState("");

    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    useEffect(() => {

        fetchCredential();

    }, [teamId, teamCredentialId]);

    const fetchCredential = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/teams/${teamId}/credentials/${teamCredentialId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    text ||
                    "Failed to load credential"
                );
            }

            const data =
                text
                    ? JSON.parse(text)
                    : null;

            if (data) {

                setTitle(
                    data.title || ""
                );

                setUsername(
                    data.username || ""
                );

                setPassword(
                    data.password || ""
                );

                setWebsite(
                    data.website || ""
                );

                setNotes(
                    data.notes || ""
                );
            }

        } catch (error) {

            // console.error(error);
            // alert(error.message);
            toast.error(
                error.message ||
                "An error occurred while fetching credential data"
            );

            navigate(
                `/teams/${teamId}`
            );

        } finally {

            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/teams/${teamId}/credentials/${teamCredentialId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title,
                        username,
                        password,
                        website,
                        notes
                    })
                }
            );

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    text ||
                    "Failed to update credential"
                );
            }

            toast.success(
                "Credential updated successfully"
            );

            navigate(
                `/teams/${teamId}`
            );

        } catch (error) {

            // console.error(error);
            // alert(error.message);
            toast.error(
                error.message ||
                "An error occurred while updating credential"
            );

        } finally {

            setSaving(false);
        }
    };

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            <div className="max-w-xl mx-auto">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/teams/${teamId}`
                        )
                    }
                    className="mb-5 text-blue-600 hover:underline"
                >
                    ← Back to Team
                </button>

                <div className="bg-white rounded-xl shadow p-6">

                    <h1 className="text-2xl font-bold mb-6">
                        Edit Team Credential
                    </h1>

                    <form onSubmit={handleSubmit}>

                        <div className="mb-4">

                            <label className="block text-sm font-medium mb-1">
                                Title
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>

                        <div className="mb-4">

                            <label className="block text-sm font-medium mb-1">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>

                        <div className="mb-4">

                            <label className="block text-sm font-medium mb-1">
                                Password
                            </label>

                            <input
                                type="text"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            <PasswordGenerator
                                setPassword={
                                    setPassword
                                }
                            />

                            <PasswordStrength
                                password={
                                    password
                                }
                            />

                        </div>

                        <div className="mb-4">

                            <label className="block text-sm font-medium mb-1">
                                Website
                            </label>

                            <input
                                type="text"
                                value={website}
                                onChange={(e) =>
                                    setWebsite(
                                        e.target.value
                                    )
                                }
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>

                        <div className="mb-5">

                            <label className="block text-sm font-medium mb-1">
                                Notes
                            </label>

                            <textarea
                                value={notes}
                                onChange={(e) =>
                                    setNotes(
                                        e.target.value
                                    )
                                }
                                rows="4"
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving
                                ? "Updating..."
                                : "Update Credential"}
                        </button>

                    </form>

                </div>

            </div>
             < ToastContainer />

        </div>
    );
}

export default EditTeamCredential;