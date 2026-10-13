import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

export default function OAuth2Success() {

    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {

        const token = params.get("token");
        const username = params.get("username");
        const email = params.get("email");

        if (!token) {
            navigate("/login");
            return;
        }

        localStorage.setItem(
            "token",
            token
        );

        localStorage.setItem(
            "username",
            username || ""
        );

        localStorage.setItem(
            "email",
            email || ""
        );

        navigate("/dashboard");

    }, [navigate, params]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">

                <LockKeyhole className="mx-auto mb-4 text-blue-600" size={40} aria-hidden="true" />

                <h2 className="text-xl font-bold text-slate-800">
                    Signing you in...
                </h2>

                <p className="text-slate-500 mt-2">
                    Please wait while SecureVault completes authentication.
                </p>

            </div>

        </div>
    );
}

