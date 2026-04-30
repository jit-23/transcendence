import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { useTranslation } from "react-i18next";
import { TopBar } from "./components/ui/topbar";
import { Avatar } from "./Avatar";


type Participant = {
    id: number;
    name: string;
    avatar?: string | null;
    online?: boolean;
    role?: string; // "owner" | "member"
};
   

type ChatBubble = {
    from: string;
    text: string;
    self: boolean;
};

export function ChatPage() {
    const {t} = useTranslation();
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const friendIdParam = searchParams.get("friendId");
    const conversationIdParam = searchParams.get("conversationId");
    const chatNameParam = searchParams.get("name") ?? "";
    const initialTarget = chatNameParam;

    const [target, setTarget] = useState(initialTarget);
    const [text, setText] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatBubble[]>([]);
    const [peerTyping, setPeerTyping] = useState<string | null>(null);
    const [conversationLoading, setConversationLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<number | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });


	//

	const [participants, setParticipants] = useState<Participant[]>([]);
    const [isOwner, setIsOwner] = useState(false);
    const [participantsLoading, setParticipantsLoading] = useState(false);
    const [participantsError, setParticipantsError] = useState<string | null>(null);
    // Fetch participants for group conversations
    useEffect(() => {
        if (!conversationId) return;
        const fetchParticipants = async () => {
            setParticipantsLoading(true);
            setParticipantsError(null);
            try {
                const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
                const res = await fetch(`${apiUrl}/conversations/${conversationId}/members`, {
                    headers: authHeader(),
                });
                const data = await res.json();
                if (!res.ok) {
                    setParticipantsError(data.error || "Failed to load participants");
                    setParticipants([]);
                    return;
                }
                setParticipants(data.members || []);
                setIsOwner(data.role === "owner");
            } catch {
                setParticipantsError("Network error while loading participants");
                setParticipants([]);
            } finally {
                setParticipantsLoading(false);
            }
        };
        fetchParticipants();
    }, [conversationId]);

	//

    const canSend = useMemo(() => {
        return Boolean(conversationId && text.trim() && socketRef.current && !conversationLoading);
    }, [conversationId, text, conversationLoading]);

    useEffect(() => {
        const node = messagesContainerRef.current;
        if (!node) return;
        node.scrollTop = node.scrollHeight;
    }, [messages.length]);

    useEffect(() => {
        if (!friendIdParam) return;
        if (!user?.name) return;

        const friendId = Number(friendIdParam);
        if (!Number.isInteger(friendId) || friendId <= 0) {
            setStatus(t("CH_invalid_friend_id", "Invalid friendId in URL"));
            return;
        }

        let cancelled = false;

        const openDirectConversation = async () => {
            setConversationLoading(true);
            setStatus(t("CH_opening_conversation", "Opening conversation..."));

            try {
                const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
                const res = await fetch(`${apiUrl}/conversations/direct`, {
                    method: "POST",
                    headers: authHeader(),
                    body: JSON.stringify({ friendId }),
                });
                const data = await res.json();

                if (!res.ok) {
                    setStatus(data.error || t("CH_failed_open_conversation", "Failed to open conversation"));
                    return;
                }

                if (cancelled) return;

                const displayName = chatNameParam || data.name || `User ${friendId}`;
                setConversationId(Number(data.id));
                setTarget(displayName);
                setMessages([]);
                setPeerTyping(null);
                setStatus(` ${displayName}`);
            } catch {
                if (!cancelled) {
                    setStatus(t("CH_network_error_opening", "Network error while opening conversation"));
                }
            } finally {
                if (!cancelled) {
                    setConversationLoading(false);
                }
            }
        };

        void openDirectConversation();

        return () => {
            cancelled = true;
        };
    }, [friendIdParam, chatNameParam, user?.name]);

    useEffect(() => {
        if (friendIdParam) return;
        if (!conversationIdParam) return;

        const existingConversationId = Number(conversationIdParam);
        if (!Number.isInteger(existingConversationId) || existingConversationId <= 0) {
            setStatus(t("CH_invalid_conversation_id", "Invalid conversationId in URL"));
            return;
        }

        const displayName = chatNameParam || `Conversation ${existingConversationId}`;
        setConversationLoading(true);
        setConversationId(existingConversationId);
        setTarget(displayName);
        setMessages([]);
        setPeerTyping(null);
        setStatus(t("CH_chatting_in", { name: displayName, defaultValue: `Chatting in ${displayName}` }));
        setConversationLoading(false);
    }, [friendIdParam, conversationIdParam, chatNameParam]);

    useEffect(() => {
        if (!conversationId) return;

        let cancelled = false;

        const loadMessages = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
                const res = await fetch(`${apiUrl}/conversations/${conversationId}/messages`, {
                    headers: authHeader(),
                });
                const data = await res.json();

                if (!res.ok) {
                    setStatus(data.error || t("CH_failed_load_messages", "Failed to load messages"));
                    return;
                }

                if (cancelled) return;

                const mapped: ChatBubble[] = data.map((message: any) => ({
                    from: message.sender?.name ?? "Unknown",
                    text: message.content,
                    self: message.sender?.id === user?.id,
                }));

                setMessages(mapped);
            } catch {
                if (!cancelled) {
                    setStatus(t("CH_network_error_loading", "Network error while loading messages"));
                }
            }
        };

        void loadMessages();

        return () => {
            cancelled = true;
        };
    }, [conversationId, user?.id]);

    useEffect(() => {
        if (!user?.name) return;

        const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
        const socket = io(apiUrl, {
            auth: { username: user.name },
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => setStatus(""));
        socket.on("disconnect", () => setStatus(t("CH_disconnected", "disconnected")));

        socket.on("conversation-message", ({ conversationId: incomingConversationId, message }) => {
            const normalizedIncoming = Number(incomingConversationId);
            if (!conversationId || normalizedIncoming !== conversationId) return;

            setMessages((prev) => [
                ...prev,
                {
                    from: message.sender?.name ?? "Unknown",
                    text: message.content,
                    self: message.sender?.id === user?.id,
                },
            ]);
        });

        socket.on("conversation-typing", ({ conversationId: incomingConversationId, from, isTyping }) => {
            const normalizedIncoming = Number(incomingConversationId);
            if (!conversationId || normalizedIncoming !== conversationId) return;
            setPeerTyping(isTyping ? from : null);
        });

        return () => {
            if (typingTimeoutRef.current) {
                window.clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user?.name, conversationId, user?.id]);

    const handleTextChange = (value: string) => {
        setText(value);

        if (!socketRef.current) return;
        if (!conversationId) return;

        socketRef.current.emit("conversation-typing", {
            conversationId,
            isTyping: true,
        });

        if (typingTimeoutRef.current) {
            window.clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = window.setTimeout(() => {
            if (!socketRef.current) return;
            socketRef.current.emit("conversation-typing", { conversationId, isTyping: false });
            typingTimeoutRef.current = null;
        }, 900);
    };

    const handleSend = (event: FormEvent) => {
        event.preventDefault();
        const cleanText = text.trim();
        if (!cleanText || !socketRef.current || !conversationId) return;

        socketRef.current.emit("conversation-message", {
            conversationId,
            text: cleanText,
        });

        socketRef.current.emit("conversation-typing", {
            conversationId,
            isTyping: false,
        });

        setText("");
    };

    return (
        <div className="min-h-screen w-full">
            <TopBar />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", width: "100%", minHeight: "calc(100vh - 60px)", background: "var(--bg)" }}>
                <div style={{ display: "flex", width: 900, minHeight: 540, maxHeight: 700, background: "var(--surface2)", borderRadius: 14, boxShadow: "0 2px 12px #0001", overflow: "hidden", marginTop: 32 }}>
                    {/* Sidebar: Participants */}
                    <div style={{ width: 220, background: "var(--surface1)", borderRight: "1px solid var(--border)", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>{t("CH_participants", "Participants")}</h3>
                        {participantsLoading ? (
                            <p style={{ color: "var(--ink3)", fontSize: "0.9rem" }}>{t("CH_loading", "Loading...")}</p>
                        ) : participantsError ? (
                            <p style={{ color: "var(--error)", fontSize: "0.9rem" }}>{participantsError}</p>
                        ) : participants.length === 0 ? (
                            <p style={{ color: "var(--ink3)", fontSize: "0.9rem" }}>{t("CH_no_participants", "No participants")}</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {participants.map((p) => (
                                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px", background: "var(--surface2)", borderRadius: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                            <Avatar avatar={p.avatar} name={p.name} size={32} />
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                                                <p style={{ fontSize: "0.72rem", color: p.online ? "#22c55e" : "var(--ink3)", lineHeight: 1 }}>
                                                    {p.online ? t("FRC_online") : t("FRC_offline")}
                                                </p>
                                            </div>
                                        </div>
                                        {isOwner && p.role !== "owner" && (
                                            <button
                                                className="btn btn-ghost btn-xs"
                                                style={{ color: "var(--error)", fontSize: "0.75rem", flexShrink: 0 }}
                                                onClick={async () => {
                                                    try {
                                                        const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
                                                        await fetch(`${apiUrl}/conversations/${conversationId}/members/${p.id}`, {
                                                            method: "DELETE",
                                                            headers: authHeader(),
                                                        });
                                                        const res = await fetch(`${apiUrl}/conversations/${conversationId}/members`, { headers: authHeader() });
                                                        const data = await res.json();
                                                        setParticipants(data.members || []);
                                                    } catch {}
                                                }}
                                            >{t("CH_remove", "Remove")}</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {isOwner && (
                            <button
                                className="btn btn-primary btn-xs"
                                style={{ marginTop: 10 }}
                                onClick={async () => {
                                    // Add friend logic (simple prompt for demo)
                                    const friendId = window.prompt("Enter friend ID to add:");
                                    if (!friendId) return;
                                    try {
                                        const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
                                        await fetch(`${apiUrl}/conversations/${conversationId}/members`, {
                                            method: "POST",
                                            headers: authHeader(),
                                            body: JSON.stringify({ memberIds: [Number(friendId)] }),
                                        });
                                        // Refresh participants
                                        const res = await fetch(`${apiUrl}/conversations/${conversationId}/members`, { headers: authHeader() });
                                        const data = await res.json();
                                        setParticipants(data.members || []);
                                    } catch {}
                                }}
                            >{t("CH_add_friend", "Add Friend")}</button>
                        )}
                    </div>
                    {/* Main Chat Area */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, padding: 0, background: "var(--surface2)" }}>
                        <div style={{ padding: "18px 18px 0 18px" }}>
                            <h2 style={{ marginBottom: 10 }}>{target}</h2>
                            {status && (
                                <p style={{ color: "var(--ink2)", fontSize: "0.78rem", marginBottom: 12 }}>{status}</p>
                            )}
                        </div>
                        <div
                            ref={messagesContainerRef}
                            style={{
                                border: "1px solid var(--border)",
                                borderRadius: 10,
                                padding: 12,
                                minHeight: 220,
                                flex: 1,
                                overflowY: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                                margin: 18,
                                background: "var(--surface2)",
                            }}
                        >
                            {messages.length === 0 && (
                                <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>{t("CH_no_messages_chat", "No messages yet.")}</p>
                            )}
                            {messages.map((message, index) => (
                                <div
                                    key={`${message.from}-${index}`}
                                    style={{
                                        alignSelf: message.self ? "flex-end" : "flex-start",
                                        maxWidth: "75%",
                                        border: "1px solid var(--border)",
                                        borderRadius: 10,
                                        padding: "8px 10px",
                                        background: message.self ? "var(--surface)" : "var(--bg)",
                                    }}
                                >
                                    <p style={{ fontSize: "0.7rem", color: "var(--ink3)", marginBottom: 4 }}>{message.from}</p>
                                    <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.35 }}>{message.text}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSend} style={{ display: "flex", gap: 8, margin: "0 18px 16px 18px" }}>
							<input
								value={text}
								onChange={(event) => handleTextChange(event.target.value)}
								placeholder={t("CH_type_message_chat")}
								disabled={conversationLoading || !conversationId}
							/>
							<button className="btn btn-primary" type="submit" disabled={!canSend}>{t("CH_send_chat")}</button>
						</form>

						{peerTyping && (
							<p style={{ color: "var(--ink3)", fontSize: "0.78rem", marginBottom: 12 }}>
								{peerTyping} {t("CH_is_typing_chat")}
							</p>
						)}
                    </div>
                </div>
            </div>
        </div>
    );
}