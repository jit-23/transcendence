import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";

export function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled ?? false);
    const [qr, setQr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleToggle2FA = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8081/users/toggle2FA", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setTwoFAEnabled(data.enabled);
            setQr(data.qr ?? null);
        } catch (err) {
            alert("Failed to toggle 2FA");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Welcome {user?.name}</h1>

            <button onClick={logout}>Logout</button>

            <div style={{ marginTop: "20px" }}>
                <p>2FA: <strong>{twoFAEnabled ? "✅ Enabled" : "❌ Disabled"}</strong></p>
                <button onClick={handleToggle2FA} disabled={loading}>
                    {loading ? "Updating..." : twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
                </button>

                {qr && (
                    <div style={{ marginTop: "16px" }}>
                        <p>Scan with Google Authenticator:</p>
                        <img src={qr} alt="2FA QR Code" />
                        <p><em>You won't see this again — scan it now!</em></p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;