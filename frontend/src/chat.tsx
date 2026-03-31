import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";

type ChatMessage = {
  from: string;
  text: string;
};

export function ChatPage() {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const to = (searchParams.get("to") || "").trim();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myName = useMemo(() => user?.name || "", [user?.name]);

  useEffect(() => {
    if (!myName || !to) return;

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

    s.on("private-message", (msg: ChatMessage) => {
      if (msg.from === to || msg.from === myName) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    s.on("typing", ({ from, isTyping }: { from: string; isTyping: boolean }) => {
      if (from === to) {
        setIsFriendTyping(isTyping);
      }
    });

    s.on("user-not-found", () => {
      setError(`User ${to} is offline or not found.`);
    });

    setSocket(s);

    return () => {
      s.emit("typing", { to, isTyping: false });
      s.disconnect();
      setSocket(null);
      setIsFriendTyping(false);
    };
  }, [myName, to]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!socket || !connected) {
      setError("Not connected to chat server.");
      return;
    }

    const clean = text.trim();
    if (!clean) return;

    socket.emit("private-message", {
      payload: { to, text: clean },
    });

    socket.emit("typing", { to, isTyping: false });
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }

    setMessages((prev) => [...prev, { from: myName, text: clean }]);
    setText("");
  };

  const onTypingChange = (value: string) => {
    setText(value);
    if (!socket || !connected || !to) return;

    const hasText = value.trim().length > 0;
    socket.emit("typing", { to, isTyping: hasText });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    if (hasText) {
      typingTimeout.current = setTimeout(() => {
        socket.emit("typing", { to, isTyping: false });
      }, 900);
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="logo">
          <div className="logo-mark">W</div>
          whiteboard
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <main className="dashboard-body">
        <div className="page-title fade-up">
          <h1>Chat with {to || "..."}</h1>
          <p>{connected ? "Connected" : "Connecting..."}</p>
        </div>

        {!to && (
          <div className="section-card fade-up">
            <div className="msg msg-error">Missing chat target. Open chat from your friends list.</div>
          </div>
        )}

        {to && (
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
              {messages.length === 0 && (
                <p style={{ color: "var(--ink3)", fontSize: "0.85rem" }}>No messages yet.</p>
              )}
              {messages.map((msg, index) => {
                const mine = msg.from === myName;
                return (
                  <div
                    key={`${msg.from}-${index}`}
                    style={{
                      alignSelf: mine ? "flex-end" : "flex-start",
                      background: mine ? "var(--ink)" : "var(--bg2)",
                      color: mine ? "var(--bg)" : "var(--ink)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "8px 10px",
                      maxWidth: "75%",
                    }}
                  >
                    <div style={{ fontSize: "0.72rem", opacity: 0.7, marginBottom: 2 }}>
                      {msg.from}
                    </div>
                    <div>{msg.text}</div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={text}
                onChange={(e) => onTypingChange(e.target.value)}
                placeholder="Type a message..."
                className="code-input"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" type="submit" disabled={!connected || !text.trim()}>
                Send
              </button>
            </form>

            {isFriendTyping && (
              <p style={{ marginTop: 8, color: "var(--ink3)", fontSize: "0.8rem" }}>
                {to} is typing...
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


