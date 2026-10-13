import React, { useState } from "react";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import PasswordGenerator from "../components/PasswordGenerator";
import PasswordStrength from "../components/PasswordStrength";

function PasswordGeneratorPage() {

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleCopy = async () => {

        if (!password) {
            toast.info("Generate a password first");
            return;
        }

        try {
            await navigator.clipboard.writeText(password);
            toast.success("Password copied!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to copy password");
        }
    };

    return (
        <Layout>

            <div className="w-full">

                {/* ================= PAGE HEADER ================= */}
                <div className="mb-6">

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                        Password Generator
                    </h1>

                    <p className="mt-1 text-sm sm:text-base text-slate-500">
                        Create and evaluate strong passwords.
                    </p>

                </div>


                {/* ================= MAIN GRID ================= */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">


                    {/* ================= GENERATOR CARD ================= */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">

                        {/* Generated Password */}
                        <div className="flex items-center gap-2">

                            <div className="relative flex-1 min-w-0">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    readOnly
                                    placeholder="Generate a password"
                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-slate-200
                                        bg-slate-100
                                        px-4
                                        py-3
                                        pr-16
                                        font-mono
                                        text-sm
                                        text-slate-800
                                        outline-none
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    disabled={!password}
                                    className="
                                        absolute
                                        right-2
                                        top-1/2
                                        -translate-y-1/2
                                        rounded-md
                                        border
                                        border-slate-200
                                        bg-white
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-medium
                                        text-slate-600
                                        hover:bg-slate-50
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>


                            {/* Copy */}
                            <button
                                type="button"
                                onClick={handleCopy}
                                disabled={!password}
                                className="
                                    shrink-0
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-medium
                                    text-slate-700
                                    hover:bg-slate-50
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                Copy
                            </button>

                        </div>


                        {/* Generator */}
                        <PasswordGenerator
                            setPassword={setPassword}
                        />

                    </div>


                    {/* ================= STRENGTH CARD ================= */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">

                        <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                            Strength analysis
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Check how strong your generated password is.
                        </p>


                        <div className="mt-5">

                            <PasswordStrength
                                password={password}
                            />

                        </div>

                    </div>

                </div>

            </div>

        </Layout>
    );
}

export default PasswordGeneratorPage;