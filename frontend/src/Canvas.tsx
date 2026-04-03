import { useEffect, useRef, useState } from "react";
import p5 from "p5";

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
const HISTORY_LIMIT = 50;

export default function Canvas() {
	const [backgroundColor, setBackgroundColor] = useState("#ffffff");
	const [lineColor, setLineColor] = useState("#111111");
	const [tool, setTool] = useState<Tool>("freehand");
	const [fill, setFill] = useState(false);
	const [strokeWeight, setStrokeWeight] = useState(4);
	const [zoomPercent, setZoomPercent] = useState(100);

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

	const undo = () => {
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
	};

	const redo = () => {
		const restoredShape = redoShapesRef.current.pop();
		if (!restoredShape) return;
		shapesRef.current.push(restoredShape);
		undoDepthRef.current = Math.min(HISTORY_LIMIT, undoDepthRef.current + 1);
	};

	const clearCanvas = () => {
		if (shapesRef.current.length === 0) return;
		if (!window.confirm("Clear the entire canvas? This cannot be undone.")) return;
		shapesRef.current = [];
		redoShapesRef.current = [];
		undoDepthRef.current = 0;
		draftShapeRef.current = null;
		dragStartRef.current = null;
		dotRef.current = true;
	};

	const commitShape = (shape: Shape) => {
		shapesRef.current.push(shape);
		undoDepthRef.current = Math.min(HISTORY_LIMIT, undoDepthRef.current + 1);
		redoShapesRef.current = [];
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
		width: "80px",
	};
	const controlNameStyle = {
		display: "flex",
		justifyContent: "center" as const,
		alignItems: "center" as const,
		width: "100%",
		height: "100%",
		whiteSpace: "nowrap" as const,
		fontSize: "0.8rem",
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
				return;
			}

			const restoredShape = redoShapesRef.current.pop();
			if (!restoredShape) return;
			shapesRef.current.push(restoredShape);
			undoDepthRef.current = Math.min(HISTORY_LIMIT, undoDepthRef.current + 1);
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

  useEffect(() => {
		if (!canvasHostRef.current || p5Ref.current || initializedSketchRef.current) return;
		initializedSketchRef.current = true;
		let removeWheelListener: (() => void) | null = null;

    const sketch = (s: p5) => {
			const resizeToViewport = () => {
				const controlsHeight = controlsRef.current?.offsetHeight ?? 56;
				const nextHeight = Math.max(s.windowHeight - controlsHeight - 24, 200);
				s.resizeCanvas(s.windowWidth, nextHeight);
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
							<button type="button" onClick={clearCanvas} style={{ width: "80px" }}>
								Clear
							</button>
						</span>
					</label>
				</div>

				<div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", flexWrap: "wrap", alignContent: "center" }}>
					{/* Undo/Redo */}
					<button
						type="button"
						onClick={undo}
						disabled={undoDepthRef.current <= 0}
						title="Undo"
						style={{ fontSize: "1.2rem", padding: "4px 8px" }}
					>
						↶
					</button>
					<button
						type="button"
						onClick={redo}
						disabled={redoShapesRef.current.length === 0}
						title="Redo"
						style={{ fontSize: "1.2rem", padding: "4px 8px" }}
					>
						↷
					</button>

					{/* Tools */}
					<button
						type="button"
						onClick={() => setTool("freehand")}
						className={tool === "freehand" ? "btn btn-primary" : "btn btn-ghost"}
						title="Freehand"
						style={{ fontSize: "1.2rem", padding: "4px 8px" }}
					>
						✏️
					</button>
					<button
						type="button"
						onClick={() => setTool("eraser")}
						className={tool === "eraser" ? "btn btn-primary" : "btn btn-ghost"}
						title="Eraser"
						style={{ fontSize: "1.2rem", padding: "4px 8px" }}
					>
						🧽
					</button>
					<button
						type="button"
						onClick={() => setTool("line")}
						className={tool === "line" ? "btn btn-primary" : "btn btn-ghost"}
						title="Line"
						style={{ fontSize: "1.2rem", padding: "4px 8px" }}
					>
						📏
					</button>
					<button
						type="button"
						onClick={() => setTool("rectangle")}
						className={tool === "rectangle" ? "btn btn-primary" : "btn btn-ghost"}
						title="Rectangle"
						style={{ fontSize: "1.2rem", padding: "4px 8px" }}
					>
						▭
					</button>
					<button
						type="button"
						onClick={() => setTool("circle")}
						className={tool === "circle" ? "btn btn-primary" : "btn btn-ghost"}
						title="Circle"
						style={{ fontSize: "1.2rem", padding: "4px 8px" }}
					>
						○
					</button>

					{/* Colors and Settings */}
					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>BG</span>
						<span style={controlFieldStyle}>
							<input
								type="color"
								value={backgroundColor}
								onChange={(event) => setBackgroundColor(event.target.value)}
							/>
						</span>
					</label>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Color</span>
						<span style={controlFieldStyle}>
							<input
								type="color"
								value={lineColor}
								onChange={(event) => setLineColor(event.target.value)}
							/>
						</span>
					</label>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Fill</span>
						<span style={controlFieldStyle}>
							<input
								type="checkbox"
								checked={fill}
								onChange={(event) => setFill(event.target.checked)}
							/>
						</span>
					</label>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Size</span>
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
								style={{ width: "50px" }}
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
								style={{ width: "50px", textAlign: "center" }}
							/>
						</span>
					</label>

					{/* Clear Button */}
					<button
						type="button"
						onClick={() => {
							if (window.confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
								clearCanvas();
							}
						}}
						title="Clear Canvas"
						style={{ fontSize: "1.2rem", padding: "4px 8px" }}
					>
						🗑️
					</button>
				</div>

				<div />
			</div>
      <div ref={canvasHostRef} />
    </div>
  );
}