import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import CanvasChatSidebar, { CanvasChatMessage, CanvasMember } from "./components/canvas/CanvasChatSidebar";

type Tool = "line" | "rectangle" | "circle" | "freehand" | "eraser";

type LineShape = {
	kind: "line";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	strokeWeight: number;
};

type RectangleShape = {
	kind: "rectangle";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	filled: boolean;
	strokeWeight: number;
};

type CircleShape = {
	kind: "circle";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	filled: boolean;
	strokeWeight: number;
};

type FreeHandShape = {
	kind: "freehand";
	points: Array<{ x: number; y: number }>;
	color: string;
	strokeWeight: number;
};

type DotShape = {
	kind: "dot";
	x: number;
	y: number;
	color: string;
	strokeWeight: number;
};

type EraserShape = {
	kind: "eraser";
	points: Array<{ x: number; y: number }>;
	strokeWeight: number;
};

type Shape = LineShape | RectangleShape | CircleShape | FreeHandShape | DotShape | EraserShape;

type ConversationSummary = {
	id: number;
	type: "DIRECT" | "GROUP";
	name: string | null;
	members: Array<{ id: number; name: string; email: string }>;
	role?: string;
};

type CanvasSnapshot = {
	version: 1;
	backgroundColor: string;
	lineColor: string;
	tool: Tool;
	fill: boolean;
	strokeWeight: number;
	zoomPercent: number;
	view: { scale: number; offsetX: number; offsetY: number };
	shapes: Shape[];
};
const HISTORY_LIMIT = 50;

