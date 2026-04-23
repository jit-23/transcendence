import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

export function TermsOfServicePage() {
    return (
        <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <main className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-muted">Legal</p>
                        <h1 className="font-display text-3xl">Terms of Service</h1>
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
                        <CardTitle className="text-base">Service terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 text-sm leading-7 text-ink">
                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Transcendence ("Service," "we," "us," "our," or "Company"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service. We reserve the right to modify these terms at any time, and your continued use of the Service following modifications constitutes your acceptance of the modified terms.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">2. Use License</h2>
                            <h3 className="text-base font-semibold text-ink">2.1 Grant of License</h3>
                            <p>
                                We grant you a limited, non-exclusive, revocable license to access and use the Service for lawful purposes only, subject to your compliance with these Terms of Service.
                            </p>
                            <h3 className="text-base font-semibold text-ink">2.2 Restrictions</h3>
                            <p>You agree not to:</p>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li>Reproduce, distribute, or transmit any content without proper authorization.</li>
                                <li>Modify, adapt, translate, or create derivative works based on the Service.</li>
                                <li>Reverse engineer, decompile, or attempt to discover the source code or underlying technology.</li>
                                <li>Use the Service for any illegal or unauthorized purpose.</li>
                                <li>Introduce viruses, malware, or other malicious code.</li>
                                <li>Attempt to gain unauthorized access to the Service or its systems.</li>
                                <li>Harass, abuse, defame, or threaten other users.</li>
                                <li>Spam or send unsolicited messages.</li>
                                <li>Use automated tools (bots, scrapers) without authorization.</li>
                                <li>Circumvent security measures or access restrictions.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">3. User Accounts</h2>
                            <h3 className="text-base font-semibold text-ink">3.1 Account Registration</h3>
                            <p>
                                To access certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your password and account information. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.
                            </p>
                            <h3 className="text-base font-semibold text-ink">3.2 Account Security</h3>
                            <p>
                                You are responsible for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.
                            </p>
                            <h3 className="text-base font-semibold text-ink">3.3 Account Termination</h3>
                            <p>
                                We reserve the right to suspend or terminate your account if we determine that you have violated these Terms of Service or engaged in illegal or harmful behavior.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">4. Authentication</h2>
                            <h3 className="text-base font-semibold text-ink">4.1 OAuth 2.0</h3>
                            <p>
                                The Service supports authentication through Google OAuth 2.0 and 42 School OAuth 2.0. When you use OAuth authentication, you are granting us permission to access the information from those services as indicated by the authorization prompts.
                            </p>
                            <h3 className="text-base font-semibold text-ink">4.2 Two-Factor Authentication</h3>
                            <p>
                                We strongly recommend enabling two-factor authentication (2FA) for enhanced security. You are responsible for managing and protecting your 2FA credentials (TOTP codes).
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">5. User Content</h2>
                            <h3 className="text-base font-semibold text-ink">5.1 Content Ownership</h3>
                            <p>
                                You retain all rights to content you create and upload to the Service ("Your Content"). By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display Your Content for the purpose of operating and improving the Service.
                            </p>
                            <h3 className="text-base font-semibold text-ink">5.2 Content Standards</h3>
                            <p>Your Content must not:</p>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li>Violate any applicable law or regulation.</li>
                                <li>Infringe upon intellectual property rights of third parties.</li>
                                <li>Contain defamatory, obscene, offensive, or harmful material.</li>
                                <li>Constitute spam or unsolicited promotion.</li>
                                <li>Contain personal information of others without consent.</li>
                            </ul>
                            <h3 className="text-base font-semibold text-ink">5.3 Moderation</h3>
                            <p>
                                We reserve the right to remove, edit, or refuse to publish any content that violates these Terms of Service or applicable laws.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">6. Canvas and Collaborative Features</h2>
                            <h3 className="text-base font-semibold text-ink">6.1 Canvas Sharing</h3>
                            <p>
                                When you share a canvas with other users, those users gain access rights as specified by you. You are responsible for managing canvas permissions.
                            </p>
                            <h3 className="text-base font-semibold text-ink">6.2 Collaborative Responsibility</h3>
                            <p>
                                Users who collaborate on a canvas agree to respect intellectual property rights and not use the collaborative features for harassment or abuse.
                            </p>
                            <h3 className="text-base font-semibold text-ink">6.3 Canvas Data</h3>
                            <p>
                                Canvases and associated data may be stored on our servers. While we implement security measures, we are not liable for data loss or unauthorized access.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">7. Communications and Chat</h2>
                            <h3 className="text-base font-semibold text-ink">7.1 Privacy of Messages</h3>
                            <p>
                                Private messages between users are intended to be private. However, we may access messages for security, legal, or abuse prevention purposes.
                            </p>
                            <h3 className="text-base font-semibold text-ink">7.2 Conversation Records</h3>
                            <p>
                                Conversations may be temporarily stored on our servers for service delivery purposes. You may delete your conversations at any time.
                            </p>
                            <h3 className="text-base font-semibold text-ink">7.3 Blocking and Reporting</h3>
                            <p>
                                You can block other users to prevent them from contacting you. If you experience harassment or abuse, you can report users to our moderation team.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">8. Limitation of Liability</h2>
                            <h3 className="text-base font-semibold text-ink">8.1 No Consequential Damages</h3>
                            <p>
                                To the fullest extent permitted by law, we shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, or business opportunity.
                            </p>
                            <h3 className="text-base font-semibold text-ink">8.2 Liability Cap</h3>
                            <p>
                                Our total liability to you for all claims arising from these Terms of Service shall not exceed $100 or the amounts you have paid to us in the 12 months preceding the claim, whichever is greater.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">9. User Conduct</h2>
                            <p>
                                You agree to use the Service only for lawful purposes and in ways that do not infringe upon the rights of others. Prohibited behavior includes harassing or threatening other users, attempting unauthorized access, collecting personal information without consent, and violating applicable laws.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">10. Dispute Resolution</h2>
                            <h3 className="text-base font-semibold text-ink">10.1 Governing Law</h3>
                            <p>
                                These Terms of Service are governed by and construed in accordance with the laws of France, without regard to its conflict of law principles.
                            </p>
                            <h3 className="text-base font-semibold text-ink">10.2 Informal Resolution</h3>
                            <p>
                                Before pursuing formal dispute resolution, you agree to attempt to resolve disputes informally by contacting us.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">11. Termination</h2>
                            <h3 className="text-base font-semibold text-ink">11.1 Termination by You</h3>
                            <p>
                                You may terminate your account at any time by contacting us or using account settings.
                            </p>
                            <h3 className="text-base font-semibold text-ink">11.2 Termination by Us</h3>
                            <p>
                                We may suspend or terminate your access to the Service immediately if we determine that you have violated these Terms of Service or engaged in illegal or harmful behavior.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">12. Contact Information</h2>
                            <p>
                                For questions about these Terms of Service, please contact us at:
                            </p>
                            <ul className="space-y-2 pl-5 text-muted [list-style:disc]">
                                <li><strong>Email:</strong> legal@transcendence.local</li>
                                <li><strong>Address:</strong> Transcendence Services, 42 School, Paris, France</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-lg font-semibold text-ink">13. Entire Agreement</h2>
                            <p>
                                These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.
                            </p>
                        </section>

                        <div className="border-t border-border pt-4 text-sm text-muted">
                            BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
