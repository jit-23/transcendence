import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { Avatar } from "./Avatar";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/i18n";

export function ConversationsPage() {
  const {t} = useTranslation();
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="logo">
          <div className="logo-mark">W</div>
          whiteboard
        </div>

        <div className="topbar-right">
          <div className="user-chip">
            <Avatar avatar={user?.avatar} name={user?.name ?? "?"} size={24} />
            {user?.name}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>{t("CO_dashboard")}</button>
          {/* <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "☀" : "☾"}
          </button> */}
          <LanguageSwitcher />
        </div>
      </header>

      <main className="dashboard-body">
        <div className="page-title fade-up">
          <h1>{t("CO_choose")}</h1>
          <p>{t("CO_pick_how")}</p>
        </div>

        <div className="section-card fade-up fade-up-1">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <button className="btn btn-primary" onClick={() => navigate("/chat")}>{t("CO_one_to_one")}</button>
            <button className="btn btn-ghost" onClick={() => navigate("/groups")}>{t("CO_group_chat")}</button>
          </div>
        </div>
      </main>
    </div>
  );
}
