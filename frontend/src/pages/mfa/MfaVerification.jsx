import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getDeviceId } from "../../utils/deviceId";
import API_BASE_URL from "../../config/api";

export default function MfaVerification() {

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    /*
     * Challenge ID can come from:
     *
     * 1. URL query parameter
     * 2. React Router state
     * 3. localStorage
     */
    const challengeId =
        searchParams.get("challengeId") ||
        location.state?.challengeId ||
        localStorage.getItem("mfaChallengeId");

    /*
     * Username can also come from URL,
     * Router state or localStorage.
     */
    const mfaUsername =
        searchParams.get("username") ||
        location.state?.username ||
        localStorage.getItem("mfaUsername") ||
        "";

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    /*
     * If no challenge ID is available,
     * MFA session is invalid.
     */
    if (!challengeId) {

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

                <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-6">

                    <h2 className="text-2xl font-bold text-slate-800">
                        Invalid MFA Session
                    </h2>

                    <p className="text-gray-600 mt-2">
                        Your MFA session is missing or has expired.
                        Please login again.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Login
                    </button>

                </div>

            </div>
        );
    }


    const verify = async (e) => {

        e.preventDefault();

        setError("");

        if (code.length !== 6) {

            setError(
                "Please enter the 6-digit MFA code."
            );

            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/mfa/verify`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "X-Device-Id": getDeviceId()
                    },

                    body: JSON.stringify({
                        challengeId: challengeId,
                        code: code
                    })
                }
            );


            const responseText = await response.text();

            // console.log(
            //     "MFA response status:",
            //     response.status
            // );


            let data = {};

            if (responseText) {

                try {

                    data = JSON.parse(responseText);

                } catch (jsonError) {

                    console.error(
                        "Invalid JSON response:",
                        jsonError
                    );
                }
            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Invalid MFA code. Please enter the current code from your authenticator app."
                );
            }


            if (!data.token) {

                throw new Error(
                    "MFA verification succeeded but JWT token was not returned."
                );
            }


            /*
             * Save final JWT
             */
            localStorage.setItem(
                "token",
                data.token
            );


            localStorage.setItem(
                "username",
                data.username || mfaUsername
            );


            localStorage.setItem(
                "email",
                data.email || ""
            );


            /*
             * Remove temporary MFA data
             */
            localStorage.removeItem(
                "mfaChallengeId"
            );

            localStorage.removeItem(
                "mfaUsername"
            );


            /*
             * Go to dashboard
             */
            navigate("/dashboard");

        } catch (err) {

            console.error(
                "MFA verification error:",
                err
            );

            setError(
                err.message ||
                "MFA verification failed."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    MFA Verification
                </h2>

                <p className="text-gray-600 mb-6">
                    Enter the 6-digit code from your authenticator app.
                </p>


                <form onSubmit={verify}>

                    <input
                        type="text"
                        value={code}
                        onChange={(e) =>
                            setCode(
                                e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 6)
                            )
                        }
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg"
                        required
                    />


                    <button
                        type="submit"
                        disabled={
                            loading ||
                            code.length !== 6
                        }
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify MFA"}
                    </button>

                </form>


                {error && (

                    <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-4 text-sm">
                        {error}
                    </p>

                )}


                <button
                    onClick={() => navigate("/login")}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                >
                    Back to Login
                </button>

            </div>

        </div>
    );
}