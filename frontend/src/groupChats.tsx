import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTranslation } from "react-i18next";
import { TopBar } from "./components/ui/topbar";

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
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [searchOpenByGroup, setSearchOpenByGroup] = useState<Record<number, boolean>>({});
  const [searchQueryByGroup, setSearchQueryByGroup] = useState<Record<number, string>>({});

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
      const convData = await conversationsRes.json();
      if (!friendsRes.ok) throw new Error(friendsData.error || t("GCS_failed_load_friends"));
      if (!conversationsRes.ok) throw new Error(convData.error || t("GCS_failed_load_conversations"));
      setFriends(friendsData);
      setConversations(convData.filter((c: Conversation) => c.type === "GROUP"));
    } catch (err: any) {
      setError(err.message || t("GCS_failed_load_data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSelected = (friendId: number) => {
    setSelected((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const deleteGroup = async (conversationId: number) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
      const res = await fetch(`${apiUrl}/conversations/${conversationId}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("GCS_failed_delete"));
      await loadData();
      setError(data.message || t("GCS_group_updated"));
    } catch (err: any) {
      setError(err.message || t("GCS_failed_delete"));
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return setError(t("GCS_name_required"));
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
      const res = await fetch(`${apiUrl}/conversations/group`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ name: groupName.trim(), memberIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("GCS_failed_create"));
      setGroupName("");
      setSelected([]);
      setFriendSearchQuery("");
      setShowCreateGroupModal(false);
      await loadData();
      const title = data.name || groupName.trim();
      navigate(`/chat?conversationId=${data.id}&name=${encodeURIComponent(title)}`);
    } catch (err: any) {
      setError(err.message || t("GCS_failed_create"));
    } finally {
      setLoading(false);
    }
  };

  const openCreateGroupModal = () => {
    setError(null);
    setGroupName("");
    setSelected([]);
    setFriendSearchQuery("");
    setShowCreateGroupModal(true);
  };

  const closeCreateGroupModal = () => {
    if (loading) return;
    setShowCreateGroupModal(false);
  };

  const filteredFriendsForCreate = friends.filter((friend) => {
    const query = friendSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return friend.name.toLowerCase().includes(query);
  });

  const toggleSearch = (conversationId: number) => {
    setSearchOpenByGroup((prev) => {
      const isOpen = prev[conversationId];
      if (isOpen) {
        setSearchQueryByGroup((q) => ({ ...q, [conversationId]: "" }));
      }
      return { ...prev, [conversationId]: !isOpen };
    });
  };

  const addFriendToGroup = async (conversationId: number, friendId: number) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
      const res = await fetch(`${apiUrl}/conversations/${conversationId}/members`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ memberIds: [friendId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("GCS_failed_add"));
      await loadData();
    } catch (err: any) {
      setError(err.message || t("GCS_failed_add"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <TopBar />

      <main className="dashboard-body">
        <div className="page-title fade-up">
          <h1>{t("GCS_group_chats")}</h1>
          <p>{t("GCS_create_groups")}</p>
        </div>

        <div className="section-card fade-up fade-up-1">
          <div className="section-card-header">
            <h3>{t("GCS_create_group")}</h3>
          </div>
          <p style={{ color: "var(--ink3)", fontSize: "0.84rem", marginBottom: 10 }}>
            {t("GCS_create_group_hint")}
          </p>
          <button
            className="btn btn-primary"
            onClick={openCreateGroupModal}
            disabled={loading || friends.length === 0}
          >
            {t("GCS_create_group")}
          </button>
          {friends.length === 0 && (
            <p style={{ color: "var(--ink3)", fontSize: "0.82rem", marginTop: 8 }}>
              {t("GCS_you_need_friends")}
            </p>
          )}
        </div>

        <div className="section-card fade-up fade-up-2">
          <div className="section-card-header">
            <h3>{t("GCS_my_groups")}</h3>
            <button className="btn btn-ghost btn-sm" onClick={loadData} disabled={loading}>
              {t("GCS_refresh")}
            </button>
          </div>

          {error && (
            <div className="msg msg-error" style={{ marginBottom: 10 }}>{error}</div>
          )}

          {conversations.length === 0 && !loading && (
            <p style={{ color: "var(--ink3)", fontSize: "0.82rem" }}>{t("GCS_no_groups")}</p>
          )}

          {conversations.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {conversations.map((conversation) => {
                const title = conversation.name || `Group ${conversation.id}`;
                const isSearchOpen = searchOpenByGroup[conversation.id] ?? false;
                const searchQuery = (searchQueryByGroup[conversation.id] ?? "").toLowerCase().trim();
                const availableFriends = friends.filter(
                  (f) => !conversation.members.some((m) => m.id === f.id)
                );
                const filteredResults = searchQuery
                  ? availableFriends.filter((f) => f.name.toLowerCase().includes(searchQuery))
                  : availableFriends;

                return (
                  <div
                    key={conversation.id}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {/* Name + action buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontWeight: 600 }}>{title}</p>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            navigate(`/chat?conversationId=${conversation.id}&name=${encodeURIComponent(title)}`)
                          }
                        >
                          {t("GCS_open_chat")}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => deleteGroup(conversation.id)}
                          disabled={loading}
                          style={{ color: "var(--error)" }}
                        >
                          {conversation.role === "owner" ? t("GCS_delete") : t("GCS_leave")}
                        </button>
                      </div>
                    </div>

                    {/* Participants label + search toggle (owners only) */}
                    {conversation.role === "owner" && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--ink3)", fontWeight: 600 }}>
                          {t("GCS_participants")}
                        </span>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => toggleSearch(conversation.id)}
                          disabled={loading}
                          style={{ fontSize: "0.8rem" }}
                        >
                          {isSearchOpen ? "✕" : t("DB_invitebutton")}
                        </button>
                      </div>
                    )}

                    {/* Search area */}
                    {conversation.role === "owner" && isSearchOpen && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <input
                          type="text"
                          placeholder={t("FRS_search_user")}
                          value={searchQueryByGroup[conversation.id] ?? ""}
                          onChange={(e) =>
                            setSearchQueryByGroup((prev) => ({
                              ...prev,
                              [conversation.id]: e.target.value,
                            }))
                          }
                          autoFocus
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "var(--surface2)",
                            color: "var(--ink)",
                            fontSize: "0.85rem",
                          }}
                        />
                        {filteredResults.length === 0 ? (
                          <p style={{ fontSize: "0.8rem", color: "var(--ink3)" }}>
                            {availableFriends.length === 0
                              ? t("GCS_all_in_group")
                              : t("CVS_no_friends_match")}
                          </p>
                        ) : (
                          filteredResults.map((friend) => (
                            <div
                              key={friend.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "6px 8px",
                                background: "var(--surface2)",
                                borderRadius: 6,
                                border: "1px solid var(--border)",
                              }}
                            >
                              <span style={{ fontSize: "0.85rem" }}>{friend.name}</span>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => addFriendToGroup(conversation.id, friend.id)}
                                disabled={loading}
                              >
                                {t("DB_invitebutton")}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showCreateGroupModal && (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4"
          onClick={closeCreateGroupModal}
        >
          <div
            className="section-card"
            style={{ width: "100%", maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-card-header" style={{ marginBottom: 10 }}>
              <h3>{t("GCS_create")}</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeCreateGroupModal} disabled={loading}>
                {t("DB_close")}
              </button>
            </div>

            {error && <div className="msg msg-error" style={{ marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <label style={{ color: "#8b8b8b", fontWeight: "600", minWidth: "100px" }}>
                  {t("GCS_name_required")}:
                </label>
                <input
                  className="code-input"
                  placeholder="..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <label style={{ color: "#818181", fontWeight: "600", minWidth: "100px" }}>
                  {t("SEARCH_FRIENDS")}:
                </label>
                <input
                  className="code-input"
                  placeholder="..."
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  maxHeight: 220,
                  minHeight: 220,
                  overflowY: "auto",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 10,
                  backgroundColor: "var(--surface2)",
                }}
              >
                {filteredFriendsForCreate.length === 0 ? (
                  <p style={{ color: "var(--ink3)", fontSize: "0.82rem" }}>{t("CVS_no_friends_match")}</p>
                ) : (
                  filteredFriendsForCreate.map((friend) => (
                    <div
                      key={friend.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "10px 12px",
                        background: "var(--surface1)",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600 }}>{friend.name}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--ink3)" }}>{friend.email}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selected.includes(friend.id)}
                        onChange={() => toggleSelected(friend.id)}
                        style={{ marginLeft: 200, width: 20, height: 20 }}
                      />
                    </div>
                  ))
                )}
              </div>

              <button
                className="btn btn-primary"
                onClick={createGroup}
                disabled={loading || !groupName.trim()}
              >
                {loading ? t("GCS_creating") : t("GCS_create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
