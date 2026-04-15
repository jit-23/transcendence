import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";

type ChatBubble = {
    from: string;
    text: string;
    self: boolean;
};

export function ChatPage() {
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const friendIdParam = searchParams.get("friendId");
    const friendNameParam = searchParams.get("name") ?? "";
    const initialTarget = friendNameParam;

    const [target, setTarget] = useState(initialTarget);
    const [text, setText] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatBubble[]>([]);
    const [peerTyping, setPeerTyping] = useState<string | null>(null);
    const [conversationLoading, setConversationLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });

    const canSend = useMemo(() => {
        return Boolean(conversationId && text.trim() && socketRef.current && !conversationLoading);
    }, [conversationId, text, conversationLoading]);

    useEffect(() => {
        if (!friendIdParam) return;
        if (!user?.name) return;

        const friendId = Number(friendIdParam);
        if (!Number.isInteger(friendId) || friendId <= 0) {
            setStatus("Invalid friendId in URL");
            return;
        }

        let cancelled = false;

        const openDirectConversation = async () => {
            setConversationLoading(true);
            setStatus("Opening conversation...");

            try {
                const res = await fetch("http://localhost:8081/conversations/direct", {
                    method: "POST",
                    headers: authHeader(),
                    body: JSON.stringify({ friendId }),
                });
                const data = await res.json();

                if (!res.ok) {
                    setStatus(data.error || "Failed to open conversation");
                    return;
                }

                if (cancelled) return;

                const displayName = friendNameParam || data.name || `User ${friendId}`;
                setConversationId(Number(data.id));
                setTarget(displayName);
                setMessages([]);
                setPeerTyping(null);
                setStatus(`Chatting with ${displayName}`);
            } catch {
                if (!cancelled) {
                    setStatus("Network error while opening conversation");
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
    }, [friendIdParam, friendNameParam, user?.name]);

    useEffect(() => {
        if (!conversationId) return;

        let cancelled = false;

        const loadMessages = async () => {
            try {
                const res = await fetch(`http://localhost:8081/conversations/${conversationId}/messages`, {
                    headers: authHeader(),
                });
                const data = await res.json();

                if (!res.ok) {
                    setStatus(data.error || "Failed to load messages");
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
                    setStatus("Network error while loading messages");
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

        const socket = io("http://localhost:8081", {
            auth: { username: user.name },
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => setStatus("Connected"));
        socket.on("disconnect", () => setStatus("Disconnected"));

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
            socketRef.current.emit("typing", { to: cleanTarget, isTyping: false });
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
        <div id="center">
            <div className="card" style={{ maxWidth: 700 }}>
                <h2 style={{ marginBottom: 10 }}>Direct Chat</h2>

                <p style={{ color: "var(--ink3)", marginBottom: 12 }}>
                    {target ? `Talking to: ${target}` : "Open this page from your friends list."}
                </p>

                {status && (
                    <p style={{ color: "var(--ink2)", fontSize: "0.78rem", marginBottom: 12 }}>
                        {status}
                    </p>
                )}

                <div
                    style={{
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: 12,
                        minHeight: 220,
                        maxHeight: 320,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginBottom: 14,
                        background: "var(--surface2)",
                    }}
                >
                    {messages.length === 0 && (
                        <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>No messages yet.</p>
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
                            <p>{message.text}</p>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSend} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <input
                        value={text}
                        onChange={(event) => handleTextChange(event.target.value)}
                        placeholder="Type a message"
                        disabled={conversationLoading || !conversationId}
                    />
                    <button className="btn btn-primary" type="submit" disabled={!canSend}>Send</button>
                </form>

                {peerTyping && (
                    <p style={{ color: "var(--ink3)", fontSize: "0.78rem", marginBottom: 12 }}>
                        {peerTyping} is typing...
                    </p>
                )}

            </div>
        </div>
    );
}