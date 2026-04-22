import { EnableStep } from "./types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

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
        <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${twoFAEnabled ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border border-border bg-surface2 text-muted"}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {twoFAEnabled ? "Enabled" : "Disabled"}
        </span>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}

        {!twoFAEnabled && enableStep === "idle" && (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Step 1 — Start setup</p>
            <p className="text-sm text-muted">
              Protect your account with a time-based one-time password from an authenticator app.
            </p>
            <Button variant="outline" onClick={onGenerate} disabled={loading}>
              {loading ? "Loading..." : "Enable 2FA"}
            </Button>
          </>
        )}

        {enableStep === "scanning" && qr && (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Step 2 — Scan and verify</p>
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              <span>⚠</span>
              <span>
                Scan this with Google Authenticator or Authy. <strong className="text-ink">You won't see it again.</strong>
              </span>
            </div>
            <div className="mx-auto w-fit rounded-lg border border-border bg-surface2 p-3">
              <img src={qr} alt="2FA QR Code" width={160} height={160} />
            </div>
            <p className="text-xs text-muted">Enter the 6-digit code from your app to confirm:</p>
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
                {loading ? "Verifying..." : "Confirm"}
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
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted">Tip: paste is supported for the full code.</p>
          </>
        )}

        {twoFAEnabled && !showDisable && (
          <>
            <p className="text-sm text-muted">
              Your account is protected. An authenticator code is required at every login.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDisable(true);
                setError(null);
              }}
            >
              Disable 2FA
            </Button>
          </>
        )}

        {twoFAEnabled && showDisable && (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Disable verification</p>
            <p className="text-xs text-muted">Enter your current authenticator code to confirm:</p>
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
                {loading ? "Disabling..." : "Confirm"}
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
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