export default function Canvas() {
	const [searchParams] = useSearchParams();
	const canvasIdParam = searchParams.get("id");
	const canvasId = canvasIdParam ? Number(canvasIdParam) : null;

	const [backgroundColor, setBackgroundColor] = useState("#ffffff");
	const [lineColor, setLineColor] = useState("#111111");
	const [tool, setTool] = useState<Tool>("freehand");
	const [fill, setFill] = useState(false);
	const [strokeWeight, setStrokeWeight] = useState(4);
	const [zoomPercent, setZoomPercent] = useState(100);
	const [saveStatus, setSaveStatus] = useState("");
	const [saving, setSaving] = useState(false);
	const [canvasName, setCanvasName] = useState("");
	const [members, setMembers] = useState<CanvasMember[]>([]);
	const [conversationId, setConversationId] = useState<number | null>(null);
	const [chatInput, setChatInput] = useState("");
	const [chatMessages, setChatMessages] = useState<CanvasChatMessage[]>([]);
	const [chatStatus, setChatStatus] = useState<string | null>(null);
	const [peerTyping, setPeerTyping] = useState<string | null>(null);
	const [sendingMessage, setSendingMessage] = useState(false);

  const controlsRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
	const p5Ref = useRef<p5 | null>(null);

	const settingsRef = useRef({
		backgroundColor: "#ffffff",
		lineColor: "#111111",
		tool: "freehand" as Tool,
		fill: false,
		strokeWeight: 4,
	});

	const shapesRef = useRef<Shape[]>([]);
	const redoShapesRef = useRef<Shape[]>([]);
	const undoDepthRef = useRef(0);
	const draftShapeRef = useRef<Shape | null>(null);
	const dragStartRef = useRef<{ x: number; y: number } | null>(null);
	const viewRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
	const initializedSketchRef = useRef(false);
	const dotRef = useRef(true);
	const dirtyRef = useRef(false);
	const hydratingRef = useRef(false);
	const chatSocketRef = useRef<Socket | null>(null);
	const chatTypingTimeoutRef = useRef<number | null>(null);

	const authHeader = () => ({
		Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		"Content-Type": "application/json",
	});

	const markDirty = () => {
		if (hydratingRef.current) return;
		dirtyRef.current = true;
	};

	const buildSnapshot = (): CanvasSnapshot => ({
		version: 1,
		backgroundColor,
		lineColor,
		tool,
		fill,
		strokeWeight,
		zoomPercent,
		view: {
			scale: viewRef.current.scale,
			offsetX: viewRef.current.offsetX,
			offsetY: viewRef.current.offsetY,
		},
		shapes: shapesRef.current,
	});

	const applySnapshot = (snapshot: CanvasSnapshot) => {
		hydratingRef.current = true;

		setBackgroundColor(snapshot.backgroundColor ?? "#ffffff");
		setLineColor(snapshot.lineColor ?? "#111111");
		setTool(snapshot.tool ?? "freehand");
		setFill(Boolean(snapshot.fill));
		setStrokeWeight(typeof snapshot.strokeWeight === "number" ? Math.min(30, Math.max(1, snapshot.strokeWeight)) : 4);
		setZoomPercent(typeof snapshot.zoomPercent === "number" ? Math.min(500, Math.max(20, snapshot.zoomPercent)) : 100);

		viewRef.current = snapshot.view ?? { scale: 1, offsetX: 0, offsetY: 0 };
		shapesRef.current = Array.isArray(snapshot.shapes) ? snapshot.shapes : [];
		redoShapesRef.current = [];
		undoDepthRef.current = Math.min(HISTORY_LIMIT, shapesRef.current.length);
		draftShapeRef.current = null;
		dragStartRef.current = null;
		dotRef.current = true;

		dirtyRef.current = false;
		hydratingRef.current = false;
	};

	const saveCanvas = async () => {
		if (!canvasId || !Number.isInteger(canvasId) || canvasId <= 0) {
			setSaveStatus("No canvas id found in URL");
			return;
		}

		setSaving(true);
		setSaveStatus("Saving...");

		try {
			const res = await fetch(`http://localhost:8081/canvases/${canvasId}/content`, {
				method: "PUT",
				headers: authHeader(),
				body: JSON.stringify({ content: JSON.stringify(buildSnapshot()) }),
			});
			const data = await res.json();

			if (!res.ok) {
				setSaveStatus(data.error || "Failed to save canvas");
				return;
			}

			dirtyRef.current = false;
			setSaveStatus("Saved");
		} catch {
			setSaveStatus("Network error while saving");
		} finally {
			setSaving(false);
		}
	};

	const clearCanvas = () => {
		shapesRef.current = [];
		redoShapesRef.current = [];
		undoDepthRef.current = 0;
		draftShapeRef.current = null;
		dragStartRef.current = null;
		dotRef.current = true;
		markDirty();
	};

	const commitShape = (shape: Shape) => {
		shapesRef.current.push(shape);
		undoDepthRef.current = Math.min(HISTORY_LIMIT, undoDepthRef.current + 1);
		redoShapesRef.current = [];
		markDirty();
	};

	const applyZoomPercent = (nextPercentValue: number, anchor?: { x: number; y: number }) => {
		const clampedPercent = Math.min(500, Math.max(20, nextPercentValue));
		const nextScale = clampedPercent / 100;
		const previousScale = viewRef.current.scale;

		if (nextScale === previousScale) {
			setZoomPercent(clampedPercent);
			return;
		}

		const currentOffsetX = viewRef.current.offsetX;
		const currentOffsetY = viewRef.current.offsetY;
		const anchorX = anchor?.x ?? (p5Ref.current?.width ?? 0) / 2;
		const anchorY = anchor?.y ?? (p5Ref.current?.height ?? 0) / 2;
		const worldX = (anchorX - currentOffsetX) / previousScale;
		const worldY = (anchorY - currentOffsetY) / previousScale;

		viewRef.current.scale = nextScale;
		viewRef.current.offsetX = anchorX - worldX * nextScale;
		viewRef.current.offsetY = anchorY - worldY * nextScale;
		setZoomPercent(clampedPercent);
		markDirty();
	};

	const isEditableElement = (target: EventTarget | null) => {
		if (!(target instanceof HTMLElement)) return false;
		return target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT";
	};

	const controlLabelStyle = {
		display: "grid",
		gridTemplateRows: "22px 34px",
		justifyItems: "center" as const,
		alignItems: "center" as const,
		textAlign: "center" as const,
		width: "120px",
	};
	const controlNameStyle = {
		display: "flex",
		justifyContent: "center" as const,
		alignItems: "center" as const,
		width: "100%",
		height: "100%",
		whiteSpace: "nowrap" as const,
	};
	const controlFieldStyle = {
		display: "flex",
		justifyContent: "center" as const,
		alignItems: "center" as const,
		width: "100%",
		height: "100%",
	};



	useEffect(() => {
		settingsRef.current = { backgroundColor, lineColor, tool, fill, strokeWeight };
	}, [backgroundColor, lineColor, tool, fill, strokeWeight]);

	useEffect(() => {
		if (!canvasId || !Number.isInteger(canvasId) || canvasId <= 0) return;

		let cancelled = false;

		const loadCanvas = async () => {
			setSaveStatus("Loading...");
			try {
				const res = await fetch(`http://localhost:8081/canvases/${canvasId}`, {
					headers: authHeader(),
				});
				const data = await res.json();
				console.log("Loaded canvas data:", data);
				if (!res.ok) {
					if (!cancelled) setSaveStatus(data.error || "Failed to load canvas");
					return;
				}

				if (cancelled) return;

				setCanvasName(data.name ?? "Shared Canvas");
				const owner = data.user ? [{ id: data.user.id, name: data.user.name, email: data.user.email, role: "owner" as const }] : [];
				const collaborators = Array.isArray(data.collaborators)
					? data.collaborators.map((entry: any) => ({
						id: entry.user?.id ?? entry.id,
						name: entry.user?.name ?? entry.name,
						email: entry.user?.email ?? entry.email,
						role: "collaborator" as const,
					}))
					: [];
				setMembers([...owner, ...collaborators].filter((member) => member.id && member.name));

				if (data.content) {
					try {
						applySnapshot(JSON.parse(data.content) as CanvasSnapshot);
					} catch {
						setSaveStatus("Saved data is invalid JSON");
					}
				} else {
					dirtyRef.current = false;
				}

				// Use conversationId directly from backend
				if (!cancelled) {
					setConversationId(data.conversationId ?? null);
					setChatStatus(data.conversationId ? null : "No linked group chat found for this canvas yet");
				}

				if (!cancelled) setSaveStatus("Loaded");
			} catch {
				if (!cancelled) setSaveStatus("Network error while loading");
			}
		};

		void loadCanvas();

		return () => {
			cancelled = true;
		};
	}, [canvasIdParam]);

	useEffect(() => {
		if (!conversationId) {
			setChatMessages([]);
			return;
		}

		let cancelled = false;

		const loadMessages = async () => {
			try {
				const res = await fetch(`http://localhost:8081/conversations/${conversationId}/messages`, {
					headers: authHeader(),
				});
				const data = await res.json();
				if (!res.ok) {
					if (!cancelled) setChatStatus(data.error || "Failed to load chat messages");
					return;
				}

				if (cancelled) return;
				setChatMessages(
					(data as any[]).map((message) => ({
						from: message.sender?.name ?? "Unknown",
						text: message.content,
						self: Boolean(message.sender?.name && message.sender.name === sessionStorage.getItem("username")),
					}))
				);
			} catch {
				if (!cancelled) setChatStatus("Network error while loading chat");
			}
		};

		void loadMessages();

		return () => {
			cancelled = true;
		};
	}, [conversationId]);

	useEffect(() => {
		const username = sessionStorage.getItem("username");
		if (!username) return;

		const socket = io("http://localhost:8081", {
			auth: { username },
			withCredentials: true,
		});

		chatSocketRef.current = socket;

		socket.on("conversation-message", ({ conversationId: incomingConversationId, message }) => {
			if (!conversationId || Number(incomingConversationId) !== conversationId) return;
			setChatMessages((prev) => [
				...prev,
				{
					from: message.sender?.name ?? "Unknown",
					text: message.content,
					self: message.sender?.name === username,
				},
			]);
		});

		socket.on("conversation-typing", ({ conversationId: incomingConversationId, from, isTyping }) => {
			if (!conversationId || Number(incomingConversationId) !== conversationId) return;
			setPeerTyping(isTyping ? from : null);
		});

		socket.on("connect", () => setChatStatus(null));
		socket.on("disconnect", () => setChatStatus("Chat disconnected"));

		return () => {
			if (chatTypingTimeoutRef.current) {
				window.clearTimeout(chatTypingTimeoutRef.current);
				chatTypingTimeoutRef.current = null;
			}
			socket.disconnect();
			chatSocketRef.current = null;
		};
	}, [conversationId]);

	const handleChatInputChange = (value: string) => {
		setChatInput(value);
		if (!conversationId || !chatSocketRef.current) return;

		chatSocketRef.current.emit("conversation-typing", {
			conversationId,
			isTyping: true,
		});

		if (chatTypingTimeoutRef.current) {
			window.clearTimeout(chatTypingTimeoutRef.current);
		}

		chatTypingTimeoutRef.current = window.setTimeout(() => {
			if (!chatSocketRef.current) return;
			chatSocketRef.current.emit("conversation-typing", {
				conversationId,
				isTyping: false,
			});
			chatTypingTimeoutRef.current = null;
		}, 900);
	};

	const handleSendChat = () => {
		if (!conversationId || !chatSocketRef.current) return;
		const clean = chatInput.trim();
		if (!clean) return;

		setSendingMessage(true);
		chatSocketRef.current.emit("conversation-message", {
			conversationId,
			text: clean,
		});
		chatSocketRef.current.emit("conversation-typing", {
			conversationId,
			isTyping: false,
		});
		setChatInput("");
		setSendingMessage(false);
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!(event.ctrlKey || event.metaKey)) return;
			if (isEditableElement(event.target)) return;

			const key = event.key.toLowerCase();
			const shouldUndo = key === "z" && !event.shiftKey;
			const shouldRedo = key === "y" || (key === "z" && event.shiftKey);
			if (!shouldUndo && !shouldRedo) return;

			event.preventDefault();

			if (shouldUndo) {
				if (undoDepthRef.current <= 0) return;
				const removedShape = shapesRef.current.pop();
				if (!removedShape) return;
				redoShapesRef.current.push(removedShape);
				if (redoShapesRef.current.length > HISTORY_LIMIT) {
					redoShapesRef.current.shift();
				}
				undoDepthRef.current -= 1;
				draftShapeRef.current = null;
				dragStartRef.current = null;
				markDirty();
				return;
			}

			const restoredShape = redoShapesRef.current.pop();
			if (!restoredShape) return;
			shapesRef.current.push(restoredShape);
			undoDepthRef.current = Math.min(HISTORY_LIMIT, undoDepthRef.current + 1);
			markDirty();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	useEffect(() => {
		if (!canvasId || !Number.isInteger(canvasId) || canvasId <= 0) return;
		const interval = window.setInterval(() => {
			if (!dirtyRef.current || saving) return;
			void saveCanvas();
		}, 8000);

		return () => {
			window.clearInterval(interval);
		};
	}, [canvasIdParam, saving, backgroundColor, lineColor, tool, fill, strokeWeight, zoomPercent]);

  useEffect(() => {
		if (!canvasHostRef.current || p5Ref.current || initializedSketchRef.current) return;
		initializedSketchRef.current = true;
		let removeWheelListener: (() => void) | null = null;

    const sketch = (s: p5) => {
			const resizeToViewport = () => {
				const controlsHeight = controlsRef.current?.offsetHeight ?? 56;
				const nextHeight = Math.max(s.windowHeight - controlsHeight - 24, 200);
				const nextWidth = Math.max(canvasHostRef.current?.clientWidth ?? s.windowWidth, 320);
				s.resizeCanvas(nextWidth, nextHeight);
			};

			const screenToWorld = (screenX: number, screenY: number) => {
				const { scale, offsetX, offsetY } = viewRef.current;
				return {
					x: (screenX - offsetX) / scale,
					y: (screenY - offsetY) / scale,
				};
			};

			const drawShape = (shape: Shape) => {
				if (shape.kind === "eraser") {
					s.noFill();
					s.stroke(settingsRef.current.backgroundColor);
					s.strokeWeight(shape.strokeWeight);
					s.beginShape();
					for (const point of shape.points) {
						s.vertex(point.x, point.y);
					}
					s.endShape();
					return;
				}

				if (shape.kind === "freehand") {
					s.noFill();
					s.stroke(shape.color);
					s.strokeWeight(shape.strokeWeight);
					s.beginShape();
					for (const point of shape.points) {
						s.vertex(point.x, point.y);
					}
					s.endShape();
					return;
				}

				if (shape.kind === "dot") {
					s.noStroke();
					s.fill(shape.color);
					s.ellipseMode(s.CENTER);
					s.ellipse(shape.x, shape.y, shape.strokeWeight, shape.strokeWeight);
					return;
				}

				if (shape.kind === "line") {
					s.noFill();
					s.stroke(shape.color);
					s.strokeWeight(shape.strokeWeight);
					s.line(shape.x1, shape.y1, shape.x2, shape.y2);
					return;
				}

				if (shape.kind === "rectangle") {
					s.stroke(shape.color);
					s.strokeWeight(shape.strokeWeight);
					if (shape.filled) {
						s.fill(shape.color);
					} else {
						s.noFill();
					}
					s.rectMode(s.CORNERS);
					s.rect(shape.x1, shape.y1, shape.x2, shape.y2);
					return;
				}

				if (shape.filled) {
					s.stroke(shape.color);
					s.strokeWeight(shape.strokeWeight);
					s.fill(shape.color);
				} else {
					s.stroke(shape.color);
					s.strokeWeight(shape.strokeWeight);
					s.noFill();
				}
				s.ellipseMode(s.CORNERS);
				s.ellipse(shape.x1, shape.y1, shape.x2, shape.y2);
			};

			s.setup = () => {
				const renderer = s.createCanvas(100, 100);
				renderer.parent(canvasHostRef.current!);

				const handleWheel = (event: WheelEvent) => {
					const canvasRect = renderer.elt.getBoundingClientRect();
					const pointerX = event.clientX - canvasRect.left;
					const pointerY = event.clientY - canvasRect.top;
					if (pointerX < 0 || pointerX > canvasRect.width || pointerY < 0 || pointerY > canvasRect.height) return;

						event.preventDefault();

						if (!event.ctrlKey) {
							const horizontalDelta = event.deltaX !== 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0;
							const verticalDelta = event.shiftKey && event.deltaX === 0 ? 0 : event.deltaY;
							viewRef.current.offsetX -= horizontalDelta;
							viewRef.current.offsetY -= verticalDelta;
							return;
						}

					const currentPercent = Math.round(viewRef.current.scale * 100);
					const nextPercent = currentPercent + (event.deltaY < 0 ? 5 : -5);
					applyZoomPercent(nextPercent, { x: pointerX, y: pointerY });
				};

				renderer.elt.addEventListener("wheel", handleWheel, { passive: false });
				removeWheelListener = () => renderer.elt.removeEventListener("wheel", handleWheel);
				resizeToViewport();
			};

			s.draw = () => {
				s.background(settingsRef.current.backgroundColor);
				s.push();
				s.translate(viewRef.current.offsetX, viewRef.current.offsetY);
				s.scale(viewRef.current.scale);
				for (const shape of shapesRef.current) {
					drawShape(shape);
				}
				if (draftShapeRef.current) {
					drawShape(draftShapeRef.current);
				}
				s.pop();
			};

			s.mousePressed = (event: MouseEvent) => {
				if ((event.buttons & 1) === 0) return;
				if (s.mouseX < 0 || s.mouseX > s.width || s.mouseY < 0 || s.mouseY > s.height) return;
				const worldPoint = screenToWorld(s.mouseX, s.mouseY);

				dragStartRef.current = { x: worldPoint.x, y: worldPoint.y };

				if (settingsRef.current.tool === "freehand" || settingsRef.current.tool === "eraser") {
					draftShapeRef.current = {
						kind: settingsRef.current.tool,
						points: [{ x: worldPoint.x, y: worldPoint.y }],
						...(settingsRef.current.tool === "freehand" ? { color: settingsRef.current.lineColor } : {}),
						strokeWeight: settingsRef.current.strokeWeight,
					} as FreeHandShape | EraserShape;
					return;
				}

				draftShapeRef.current = {
					kind: settingsRef.current.tool,
					x1: worldPoint.x,
					y1: worldPoint.y,
					x2: worldPoint.x,
					y2: worldPoint.y,
					color: settingsRef.current.lineColor,
					filled: settingsRef.current.fill,
					strokeWeight: settingsRef.current.strokeWeight,
				} as LineShape | RectangleShape | CircleShape;
			};

				s.mouseClicked = () => {
					if (s.mouseX < 0 || s.mouseX > s.width || s.mouseY < 0 || s.mouseY > s.height) return;
					if (settingsRef.current.tool !== "freehand") return;
					const worldPoint = screenToWorld(s.mouseX, s.mouseY);
					if (!dotRef.current) {
						dotRef.current = true;
						return;
					}
					commitShape({
						kind: "dot",
						x: worldPoint.x,
						y: worldPoint.y,
						color: settingsRef.current.lineColor,
						strokeWeight: settingsRef.current.strokeWeight,
					});
					draftShapeRef.current = null;
					dragStartRef.current = null;
				};

			s.mouseDragged = (event: MouseEvent) => {
				if ((event.buttons & 1) === 0) return;
				if (!dragStartRef.current || !draftShapeRef.current) return;
				const worldPoint = screenToWorld(s.mouseX, s.mouseY);
				dotRef.current = false;
				if (draftShapeRef.current.kind === "freehand" || draftShapeRef.current.kind === "eraser") {
					draftShapeRef.current = {
						...draftShapeRef.current,
						points: [...draftShapeRef.current.points, { x: worldPoint.x, y: worldPoint.y }],
					};
					return;
				}

				draftShapeRef.current = {
					...draftShapeRef.current,
					x2: worldPoint.x,
					y2: worldPoint.y,
				};
			};

			s.mouseReleased = () => {
				if (!dragStartRef.current || !draftShapeRef.current) return;
					if ((draftShapeRef.current.kind === "freehand" || draftShapeRef.current.kind === "eraser") && draftShapeRef.current.points.length < 2) {
						draftShapeRef.current = null;
						dragStartRef.current = null;
						return;
					}
					commitShape({ ...draftShapeRef.current });
				dragStartRef.current = null;
				draftShapeRef.current = null;
			};

			s.windowResized = () => {
				resizeToViewport();
			};
    };

		p5Ref.current = new p5(sketch);

		return () => {
			removeWheelListener?.();
			p5Ref.current?.remove();
			p5Ref.current = null;
			if (canvasHostRef.current) {
				canvasHostRef.current.innerHTML = "";
			}
		};
  }, []);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
			<div
				ref={controlsRef}
				style={{
					width: "100%",
					display: "grid",
					gridTemplateColumns: "1fr auto 1fr",
					alignItems: "center",
					columnGap: "12px",
				}}
			>
				<div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Canvas</span>
						<span style={controlFieldStyle}>
							<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
								<button type="button" onClick={clearCanvas} style={{ width: "70px" }}>
									Clear
								</button>
								<button
									type="button"
									onClick={() => void saveCanvas()}
									style={{ width: "56px", padding: "4px 6px", fontSize: "0.75rem" }}
									disabled={saving}
								>
									{saving ? "..." : "Save"}
								</button>
							</div>
						</span>
					</label>
				</div>

				<div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", flexWrap: "wrap", alignContent: "center" }}>
					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Background</span>
						<span style={controlFieldStyle}>
							<input
								type="color"
								value={backgroundColor}
								onChange={(event) => setBackgroundColor(event.target.value)}
							/>
						</span>
					</label>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Line Color</span>
						<span style={controlFieldStyle}>
							<input
								type="color"
								value={lineColor}
								onChange={(event) => setLineColor(event.target.value)}
							/>
						</span>
					</label>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Tool</span>
						<span style={controlFieldStyle}>
							<select
								value={tool}
								onChange={(event) => setTool(event.target.value as Tool)}
							>
								<option value="freehand">Free Hand</option>
								<option value="eraser">Eraser</option>
								<option value="line">Line</option>
								<option value="rectangle">Rectangle</option>
								<option value="circle">Circle</option>
							</select>
						</span>
					</label>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Fill Shape</span>
						<span style={controlFieldStyle}>
							<input
								type="checkbox"
								checked={fill}
								onChange={(event) => setFill(event.target.checked)}
							/>
						</span>
					</label>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Stroke Weight</span>
						<span style={controlFieldStyle}>
							<input
								type="number"
								min={1}
								max={30}
								step={1}
								value={strokeWeight}
								onChange={(event) => {
									const parsed = Number(event.target.value);
									if (Number.isNaN(parsed)) return;
									const clamped = Math.min(30, Math.max(1, parsed));
									setStrokeWeight(clamped);
								}}
								style={{ width: "64px" }}
							/>
						</span>
					</label>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Zoom</span>
						<span style={controlFieldStyle}>
							<input
								type="text"
								value={`${zoomPercent}%`}
								readOnly
								style={{ width: "64px", textAlign: "center" }}
							/>
						</span>
					</label>
				</div>

				<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", color: "var(--ink3)", fontSize: "0.8rem" }}>
					{saveStatus}
				</div>
			</div>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "10px", alignItems: "stretch" }}>
					<div ref={canvasHostRef} style={{ minHeight: "320px", border: "1px solid var(--border)", borderRadius: 8 }} />
					<CanvasChatSidebar
						canvasName={canvasName}
						members={members}
						chatStatus={chatStatus}
						messages={chatMessages}
						peerTyping={peerTyping}
						chatInput={chatInput}
						conversationLinked={Boolean(conversationId)}
						sendingMessage={sendingMessage}
						onChatInputChange={handleChatInputChange}
						onSend={handleSendChat}
					/>
				</div>
    </div>
  );
}