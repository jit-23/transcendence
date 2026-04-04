import { Link } from "react-router-dom";

export function ChatPage() {
    return (
        <div id="center">
            <div className="card" style={{ maxWidth: 560, textAlign: "center" }}>
                <h2 style={{ marginBottom: 10 }}>Direct Chat</h2>
                <p style={{ color: "var(--ink3)", marginBottom: 20 }}>
                    This page is now wired correctly. You can add direct-message UI here.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                    <Link to="/dashboard" className="btn btn-ghost">← Dashboard</Link>
                    <Link to="/groups" className="btn btn-primary">Open Group Chats →</Link>
                </div>
            </div>
        </div>
    );
}
