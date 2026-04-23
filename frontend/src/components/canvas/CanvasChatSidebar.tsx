export type CanvasMember = {
	id: number;
	name: string;
	email: string;
	role: "owner" | "collaborator";
};

export type CanvasChatMessage = {
	from: string;
	text: string;
	self: boolean;
};

type CanvasChatSidebarProps = {
	canvasName: string;
	members: CanvasMember[];
	activeMemberIds: number[];
	chatStatus: string | null;
	messages: CanvasChatMessage[];
	peerTyping: string | null;
	chatInput: string;
	conversationLinked: boolean;
	sendingMessage: boolean;
	onChatInputChange: (value: string) => void;
	onSend: () => void;
};

export default function CanvasChatSidebar({
	canvasName,
	members,
	activeMemberIds,
	chatStatus,
	messages,
	peerTyping,
	chatInput,
	conversationLinked,
	sendingMessage,
	onChatInputChange,
	onSend,
}: CanvasChatSidebarProps) {
	return (
		<aside style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 10, background: "var(--surface)" }}>
			<div>
				<h3 style={{ margin: 0, fontSize: "1rem" }}>Canvas Chat</h3>
				<p style={{ margin: "4px 0 0", color: "var(--ink3)", fontSize: "0.78rem" }}>{canvasName || "Shared Canvas"}</p>
			</div>

			<div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
				<p style={{ margin: "0 0 6px", fontSize: "0.8rem", fontWeight: 600 }}>
					Members ({members.length}) · Active ({activeMemberIds.length})
				</p>
				<div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto" }}>
					{members.length === 0 && <p style={{ margin: 0, color: "var(--ink3)", fontSize: "0.78rem" }}>No members found.</p>}
					{members.map((member) => {
						const isActive = activeMemberIds.includes(member.id);
						return (
							<div key={member.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
								<span>{member.name}{isActive ? " (online)" : ""}</span>
								<span style={{ color: "var(--ink3)" }}>{member.role}</span>
							</div>
						);
					})}
				</div>
			</div>

			<div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
				<p style={{ margin: "0 0 6px", fontSize: "0.8rem", fontWeight: 600 }}>Messages</p>
				{chatStatus && <p style={{ margin: "0 0 8px", color: "var(--ink3)", fontSize: "0.75rem" }}>{chatStatus}</p>}
				<div style={{ flex: 1, minHeight: 120, border: "1px solid var(--border)", borderRadius: 6, padding: 8, overflowY: "auto", background: "var(--surface2)" }}>
					{messages.length === 0 && <p style={{ margin: 0, color: "var(--ink3)", fontSize: "0.78rem" }}>No messages yet.</p>}
					{messages.map((message, index) => (
						<div key={`${message.from}-${index}`} style={{ marginBottom: 8, textAlign: message.self ? "right" : "left" }}>
							<p style={{ margin: "0 0 2px", fontSize: "0.68rem", color: "var(--ink3)" }}>{message.from}</p>
							<p
								style={{
									margin: 0,
									display: "inline-block",
									maxWidth: "88%",
									padding: "6px 8px",
									borderRadius: 8,
									background: message.self ? "#827c7c" : "var(--surface)",
									whiteSpace: "pre-wrap",
									overflowWrap: "anywhere",
									wordBreak: "break-word",
									lineHeight: 1.35,
									textAlign: "left",
								}}
							>
								{message.text}
							</p>
						</div>
					))}
				</div>
				{peerTyping && <p style={{ margin: "6px 0 0", color: "var(--ink3)", fontSize: "0.75rem" }}>{peerTyping} is typing...</p>}
				<div style={{ display: "flex", gap: 6, marginTop: 8 }}>
					<input
						value={chatInput}
						onChange={(event) => onChatInputChange(event.target.value)}
						onKeyDown={(event) => {
							if (event.key !== "Enter") return;
							event.preventDefault();
							if (!conversationLinked || sendingMessage || !chatInput.trim()) return;
							onSend();
						}}
						placeholder={conversationLinked ? "Type a message" : "Group chat not linked"}
						disabled={!conversationLinked}
						style={{ flex: 1 }}
					/>
					<button type="button" onClick={onSend} disabled={!conversationLinked || sendingMessage || !chatInput.trim()}>
						Send
					</button>
				</div>
			</div>
		</aside>
	);
}
