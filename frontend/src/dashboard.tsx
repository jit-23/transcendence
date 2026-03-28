import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";

type EnableStep = "idle" | "scanning" | "confirming";

export function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled ?? false);

    // Enable flow
    const [enableStep, setEnableStep] = useState<EnableStep>("idle");
    const [qr, setQr] = useState<string | null>(null);
    const [confirmCode, setConfirmCode] = useState("");

    // Disable flow
    const [showDisable, setShowDisable] = useState(false);
    const [disableCode, setDisableCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });

    // ── ENABLE Step 1: fetch QR ───────────────────────────────────────────────
    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:8081/users/2fa/generate", {
                method: "POST",
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setQr(data.qr);
            setEnableStep("scanning");
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    // ── ENABLE Step 2: confirm scan with first code ───────────────────────────
    const handleConfirm = async () => {
        if (!confirmCode) return setError("Enter the 6-digit code from your app");
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:8081/users/2fa/confirm", {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ code: confirmCode }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setTwoFAEnabled(true);
            setEnableStep("idle");
            setQr(null);
            setConfirmCode("");
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    // ── DISABLE: require current code ────────────────────────────────────────
    const handleDisable = async () => {
        if (!disableCode) return setError("Enter your current 2FA code to disable");
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:8081/users/2fa/disable", {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ code: disableCode }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setTwoFAEnabled(false);
            setShowDisable(false);
            setDisableCode("");
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Welcome {user?.name}</h1>
            <button onClick={logout}>Logout</button>

            <div style={{ marginTop: "30px", maxWidth: "360px" }}>
                <h3>Two-Factor Authentication</h3>
                <p>Status: <strong>{twoFAEnabled ? "✅ Enabled" : "❌ Disabled"}</strong></p>

                {error && <p style={{ color: "red" }}>{error}</p>}

                {/* NOT ENABLED — show Enable button */}
                {!twoFAEnabled && enableStep === "idle" && (
                    <button onClick={handleGenerate} disabled={loading}>
                        {loading ? "Loading..." : "Enable 2FA"}
                    </button>
                )}

                {/* SCANNING — show QR + confirm input */}
                {enableStep === "scanning" && qr && (
                    <div>
                        <p>⚠️ Scan this QR with Google Authenticator — you won't see it again!</p>
                        <img src={qr} alt="2FA QR Code" style={{ display: "block", margin: "12px 0" }} />
                        <p>Enter the 6-digit code to confirm:</p>
                        <input
                            placeholder="6-digit code"
                            value={confirmCode}
                            onChange={(e) => setConfirmCode(e.target.value)}
                            maxLength={6}
                        />
                        <button onClick={handleConfirm} disabled={loading} style={{ marginLeft: "8px" }}>
                            {loading ? "Verifying..." : "Confirm & Activate"}
                        </button>
                        <button
                            onClick={() => { setEnableStep("idle"); setQr(null); setConfirmCode(""); setError(null); }}
                            style={{ marginLeft: "8px" }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* ENABLED — show Disable button */}
                {twoFAEnabled && !showDisable && (
                    <button onClick={() => { setShowDisable(true); setError(null); }}>
                        Disable 2FA
                    </button>
                )}

                {/* DISABLING — require current code */}
                {twoFAEnabled && showDisable && (
                    <div>
                        <p>Enter your current 2FA code to disable:</p>
                        <input
                            placeholder="6-digit code"
                            value={disableCode}
                            onChange={(e) => setDisableCode(e.target.value)}
                            maxLength={6}
                        />
                        <button onClick={handleDisable} disabled={loading} style={{ marginLeft: "8px" }}>
                            {loading ? "Disabling..." : "Confirm Disable"}
                        </button>
                        <button
                            onClick={() => { setShowDisable(false); setDisableCode(""); setError(null); }}
                            style={{ marginLeft: "8px" }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;