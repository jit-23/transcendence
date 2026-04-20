import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

export function PrivacyPolicyPage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-xs">W</div>
                        whiteboard
                    </div>
                    <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'dark' ? '☀' : '☾'}
                    </Button>
                </div>
            </header>

            <main className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-muted">Legal</p>
                        <h1 className="font-display text-3xl">Privacy Policy</h1>
                        <p className="mt-1 text-sm text-muted">Last Updated: April 13, 2026</p>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-surface2 px-3 text-xs font-medium text-ink transition hover:bg-surface"
                    >
                        ← Back to home
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Policy details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 text-sm leading-7 text-ink">
                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">1. Introduction</h2>
                            <p>
                                This Privacy Policy explains how Transcendence ("we," "us," "our," or "Company") collects, uses, discloses, and otherwise processes personal information in connection with our website, mobile applications, and services (collectively, the "Services").
                            </p>
                            <p>
                                Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">2. Information We Collect</h2>
                            <h3 className="text-base font-semibold text-ink">2.1 Information You Provide Directly</h3>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li><strong>Account Information:</strong> When you register for an account, we collect information such as your name, email address, password, and profile information.</li>
                                <li><strong>Authentication Information:</strong> If you use OAuth 2.0 authentication (Google, 42 School), we collect the information you authorize those services to share with us.</li>
                                <li><strong>Communication Data:</strong> Messages, conversations, and chat content you share through our platform.</li>
                                <li><strong>Canvas Data:</strong> Content, drawings, and collaborative information related to our canvas features.</li>
                                <li><strong>User Preferences:</strong> Your account settings, theme preferences, and notification preferences.</li>
                            </ul>
                            <h3 className="text-base font-semibold text-ink">2.2 Information Collected Automatically</h3>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li><strong>Device Information:</strong> Device type, operating system, and browser type.</li>
                                <li><strong>Usage Data:</strong> Pages visited, features used, actions taken, and time spent on the Services.</li>
                                <li><strong>IP Address and Location:</strong> Your IP address and approximate geographic location.</li>
                                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to track user activity and preferences.</li>
                            </ul>
                            <h3 className="text-base font-semibold text-ink">2.3 Third-Party Information</h3>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li><strong>OAuth Providers:</strong> Information shared by Google and 42 School authentication providers.</li>
                                <li><strong>Other Users:</strong> Information other users may provide about you when using our Services (e.g., friend requests, mentions in conversations).</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">3. How We Use Your Information</h2>
                            <p>We use the information we collect for the following purposes:</p>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li>Service Provision: To provide, maintain, and improve the Services.</li>
                                <li>Account Management: To create and manage your account.</li>
                                <li>Communication: To send you service-related announcements and respond to your inquiries.</li>
                                <li>Personalization: To customize your experience and deliver personalized content.</li>
                                <li>Analytics: To understand how users interact with our Services and improve functionality.</li>
                                <li>Security: To detect, prevent, and address fraud and security issues.</li>
                                <li>Legal Compliance: To comply with applicable laws and regulations.</li>
                                <li>Monitoring: To monitor system performance and user activity through Prometheus metrics.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">4. How We Share Your Information</h2>
                            <h3 className="text-base font-semibold text-ink">4.1 Information Sharing</h3>
                            <p>We may share your information in the following circumstances:</p>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li>Collaborators: Canvas collaborators and friends can see your profile information and shared content.</li>
                                <li>Service Providers: Third parties who assist us in operating the Services and conducting our business.</li>
                                <li>Legal Requirements: When required by law or in response to legal process.</li>
                                <li>Business Transfers: If we merge with or are acquired by another company.</li>
                                <li>Blocked Users: Limited information to enforce user blocking features.</li>
                                <li>Public Information: Information you choose to make public is visible to other users.</li>
                            </ul>
                            <h3 className="text-base font-semibold text-ink">4.2 Information We Do Not Share</h3>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li>We do not sell or rent your personal information to third parties.</li>
                                <li>We do not share passwords or authentication credentials.</li>
                                <li>We do not share private messages without your consent unless required by law.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">5. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">6. Data Retention</h2>
                            <p>
                                We retain your personal information for as long as your account is active or as necessary to provide the Services. When you delete your account, we will delete or anonymize your information within 30 days, except where we are required to retain it by law or for legitimate business purposes.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">7. Two-Factor Authentication</h2>
                            <p>
                                We offer two-factor authentication (2FA) to enhance account security. Enabling 2FA adds an additional layer of protection to your account using time-based one-time passwords (TOTP).
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">8. User Control and Rights</h2>
                            <p>You have the following rights regarding your personal information:</p>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li><strong>Access:</strong> You can access and review your personal information through your account settings.</li>
                                <li><strong>Correction:</strong> You can update or correct inaccurate information.</li>
                                <li><strong>Deletion:</strong> You can request deletion of your account and associated data.</li>
                                <li><strong>Portability:</strong> You can request a copy of your data in a portable format.</li>
                                <li><strong>Withdrawal of Consent:</strong> You can withdraw consent for specific processing activities.</li>
                            </ul>
                            <p>To exercise these rights, please contact us using the information in Section 10.</p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">9. Children&apos;s Privacy</h2>
                            <p>
                                Our Services are not intended for children under 13 years of age, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete such information.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">10. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
                            </p>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li><strong>Email:</strong> privacy@transcendence.local</li>
                                <li><strong>Address:</strong> Transcendence Services, 42 School, Paris, France</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">11. Changes to This Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy and changing the "Last Updated" date. Your continued use of the Services following the posting of changes constitutes your acceptance of those changes.
                            </p>
                        </section>

                        <div className="border-t border-border pt-4 text-sm text-muted">
                            End of Privacy Policy
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
