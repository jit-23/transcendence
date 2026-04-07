import { useEffect, useRef, useState } from "react";
import p5 from "p5";

type Tool = "line" | "rectangle" | "circle" | "freehand" | "eraser" | "cursor";

type LineShape = {
	kind: "line";
	id: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	strokeWeight: number;
	angle: number;
};

type RectangleShape = {
	kind: "rectangle";
	id: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	filled: boolean;
	strokeWeight: number;
	angle: number;
};

type CircleShape = {
	kind: "circle";
	id: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	filled: boolean;
	strokeWeight: number;
	angle: number;
};

type FreeHandShape = {
	kind: "freehand";
	id: string;
	points: Array<{ x: number; y: number }>;
	color: string;
	strokeWeight: number;
	angle: number;
};

type DotShape = {
	kind: "dot";
	id: string;
	x: number;
	y: number;
	color: string;
	strokeWeight: number;
	angle: number;
};

type EraserShape = {
	kind: "eraser";
	id: string;
	points: Array<{ x: number; y: number }>;
	strokeWeight: number;
	angle: number;
};

type Shape = LineShape | RectangleShape | CircleShape | FreeHandShape | DotShape | EraserShape;
const HISTORY_LIMIT = 50;

type RgbColor = {
	r: number;
	g: number;
	b: number;
};

type Bounds = {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
};

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type RotationHandle = "rotation";
type AnyHandle = ResizeHandle | RotationHandle;

type HandlePoint = {
	handle: AnyHandle;
	x: number;
	y: number;
};

let shapeIdCounter = 0;

const generateShapeId = () => `shape-${++shapeIdCounter}`;

const isPointInShape = (px: number, py: number, shape: Shape, hitTolerance = 6): boolean => {
	// Unrotate the point if shape is rotated
	let testX = px;
	let testY = py;
	
	if (shape.angle !== 0) {
		const center = getRotationCenter(shape);
		const unrotated = unrotatePoint({ x: px, y: py }, center, shape.angle);
		testX = unrotated.x;
		testY = unrotated.y;
	}
	
	switch (shape.kind) {
		case "dot":
			return Math.hypot(testX - shape.x, testY - shape.y) <= shape.strokeWeight / 2 + hitTolerance;

		case "freehand":
		case "eraser": {
			for (let i = 0; i < shape.points.length - 1; i++) {
				const p1 = shape.points[i]!;
				const p2 = shape.points[i + 1]!;
				const dist = distanceToLineSegment(testX, testY, p1.x, p1.y, p2.x, p2.y);
				if (dist <= shape.strokeWeight / 2 + hitTolerance) return true;
			}
			return false;
		}

		case "line": {
			const dist = distanceToLineSegment(testX, testY, shape.x1, shape.y1, shape.x2, shape.y2);
			return dist <= shape.strokeWeight / 2 + hitTolerance;
		}

		case "rectangle": {
			const minX = Math.min(shape.x1, shape.x2);
			const maxX = Math.max(shape.x1, shape.x2);
			const minY = Math.min(shape.y1, shape.y2);
			const maxY = Math.max(shape.y1, shape.y2);
			if (shape.filled) {
				return testX >= minX && testX <= maxX && testY >= minY && testY <= maxY;
			}
			return (
				(testX >= minX - hitTolerance && testX <= maxX + hitTolerance && Math.abs(testY - minY) <= hitTolerance) ||
				(testX >= minX - hitTolerance && testX <= maxX + hitTolerance && Math.abs(testY - maxY) <= hitTolerance) ||
				(testY >= minY - hitTolerance && testY <= maxY + hitTolerance && Math.abs(testX - minX) <= hitTolerance) ||
				(testY >= minY - hitTolerance && testY <= maxY + hitTolerance && Math.abs(testX - maxX) <= hitTolerance)
			);
		}

		case "circle": {
			const centerX = (shape.x1 + shape.x2) / 2;
			const centerY = (shape.y1 + shape.y2) / 2;
			const radiusX = Math.abs(shape.x2 - shape.x1) / 2;
			const radiusY = Math.abs(shape.y2 - shape.y1) / 2;
			const dx = testX - centerX;
			const dy = testY - centerY;
			const normalized = (dx / radiusX) ** 2 + (dy / radiusY) ** 2;
			if (shape.filled) {
				return normalized <= 1;
			}
			return Math.abs(normalized - 1) <= 0.15;
		}

		default:
			return false;
	}
};

const distanceToLineSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
	const closestX = x1 + t * dx;
	const closestY = y1 + t * dy;
	return Math.hypot(px - closestX, py - closestY);
};

const moveShape = (shape: Shape, deltaX: number, deltaY: number): Shape => {
	switch (shape.kind) {
		case "dot":
			return { ...shape, x: shape.x + deltaX, y: shape.y + deltaY };

		case "freehand":
		case "eraser":
			return { ...shape, points: shape.points.map((p) => ({ x: p.x + deltaX, y: p.y + deltaY })) };

		case "line":
			return { ...shape, x1: shape.x1 + deltaX, y1: shape.y1 + deltaY, x2: shape.x2 + deltaX, y2: shape.y2 + deltaY };

		case "rectangle":
		case "circle":
			return { ...shape, x1: shape.x1 + deltaX, y1: shape.y1 + deltaY, x2: shape.x2 + deltaX, y2: shape.y2 + deltaY };

		default:
			return shape;
	}
};

const getShapeBounds = (shape: Shape): Bounds => {
	switch (shape.kind) {
		case "dot": {
			const radius = Math.max(2, shape.strokeWeight / 2);
			return {
				minX: shape.x - radius,
				minY: shape.y - radius,
				maxX: shape.x + radius,
				maxY: shape.y + radius,
			};
		}
		case "freehand":
		case "eraser": {
			if (shape.points.length === 0) {
				return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
			}
			let minX = shape.points[0]!.x;
			let maxX = shape.points[0]!.x;
			let minY = shape.points[0]!.y;
			let maxY = shape.points[0]!.y;
			for (const point of shape.points) {
				minX = Math.min(minX, point.x);
				maxX = Math.max(maxX, point.x);
				minY = Math.min(minY, point.y);
				maxY = Math.max(maxY, point.y);
			}
			return { minX, minY, maxX, maxY };
		}
		default:
			return {
				minX: Math.min(shape.x1, shape.x2),
				minY: Math.min(shape.y1, shape.y2),
				maxX: Math.max(shape.x1, shape.x2),
				maxY: Math.max(shape.y1, shape.y2),
			};
	}
};

const getBoundsSize = (bounds: Bounds) => ({
	width: Math.max(1, bounds.maxX - bounds.minX),
	height: Math.max(1, bounds.maxY - bounds.minY),
});

const getResizeHandles = (bounds: Bounds): HandlePoint[] => {
	const centerX = (bounds.minX + bounds.maxX) / 2;
	const centerY = (bounds.minY + bounds.maxY) / 2;
	return [
		{ handle: "nw", x: bounds.minX, y: bounds.minY },
		{ handle: "n", x: centerX, y: bounds.minY },
		{ handle: "ne", x: bounds.maxX, y: bounds.minY },
		{ handle: "e", x: bounds.maxX, y: centerY },
		{ handle: "se", x: bounds.maxX, y: bounds.maxY },
		{ handle: "s", x: centerX, y: bounds.maxY },
		{ handle: "sw", x: bounds.minX, y: bounds.maxY },
		{ handle: "w", x: bounds.minX, y: centerY },
	];
};

const getOppositeHandlePoint = (bounds: Bounds, handle: ResizeHandle) => {
	const centerX = (bounds.minX + bounds.maxX) / 2;
	const centerY = (bounds.minY + bounds.maxY) / 2;
	const oppositeMap: Record<ResizeHandle, { x: number; y: number }> = {
		nw: { x: bounds.maxX, y: bounds.maxY },
		n: { x: centerX, y: bounds.maxY },
		ne: { x: bounds.minX, y: bounds.maxY },
		e: { x: bounds.minX, y: centerY },
		se: { x: bounds.minX, y: bounds.minY },
		s: { x: centerX, y: bounds.minY },
		sw: { x: bounds.maxX, y: bounds.minY },
		w: { x: bounds.maxX, y: centerY },
	};
	return oppositeMap[handle];
};

