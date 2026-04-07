import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export function ChatPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialTarget = searchParams.get("to") ?? "";

    const [target, setTarget] = useState(initialTarget);
    const [draftTarget, setDraftTarget] = useState(initialTarget);
    const [text, setText] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [messages, setMessages] = useState<Array<{ from: string; text: string; self: boolean }>>([]);
    const [peerTyping, setPeerTyping] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    const canSend = useMemo(() => {
        return Boolean(target.trim() && text.trim() && socketRef.current);
    }, [target, text]);

    useEffect(() => {
        if (!user?.name) return;

        const socket = io("http://localhost:8081", {
            auth: { username: user.name },
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => setStatus("Connected"));
        socket.on("disconnect", () => setStatus("Disconnected"));

        socket.on("private-message", ({ from, text: incomingText }) => {
            setMessages((prev) => [...prev, { from, text: incomingText, self: false }]);
        });

        socket.on("user-not-found", ({ to }) => {
            setStatus(`User ${to} is offline or not connected`);
        });

        socket.on("typing", ({ from, isTyping }) => {
            if (from !== target.trim()) return;
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
    }, [user?.name, target]);

    const handleSelectTarget = (event: FormEvent) => {
        event.preventDefault();
        const clean = draftTarget.trim();
        if (!clean) return;
        setTarget(clean);
        setStatus(`Chatting with ${clean}`);
        setMessages([]);
        setPeerTyping(null);
        navigate(`/chat?to=${encodeURIComponent(clean)}`, { replace: true });
    };

    const handleTextChange = (value: string) => {
        setText(value);

        const cleanTarget = target.trim();
        if (!cleanTarget || !socketRef.current) return;

        socketRef.current.emit("typing", { to: cleanTarget, isTyping: true });

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
        const cleanTarget = target.trim();
        const cleanText = text.trim();
        if (!cleanTarget || !cleanText || !socketRef.current) return;

        socketRef.current.emit("private-message", {
            payload: { to: cleanTarget, text: cleanText },
        });

        socketRef.current.emit("typing", { to: cleanTarget, isTyping: false });

        setMessages((prev) => [...prev, { from: user?.name ?? "me", text: cleanText, self: true }]);
        setText("");
    };

    return (
        <div id="center">
            <div className="card" style={{ maxWidth: 700 }}>
                <h2 style={{ marginBottom: 10 }}>Direct Chat</h2>

                {!target && (
                    <form onSubmit={handleSelectTarget} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        <input
                            value={draftTarget}
                            onChange={(event) => setDraftTarget(event.target.value)}
                            placeholder="Friend username"
                        />
                        <button className="btn btn-ghost" type="submit">Open</button>
                    </form>
                )}

                <p style={{ color: "var(--ink3)", marginBottom: 12 }}>
                    {target ? `Talking to: ${target}` : "Select a username to start chatting."}
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
                        disabled={!target}
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
