import { EnableStep } from "./types";

type TwoFactorCardProps = {
  twoFAEnabled: boolean;
  enableStep: EnableStep;
  qr: string | null;
  confirmCode: string;
  disableCode: string;
  showDisable: boolean;
  loading: boolean;
  error: string | null;
  setConfirmCode: (value: string) => void;
  setDisableCode: (value: string) => void;
  setEnableStep: (step: EnableStep) => void;
  setQr: (value: string | null) => void;
  setShowDisable: (value: boolean) => void;
  setError: (value: string | null) => void;
  onGenerate: () => void;
  onConfirm: () => void;
  onDisable: () => void;
};

export function TwoFactorCard({
  twoFAEnabled,
  enableStep,
  qr,
  confirmCode,
  disableCode,
  showDisable,
  loading,
  error,
  setConfirmCode,
  setDisableCode,
  setEnableStep,
  setQr,
  setShowDisable,
  setError,
  onGenerate,
  onConfirm,
  onDisable,
}: TwoFactorCardProps) {
  return (
    <div className="section-card fade-up fade-up-2">
      <div className="section-card-header">
        <h3>Two-Factor Authentication</h3>
        <span className={`badge ${twoFAEnabled ? "badge-on" : "badge-off"}`}>
          <span className="badge-dot" />
          {twoFAEnabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      {error && <div className="msg msg-error" style={{ marginBottom: 14 }}>{error}</div>}

      {!twoFAEnabled && enableStep === "idle" && (
        <>
          <p style={{ color: "var(--ink3)", fontSize: "0.8rem", marginBottom: 16, lineHeight: 1.6 }}>
            Protect your account with a time-based one-time password from an authenticator app.
          </p>
          <button className="btn btn-ghost" onClick={onGenerate} disabled={loading}>
            {loading ? "Loading..." : "Enable 2FA"}
          </button>
        </>
      )}

      {enableStep === "scanning" && qr && (
        <>
          <div className="qr-warning">
            <span>⚠</span>
            <span>
              Scan this with Google Authenticator or Authy. <strong style={{ color: "var(--ink)" }}>You won't see it again.</strong>
            </span>
          </div>
          <div className="qr-box">
            <img src={qr} alt="2FA QR Code" width={160} height={160} />
          </div>
          <p style={{ color: "var(--ink3)", fontSize: "0.76rem", marginBottom: 10, marginTop: 4 }}>
            Enter the 6-digit code from your app to confirm:
          </p>
          <div className="code-row">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={confirmCode}
              onChange={(event) => setConfirmCode(event.target.value.replace(/\D/g, ""))}
              className="code-input"
              autoFocus
            />
            <button className="btn btn-primary" onClick={onConfirm} disabled={loading}>
              {loading ? "Verifying..." : "Confirm"}
            </button>
            <button
              className="btn btn-ghost"
              disabled={loading}
              onClick={() => {
                setEnableStep("idle");
                setQr(null);
                setConfirmCode("");
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {twoFAEnabled && !showDisable && (
        <>
          <p style={{ color: "var(--ink3)", fontSize: "0.8rem", marginBottom: 16, lineHeight: 1.6 }}>
            Your account is protected. An authenticator code is required at every login.
          </p>
          <button
            className="btn btn-danger"
            onClick={() => {
              setShowDisable(true);
              setError(null);
            }}
          >
            Disable 2FA
          </button>
        </>
      )}

      {twoFAEnabled && showDisable && (
        <>
          <p style={{ color: "var(--ink3)", fontSize: "0.76rem", marginBottom: 10 }}>
            Enter your current authenticator code to confirm:
          </p>
          <div className="code-row">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={disableCode}
              onChange={(event) => setDisableCode(event.target.value.replace(/\D/g, ""))}
              className="code-input"
              autoFocus
            />
            <button className="btn btn-danger" onClick={onDisable} disabled={loading}>
              {loading ? "Disabling..." : "Confirm"}
            </button>
            <button
              className="btn btn-ghost"
              disabled={loading}
              onClick={() => {
                setShowDisable(false);
                setDisableCode("");
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
