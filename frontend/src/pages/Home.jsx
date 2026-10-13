import React from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LockKeyhole, ShieldCheck, Zap } from "lucide-react";

function Home() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Header */}
            <header className="border-b border-slate-800">

                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <LockKeyhole size={28} aria-hidden="true" />

                        <span className="text-xl font-bold">
                            SecureVault
                        </span>

                    </div>


                    <div className="flex flex-wrap justify-end gap-3">

                        <button
                            onClick={() => navigate("/login")}
                            className="px-5 py-2 rounded-lg border border-slate-600 hover:bg-slate-800"
                        >
                            Login
                        </button>

                        <button
                            onClick={() => navigate("/register")}
                            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                        >
                            Get Started
                        </button>

                    </div>

                </div>

            </header>


            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 py-24">

                <div className="max-w-3xl">

                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-900/40 px-4 py-2 text-sm text-blue-400">
                        <KeyRound size={16} aria-hidden="true" /> Secure Password Management
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                        Your passwords.
                        <br />
                        <span className="text-blue-500">
                            Secured in one place.
                        </span>
                    </h1>

                    <p className="mt-6 text-lg text-slate-400 max-w-2xl">
                        SecureVault helps you store, manage, generate
                        strong passwords and share the credentials securely in one place.
                    </p>


                    <div className="mt-8 flex flex-wrap gap-4">

                        <button
                            onClick={() => navigate("/register")}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                        >
                            Get Started
                        </button>

                        <button
                            onClick={() => navigate("/login")}
                            className="px-6 py-3 border border-slate-600 hover:bg-slate-800 rounded-lg font-semibold"
                        >
                            Login
                        </button>

                    </div>

                </div>


                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mt-24">

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <LockKeyhole className="mb-4 text-blue-400" size={30} aria-hidden="true" />
                        <h3 className="font-bold text-xl">
                            Secure Storage
                        </h3>
                        <p className="text-slate-400 mt-2">
                            Store your credentials securely with encrypted passwords.
                        </p>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <Zap className="mb-4 text-blue-400" size={30} aria-hidden="true" />
                        <h3 className="font-bold text-xl">
                            Password Generator
                        </h3>
                        <p className="text-slate-400 mt-2">
                            Generate strong passwords with customizable options.
                        </p>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <ShieldCheck className="mb-4 text-blue-400" size={30} aria-hidden="true" />
                        <h3 className="font-bold text-xl">
                            Password Health
                        </h3>
                        <p className="text-slate-400 mt-2">
                            Analyze your vault and identify weak passwords.
                        </p>
                    </div>

                </div>

            </section>

        </div>
    );
}

export default Home;