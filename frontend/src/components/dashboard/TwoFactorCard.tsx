import { EnableStep } from "./types";
import { useTranslation } from 'react-i18next';

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
  const {t} = useTranslation()
  return (
    <div className="section-card fade-up fade-up-2">
      <div className="section-card-header">
        <h3>{t("two_fac_auth")}</h3>
        <span className={`badge ${twoFAEnabled ? "badge-on" : "badge-off"}`}>
          <span className="badge-dot" />
          {twoFAEnabled ? t("enabled_2fa") : t("disabled_2fa")}
        </span>
      </div>

      {error && <div className="msg msg-error" style={{ marginBottom: 14 }}>{error}</div>}

      {!twoFAEnabled && enableStep === "idle" && (
        <>
          <p style={{ color: "var(--ink3)", fontSize: "0.8rem", marginBottom: 16, lineHeight: 1.6 }}>
            {t("protect_acc_2fa")}
          </p>
          <button className="btn btn-ghost" onClick={onGenerate} disabled={loading}>
            {loading ? t("loading") : t("enable_2fa")}
          </button>
        </>
      )}

      {enableStep === "scanning" && qr && (
        <>
          <div className="qr-warning">
            <span>⚠</span>
            <span>
              {t("scan_2fa")}<strong style={{ color: "var(--ink)" }}>{t("wont_see_2fa")}</strong>
            </span>
          </div>
          <div className="qr-box">
            <img src={qr} alt="2FA QR Code" width={160} height={160} />
          </div>
          <p style={{ color: "var(--ink3)", fontSize: "0.76rem", marginBottom: 10, marginTop: 4 }}>
            {t("enter_2fa")}
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
              {loading ? t("verifying") : t("confirm_2fa")}
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
              {t("cancel_2fa")}
            </button>
          </div>
        </>
      )}

      {twoFAEnabled && !showDisable && (
        <>
          <p style={{ color: "var(--ink3)", fontSize: "0.8rem", marginBottom: 16, lineHeight: 1.6 }}>
            {t("acc_protected_2fa")}
          </p>
          <button
            className="btn btn-danger"
            onClick={() => {
              setShowDisable(true);
              setError(null);
            }}
          >
            {t("disable_2fa")}
          </button>
        </>
      )}

      {twoFAEnabled && showDisable && (
        <>
          <p style={{ color: "var(--ink3)", fontSize: "0.76rem", marginBottom: 10 }}>
            {t("enter_curr_2fa")}
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
              {loading ? t("disabling_2fa") : t("confirm_2fa")}
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
              {t("cancel_2fa")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
