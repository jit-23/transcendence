import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/i18n";

const termsText = `1. Acceptance of Terms
By accessing and using Transcendence ("Service," "we," "us," "our," or "Company"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service. We reserve the right to modify these terms at any time, and your continued use of the Service following modifications constitutes your acceptance of the modified terms.

2. Use License
2.1 Grant of License
We grant you a limited, non-exclusive, revocable license to access and use the Service for lawful purposes only, subject to your compliance with these Terms of Service.
2.2 Restrictions
You agree not to reproduce, distribute, or transmit any content without proper authorization. You agree not to modify, adapt, translate, or create derivative works based on the Service. You agree not to reverse engineer, decompile, or attempt to discover the source code or underlying technology. You agree not to use the Service for any illegal or unauthorized purpose. You agree not to introduce viruses, malware, or other malicious code. You agree not to attempt to gain unauthorized access to the Service or its systems. You agree not to harass, abuse, defame, or threaten other users. You agree not to spam or send unsolicited messages. You agree not to use automated tools (bots, scrapers) without authorization. You agree not to circumvent security measures or access restrictions.

3. User Accounts
3.1 Account Registration
To access certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your password and account information. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.
3.2 Account Security
You are responsible for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.
3.3 Account Termination
We reserve the right to suspend or terminate your account if we determine that you have violated these Terms of Service or engaged in illegal or harmful behavior.

4. Authentication
4.1 OAuth 2.0
The Service supports authentication through Google OAuth 2.0 and 42 School OAuth 2.0. When you use OAuth authentication, you are granting us permission to access the information from those services as indicated by the authorization prompts.
4.2 Two-Factor Authentication
We strongly recommend enabling two-factor authentication (2FA) for enhanced security. You are responsible for managing and protecting your 2FA credentials (TOTP codes).

5. User Content
5.1 Content Ownership
You retain all rights to content you create and upload to the Service ("Your Content"). By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display Your Content for the purpose of operating and improving the Service.
5.2 Content Standards
Your Content must not violate any applicable law or regulation, infringe upon intellectual property rights of third parties, contain defamatory, obscene, offensive, or harmful material, constitute spam or unsolicited promotion, or contain personal information of others without consent.
5.3 Moderation
We reserve the right to remove, edit, or refuse to publish any content that violates these Terms of Service or applicable laws.

6. Canvas and Collaborative Features
6.1 Canvas Sharing
When you share a canvas with other users, those users gain access rights as specified by you. You are responsible for managing canvas permissions.
6.2 Collaborative Responsibility
Users who collaborate on a canvas agree to respect intellectual property rights and not use the collaborative features for harassment or abuse.
6.3 Canvas Data
Canvases and associated data may be stored on our servers. While we implement security measures, we are not liable for data loss or unauthorized access.

7. Communications and Chat
7.1 Privacy of Messages
Private messages between users are intended to be private. However, we may access messages for security, legal, or abuse prevention purposes.
7.2 Conversation Records
Conversations may be temporarily stored on our servers for service delivery purposes. You may delete your conversations at any time.
7.3 Blocking and Reporting
You can block other users to prevent them from contacting you. If you experience harassment or abuse, you can report users to our moderation team.

8. Limitation of Liability
8.1 No Consequential Damages
To the fullest extent permitted by law, we shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, or business opportunity.
8.2 Liability Cap
Our total liability to you for all claims arising from these Terms of Service shall not exceed $100 or the amounts you have paid to us in the 12 months preceding the claim, whichever is greater.

9. User Conduct
You agree to use the Service only for lawful purposes and in ways that do not infringe upon the rights of others. Prohibited behavior includes harassing or threatening other users, attempting unauthorized access, collecting personal information without consent, and violating applicable laws.

10. Dispute Resolution
10.1 Governing Law
These Terms of Service are governed by and construed in accordance with the laws of France, without regard to its conflict of law principles.
10.2 Informal Resolution
Before pursuing formal dispute resolution, you agree to attempt to resolve disputes informally by contacting us.

11. Termination
11.1 Termination by You
You may terminate your account at any time by contacting us or using account settings.
11.2 Termination by Us
We may suspend or terminate your access to the Service immediately if we determine that you have violated these Terms of Service or engaged in illegal or harmful behavior.

12. Contact Information
For questions about these Terms of Service, please contact us at: Email: legal@transcendence.local. Address: Transcendence Services, 42 School, Paris, France.

13. Entire Agreement
These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.

BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.`;

export function TermsOfServicePage() {
    const {t} = useTranslation();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-xs">W</div>
                        whiteboard
                    </div>
                    {/* <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'dark' ? '☀' : '☾'}
                    </Button> */}
                    <LanguageSwitcher />
                </div>
            </header>

            <main className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-muted">Legal</p>
                        <h1 className="font-display text-3xl">{t("terms_terms")}</h1>
                        <p className="mt-1 text-sm text-muted">{t("terms_last")}</p>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-surface2 px-3 text-xs font-medium text-ink transition hover:bg-surface"
                    >
                        {t("terms_back")}
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t("terms_serv")}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-7 text-ink">
                        <div className="whitespace-pre-line">{t("terms_1")}{t("terms_2")}{t("terms_3")}{t("terms_4")}{t("terms_5")}{t("terms_6")}{t("terms_7")}{t("terms_8")}{t("terms_9")}{t("terms_10")}{t("terms_11")}{t("terms_12")}{t("terms_13")}{t("terms_14")}</div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
