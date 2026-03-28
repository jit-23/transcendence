import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

type EnableStep = "idle" | "scanning";

export function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled ?? false);
    const [enableStep, setEnableStep]     = useState<EnableStep>("idle");
    const [qr, setQr]                     = useState<string | null>(null);
    const [confirmCode, setConfirmCode]   = useState("");
    const [showDisable, setShowDisable]   = useState(false);
    const [disableCode, setDisableCode]   = useState("");
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState<string | null>(null);

    const initials = user?.name?.slice(0, 2).toUpperCase() ?? "??";

    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });

    const handleGenerate = async () => {
        setLoading(true); setError(null);
        try {
            const res  = await fetch("http://localhost:8081/users/2fa/generate", { method: "POST", headers: authHeader() });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setQr(data.qr); setEnableStep("scanning");
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    const handleConfirm = async () => {
        if (!confirmCode) return setError("Enter the 6-digit code");
        setLoading(true); setError(null);
        try {
            const res  = await fetch("http://localhost:8081/users/2fa/confirm", {
                method: "POST", headers: authHeader(), body: JSON.stringify({ code: confirmCode }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setTwoFAEnabled(true); setEnableStep("idle"); setQr(null); setConfirmCode("");
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    const handleDisable = async () => {
        if (!disableCode) return setError("Enter your current 2FA code");
        setLoading(true); setError(null);
        try {
            const res  = await fetch("http://localhost:8081/users/2fa/disable", {
                method: "POST", headers: authHeader(), body: JSON.stringify({ code: disableCode }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setTwoFAEnabled(false); setShowDisable(false); setDisableCode("");
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="dashboard-shell">
            {/* ── Topbar ── */}
            <header className="topbar">
                <div className="logo">
                    <div className="logo-mark">W</div>
                    whiteboard
                </div>
                <div className="topbar-right">
                    <div className="user-chip">
                        <div className="user-avatar">{initials}</div>
                        {user?.name}
                    </div>
                    <button className="btn btn-ghost" onClick={() => navigate('/profile')}
                            style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                        Profile
                    </button>
                    <button className="btn btn-ghost" onClick={logout}
                            style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                        Sign out
                    </button>
                </div>
            </header>

            {/* ── Body ── */}
            <main className="dashboard-body">
                <div className="page-title fade-up">
                    <h1>Good to see you, {user?.name} 👋</h1>
                    <p>Manage your account and security settings below.</p>
                </div>

                {/* Account info card */}
                <div className="section-card fade-up fade-up-1">
                    <div className="section-card-header">
                        <h3>Account</h3>
                        <button className="btn btn-ghost" onClick={() => navigate('/profile')}
                                style={{ padding: '5px 14px', fontSize: '0.76rem' }}>
                            Edit →
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { label: 'Username', value: user?.name },
                            { label: 'Email',    value: user?.email },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--ink3)', fontSize: '0.78rem' }}>{label}</span>
                                <span style={{ color: 'var(--ink2)', fontFamily: 'var(--font-mono)' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2FA card */}
                <div className="section-card fade-up fade-up-2">
                    <div className="section-card-header">
                        <h3>Two-Factor Authentication</h3>
                        <span className={`badge ${twoFAEnabled ? 'badge-on' : 'badge-off'}`}>
                            <span className="badge-dot" />
                            {twoFAEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    {error && <div className="msg msg-error" style={{ marginBottom: 14 }}>{error}</div>}

                    {/* NOT enabled — idle */}
                    {!twoFAEnabled && enableStep === "idle" && (
                        <div>
                            <p style={{ color: 'var(--ink3)', fontSize: '0.82rem', marginBottom: 14 }}>
                                Add an extra layer of security to your account using an authenticator app.
                            </p>
                            <button className="btn btn-ghost" onClick={handleGenerate} disabled={loading}>
                                {loading ? 'Loading...' : 'Enable 2FA'}
                            </button>
                        </div>
                    )}

                    {/* SCANNING — show QR */}
                    {enableStep === "scanning" && qr && (
                        <div>
                            <div className="qr-warning">
                                <span className="qr-warning-icon">⚠️</span>
                                <span>Scan this QR code with Google Authenticator or Authy. <strong style={{ color: 'var(--ink)' }}>You won't see it again.</strong></span>
                            </div>
                            <div className="qr-box">
                                <img src={qr} alt="2FA QR Code" width={160} height={160} />
                            </div>
                            <p style={{ color: 'var(--ink3)', fontSize: '0.78rem', marginBottom: 10 }}>
                                Enter the 6-digit code from your app to confirm:
                            </p>
                            <div className="code-row">
                                <input
                                    type="text" inputMode="numeric" maxLength={6}
                                    placeholder="000000"
                                    value={confirmCode}
                                    onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                />
                                <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
                                    {loading ? 'Verifying...' : 'Confirm'}
                                </button>
                                <button className="btn btn-ghost" disabled={loading}
                                        onClick={() => { setEnableStep("idle"); setQr(null); setConfirmCode(""); setError(null); }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ENABLED */}
                    {twoFAEnabled && !showDisable && (
                        <div>
                            <p style={{ color: 'var(--ink3)', fontSize: '0.82rem', marginBottom: 14 }}>
                                Your account is protected with two-factor authentication.
                            </p>
                            <button className="btn btn-danger"
                                    onClick={() => { setShowDisable(true); setError(null); }}>
                                Disable 2FA
                            </button>
                        </div>
                    )}

                    {/* DISABLING */}
                    {twoFAEnabled && showDisable && (
                        <div>
                            <p style={{ color: 'var(--ink3)', fontSize: '0.82rem', marginBottom: 10 }}>
                                Enter your current authenticator code to confirm:
                            </p>
                            <div className="code-row">
                                <input
                                    type="text" inputMode="numeric" maxLength={6}
                                    placeholder="000000"
                                    value={disableCode}
                                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                />
                                <button className="btn btn-danger" onClick={handleDisable} disabled={loading}>
                                    {loading ? 'Disabling...' : 'Confirm'}
                                </button>
                                <button className="btn btn-ghost" disabled={loading}
                                        onClick={() => { setShowDisable(false); setDisableCode(""); setError(null); }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;