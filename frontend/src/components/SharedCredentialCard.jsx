import React from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Eye, KeyRound } from "lucide-react";

function SharedCredentialCard({ share }) {

    const navigate = useNavigate();

    const canEdit =
        share.permission === "EDIT" ||
        share.permission === "MANAGE";

    const handleView = () => {
        navigate(`/credential/${share.credentialId}`);
    };

    const handleEdit = () => {
        navigate(`/edit-credential/${share.credentialId}`);
    };

    return (
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

            <div className="flex flex-wrap items-start justify-between gap-3">

                <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-slate-800">
                        {share.credentialTitle}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Owner: {share.ownerUsername}
                    </p>
                </div>

                <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                    {share.permission}
                </span>

            </div>

            <div className="mt-4 flex flex-wrap gap-2">

                {/* VIEW */}
                <button
                    type="button"
                    onClick={handleView}
                    className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
                >
                    <Eye size={16} aria-hidden="true" />
                    View
                </button>

                {/* EDIT */}
                {canEdit && (
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-yellow-700 hover:bg-yellow-200"
                    >
                        <Edit3 size={16} aria-hidden="true" />
                        Edit
                    </button>
                )}

            </div>

            <div className="mt-4 text-sm text-slate-500">

                {share.expiresAt ? (
                    <p>
                        Expires:{" "}
                        {new Date(
                            share.expiresAt
                        ).toLocaleString()}
                    </p>
                ) : (
                    <p>No expiry</p>
                )}

            </div>

        </div>
       
    );
}

export default SharedCredentialCard;