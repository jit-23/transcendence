import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";

export function TermsOfServicePage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div id="center" style={{ paddingTop: 60, paddingBottom: 60 }}>
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                title="Toggle theme"
                style={{ position: 'fixed', top: 20, right: 24 }}
            >
                {theme === 'dark' ? '☀' : '☾'}
            </button>

            <div style={{ maxWidth: 760, textAlign: 'left' }}>
                <Link to="/" style={{ color: 'var(--ink2)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: 32, display: 'inline-block' }}>
                    ← Back to home
                </Link>

                <h1 style={{ fontSize: '2.2rem', marginBottom: 8, lineHeight: 1.2 }}>Terms of Service</h1>
                <p style={{ color: 'var(--ink2)', marginBottom: 32, fontSize: '0.875rem' }}>Last Updated: April 13, 2026</p>

                <div style={{ lineHeight: 1.8, color: 'var(--ink)' }}>
                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Transcendence ("Service," "we," "us," "our," or "Company"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service. We reserve the right to modify these terms at any time, and your continued use of the Service following modifications constitutes your acceptance of the modified terms.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>2. Use License</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>2.1 Grant of License</h3>
                    <p>
                        We grant you a limited, non-exclusive, revocable license to access and use the Service for lawful purposes only, subject to your compliance with these Terms of Service.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>2.2 Restrictions</h3>
                    <p>You agree not to:</p>
                    <ul style={{ paddingLeft: 24, marginBottom: 12, marginTop: 12 }}>
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

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>3. User Accounts</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>3.1 Account Registration</h3>
                    <p>
                        To access certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your password and account information. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>3.2 Account Security</h3>
                    <p>
                        You are responsible for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>3.3 Account Termination</h3>
                    <p>
                        We reserve the right to suspend or terminate your account if we determine that you have violated these Terms of Service or engaged in illegal or harmful behavior.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>4. Authentication</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>4.1 OAuth 2.0</h3>
                    <p>
                        The Service supports authentication through Google OAuth 2.0 and 42 School OAuth 2.0. When you use OAuth authentication, you are granting us permission to access the information from those services as indicated by the authorization prompts.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>4.2 Two-Factor Authentication</h3>
                    <p>
                        We strongly recommend enabling two-factor authentication (2FA) for enhanced security. You are responsible for managing and protecting your 2FA credentials (TOTP codes).
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>5. User Content</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>5.1 Content Ownership</h3>
                    <p>
                        You retain all rights to content you create and upload to the Service ("Your Content"). By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display Your Content for the purpose of operating and improving the Service.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>5.2 Content Standards</h3>
                    <p>Your Content must not:</p>
                    <ul style={{ paddingLeft: 24, marginBottom: 12, marginTop: 12 }}>
                        <li>Violate any applicable law or regulation.</li>
                        <li>Infringe upon intellectual property rights of third parties.</li>
                        <li>Contain defamatory, obscene, offensive, or harmful material.</li>
                        <li>Constitute spam or unsolicited promotion.</li>
                        <li>Contain personal information of others without consent.</li>
                    </ul>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>5.3 Moderation</h3>
                    <p>
                        We reserve the right to remove, edit, or refuse to publish any content that violates these Terms of Service or applicable laws.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>6. Canvas and Collaborative Features</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>6.1 Canvas Sharing</h3>
                    <p>
                        When you share a canvas with other users, those users gain access rights as specified by you. You are responsible for managing canvas permissions.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>6.2 Collaborative Responsibility</h3>
                    <p>
                        Users who collaborate on a canvas agree to respect intellectual property rights and not use the collaborative features for harassment or abuse.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>6.3 Canvas Data</h3>
                    <p>
                        Canvases and associated data may be stored on our servers. While we implement security measures, we are not liable for data loss or unauthorized access.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>7. Communications and Chat</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>7.1 Privacy of Messages</h3>
                    <p>
                        Private messages between users are intended to be private. However, we may access messages for security, legal, or abuse prevention purposes.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>7.2 Conversation Records</h3>
                    <p>
                        Conversations may be temporarily stored on our servers for service delivery purposes. You may delete your conversations at any time.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>7.3 Blocking and Reporting</h3>
                    <p>
                        You can block other users to prevent them from contacting you. If you experience harassment or abuse, you can report users to our moderation team.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>8. Limitation of Liability</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>8.1 No Consequential Damages</h3>
                    <p>
                        To the fullest extent permitted by law, we shall not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, or business opportunity.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>8.2 Liability Cap</h3>
                    <p>
                        Our total liability to you for all claims arising from these Terms of Service shall not exceed $100 or the amounts you have paid to us in the 12 months preceding the claim, whichever is greater.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>9. User Conduct</h2>
                    <p>
                        You agree to use the Service only for lawful purposes and in ways that do not infringe upon the rights of others. Prohibited behavior includes harassing or threatening other users, attempting unauthorized access, collecting personal information without consent, and violating applicable laws.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>10. Dispute Resolution</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>10.1 Governing Law</h3>
                    <p>
                        These Terms of Service are governed by and construed in accordance with the laws of France, without regard to its conflict of law principles.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>10.2 Informal Resolution</h3>
                    <p>
                        Before pursuing formal dispute resolution, you agree to attempt to resolve disputes informally by contacting us.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>11. Termination</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>11.1 Termination by You</h3>
                    <p>
                        You may terminate your account at any time by contacting us or using account settings.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>11.2 Termination by Us</h3>
                    <p>
                        We may suspend or terminate your access to the Service immediately if we determine that you have violated these Terms of Service or engaged in illegal or harmful behavior.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>12. Contact Information</h2>
                    <p>
                        For questions about these Terms of Service, please contact us at:
                    </p>
                    <ul style={{ paddingLeft: 24, marginBottom: 12, marginTop: 12 }}>
                        <li><strong>Email:</strong> legal@transcendence.local</li>
                        <li><strong>Address:</strong> Transcendence Services, 42 School, Paris, France</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>13. Entire Agreement</h2>
                    <p>
                        These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.
                    </p>

                    <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--ink2)', fontSize: '0.875rem' }}>
                            BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
