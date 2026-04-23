import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { Avatar } from "./Avatar";
import TopBar from "./components/ui/topbar";

export function ConversationsPage() {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="dashboard-shell">
      <TopBar />

      <main className="dashboard-body">
        <div className="page-title fade-up">
          <h1>Choose Conversation Type</h1>
          <p>Pick how you want to chat.</p>
        </div>

        <div className="section-card fade-up fade-up-1">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <button className="btn btn-primary" onClick={() => navigate("/chat")}>1 to 1 Conversation</button>
            <button className="btn btn-ghost" onClick={() => navigate("/groups")}>Group Chats</button>
          </div>
        </div>
      </main>
    </div>
  );
}
