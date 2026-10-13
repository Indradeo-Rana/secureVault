import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import Layout from "../../components/Layout";
import { LockKeyhole } from "lucide-react";
import TeamCredentialCard from "../../components/TeamCredentialCard";
import {ToastContainer, toast } from "react-toastify";

function TeamDetails() {

    const { teamId } = useParams();

    const navigate = useNavigate();

    const [team, setTeam] = useState(null);

    const [members, setMembers] = useState([]);

    const [credentials, setCredentials] = useState([]);

    const [username, setUsername] = useState("");

    const [role, setRole] = useState("MEMBER");

    const [loading, setLoading] = useState(true);

    const [addingMember, setAddingMember] = useState(false);

    const fetchTeamData = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const headers = {
                Authorization:
                    `Bearer ${token}`
            };

            const [
                teamResponse,
                membersResponse,
                credentialsResponse
            ] = await Promise.all([

                fetch(
                    `${API_BASE_URL}/api/teams/${teamId}`,
                    { headers }
                ),

                fetch(
                    `${API_BASE_URL}/api/teams/${teamId}/members`,
                    { headers }
                ),

                fetch(
                   `${API_BASE_URL}/api/teams/${teamId}/credentials`,
                    { headers }
                )

            ]);

            const teamText = await teamResponse.text();

            const membersText = await membersResponse.text();

            const credentialsText = await credentialsResponse.text();

            if (!teamResponse.ok) {
                throw new Error(
                    teamText ||
                    "Failed to load team"
                );
            }

            if (!membersResponse.ok) {
                throw new Error(
                    membersText ||
                    "Failed to load members"
                );
            }

            if (!credentialsResponse.ok) {
                throw new Error(
                    credentialsText ||
                    "Failed to load credentials"
                );
            }

            setTeam(
                teamText
                    ? JSON.parse(teamText)
                    : null
            );

            setMembers(
                membersText
                    ? JSON.parse(membersText)
                    : []
            );

            setCredentials(
                credentialsText
                    ? JSON.parse(credentialsText)
                    : []
            );

        } catch (error) {

            // console.error(error);
            // alert(error.message);
            toast.error(
                error.message ||
                "An error occurred while fetching team data"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchTeamData();

    }, [teamId]);

    const addMember = async (e) => {

        e.preventDefault();

        if (!username.trim()) {
            // alert("Username is required");
            toast.error("Username is required");
            return;
        }

        setAddingMember(true);

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/teams/${teamId}/members`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        username:
                            username.trim(),

                        role
                    })
                }
            );

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    text ||
                    "Failed to add member"
                );
            }

            const data =
                text
                    ? JSON.parse(text)
                    : null;

            if (data) {

                setMembers(
                    previous => [
                        ...previous,
                        data
                    ]
                );
            }

            setUsername("");

            setRole("MEMBER");

            // alert(
            //     "Member added successfully"
            // );
            toast.success(
                "Member added successfully"
            );

        } catch (error) {

            // console.error(error);
            // alert(error.message);
            toast.error(
                error.message ||
                "An error occurred while adding member"
            );

        } finally {

            setAddingMember(false);
        }
    };

    const handleViewCredential = async (
        teamCredentialId
    ) => {

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

                setCredentials(
                    previous =>
                        previous.map(
                            credential =>
                                credential.id ===
                                teamCredentialId
                                    ? data
                                    : credential
                        )
                );
            }

        } catch (error) {

            // console.error(error);
            // alert(error.message);
            toast.error(
                error.message ||
                "An error occurred while fetching credential data"
            );
        }
    };

    const handleDeleteCredential = async (
        teamCredentialId
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this team credential?"
            );

        if (!confirmed) {
            return;
        }

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/teams/${teamId}/credentials/${teamCredentialId}`,
                {
                    method: "DELETE",

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
                    "Failed to delete credential"
                );
            }

            setCredentials(
                previous =>
                    previous.filter(
                        credential =>
                            credential.id !==
                            teamCredentialId
                    )
            );

            // alert(
            //     "Team credential deleted successfully"
            // );
            toast.success(
                "Team credential deleted successfully"
            );

        } catch (error) {

            // console.error(error);
            // alert(error.message);
            toast.error(
                error.message ||
                "An error occurred while deleting credential"
            );
        }
    };

    const canManageTeam =
        members.some(
            member =>
                member.role === "OWNER"
        );

    const currentUsername =
        localStorage.getItem(
            "username"
        );

    const currentMember =
        members.find(
            member =>
                member.username ===
                currentUsername
        );

    const canManageCredentials =
        currentMember?.role === "OWNER" ||
        currentMember?.role === "ADMIN";

    if (loading) {

        return (
            <Layout>
                <div className="text-center py-20">
                    Loading team...
                </div>
            </Layout>
        );
    }

    return (
        <Layout>

            <div className="mb-6">

                <button
                    type="button"
                    onClick={() =>
                        navigate("/teams")
                    }
                    className="text-blue-600 hover:underline mb-4"
                >
                    ← Back to Teams
                </button>

                {team && (

                    <div>

                        <h1 className="text-3xl font-bold text-slate-800">
                            {team.name}
                        </h1>

                        <p className="text-slate-500 mt-1">
                            Owner:{" "}
                            {team.ownerUsername}
                        </p>

                    </div>

                )}

            </div>

            <div className="grid lg:grid-cols-2 gap-6">

                {/* MEMBERS */}

                <div className="bg-white border border-slate-200 rounded-xl p-6">

                    <div className="flex items-center justify-between mb-5">

                        <h2 className="text-xl font-bold">
                            Team Members
                        </h2>

                        <span className="text-sm text-slate-500">
                            {members.length} members
                        </span>

                    </div>

                    <div className="space-y-3 mb-6">

                        {members.map(
                            (member) => (

                                <div
                                    key={member.id}
                                    className="flex items-center justify-between border-b pb-3"
                                >

                                    <div>

                                        <p className="font-medium">
                                            {member.username}
                                        </p>

                                    </div>

                                    <span className="text-sm bg-slate-100 px-3 py-1 rounded-full">
                                        {member.role}
                                    </span>

                                </div>

                            )
                        )}

                    </div>

                    {canManageTeam && (

                        <div className="border-t pt-5">

                            <h3 className="font-bold mb-4">
                                Add Team Member
                            </h3>

                            <form
                                onSubmit={
                                    addMember
                                }
                            >

                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Username"
                                    required
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3"
                                />

                                <select
                                    value={role}
                                    onChange={(e) =>
                                        setRole(
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3"
                                >

                                    <option value="MEMBER">
                                        Member
                                    </option>

                                    <option value="ADMIN">
                                        Admin
                                    </option>

                                </select>

                                <button
                                    type="submit"
                                    disabled={
                                        addingMember
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {addingMember
                                        ? "Adding..."
                                        : "Add Member"}
                                </button>

                            </form>

                        </div>

                    )}

                </div>

                {/* TEAM VAULT */}

                <div>

                    <div className="flex items-center justify-between mb-5">

                        <div>

                            <h2 className="text-xl font-bold">
                                Team Vault
                            </h2>

                            <p className="text-sm text-slate-500">
                                Shared team credentials
                            </p>

                        </div>

                        {canManageCredentials && (

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/teams/${teamId}/add-credential`
                                    )
                                }
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                + Add Credential
                            </button>

                        )}

                    </div>

                    {credentials.length === 0 ? (

                        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">

                            <LockKeyhole className="mx-auto mb-3 text-slate-400" size={40} aria-hidden="true" />

                            <p className="text-slate-500">
                                No team credentials yet.
                            </p>

                            {canManageCredentials && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/teams/${teamId}/add-credential`
                                        )
                                    }
                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Add First Credential
                                </button>

                            )}

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {credentials.map(
                                (credential) => (

                                    <TeamCredentialCard
                                        key={
                                            credential.id
                                        }
                                        credential={
                                            credential
                                        }
                                        canManage={
                                            canManageCredentials
                                        }
                                        onView={() =>
                                            handleViewCredential(
                                                credential.id
                                            )
                                        }
                                        onEdit={() =>
                                            navigate(
                                                `/teams/${teamId}/edit-credential/${credential.id}`
                                            )
                                        }
                                        onDelete={() =>
                                            handleDeleteCredential(
                                                credential.id
                                            )
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </div>
                 < ToastContainer />

            </div>

        </Layout>
    );
}

export default TeamDetails;