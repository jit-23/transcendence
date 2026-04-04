import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";

type ChatMessage = {
    id?: number;
    senderId?: number;
    from: string;
    text: string;
    createdAt?: string;
};

export function ChatPage() {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const groupConversationId = Number(searchParams.get("conversationId") || "0");
    const friendId = Number(searchParams.get("friendId") || "0");
    const chatName = (searchParams.get("name") || "").trim();
    const isGroupMode = groupConversationId > 0;

    const [activeConversationId, setActiveConversationId] = useState<number>(isGroupMode ? groupConversationId : 0);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pageLoading, setPageLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isFriendTyping, setIsFriendTyping] = useState(false);
    const [typingLabel, setTypingLabel] = useState("");
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const myName = useMemo(() => user?.name || "", [user?.name]);

    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });

    useEffect(() => {
        if (isGroupMode) {
            setActiveConversationId(groupConversationId);
            setError(null);
            return;
        }

        const ensureDirectConversation = async () => {
            if (!friendId) {
                setError("Missing friend target. Open direct chat from your friends list.");
                setActiveConversationId(0);
                return;
            }

            setPageLoading(true);
            setError(null);
            try {
                const res = await fetch("http://localhost:8081/conversations/direct", {
                    method: "POST",
                    headers: authHeader(),
                    body: JSON.stringify({ friendId }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || "Failed to open direct conversation");
                    setActiveConversationId(0);
                    return;
                }
                setActiveConversationId(data.id);
            } catch {
                setError("Network error while opening direct conversation");
                setActiveConversationId(0);
            } finally {
                setPageLoading(false);
            }
        };

        ensureDirectConversation();
    }, [groupConversationId, isGroupMode, friendId]);

    useEffect(() => {
        if (!activeConversationId) {
            setMessages([]);
            return;
        }

        const loadHistory = async () => {
            setPageLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:8081/conversations/${activeConversationId}/messages`, {
                    headers: authHeader(),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || "Failed to load messages");
                    setMessages([]);
                    return;
                }

                const normalized = data.map((message: any) => ({
                    id: message.id,
                    senderId: message.sender?.id,
                    from: message.sender?.name || "unknown",
                    text: message.content,
                    createdAt: message.created_at,
                }));

                setMessages(normalized);
            } catch {
                setError("Failed to load message history");
                setMessages([]);
            } finally {
                setPageLoading(false);
            }
        };

        loadHistory();
    }, [activeConversationId]);

    useEffect(() => {
        if (!myName || !activeConversationId) return;

        const s = io("http://localhost:8081", {
            auth: { username: myName },
        });

        s.on("connect", () => {
            setConnected(true);
            setError(null);
        });

        s.on("disconnect", () => {
            setConnected(false);
        });

        s.on("conversation-message", ({ conversationId: incomingId, message }: any) => {
            if (incomingId !== activeConversationId) return;
            setMessages((prev) => [
                ...prev,
                {
                    id: message.id,
                    senderId: message.sender?.id,
                    from: message.sender?.name || "unknown",
                    text: message.content,
                    createdAt: message.created_at,
                },
            ]);
        });

        s.on("conversation-typing", ({ conversationId: incomingId, from, isTyping }: any) => {
            if (incomingId !== activeConversationId || from === myName) return;
            setIsFriendTyping(Boolean(isTyping));
            setTypingLabel(`${from} is typing...`);
        });

        setSocket(s);

        return () => {
            s.emit("conversation-typing", { conversationId: activeConversationId, isTyping: false });
            s.disconnect();
            setSocket(null);
            setIsFriendTyping(false);
            setTypingLabel("");
        };
    }, [myName, activeConversationId]);

    const sendMessage = (event: FormEvent) => {
        event.preventDefault();
        if (!socket || !connected || !activeConversationId) {
            setError("Not connected to chat server.");
            return;
        }

        const clean = text.trim();
        if (!clean) return;

        socket.emit("conversation-message", { conversationId: activeConversationId, text: clean });
        socket.emit("conversation-typing", { conversationId: activeConversationId, isTyping: false });

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
            typingTimeout.current = null;
        }
        setText("");
    };

    const onTypingChange = (value: string) => {
        setText(value);
        if (!socket || !connected || !activeConversationId) return;

        const hasText = value.trim().length > 0;
        socket.emit("conversation-typing", { conversationId: activeConversationId, isTyping: hasText });

        if (typingTimeout.current) clearTimeout(typingTimeout.current);

        if (hasText) {
            typingTimeout.current = setTimeout(() => {
                socket.emit("conversation-typing", { conversationId: activeConversationId, isTyping: false });
            }, 900);
        }
    };

    const title = isGroupMode
        ? `Group: ${chatName || `#${activeConversationId}`}`
        : `Direct Chat${chatName ? ` with ${chatName}` : ""}`;

    return (
        <div className="dashboard-shell">
            <header className="topbar">
                <div className="logo">
                    <div className="logo-mark">W</div>
                    whiteboard
                </div>
                <div className="topbar-right">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>Dashboard</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate("/groups")}>Group Chats</button>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === "dark" ? "☀" : "☾"}
                    </button>
                </div>
            </header>

            <main className="dashboard-body">
                <div className="page-title fade-up">
                    <h1>{title}</h1>
                    <p>{connected ? "Connected" : "Connecting..."}</p>
                </div>

                <div className="section-card fade-up fade-up-1">
                    {error && <div className="msg msg-error" style={{ marginBottom: 12 }}>{error}</div>}

                    <div
                        style={{
                            minHeight: 300,
                            maxHeight: 420,
                            overflowY: "auto",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 12,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        {pageLoading && (
                            <p style={{ color: "var(--ink3)", fontSize: "0.85rem" }}>Loading messages...</p>
                        )}

                        {!pageLoading && messages.length === 0 && (
                            <p style={{ color: "var(--ink3)", fontSize: "0.85rem" }}>No messages yet.</p>
                        )}

                        {messages.map((message, index) => {
                            const mine = message.from === myName || message.senderId === user?.id;
                            return (
                                <div
                                    key={`${message.id || "m"}-${index}`}
                                    style={{
                                        alignSelf: mine ? "flex-end" : "flex-start",
                                        background: mine ? "var(--ink)" : "var(--surface2)",
                                        color: mine ? "var(--bg)" : "var(--ink)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 10,
                                        padding: "8px 10px",
                                        maxWidth: "75%",
                                    }}
                                >
                                    <div style={{ fontSize: "0.72rem", opacity: 0.7, marginBottom: 2 }}>
                                        {message.from}
                                    </div>
                                    <div>{message.text}</div>
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
                        <input
                            type="text"
                            value={text}
                            onChange={(event) => onTypingChange(event.target.value)}
                            placeholder="Type a message..."
                            className="code-input"
                            style={{ flex: 1, maxWidth: "100%", textAlign: "left", letterSpacing: "normal" }}
                            disabled={!activeConversationId}
                        />
                        <button className="btn btn-primary" type="submit" disabled={!connected || !text.trim() || !activeConversationId}>
                            Send
                        </button>
                    </form>

                    {isFriendTyping && (
                        <p style={{ marginTop: 8, color: "var(--ink3)", fontSize: "0.8rem" }}>
                            {typingLabel || "Someone is typing..."}
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
