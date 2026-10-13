import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, KeyRound, Share2, Trash2 } from "lucide-react";

function CredentialCard({ credential, onDelete , onShare}) {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <KeyRound size={23} aria-hidden="true" />
          </div>

          <div>
            <h3 className="font-bold text-lg text-slate-800">
              {credential.title}
            </h3>

            <p className="text-sm text-slate-500">{credential.username}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-2 text-green-700 hover:bg-green-200"
          >
            <Share2 size={16} aria-hidden="true" />
            Share
          </button>

          <button
            onClick={() => navigate(`/edit-credential/${credential.id}`)}
            className="flex items-center gap-1.5 rounded-lg bg-yellow-100 px-3 py-2 text-yellow-700 hover:bg-yellow-200"
          >
            <Edit3 size={16} aria-hidden="true" />
            Edit
          </button>

          <button
            onClick={() => onDelete(credential.id)}
            className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase">Password</p>

          <div className="flex items-center gap-3 mt-1">
            <p className="font-mono text-sm text-slate-700">
              {showPassword ? credential.password : "••••••••••••"}
            </p>

            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-blue-600 text-sm hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase">Website</p>

          <p className="text-sm text-blue-600 mt-1 truncate">
            {credential.website || "No website"}
          </p>
        </div>
      </div>

      {credential.notes && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 uppercase">Notes</p>

          <p className="text-sm text-slate-600 mt-1">{credential.notes}</p>
        </div>
      )}
    </div>
  );
}

export default CredentialCard;
