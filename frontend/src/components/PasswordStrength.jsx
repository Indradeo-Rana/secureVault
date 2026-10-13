import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";

function PasswordStrength({ password }) {

    const [strength, setStrength] = useState("");
    const [score, setScore] = useState(0);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {

        if (!password) {

            setStrength("");
            setScore(0);
            setSuggestions([]);

            return;
        }


        const analyzePassword = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_BASE_URL}/api/password-strength`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            password: password
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to analyze password"
                    );
                }

                const data = await response.json();

                setStrength(data.strength);
                setScore(data.score);
                setSuggestions(data.suggestions);

            } catch (error) {

                console.error(
                    "Password strength error:",
                    error
                );

            }
        };

        analyzePassword();

    }, [password]);


    if (!password) {
        return null;
    }


    const strengthColor =
        strength === "Strong"
            ? "text-green-600"
            : strength === "Medium"
                ? "text-yellow-600"
                : "text-red-600";


    return (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">

            <div className="flex justify-between">

                <span className="text-sm font-medium text-slate-600">
                    Password Strength
                </span>

                <span className={`font-bold ${strengthColor}`}>
                    {strength}
                </span>

            </div>


            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">

                <div
                    className={`h-2 rounded-full ${
                        score <= 2
                            ? "bg-red-500"
                            : score <= 4
                                ? "bg-yellow-500"
                                : "bg-green-500"
                    }`}
                    style={{
                        width: `${score * 20}%`
                    }}
                />

            </div>


            <p className="text-xs text-slate-500 mt-2">
                Score: {score}/5
            </p>


            {suggestions.length > 0 && (

                <div className="mt-4">

                    <p className="text-sm font-medium text-slate-700">
                        Suggestions
                    </p>

                    <ul className="mt-2 space-y-1">

                        {suggestions.map((suggestion, index) => (

                            <li
                                key={index}
                                className="text-sm text-slate-500"
                            >
                                • {suggestion}
                            </li>

                        ))}

                    </ul>

                </div>

            )}

        </div>
    );
}

export default PasswordStrength;