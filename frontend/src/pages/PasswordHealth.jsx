import React from "react";
import Layout from "../components/Layout";
import { HeartPulse } from "lucide-react";

function PasswordHealth() {

    return (
        <Layout>

            <div className="max-w-6xl mx-auto">

                <h1 className="text-3xl font-bold text-slate-800">
                    Password Health
                </h1>

                <p className="text-slate-500 mt-1">
                    Analyze the security of your vault.
                </p>


                <div className="mt-8 bg-white rounded-xl border border-slate-200 p-10 text-center">

                    <HeartPulse className="mx-auto text-blue-600" size={48} aria-hidden="true" />

                    <h2 className="text-2xl font-bold mt-5">
                        Password Health
                    </h2>

                    <p className="text-slate-500 max-w-lg mx-auto mt-3">
                        This module will analyze weak, medium,
                        strong and reused passwords across your vault.
                    </p>

                    <div className="mt-6 inline-block px-5 py-2 bg-blue-100 text-blue-700 rounded-full">
                        Coming Soon
                    </div>

                </div>

            </div>

        </Layout>
    );
}

export default PasswordHealth;