import { useState } from "react";
import API_BASE_URL from "../../config/api";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier }),
        }
      );

      const data = await response.text();
      setMessage(data);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
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
                  d="M16.5 10.5V7a4.5 4.5 0 00-9 0v3.5m-1.5 0h12a1.5 1.5 0 011.5 1.5v7a1.5 1.5 0 01-1.5 1.5h-12A1.5 1.5 0 015 19v-7a1.5 1.5 0 011.5-1.5z"
                />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Forgot Password?
            </h2>

            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Enter your username or email address to recover your account.
            </p>

          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">

            {/* Identifier */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username or Email
              </label>

              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter username or email"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm sm:text-base text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Processing..." : "Request Recovery"}
            </button>

          </form>

          {/* Response Message */}
          {message && (
            <div className="mt-5 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-sm text-blue-700 break-words">
                {message}
              </p>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              ← Back to Login
            </a>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-xs sm:text-sm text-gray-500">
          SecureVault Account Recovery
        </p>

      </div>
    </div>
  );
}

