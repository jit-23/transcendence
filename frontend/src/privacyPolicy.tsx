import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";

export function PrivacyPolicyPage() {
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

                <h1 style={{ fontSize: '2.2rem', marginBottom: 8, lineHeight: 1.2 }}>Privacy Policy</h1>
                <p style={{ color: 'var(--ink2)', marginBottom: 32, fontSize: '0.875rem' }}>Last Updated: April 13, 2026</p>

                <div style={{ lineHeight: 1.8, color: 'var(--ink)' }}>
                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>1. Introduction</h2>
                    <p>
                        This Privacy Policy explains how Transcendence ("we," "us," "our," or "Company") collects, uses, discloses, and otherwise processes personal information in connection with our website, mobile applications, and services (collectively, the "Services").
                    </p>
                    <p style={{ marginTop: 12 }}>
                        Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>2. Information We Collect</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>2.1 Information You Provide Directly</h3>
                    <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
                        <li><strong>Account Information:</strong> When you register for an account, we collect information such as your name, email address, password, and profile information.</li>
                        <li><strong>Authentication Information:</strong> If you use OAuth 2.0 authentication (Google, 42 School), we collect the information you authorize those services to share with us.</li>
                        <li><strong>Communication Data:</strong> Messages, conversations, and chat content you share through our platform.</li>
                        <li><strong>Canvas Data:</strong> Content, drawings, and collaborative information related to our canvas features.</li>
                        <li><strong>User Preferences:</strong> Your account settings, theme preferences, and notification preferences.</li>
                    </ul>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>2.2 Information Collected Automatically</h3>
                    <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
                        <li><strong>Device Information:</strong> Device type, operating system, and browser type.</li>
                        <li><strong>Usage Data:</strong> Pages visited, features used, actions taken, and time spent on the Services.</li>
                        <li><strong>IP Address and Location:</strong> Your IP address and approximate geographic location.</li>
                        <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to track user activity and preferences.</li>
                    </ul>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>2.3 Third-Party Information</h3>
                    <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
                        <li><strong>OAuth Providers:</strong> Information shared by Google and 42 School authentication providers.</li>
                        <li><strong>Other Users:</strong> Information other users may provide about you when using our Services (e.g., friend requests, mentions in conversations).</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>3. How We Use Your Information</h2>
                    <p>We use the information we collect for the following purposes:</p>
                    <ul style={{ paddingLeft: 24, marginBottom: 12, marginTop: 12 }}>
                        <li>Service Provision: To provide, maintain, and improve the Services.</li>
                        <li>Account Management: To create and manage your account.</li>
                        <li>Communication: To send you service-related announcements and respond to your inquiries.</li>
                        <li>Personalization: To customize your experience and deliver personalized content.</li>
                        <li>Analytics: To understand how users interact with our Services and improve functionality.</li>
                        <li>Security: To detect, prevent, and address fraud and security issues.</li>
                        <li>Legal Compliance: To comply with applicable laws and regulations.</li>
                        <li>Monitoring: To monitor system performance and user activity through Prometheus metrics.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>4. How We Share Your Information</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>4.1 Information Sharing</h3>
                    <p>We may share your information in the following circumstances:</p>
                    <ul style={{ paddingLeft: 24, marginBottom: 12, marginTop: 12 }}>
                        <li>Collaborators: Canvas collaborators and friends can see your profile information and shared content.</li>
                        <li>Service Providers: Third parties who assist us in operating the Services and conducting our business.</li>
                        <li>Legal Requirements: When required by law or in response to legal process.</li>
                        <li>Business Transfers: If we merge with or are acquired by another company.</li>
                        <li>Blocked Users: Limited information to enforce user blocking features.</li>
                        <li>Public Information: Information you choose to make public is visible to other users.</li>
                    </ul>

                    <h3 style={{ fontSize: '1.1rem', marginTop: 16, marginBottom: 8, color: 'var(--ink)' }}>4.2 Information We Do Not Share</h3>
                    <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
                        <li>We do not sell or rent your personal information to third parties.</li>
                        <li>We do not share passwords or authentication credentials.</li>
                        <li>We do not share private messages without your consent unless required by law.</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>5. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>6. Data Retention</h2>
                    <p>
                        We retain your personal information for as long as your account is active or as necessary to provide the Services. When you delete your account, we will delete or anonymize your information within 30 days, except where we are required to retain it by law or for legitimate business purposes.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>7. Two-Factor Authentication</h2>
                    <p>
                        We offer two-factor authentication (2FA) to enhance account security. Enabling 2FA adds an additional layer of protection to your account using time-based one-time passwords (TOTP).
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>8. User Control and Rights</h2>
                    <p>You have the following rights regarding your personal information:</p>
                    <ul style={{ paddingLeft: 24, marginBottom: 12, marginTop: 12 }}>
                        <li><strong>Access:</strong> You can access and review your personal information through your account settings.</li>
                        <li><strong>Correction:</strong> You can update or correct inaccurate information.</li>
                        <li><strong>Deletion:</strong> You can request deletion of your account and associated data.</li>
                        <li><strong>Portability:</strong> You can request a copy of your data in a portable format.</li>
                        <li><strong>Withdrawal of Consent:</strong> You can withdraw consent for specific processing activities.</li>
                    </ul>
                    <p style={{ marginTop: 12 }}>To exercise these rights, please contact us using the information in Section 10.</p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>9. Children's Privacy</h2>
                    <p>
                        Our Services are not intended for children under 13 years of age, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete such information.
                    </p>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>10. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or our privacy practices, please contact us at:
                    </p>
                    <ul style={{ paddingLeft: 24, marginBottom: 12, marginTop: 12 }}>
                        <li><strong>Email:</strong> privacy@transcendence.local</li>
                        <li><strong>Address:</strong> Transcendence Services, 42 School, Paris, France</li>
                    </ul>

                    <h2 style={{ fontSize: '1.3rem', marginTop: 32, marginBottom: 12, color: 'var(--accent)' }}>11. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy and changing the "Last Updated" date. Your continued use of the Services following the posting of changes constitutes your acceptance of those changes.
                    </p>

                    <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--ink2)', fontSize: '0.875rem' }}>
                            End of Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