const boundsFromAnchorAndPointer = (
	anchor: { x: number; y: number },
	pointer: { x: number; y: number },
	handle: ResizeHandle,
	originalBounds: Bounds,
): Bounds => {
	let minX = Math.min(anchor.x, pointer.x);
	let maxX = Math.max(anchor.x, pointer.x);
	let minY = Math.min(anchor.y, pointer.y);
	let maxY = Math.max(anchor.y, pointer.y);

	if (handle === "n" || handle === "s") {
		minX = originalBounds.minX;
		maxX = originalBounds.maxX;
	}

	if (handle === "e" || handle === "w") {
		minY = originalBounds.minY;
		maxY = originalBounds.maxY;
	}

	if (maxX - minX < 1) {
		const centerX = (minX + maxX) / 2;
		minX = centerX - 0.5;
		maxX = centerX + 0.5;
	}

	if (maxY - minY < 1) {
		const centerY = (minY + maxY) / 2;
		minY = centerY - 0.5;
		maxY = centerY + 0.5;
	}

	return { minX, minY, maxX, maxY };
};

const mapPointBetweenBounds = (x: number, y: number, source: Bounds, target: Bounds) => {
	const sourceSize = getBoundsSize(source);
	const targetSize = getBoundsSize(target);
	const normalizedX = (x - source.minX) / sourceSize.width;
	const normalizedY = (y - source.minY) / sourceSize.height;
	return {
		x: target.minX + normalizedX * targetSize.width,
		y: target.minY + normalizedY * targetSize.height,
	};
};

const resizeShapeFromBounds = (shape: Shape, sourceBounds: Bounds, targetBounds: Bounds): Shape => {
	const map = (x: number, y: number) => mapPointBetweenBounds(x, y, sourceBounds, targetBounds);

	switch (shape.kind) {
		case "dot": {
			const mapped = map(shape.x, shape.y);
			return {
				...shape,
				x: mapped.x,
				y: mapped.y,
			};
		}
		case "freehand":
		case "eraser":
			return {
				...shape,
				points: shape.points.map((point) => map(point.x, point.y)),
			};
		default: {
			const p1 = map(shape.x1, shape.y1);
			const p2 = map(shape.x2, shape.y2);
			return {
				...shape,
				x1: p1.x,
				y1: p1.y,
				x2: p2.x,
				y2: p2.y,
			};
		}
	}
};

const getHandleAtPoint = (bounds: Bounds, x: number, y: number, radius: number): ResizeHandle | null => {
	const handles = getResizeHandles(bounds);
	for (const point of handles) {
		if (Math.abs(x - point.x) <= radius && Math.abs(y - point.y) <= radius) {
			return point.handle;
		}
	}
	return null;
};

const getCursorForHandle = (handle: ResizeHandle) => {
	switch (handle) {
		case "nw":
		case "se":
			return "nwse-resize";
		case "ne":
		case "sw":
			return "nesw-resize";
		case "n":
		case "s":
			return "ns-resize";
		default:
			return "ew-resize";
	}
};

const rotatePoint = (point: { x: number; y: number }, center: { x: number; y: number }, angle: number) => {
	const radians = (angle * Math.PI) / 180;
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	const x = point.x - center.x;
	const y = point.y - center.y;
	return {
		x: center.x + x * cos - y * sin,
		y: center.y + x * sin + y * cos,
	};
};

const getRotationCenter = (shape: Shape): { x: number; y: number } => {
	const bounds = getShapeBounds(shape);
	return {
		x: (bounds.minX + bounds.maxX) / 2,
		y: (bounds.minY + bounds.maxY) / 2,
	};
};

const getRotationHandlePoint = (shape: Shape): HandlePoint => {
	const center = getRotationCenter(shape);
	const bounds = getShapeBounds(shape);
	const distance = (bounds.maxY - bounds.minY) / 2 + 30;
	return {
		handle: "rotation",
		x: center.x,
		y: center.y - distance,
	};
};

