import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RecycleCredential() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [credentials, setCredentials] = useState([]);

    const navigate = useNavigate();

  const handleBack = () => {
    navigate("/vault");
  }

    const fetchCredentials = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/api/credential/soft-deleted`,
               {
                    method: "GET",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
        //  Check if request failed
            if (!response.ok) {
                throw new Error("Failed to fetch credentials");
            }


            // Convert JSON response
            const data = await response.json();


            // Store credentials in state
            setCredentials(data);

            // Clear previous error
            setError("");

        } catch (error) {

            console.error(error);

            setError("Failed to load credentials");

        } finally {

            // Stop loading
            setLoading(false);
        }
    };

    React.useEffect(() => {
    
            fetchCredentials();
    
        }, []);

  return (

    <div className =" flex justify-center items-center mt-5">
        <div>
             <button 
             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
             
             onClick={ () => {handleBack()}}
             >
               
     <span className=' text-lg '> ← </span>
      </button>
    
        <h1>Recycle Credential</h1>

        <div className="block p-6 rounded-lg shadow-lg bg-white max-w-sm">
             {/* LOADING */}

                {loading && (

                    <p className="text-gray-600">
                        Loading credentials...
                    </p>

                )}

                 {/* ERROR */}

                {error && (

                    <p className="text-red-500">
                        {error}
                    </p>

                )}


                {/* NO CREDENTIALS */}

                {!loading && credentials.length === 0 && (

                    <div className="bg-white p-6 rounded-lg shadow">

                        <p className="text-gray-500">
                            No credentials found.
                        </p>

                    </div>

                )}

                 {/* CREDENTIALS LIST */}

                <div className="grid gap-4 bg-gray-100 p-4 rounded-lg shadow">

                    {credentials.map((credential) => (

                        <div
                            key={credential.id}
                            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 bg-gray-300"
                        >

                            {/* TITLE */}

                            <h2 className="text-xl font-bold text-gray-800">
                                {credential.title}
                            </h2>


                            {/* USERNAME */}

                            <p className="text-gray-600 mt-2">

                                <span className="font-medium">
                                    Username:
                                </span>

                                {" "}
                                {credential.username}

                            </p>


                            {/* PASSWORD */}

                            <p className="text-gray-600 mt-2">

                                <span className="font-medium">
                                    Password:
                                </span>

                                {" "}
                                {credential.password}

                            </p>


                            {/* WEBSITE */}

                            <p className="text-gray-600">

                                <span className="font-medium">
                                    Website:
                                </span>

                                {" "}
                                {credential.website}

                            </p>


                            {/* NOTES */}

                            {credential.notes && (

                                <p className="text-gray-500 mt-3">
                                     <span className="font-medium">
                                    Notes: 
                                </span>
                                     {credential.notes}
                                </p>

                            )}

                        </div>

                    ))}

                </div>


        </div>

        </div>
    </div>
  )
}

export default RecycleCredential