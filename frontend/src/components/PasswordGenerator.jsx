import React, { useState } from "react";
import { ToastContainer,toast } from "react-toastify";
import API_BASE_URL from "../config/api";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";

function PasswordGenerator({ setPassword }) {

    const [isOpen, setIsOpen] = useState(false);

    const [passwordLength, setPasswordLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSpecialCharacters, setIncludeSpecialCharacters] = useState(true);

    const handleGeneratePassword = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/password-generator`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        length: passwordLength,
                        includeUppercase,
                        includeLowercase,
                        includeNumbers,
                        includeSpecialCharacters
                    })
                }
            );

            if (!response.ok) {

                const errorText = await response.text();

                console.error(
                    "Backend error:",
                    response.status,
                    errorText
                );

                throw new Error("Failed to generate password");
            }

            const data = await response.json();

            setPassword(data.password);

            setIsOpen(false);

        } catch (error) {

            console.error(
                "Password generation error:",
                error
            );

            // alert("Failed to generate password");
            toast.error("Failed to generate password. Please try again later.");

        }
    };


    return (
        <div className="mt-3">

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800"
            >
                {isOpen
                    ? <><span>Hide Password Generator</span><ChevronUp size={16} aria-hidden="true" /></>
                    : <><Zap size={16} aria-hidden="true" /><span>Generate Password</span><ChevronDown size={16} aria-hidden="true" /></>}
            </button>


            {isOpen && (

                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-5">

                    <h3 className="font-bold text-lg text-slate-800">
                        Password Generator
                    </h3>

                    <p className="text-sm text-slate-500 mt-1 mb-5">
                        Configure the password you want to generate.
                    </p>


                    {/* Length */}
                    <div className="mb-5">

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password Length
                        </label>

                        <input
                            type="number"
                            min="4"
                            max="64"
                            value={passwordLength}
                            onChange={(e) =>
                                setPasswordLength(Number(e.target.value))
                            }
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>


                    {/* Options */}
                    <div className="space-y-3">

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={includeUppercase}
                                onChange={(e) =>
                                    setIncludeUppercase(e.target.checked)
                                }
                                className="w-4 h-4"
                            />
                            Uppercase
                        </label>


                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={includeLowercase}
                                onChange={(e) =>
                                    setIncludeLowercase(e.target.checked)
                                }
                                className="w-4 h-4"
                            />
                            Lowercase
                        </label>


                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={includeNumbers}
                                onChange={(e) =>
                                    setIncludeNumbers(e.target.checked)
                                }
                                className="w-4 h-4"
                            />
                            Numbers
                        </label>


                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={includeSpecialCharacters}
                                onChange={(e) =>
                                    setIncludeSpecialCharacters(e.target.checked)
                                }
                                className="w-4 h-4"
                            />
                            Special Characters
                        </label>

                    </div>


                    <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
                    >
                        Generate Password
                    </button>

                </div>

            )}
            <ToastContainer />

        </div>
    );
}

export default PasswordGenerator;