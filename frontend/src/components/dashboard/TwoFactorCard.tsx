import { EnableStep } from "./types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";

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
  const {t} = useTranslation();
  const sanitizeCode = (value: string) => value.replace(/\D/g, "").slice(0, 6);

  const handlePasteCode = (
    event: React.ClipboardEvent<HTMLInputElement>,
    setCode: (value: string) => void
  ) => {
    const pasted = sanitizeCode(event.clipboardData.getData("text"));
    if (pasted) {
      event.preventDefault();
      setCode(pasted);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{t("TFC_two_fac_auth")}</CardTitle>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${twoFAEnabled ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border border-border bg-surface2 text-muted"}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {twoFAEnabled ? t("TFC_enabled_2fa") : t("TFC_disabled_2fa")}
        </span>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}

        {!twoFAEnabled && enableStep === "idle" && (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t("TFC_step1")}</p>
            <p className="text-sm text-muted">
              {t("TFC_protect_acc_2fa")}
            </p>
            <Button variant="outline" onClick={onGenerate} disabled={loading}>
              {loading ? t("TFC_loading_2fa") : t("TFC_enable_2fa")}
            </Button>
          </>
        )}

        {enableStep === "scanning" && qr && (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t("TFC_step2")}</p>
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              <span>⚠</span>
              <span>
                {t("TFC_scan_2fa")}<strong className="text-ink">{t("TFC_wont_see_2fa")}</strong>
              </span>
            </div>
            <div className="mx-auto w-fit rounded-lg border border-border bg-surface2 p-3">
              <img src={qr} alt="2FA QR Code" width={160} height={160} />
            </div>
            <p className="text-xs text-muted">{t("TFC_enter_2fa")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={confirmCode}
                onChange={(event) => setConfirmCode(sanitizeCode(event.target.value))}
                onPaste={(event) => handlePasteCode(event, setConfirmCode)}
                className="max-w-[140px]"
                autoFocus
              />
              <Button onClick={onConfirm} disabled={loading}>
                {loading ? t("TFC_verifying") : t("TFC_confirm")}
              </Button>
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => {
                  setEnableStep("idle");
                  setQr(null);
                  setConfirmCode("");
                  setError(null);
                }}
              >
                {t("TFC_cancel_2fa")}
              </Button>
            </div>
            <p className="text-xs text-muted">{t("TFC_tip")}</p>
          </>
        )}

        {twoFAEnabled && !showDisable && (
          <>
            <p className="text-sm text-muted">
              {t("TFC_acc_protected_2fa")}
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDisable(true);
                setError(null);
              }}
            >
              {t("TFC_disable_2fa")}
            </Button>
          </>
        )}

        {twoFAEnabled && showDisable && (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{t("TFC_disable")}</p>
            <p className="text-xs text-muted">{t("TFC_enter_curr_2fa")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={disableCode}
                onChange={(event) => setDisableCode(sanitizeCode(event.target.value))}
                onPaste={(event) => handlePasteCode(event, setDisableCode)}
                className="max-w-[140px]"
                autoFocus
              />
              <Button variant="destructive" onClick={onDisable} disabled={loading}>
                {loading ? t("TFC_disabling_2fa") : t("TFC_confirm")}
              </Button>
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => {
                  setShowDisable(false);
                  setDisableCode("");
                  setError(null);
                }}
              >
                {t("TFC_cancel_2fa")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
