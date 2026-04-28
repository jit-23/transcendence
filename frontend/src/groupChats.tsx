import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedByGroup, setSelectedByGroup] = useState<Record<number, number[]>>({});
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");

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

      if (!friendsRes.ok) throw new Error(friendsData.error || "Failed to load friends");
      if (!conversationsRes.ok) throw new Error(convData.error || "Failed to load conversations");

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
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
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
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
      const res = await fetch(`${apiUrl}/conversations/group`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          name: groupName.trim(),
          memberIds: selected,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create group");

      setGroupName("");
      setSelected([]);
      setFriendSearchQuery("");
      setShowCreateGroupModal(false);
      await loadData();
      const title = data.name || groupName.trim();
      navigate(`/chat?conversationId=${data.id}&name=${encodeURIComponent(title)}`);
    } catch (err: any) {
      setError(err.message || "Failed to create group");
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
    return (
      friend.name.toLowerCase().includes(query) ||
      friend.email.toLowerCase().includes(query)
    );
  });
  const shouldScrollFriendsList = filteredFriendsForCreate.length > 3;

  const toggleSelectedForGroup = (conversationId: number, friendId: number) => {
    setSelectedByGroup((prev) => {
      const selectedForGroup = prev[conversationId] ?? [];
      const updated = selectedForGroup.includes(friendId)
        ? selectedForGroup.filter((id) => id !== friendId)
        : [...selectedForGroup, friendId];

      return {
        ...prev,
        [conversationId]: updated,
      };
    });
  };

  const addMembersToGroup = async (conversationId: number) => {
    const memberIds = selectedByGroup[conversationId] ?? [];
    if (memberIds.length === 0) {
      setError("Select at least one friend to add");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
      const res = await fetch(`${apiUrl}/conversations/${conversationId}/members`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ memberIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add members");

      setSelectedByGroup((prev) => ({ ...prev, [conversationId]: [] }));
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  const removeMemberFromGroup = async (conversationId: number, memberId: number) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
      const res = await fetch(`${apiUrl}/conversations/${conversationId}/members/${memberId}`, {
        method: "DELETE",
        headers: authHeader(),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove member");

      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <TopBar />

      <main className="dashboard-body">
        <div className="page-title fade-up">
          <h1>Group Chats</h1>
          <p>Create chat-only groups and add friends anytime.</p>
        </div>

        <div className="section-card fade-up fade-up-1">
          <div className="section-card-header">
            <h3>Create Group</h3>
          </div>
          <p style={{ color: "var(--ink3)", fontSize: "0.84rem", marginBottom: 10 }}>
            Open a popup, search your friends, select who to add, and create the group.
          </p>
          <button className="btn btn-primary" onClick={openCreateGroupModal} disabled={loading || friends.length === 0}>
            New Group
          </button>
          {friends.length === 0 && (
            <p style={{ color: "var(--ink3)", fontSize: "0.82rem", marginTop: 8 }}>
              You need friends to create a group.
            </p>
          )}
        </div>

        <div className="section-card fade-up fade-up-2">
          <div className="section-card-header">
            <h3>My Groups</h3>
            <button className="btn btn-ghost btn-sm" onClick={loadData} disabled={loading}>Refresh</button>
          </div>

          {conversations.length === 0 && !loading && (
            <p style={{ color: "var(--ink3)", fontSize: "0.82rem" }}>No groups yet.</p>
          )}

          {conversations.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {conversations.map((conversation) => {
                const title = conversation.name || `Group ${conversation.id}`;
                const availableFriends = friends.filter(
                  (friend) => !conversation.members.some((member) => member.id === friend.id),
                );
                const selectedForGroup = selectedByGroup[conversation.id] ?? [];

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
                        {conversation.members.length} members
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexDirection: "column", width: "10%" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/chat?conversationId=${conversation.id}&name=${encodeURIComponent(title)}`)}
                      >
                        Open Chat
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => deleteGroup(conversation.id)}
                        disabled={loading}
                        style={{ color: "var(--error)" }}
                      >
                        {conversation.role === "owner" ? "Delete" : "Leave"}
                      </button>
                    </div>
                    {conversation.role === "owner" && conversation.members.length > 0 && (
                      <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                        <p style={{ marginBottom: 8, fontSize: "0.78rem", color: "var(--ink3)", fontWeight: 600 }}>
                          Members
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                          {conversation.members.map((member) => (
                            <div key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "6px 8px", backgroundColor: "var(--surface2)", borderRadius: 6 }}>
                              <span style={{ fontSize: "0.85rem" }}>{member.name}</span>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => removeMemberFromGroup(conversation.id, member.id)}
                                disabled={loading}
                                style={{ color: "var(--error)", padding: "2px 6px" }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {conversation.role === "owner" && availableFriends.length > 0 && (
                      <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                        <p style={{ marginBottom: 8, fontSize: "0.78rem", color: "var(--ink3)" }}>
                          Add friends to this group
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                          {availableFriends.map((friend) => (
                            <label key={friend.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <input
                                type="checkbox"
                                checked={selectedForGroup.includes(friend.id)}
                                onChange={() => toggleSelectedForGroup(conversation.id, friend.id)}
                              />
                              <span>{friend.name}</span>
                            </label>
                          ))}
                        </div>

                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => addMembersToGroup(conversation.id)}
                          disabled={loading || selectedForGroup.length === 0}
                        >
                          Add Selected Friends
                        </button>
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
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4" onClick={closeCreateGroupModal}>
          <div className="section-card" style={{ width: "100%", maxWidth: 640 }} onClick={(event) => event.stopPropagation()}>
            <div className="section-card-header" style={{ marginBottom: 10 }}>
              <h3>Create Group</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeCreateGroupModal} disabled={loading}>Close</button>
            </div>

            {error && <div className="msg msg-error" style={{ marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                className="code-input"
                placeholder="Group name"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
              />

              <input
                className="code-input"
                placeholder="Search your friends by name or email"
                value={friendSearchQuery}
                onChange={(event) => setFriendSearchQuery(event.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: shouldScrollFriendsList ? 220 : "none",
                  overflowY: shouldScrollFriendsList ? "auto" : "visible",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 10,
                  backgroundColor: "var(--surface2)",
                }}
              >
                {filteredFriendsForCreate.length === 0 ? (
                  <p style={{ color: "var(--ink3)", fontSize: "0.82rem" }}>No friends match your search.</p>
                ) : (
                  filteredFriendsForCreate.map((friend) => (
                    <label key={friend.id} style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600 }}>{friend.name}</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--ink3)" }}>{friend.email}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selected.includes(friend.id)}
                        onChange={() => toggleSelected(friend.id)}
                      />
                    </label>
                  ))
                )}
              </div>

              <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>
                Selected friends: {selected.length}
              </p>

              <button className="btn btn-primary" onClick={createGroup} disabled={loading || !groupName.trim()}>
                {loading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
