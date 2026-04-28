import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { Avatar } from "./Avatar";
import TopBar from "./components/ui/topbar";

type ConversationMember = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
};

type Conversation = {
  id: number;
  type: "DIRECT" | "GROUP";
  name: string | null;
  members: ConversationMember[];
  role?: string;
};

type ConversationRow = Conversation & {
  displayName: string;
  otherMember?: ConversationMember;
};

export function ConversationsPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeader = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const loadConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
      const res = await fetch(`${apiUrl}/conversations/my`, { headers: authHeader() });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load conversations");
      }

      setConversations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  const sortedConversations = useMemo<ConversationRow[]>(() => {
    return conversations
      .map((conversation) => {
        const otherMember =
          conversation.type === "DIRECT"
            ? conversation.members.find((member) => member.id !== user?.id) ?? conversation.members[0]
            : undefined;

        const displayName =
          conversation.type === "GROUP"
            ? conversation.name?.trim() || `Group ${conversation.id}`
            : otherMember?.name?.trim() || conversation.name?.trim() || `Direct ${conversation.id}`;

        return {
          ...conversation,
          displayName,
          otherMember,
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
  }, [conversations, user?.id]);

  const openConversation = (conversation: ConversationRow) => {
    if (conversation.type === "DIRECT" && conversation.otherMember) {
      navigate(
        `/chat?friendId=${conversation.otherMember.id}&name=${encodeURIComponent(conversation.displayName)}`,
      );
      return;
    }

    navigate(`/chat?conversationId=${conversation.id}&name=${encodeURIComponent(conversation.displayName)}`);
  };

  return (
    <div className="dashboard-shell">
      <TopBar />

      <main className="dashboard-body">
        <div className="page-title fade-up">
          <h1>Conversations</h1>
          <p>All your chats in alphabetical order.</p>
        </div>

        <div className="section-card fade-up fade-up-1">
          <div className="section-card-header" style={{ marginBottom: 12 }}>
            <h3>Your Conversations</h3>
            <button className="btn btn-ghost btn-sm" onClick={loadConversations} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && <div className="msg msg-error" style={{ marginBottom: 12 }}>{error}</div>}

          {!loading && sortedConversations.length === 0 && (
            <p style={{ color: "var(--ink3)", fontSize: "0.85rem" }}>No conversations yet.</p>
          )}

          {sortedConversations.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sortedConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className="btn"
                  onClick={() => openConversation(conversation)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    background: "var(--surface2)",
                    color: "var(--ink)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar
                      avatar={conversation.otherMember?.avatar}
                      name={conversation.displayName}
                      size={32}
                    />
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontWeight: 600 }}>{conversation.displayName}</p>
                      <p style={{ color: "var(--ink3)", fontSize: "0.78rem" }}>
                        {conversation.type === "GROUP"
                          ? `Group • ${conversation.members.length} members`
                          : "Direct conversation"}
                      </p>
                    </div>
                  </div>
                  <span style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>
                    {conversation.type === "GROUP" ? "Group" : "1:1"}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => navigate("/choose-conversation")}>Start 1 to 1 Conversation</button>
            <button className="btn btn-ghost" onClick={() => navigate("/groups")}>Manage Group Chats</button>
          </div>
        </div>
      </main>
    </div>
  );
}
