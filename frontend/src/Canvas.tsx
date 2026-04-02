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

type RgbColor = {
	r: number;
	g: number;
	b: number;
};

const DEFAULT_BACKGROUND_COLOR = "#ffffff";
const DEFAULT_LINE_COLOR = "#111111";
const COLOR_SWATCHES = [
	"#111111",
	"#ffffff",
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#06b6d4",
	"#3b82f6",
	"#8b5cf6",
	"#ec4899",
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (value: string): RgbColor | null => {
	const normalized = value.trim().replace(/^#/, "");
	if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
	return {
		r: Number.parseInt(normalized.slice(0, 2), 16),
		g: Number.parseInt(normalized.slice(2, 4), 16),
		b: Number.parseInt(normalized.slice(4, 6), 16),
	};
};

const rgbToHex = ({ r, g, b }: RgbColor) => {
	const toHex = (component: number) => clamp(Math.round(component), 0, 255).toString(16).padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsl = ({ r, g, b }: RgbColor) => {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const lightness = (max + min) / 2;

	if (max === min) {
		return { h: 0, s: 0, l: lightness };
	}

	const delta = max - min;
	const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
	let hue = 0;

	switch (max) {
		case red:
			hue = (green - blue) / delta + (green < blue ? 6 : 0);
			break;
		case green:
			hue = (blue - red) / delta + 2;
			break;
		default:
			hue = (red - green) / delta + 4;
	}

	return { h: hue * 60, s: saturation, l: lightness };
};

const hslToRgb = (h: number, s: number, l: number) => {
	const hue = ((h % 360) + 360) % 360 / 360;

	if (s === 0) {
		const value = Math.round(l * 255);
		return { r: value, g: value, b: value };
	}

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	const hueToRgb = (pValue: number, qValue: number, tValue: number) => {
		let t = tValue;
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return pValue + (qValue - pValue) * 6 * t;
		if (t < 1 / 2) return qValue;
		if (t < 2 / 3) return pValue + (qValue - pValue) * (2 / 3 - t) * 6;
		return pValue;
	};

	return {
		r: Math.round(hueToRgb(p, q, hue + 1 / 3) * 255),
		g: Math.round(hueToRgb(p, q, hue) * 255),
		b: Math.round(hueToRgb(p, q, hue - 1 / 3) * 255),
	};
};

const normalizeHexColor = (value: string, fallback: string) => {
	const rgb = hexToRgb(value);
	return rgb ? rgbToHex(rgb) : fallback;
};

function ColorPickerControl({
	label,
	value,
	onChange,
	defaultValue,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	defaultValue: string;
}) {
	const [open, setOpen] = useState(false);
	const [draftColor, setDraftColor] = useState(() => normalizeHexColor(value, defaultValue));
	const panelRef = useRef<HTMLDivElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const dragModeRef = useRef<"sv" | "hue" | null>(null);

	const currentColor = normalizeHexColor(value, defaultValue);
	const currentRgb = hexToRgb(currentColor) ?? hexToRgb(defaultValue) ?? { r: 0, g: 0, b: 0 };
	const currentHsl = rgbToHsl(currentRgb);
	const draftRgb = hexToRgb(draftColor) ?? currentRgb;
	const draftHsl = rgbToHsl(draftRgb);

	useEffect(() => {
		if (!open) {
			setDraftColor(currentColor);
		}
	}, [currentColor, open]);

	useEffect(() => {
		const handlePointerDown = (event: PointerEvent) => {
			if (!open) return;
			const target = event.target as Node | null;
			if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
			setOpen(false);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!open) return;
			if (event.key === "Escape") setOpen(false);
		};

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	const updateFromPalette = (clientX: number, clientY: number) => {
		const palette = panelRef.current?.querySelector<HTMLElement>("[data-color-palette]");
		if (!palette) return;
		const rect = palette.getBoundingClientRect();
		const saturation = clamp((clientX - rect.left) / rect.width, 0, 1);
		const lightness = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
		const rgb = hslToRgb(draftHsl.h, saturation, lightness);
		setDraftColor(rgbToHex(rgb));
	};

	const updateFromHue = (clientX: number) => {
		const hueTrack = panelRef.current?.querySelector<HTMLElement>("[data-color-hue]");
		if (!hueTrack) return;
		const rect = hueTrack.getBoundingClientRect();
		const hue = clamp((clientX - rect.left) / rect.width, 0, 1) * 360;
		const rgb = hslToRgb(hue, draftHsl.s, draftHsl.l);
		setDraftColor(rgbToHex(rgb));
	};

	const handlePalettePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		dragModeRef.current = "sv";
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		updateFromPalette(event.clientX, event.clientY);
	};

	const handlePalettePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (dragModeRef.current !== "sv") return;
		updateFromPalette(event.clientX, event.clientY);
	};

	const handleHuePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		dragModeRef.current = "hue";
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		updateFromHue(event.clientX);
	};

	const handleHuePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (dragModeRef.current !== "hue") return;
		updateFromHue(event.clientX);
	};

	const stopDragging = () => {
		dragModeRef.current = null;
	};

	return (
		<div className="color-picker">
			<span className="color-picker__label">{label}</span>
			<button
				type="button"
				ref={buttonRef}
				className="color-picker__trigger"
				onClick={() => setOpen((nextOpen) => !nextOpen)}
				aria-expanded={open}
			>
				<span className="color-picker__swatch" style={{ background: currentColor }} />
				<span className="color-picker__value">{currentColor.toUpperCase()}</span>
			</button>
			{open ? (
				<div ref={panelRef} className="color-picker__panel">
					<div
						data-color-palette
						className="color-picker__palette"
						style={{
							backgroundColor: `hsl(${draftHsl.h}, 100%, 50%)`,
							backgroundImage: `
								linear-gradient(to right, #ffffff, rgba(255,255,255,0)),
								linear-gradient(to top, #000000, rgba(0,0,0,0))
							`,
						}}
						onPointerDown={handlePalettePointerDown}
						onPointerMove={handlePalettePointerMove}
						onPointerUp={stopDragging}
						onPointerLeave={stopDragging}
					>
						<div
							className="color-picker__cursor"
							style={{
								left: `${draftHsl.s * 100}%`,
								top: `${(1 - draftHsl.l) * 100}%`,
								background: currentColor,
							}}
						/>
					</div>
					<div className="color-picker__slider-group">
						<div
							data-color-hue
							className="color-picker__hue"
							style={{
								background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
							}}
							onPointerDown={handleHuePointerDown}
							onPointerMove={handleHuePointerMove}
							onPointerUp={stopDragging}
							onPointerLeave={stopDragging}
						>
							<div
								className="color-picker__cursor color-picker__cursor--hue"
								style={{ left: `${(draftHsl.h / 360) * 100}%` }}
							/>
						</div>
						<div className="color-picker__hex-row">
							<input
								type="text"
								value={draftColor.toUpperCase()}
								onChange={(event) => setDraftColor(normalizeHexColor(event.target.value, currentColor))}
								className="color-picker__hex-input"
								aria-label={`${label} hex value`}
							/>
							<button
								type="button"
								className="color-picker__apply"
								onClick={() => {
									onChange(draftColor);
									setOpen(false);
								}}
							>
								Apply
							</button>
						</div>
						<div className="color-picker__swatches">
							{COLOR_SWATCHES.map((swatch) => (
								<button
									key={swatch}
									type="button"
									className="color-picker__swatch-button"
									style={{ background: swatch }}
									onClick={() => setDraftColor(swatch)}
									aria-label={`Select ${swatch}`}
								/>
							))}
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}

export default function Canvas() {
	const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND_COLOR);
	const [lineColor, setLineColor] = useState(DEFAULT_LINE_COLOR);
	const [tool, setTool] = useState<Tool>("freehand");
	const [fill, setFill] = useState(false);
	const [strokeWeight, setStrokeWeight] = useState(4);
	const [zoomPercent, setZoomPercent] = useState(100);

  const controlsRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
	const p5Ref = useRef<p5 | null>(null);

	const settingsRef = useRef({
		backgroundColor: DEFAULT_BACKGROUND_COLOR,
		lineColor: DEFAULT_LINE_COLOR,
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

	const clearCanvas = () => {
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
		settingsRef.current = {
			backgroundColor: normalizeHexColor(backgroundColor, DEFAULT_BACKGROUND_COLOR),
			lineColor: normalizeHexColor(lineColor, DEFAULT_LINE_COLOR),
			tool,
			fill,
			strokeWeight,
		};
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
					s.background(normalizeHexColor(settingsRef.current.backgroundColor, DEFAULT_BACKGROUND_COLOR));
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
						...(settingsRef.current.tool === "freehand" ? { color: normalizeHexColor(settingsRef.current.lineColor, DEFAULT_LINE_COLOR) } : {}),
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
						color: normalizeHexColor(settingsRef.current.lineColor, DEFAULT_LINE_COLOR),
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
						color: normalizeHexColor(settingsRef.current.lineColor, DEFAULT_LINE_COLOR),
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

				<div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", flexWrap: "wrap", alignContent: "center" }}>
					<div style={controlLabelStyle}>
						<ColorPickerControl
							label="Background"
							value={backgroundColor}
							onChange={setBackgroundColor}
							defaultValue={DEFAULT_BACKGROUND_COLOR}
						/>
					</div>

					<div style={controlLabelStyle}>
						<ColorPickerControl
							label="Line Color"
							value={lineColor}
							onChange={setLineColor}
							defaultValue={DEFAULT_LINE_COLOR}
						/>
					</div>

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

				<div />
			</div>
      <div ref={canvasHostRef} />
    </div>
  );
}