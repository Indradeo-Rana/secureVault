import React from "react";
import Layout from "../components/Layout";
import { Trash2 } from "lucide-react";

function Trash() {

    return (
        <Layout>

            <h1 className="text-3xl font-bold text-slate-800">
                Trash
            </h1>

            <p className="text-slate-500 mt-1">
                Deleted credentials will appear here.
            </p>


            <div className="mt-8 bg-white rounded-xl border border-slate-200 p-10 text-center">

                <Trash2 className="mx-auto text-slate-500" size={48} aria-hidden="true" />

                <h2 className="text-xl font-bold mt-4">
                    Trash Management
                </h2>

                <p className="text-slate-500 mt-2">
                    Restore or permanently delete your credentials.
                </p>

                <div className="mt-5 inline-block px-5 py-2 bg-blue-100 text-blue-700 rounded-full">
                    Coming Soon
                </div>

            </div>

        </Layout>
    );
}

export default Trash;