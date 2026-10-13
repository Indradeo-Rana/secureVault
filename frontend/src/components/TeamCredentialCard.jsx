import React, { useState } from "react";
import { Edit3, Eye, KeyRound, Trash2 } from "lucide-react";

function TeamCredentialCard({
    credential,
    canManage,
    onView,
    onEdit,
    onDelete
}) {

    const [showPassword, setShowPassword] =
        useState(false);

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

            <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <KeyRound size={21} aria-hidden="true" />
                    </div>

                    <div>

                        <h3 className="font-bold text-lg text-slate-800">
                            {credential.title}
                        </h3>

                        <p className="text-sm text-slate-500">
                            {credential.username}
                        </p>

                    </div>

                </div>

                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Team
                </span>

            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-4">

                <div>

                    <p className="text-xs text-slate-400 uppercase">
                        Username
                    </p>

                    <p className="text-sm mt-1">
                        {credential.username}
                    </p>

                </div>

                <div>

                    <p className="text-xs text-slate-400 uppercase">
                        Website
                    </p>

                    <p className="text-sm text-blue-600 mt-1">
                        {credential.website ||
                            "No website"}
                    </p>

                </div>

            </div>

            {credential.password && (

                <div className="mt-4">

                    <p className="text-xs text-slate-400 uppercase">
                        Password
                    </p>

                    <div className="flex items-center gap-3 mt-1">

                        <p className="font-mono text-sm">
                            {showPassword
                                ? credential.password
                                : "••••••••••••"}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                            className="text-blue-600 text-sm"
                        >
                            {showPassword
                                ? "Hide"
                                : "Show"}
                        </button>

                    </div>

                </div>

            )}

            <div className="mt-5 flex flex-wrap gap-2">

                <button
                    type="button"
                    onClick={onView}
                    className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
                >
                    <Eye size={16} aria-hidden="true" />
                    View
                </button>

                {canManage && (

                    <>

                        <button
                            type="button"
                            onClick={onEdit}
                            className="flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-yellow-700 hover:bg-yellow-200"
                        >
                            <Edit3 size={16} aria-hidden="true" />
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={onDelete}
                            className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
                        >
                            <Trash2 size={16} aria-hidden="true" />
                            Delete
                        </button>

                    </>

                )}

            </div>

            {credential.notes && (

                <div className="mt-4 pt-4 border-t border-slate-100">

                    <p className="text-xs text-slate-400 uppercase">
                        Notes
                    </p>

                    <p className="text-sm text-slate-600 mt-1">
                        {credential.notes}
                    </p>

                </div>

            )}

        </div>
    );
}

export default TeamCredentialCard;