const getHandleAtPointWithRotation = (bounds: Bounds, shape: Shape, x: number, y: number, radius: number): AnyHandle | null => {
	const resizeHandle = getHandleAtPoint(bounds, x, y, radius);
	if (resizeHandle) return resizeHandle;

	const rotationHandle = getRotationHandlePoint(shape);
	if (Math.abs(x - rotationHandle.x) <= radius && Math.abs(y - rotationHandle.y) <= radius) {
		return "rotation";
	}
	return null;
};

const unrotatePoint = (point: { x: number; y: number }, center: { x: number; y: number }, angle: number) => {
	const radians = (angle * Math.PI) / 180;
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	const x = point.x - center.x;
	const y = point.y - center.y;
	return {
		x: center.x + x * cos + y * sin,
		y: center.y - x * sin + y * cos,
	};
};

const getShapeBoundsIgnoreRotation = (shape: Shape): Bounds => {
	const tempShape = { ...shape, angle: 0 };
	return getShapeBounds(tempShape);
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
	const [tool, setTool] = useState<Tool>("cursor");
	const [fill, setFill] = useState(false);
	const [strokeWeight, setStrokeWeight] = useState(4);
	const [zoomPercent, setZoomPercent] = useState(100);
	const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
	const selectedShapeIdRef = useRef<string | null>(null);
	const hoveredShapeIdRef = useRef<string | null>(null);
	const hoveredHandleRef = useRef<AnyHandle | null>(null);
    const resizeSessionRef = useRef<{
		shapeId: string;
		handle: ResizeHandle;
		anchor: { x: number; y: number };
		originalBounds: Bounds;
		originalShape: Shape;
	} | null>(null);
	const rotationSessionRef = useRef<{
		shapeId: string;
		originalShape: Shape;
		startAngle: number;
	} | null>(null);

  const controlsRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
	const p5Ref = useRef<p5 | null>(null);

	const settingsRef = useRef({
		backgroundColor: DEFAULT_BACKGROUND_COLOR,
		lineColor: DEFAULT_LINE_COLOR,
		tool: "cursor" as Tool,
		fill: false,
		strokeWeight: 4,
	});

	const shapesRef = useRef<Shape[]>([]);
	const redoShapesRef = useRef<Shape[]>([]);
	const undoDepthRef = useRef(0);
	const draftShapeRef = useRef<Shape | null>(null);
	const dragStartRef = useRef<{ x: number; y: number } | null>(null);
	const draggedShapeIdRef = useRef<string | null>(null);
	const viewRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
	const initializedSketchRef = useRef(false);
	const dotRef = useRef(true);

	const clearCanvas = () => {
		shapesRef.current = [];
		redoShapesRef.current = [];
		undoDepthRef.current = 0;
		draftShapeRef.current = null;
		dragStartRef.current = null;
		draggedShapeIdRef.current = null;
		hoveredShapeIdRef.current = null;
		hoveredHandleRef.current = null;
		resizeSessionRef.current = null;
		rotationSessionRef.current = null;
		selectedShapeIdRef.current = null;
		setSelectedShapeId(null);
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
		selectedShapeIdRef.current = selectedShapeId;
	}, [selectedShapeId]);

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

			const findShapeAtPoint = (x: number, y: number) => {
				for (let index = shapesRef.current.length - 1; index >= 0; index -= 1) {
					const shape = shapesRef.current[index];
					if (!shape) continue;
					if (isPointInShape(x, y, shape)) return shape;
				}
				return null;
			};

			const syncHoverFromPointer = () => {
				if (settingsRef.current.tool !== "cursor") {
					hoveredShapeIdRef.current = null;
					hoveredHandleRef.current = null;
					s.cursor(s.CROSS);
					return;
				}

				if (resizeSessionRef.current) {
					hoveredHandleRef.current = resizeSessionRef.current.handle;
					hoveredShapeIdRef.current = resizeSessionRef.current.shapeId;
					s.cursor(getCursorForHandle(resizeSessionRef.current.handle));
					return;
				}

				if (draggedShapeIdRef.current) {
					hoveredHandleRef.current = null;
					hoveredShapeIdRef.current = draggedShapeIdRef.current;
					s.cursor(s.HAND);
					return;
				}

				if (s.mouseX < 0 || s.mouseX > s.width || s.mouseY < 0 || s.mouseY > s.height) {
					hoveredShapeIdRef.current = null;
				hoveredHandleRef.current = null;
				s.cursor(s.ARROW);
				return;
			}

			const worldPoint = screenToWorld(s.mouseX, s.mouseY);
			const selectedShape = selectedShapeIdRef.current
				? shapesRef.current.find((shape) => shape.id === selectedShapeIdRef.current) ?? null
				: null;
			if (selectedShape) {
				const selectedBounds = getShapeBounds(selectedShape);
				const handleRadius = 7 / viewRef.current.scale;
				
				// Check for rotation handle first
				const rotationHandle = getRotationHandlePoint(selectedShape);
				if (Math.abs(worldPoint.x - rotationHandle.x) <= handleRadius && Math.abs(worldPoint.y - rotationHandle.y) <= handleRadius) {
					hoveredHandleRef.current = "rotation";
					hoveredShapeIdRef.current = selectedShape.id;
					s.cursor("grab");
					return;
				}
				
				// Check for resize handles (with unrotation if needed)
				let unrotatedPoint = worldPoint;
				if (selectedShape.angle !== 0) {
					const center = getRotationCenter(selectedShape);
					unrotatedPoint = unrotatePoint(worldPoint, center, selectedShape.angle);
				}
				
				const unrotatedBounds = getShapeBoundsIgnoreRotation(selectedShape);
				const handle = getHandleAtPoint(unrotatedBounds, unrotatedPoint.x, unrotatedPoint.y, handleRadius);
				if (handle) {
					hoveredHandleRef.current = handle;
					hoveredShapeIdRef.current = selectedShape.id;
					s.cursor(getCursorForHandle(handle));
					return;
				}
			}

			const hoveredShape = findShapeAtPoint(worldPoint.x, worldPoint.y);
			hoveredHandleRef.current = null;
			hoveredShapeIdRef.current = hoveredShape?.id ?? null;
			s.cursor(hoveredShape ? s.HAND : s.ARROW);
		};		const drawSelectionHandles = (shape: Shape) => {
			const bounds = getShapeBounds(shape);
			const center = getRotationCenter(shape);
			const handleSize = 10 / viewRef.current.scale;
			
			// Draw selection box (rotate if needed)
			s.noFill();
			s.stroke("#2563eb");
			s.strokeWeight(1 / viewRef.current.scale);
			
			if (shape.angle !== 0) {
				s.push();
				s.translate(center.x, center.y);
				s.rotate((shape.angle * Math.PI) / 180);
				s.translate(-center.x, -center.y);
				s.rectMode(s.CORNERS);
				s.rect(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
				s.pop();
			} else {
				s.rectMode(s.CORNERS);
				s.rect(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
			}

			// Draw resize handles (rotated if needed)
			const unrotatedBounds = getShapeBoundsIgnoreRotation(shape);
			const handles = getResizeHandles(unrotatedBounds);
			for (const point of handles) {
				let handlePos = point;
				if (shape.angle !== 0) {
					handlePos = {
						...point,
						x: rotatePoint({ x: point.x, y: point.y }, center, shape.angle).x,
						y: rotatePoint({ x: point.x, y: point.y }, center, shape.angle).y,
					};
				}
				
				s.fill(point.handle === hoveredHandleRef.current ? "#60a5fa" : "#ffffff");
				s.stroke("#2563eb");
				s.strokeWeight(1 / viewRef.current.scale);
				s.rectMode(s.CENTER);
				s.rect(handlePos.x, handlePos.y, handleSize, handleSize);
			}

			// Draw rotation handle
			const rotationHandle = getRotationHandlePoint(shape);
			s.fill(rotationHandle.handle === hoveredHandleRef.current ? "#fbbf24" : "#f97316");
			s.stroke("#ea580c");
			s.strokeWeight(1 / viewRef.current.scale);
			s.ellipseMode(s.CENTER);
			s.ellipse(rotationHandle.x, rotationHandle.y, handleSize, handleSize);
		};			const drawShape = (shape: Shape, options?: { isSelected?: boolean; isHovered?: boolean }) => {
				const isSelected = options?.isSelected ?? false;
				const isHovered = options?.isHovered ?? false;
				const highlightColor = isSelected ? "#2563eb" : "#60a5fa";
				
				// Apply rotation if angle is not 0
				if (shape.angle !== 0) {
					const center = getRotationCenter(shape);
					s.push();
					s.translate(center.x, center.y);
					s.rotate((shape.angle * Math.PI) / 180);
					s.translate(-center.x, -center.y);
				}
				
				if (shape.kind === "eraser") {
					s.noFill();
					s.stroke(settingsRef.current.backgroundColor);
					s.strokeWeight(shape.strokeWeight);
					s.beginShape();
					for (const point of shape.points) {
						s.vertex(point.x, point.y);
					}
					s.endShape();
					if (shape.angle !== 0) s.pop();
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
					if (isSelected || isHovered) {
						s.noFill();
						s.stroke(highlightColor);
						s.strokeWeight(1);
						for (const point of shape.points) {
							s.ellipse(point.x, point.y, 2, 2);
						}
					}
					if (shape.angle !== 0) s.pop();
					return;
				}

				if (shape.kind === "dot") {
					s.noStroke();
					s.fill(shape.color);
					s.ellipseMode(s.CENTER);
					s.ellipse(shape.x, shape.y, shape.strokeWeight, shape.strokeWeight);
					if (isSelected || isHovered) {
						s.noFill();
						s.stroke(highlightColor);
						s.strokeWeight(2);
						s.ellipse(shape.x, shape.y, shape.strokeWeight + 4, shape.strokeWeight + 4);
					}
					if (shape.angle !== 0) s.pop();
					return;
				}

				if (shape.kind === "line") {
					s.noFill();
					s.stroke(shape.color);
					s.strokeWeight(shape.strokeWeight);
					s.line(shape.x1, shape.y1, shape.x2, shape.y2);
					if (isSelected || isHovered) {
						s.noFill();
						s.stroke(highlightColor);
						s.strokeWeight(2);
						s.line(shape.x1, shape.y1, shape.x2, shape.y2);
					}
					if (shape.angle !== 0) s.pop();
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
					if (isSelected || isHovered) {
						s.noFill();
						s.stroke(highlightColor);
						s.strokeWeight(2);
						s.rect(shape.x1, shape.y1, shape.x2, shape.y2);
					}
					if (shape.angle !== 0) s.pop();
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
				if (isSelected || isHovered) {
					s.noFill();
					s.stroke(highlightColor);
					s.strokeWeight(2);
					s.ellipse(shape.x1, shape.y1, shape.x2, shape.y2);
				}
				if (shape.angle !== 0) s.pop();
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
				syncHoverFromPointer();
					s.background(normalizeHexColor(settingsRef.current.backgroundColor, DEFAULT_BACKGROUND_COLOR));
				s.push();
				s.translate(viewRef.current.offsetX, viewRef.current.offsetY);
				s.scale(viewRef.current.scale);
				for (const shape of shapesRef.current) {
					drawShape(shape, {
						isSelected: shape.id === selectedShapeIdRef.current,
						isHovered: shape.id === hoveredShapeIdRef.current,
					});
				}
				if (draftShapeRef.current) {
					drawShape(draftShapeRef.current, { isSelected: false, isHovered: false });
				}
				const selectedShape = selectedShapeIdRef.current
					? shapesRef.current.find((shape) => shape.id === selectedShapeIdRef.current) ?? null
					: null;
				if (selectedShape && settingsRef.current.tool === "cursor") {
					drawSelectionHandles(selectedShape);
				}
				s.pop();
			};

			s.mouseMoved = () => {
				syncHoverFromPointer();
			};

			s.mousePressed = (event: MouseEvent) => {
				if ((event.buttons & 1) === 0) return;
				if (s.mouseX < 0 || s.mouseX > s.width || s.mouseY < 0 || s.mouseY > s.height) return;
				const worldPoint = screenToWorld(s.mouseX, s.mouseY);

			dragStartRef.current = { x: worldPoint.x, y: worldPoint.y };

			if (settingsRef.current.tool === "cursor" && selectedShapeIdRef.current) {
				const selectedShape = shapesRef.current.find((shape) => shape.id === selectedShapeIdRef.current) ?? null;
				if (selectedShape) {
					const selectedBounds = getShapeBounds(selectedShape);
					const handleRadius = 7 / viewRef.current.scale;
					
					// Check for rotation handle first (no unrotate needed for rotation handle)
					const rotationHandle = getRotationHandlePoint(selectedShape);
					if (Math.abs(worldPoint.x - rotationHandle.x) <= handleRadius && Math.abs(worldPoint.y - rotationHandle.y) <= handleRadius) {
						// Start rotation session
						rotationSessionRef.current = {
							shapeId: selectedShape.id,
							originalShape: { ...selectedShape },
							startAngle: selectedShape.angle,
						};
						draggedShapeIdRef.current = null;
						return;
					}
					
					// Check for resize handles (need to unrotate point if shape is rotated)
					let unrotatedPoint = worldPoint;
					if (selectedShape.angle !== 0) {
						const center = getRotationCenter(selectedShape);
						unrotatedPoint = unrotatePoint(worldPoint, center, selectedShape.angle);
					}
					
					const unrotatedBounds = getShapeBoundsIgnoreRotation(selectedShape);
					const handle = getHandleAtPoint(unrotatedBounds, unrotatedPoint.x, unrotatedPoint.y, handleRadius);
					
					if (handle) {
						// Resize session
						hoveredHandleRef.current = handle;
						
						// Get the anchor point in unrotated space
						const anchorInUnrotated = getOppositeHandlePoint(unrotatedBounds, handle);
						
						// If shape is rotated, rotate the anchor to world space so it stays fixed
						let anchorInWorld = anchorInUnrotated;
						if (selectedShape.angle !== 0) {
							const center = getRotationCenter(selectedShape);
							anchorInWorld = rotatePoint(anchorInUnrotated, center, selectedShape.angle);
						}
						
						resizeSessionRef.current = {
							shapeId: selectedShape.id,
							handle,
							anchor: anchorInWorld,
							originalBounds: unrotatedBounds,
							originalShape: { ...selectedShape },
						};
						draggedShapeIdRef.current = null;
						return;
					}
				}
			}				// Check if clicking on an existing shape (for drag mode)
				const clickedShape = findShapeAtPoint(worldPoint.x, worldPoint.y);

				if (clickedShape) {
					// Entering drag mode: select and prepare to drag the shape
					selectedShapeIdRef.current = clickedShape.id;
					setSelectedShapeId(clickedShape.id);
					draggedShapeIdRef.current = clickedShape.id;
					hoveredShapeIdRef.current = clickedShape.id;
					hoveredHandleRef.current = null;
					return;
				}

				// Clear selection if clicking on empty space
				selectedShapeIdRef.current = null;
				setSelectedShapeId(null);
				hoveredShapeIdRef.current = null;
				hoveredHandleRef.current = null;
				draggedShapeIdRef.current = null;

				// Cursor tool: only selection, no drawing
				if (settingsRef.current.tool === "cursor") {
					return;
				}

				// Drawing mode
				if (settingsRef.current.tool === "freehand" || settingsRef.current.tool === "eraser") {
					draftShapeRef.current = {
						kind: settingsRef.current.tool,
						id: generateShapeId(),
						points: [{ x: worldPoint.x, y: worldPoint.y }],
						...(settingsRef.current.tool === "freehand" ? { color: normalizeHexColor(settingsRef.current.lineColor, DEFAULT_LINE_COLOR) } : {}),
						strokeWeight: settingsRef.current.strokeWeight,
						angle: 0,
					} as FreeHandShape | EraserShape;
					return;
				}

				draftShapeRef.current = {
					kind: settingsRef.current.tool,
					id: generateShapeId(),
					x1: worldPoint.x,
					y1: worldPoint.y,
					x2: worldPoint.x,
					y2: worldPoint.y,
					color: normalizeHexColor(settingsRef.current.lineColor, DEFAULT_LINE_COLOR),
					filled: settingsRef.current.fill,
					strokeWeight: settingsRef.current.strokeWeight,
					angle: 0,
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
						id: generateShapeId(),
						x: worldPoint.x,
						y: worldPoint.y,
						color: normalizeHexColor(settingsRef.current.lineColor, DEFAULT_LINE_COLOR),
						strokeWeight: settingsRef.current.strokeWeight,
						angle: 0,
					});
					draftShapeRef.current = null;
					dragStartRef.current = null;
				};

			s.mouseDragged = (event: MouseEvent) => {
				if ((event.buttons & 1) === 0) return;
			if (!dragStartRef.current) return;
			const worldPoint = screenToWorld(s.mouseX, s.mouseY);

			if (rotationSessionRef.current) {
				const { shapeId, originalShape } = rotationSessionRef.current;
				const center = getRotationCenter(originalShape);
				
				// Calculate angle between center and drag start point
				const startDx = dragStartRef.current.x - center.x;
				const startDy = dragStartRef.current.y - center.y;
				const startAngle = Math.atan2(startDy, startDx);
				
				// Calculate angle between center and current point
				const currentDx = worldPoint.x - center.x;
				const currentDy = worldPoint.y - center.y;
				const currentAngle = Math.atan2(currentDy, currentDx);
				
				// Calculate the difference
				const angleDelta = currentAngle - startAngle;
				const angleInDegrees = (angleDelta * 180) / Math.PI;
				
				const newAngle = (originalShape.angle + angleInDegrees) % 360;
				
				const shapeIndex = shapesRef.current.findIndex((shape) => shape.id === shapeId);
				if (shapeIndex >= 0) {
					shapesRef.current[shapeIndex] = { ...originalShape, angle: newAngle };
					selectedShapeIdRef.current = shapeId;
					hoveredShapeIdRef.current = shapeId;
					hoveredHandleRef.current = "rotation";
				}
				return;
			}

			if (resizeSessionRef.current) {
				const { shapeId, handle, anchor, originalBounds, originalShape } = resizeSessionRef.current;
				
				// If the shape is rotated, unrotate both the worldPoint and anchor to work in unrotated coordinate space
				let resizePoint = worldPoint;
				let resizeAnchor = anchor;
				if (originalShape.angle !== 0) {
					const center = getRotationCenter(originalShape);
					resizePoint = unrotatePoint(worldPoint, center, originalShape.angle);
					resizeAnchor = unrotatePoint(anchor, center, originalShape.angle);
				}
				
				const resizedBounds = boundsFromAnchorAndPointer(resizeAnchor, resizePoint, handle, originalBounds);
				const shapeIndex = shapesRef.current.findIndex((shape) => shape.id === shapeId);
				if (shapeIndex >= 0) {
					shapesRef.current[shapeIndex] = resizeShapeFromBounds(originalShape, originalBounds, resizedBounds);
					selectedShapeIdRef.current = shapeId;
					hoveredShapeIdRef.current = shapeId;
					hoveredHandleRef.current = handle;
				}
				return;
			}				// If we're dragging a shape, move it
				if (draggedShapeIdRef.current) {
					const shapeIndex = shapesRef.current.findIndex((s) => s.id === draggedShapeIdRef.current);
					if (shapeIndex >= 0) {
						const shape = shapesRef.current[shapeIndex]!;
						const deltaX = worldPoint.x - dragStartRef.current.x;
						const deltaY = worldPoint.y - dragStartRef.current.y;
						shapesRef.current[shapeIndex] = moveShape(shape, deltaX, deltaY);
						hoveredShapeIdRef.current = draggedShapeIdRef.current;
						dragStartRef.current = { x: worldPoint.x, y: worldPoint.y };
					}
					return;
				}

				// Drawing mode
				if (!draftShapeRef.current) return;
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
				if (rotationSessionRef.current) {
					rotationSessionRef.current = null;
					dragStartRef.current = null;
					return;
				}

				if (resizeSessionRef.current) {
					resizeSessionRef.current = null;
					dragStartRef.current = null;
					return;
				}

				// If we were dragging a shape, commit the changes
				if (draggedShapeIdRef.current) {
					draggedShapeIdRef.current = null;
					dragStartRef.current = null;
					// The shape position has already been updated in shapesRef during drag
					return;
				}

				// Drawing mode
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

			s.mouseOut = () => {
				hoveredShapeIdRef.current = null;
				hoveredHandleRef.current = null;
				s.cursor(settingsRef.current.tool === "cursor" ? s.ARROW : s.CROSS);
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
								<option value="cursor">Cursor</option>
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