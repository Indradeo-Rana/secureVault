import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Token URL se nahi mila
    if (!token) {
      setError(
        "Invalid or missing password reset link. Please request a new password reset link."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token: token,
            newPassword: newPassword,
          }),
        }
      );

      const text = await response.text();

      if (!response.ok) {
        setError(
          text || "Unable to reset password."
        );
        return;
      }

      setMessage(
        text ||
        "Password reset successful. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {

      setError(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">

          {/* Header */}
          <div className="text-center mb-7">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 7a4 4 0 10-8 0v3m-1 0h10a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2zm5 5v3"
                />
              </svg>

            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Reset Password
            </h2>

            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Create a new password for your SecureVault account.
            </p>

          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">

            {/* New Password */}
            <div>

              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter new password"
                minLength={8}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Password must contain at least 8 characters.
              </p>

            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>

          {/* Success Message */}
          {message && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-700">
                {message}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700 break-words">
                {error}
              </p>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              ← Back to Login
            </button>

          </div>

        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-xs sm:text-sm text-gray-500">
          SecureVault Password Recovery
        </p>

      </div>

    </div>
  );
}