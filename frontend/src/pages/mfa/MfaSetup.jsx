import { useState } from "react";
import API_BASE_URL from "../../config/api";

export default function MfaSetup() {
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const startSetup = async () => {
    try {
    const response = await fetch(`${API_BASE_URL}/api/auth/mfa/setup`, {
      method: "POST",
      headers: authHeaders,
    });
    const data = await response.json();

   if (!response.ok) {
            throw new Error(data.message || "Unable to setup MFA");
        }

        setMfaEnabled(data.enabled);

        if (!data.enabled) {
            setSecret(data.secret || "");
            setOtpauthUri(data.otpauthUri || "");
        }

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

  const enable = async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/mfa/enable`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ code }),
    });
    setMessage(response.ok ? "MFA enabled successfully." : "Invalid MFA code.");
  };

  return (
    <div>
      <h2>Multi-Factor Authentication</h2>
      {!setup && <button onClick={startSetup}>Start MFA Setup</button>}
      {setup && (
        <>
          <p><strong>Secret:</strong> {setup.secret}</p>
          <p>otpauth URI:</p>
          <textarea readOnly value={setup.otpauthUri} rows={4} />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
          />
          <button onClick={enable} disabled={code.length !== 6}>Enable MFA</button>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
