import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/i18n";

export function PrivacyPolicyPage() {
	const {t} = useTranslation();
    return (
        <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <main className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-muted">Legal</p>
                        <h1 className="font-display text-3xl">{t("privacy_priv")}</h1>
                        <p className="mt-1 text-sm text-muted">{t("privacy_last")}</p>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-surface2 px-3 text-xs font-medium text-ink transition hover:bg-surface"
                    >
                        {t("privacy_back")}
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t("privacy_details")}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-7 text-ink">
                        <div className="whitespace-pre-line">{t("privacy_1")}{t("privacy_2")}{t("privacy_3")}{t("privacy_4")}{t("privacy_5")}{t("privacy_6")}{t("privacy_7")}{t("privacy_8")}{t("privacy_9")}{t("privacy_10")}{t("privacy_11")}{t("privacy_12")}</div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
