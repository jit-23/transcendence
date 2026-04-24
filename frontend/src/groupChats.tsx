import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { createSharedCanvas } from "./utils/sharedCanvas";
import LanguageSwitcher from "./components/i18n";
import { useTranslation } from "react-i18next";

type Friend = {
  id: number;
  name: string;
  email: string;
};

type Conversation = {
  id: number;
  type: "DIRECT" | "GROUP";
  name: string | null;
  members: Friend[];
  role?: string;
};

export function GroupChatsPage() {
  const {t} = useTranslation();
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeader = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
    try {
        const [friendsRes, conversationsRes] = await Promise.all([
        fetch(`${apiUrl}/users/friends`, { headers: authHeader() }),
        fetch(`${apiUrl}/conversations/my`, { headers: authHeader() }),
      ]);

      const friendsData = await friendsRes.json();
      const convData = await convRes.json();

      if (!friendsRes.ok) throw new Error(friendsData.error || "Failed to load friends");
      if (!convRes.ok) throw new Error(convData.error || "Failed to load conversations");

      setFriends(friendsData);
      setConversations(convData.filter((conversation: Conversation) => conversation.type === "GROUP"));
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSelected = (friendId: number) => {
    setSelected((prev) => {
      if (prev.includes(friendId)) return prev.filter((id) => id !== friendId);
      return [...prev, friendId];
    });
  };

  const deleteGroup = async (conversationId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/conversations/${conversationId}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete group");

      await loadData();
      setError(data.message || "Group updated");
    } catch (err: any) {
      setError(err.message || "Failed to delete group");
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim())
      return setError("Group name is required");

    setLoading(true);
    setError(null);
    try {
      const sharedCanvas = await createSharedCanvas({
        groupName: groupName.trim(),
        collaboratorIds: selected,
      });

      setGroupName("");
      setSelected([]);
      await loadData();
      navigate(`/canvas?id=${sharedCanvas.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="logo">
          <div className="logo-mark">W</div>
          whiteboard
        </div>
        <div className="topbar-right">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
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
          <h1>{t("GCS_group_chats")}</h1>
          <p>{t("GCS_create_groups")}</p>
        </div>

        <div className="section-card fade-up fade-up-1">
          <div className="section-card-header">
            <h3>{t("GCS_create_group")}</h3>
          </div>

          {error && <div className="msg msg-error" style={{ marginBottom: 12 }}>{error}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              className="code-input"
              placeholder="Group name"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {friends.length === 0 && <p style={{ color: "var(--ink3)" }}>{t("GCS_you_need_friends")}</p>}
              {friends.map((friend) => (
                <label key={friend.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(friend.id)}
                    onChange={() => toggleSelected(friend.id)}
                  />
                  <span>{friend.name} ({friend.email})</span>
                </label>
              ))}
            </div>

            <button className="btn btn-primary" onClick={createGroup} disabled={loading}>
              {loading ? t("GCS_creating") : t("GCS_create")}
            </button>
          </div>
        </div>

        <div className="section-card fade-up fade-up-2">
          <div className="section-card-header">
            <h3>{t("GCS_my_groups")}</h3>
            <button className="btn btn-ghost btn-sm" onClick={loadData} disabled={loading}>{t("GCS_refresh")}</button>
          </div>

          {conversations.length === 0 && !loading && (
            <p style={{ color: "var(--ink3)", fontSize: "0.82rem" }}>{t("GCS_no_groups")}</p>
          )}

          {conversations.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {conversations.map((conversation) => {
                const title = conversation.name || `Group ${conversation.id}`;
                return (
                  <div
                    key={conversation.id}
                    style={{
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ marginBottom: 4, fontWeight: 600 }}>{title}</p>
                      <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>
                        {conversation.members.length} {t("GCS_members")}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/chat?conversationId=${conversation.id}&name=${encodeURIComponent(title)}`)}
                      >
                        {t("GCS_open_chat")}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => deleteGroup(conversation.id)}
                        disabled={loading}
                        style={{ color: "var(--error)" }}
                      >
                        {conversation.role === "owner" ? t("GCS_delete"): t("GCS_leave")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
