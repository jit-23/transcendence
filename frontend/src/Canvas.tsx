import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import { useContext } from 'react';
//nando
import { useNavigate, useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import CanvasChatSidebar, { CanvasChatMessage, CanvasMember } from "./components/canvas/CanvasChatSidebar";
import { AuthContext } from "./AuthContext";
import { AppTopbar } from "./components/AppTopbar";
import { emitCanvasEvent, joinCanvasRoom, registerCanvasRealtimeHandlers } from "./utils/canvasRealtime";
//nando



//nando
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


type RemoteCursor = {
	x: number;
	y: number;
	username: string;
	lastSeen: number;
};
//nando


type Tool =
	| "line"
	| "arrow"
	| "rectangle"
	| "rounded-rectangle"
	| "circle"
	| "circle-text"
	| "freehand"
	| "highlighter"
	| "eraser"
	| "text"
	| "textbox"
	| "rounded-textbox"
	| "cursor";

type TextShapeKind = "text" | "textbox" | "rounded-textbox" | "circle-text";
type TextFont = "Arial" | "Georgia" | "Courier New";

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

type ArrowShape = {
	kind: "arrow";
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

type RoundedRectangleShape = {
	kind: "rounded-rectangle";
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

type TextShape = {
	kind: TextShapeKind;
	id: string;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	strokeWeight: number;
	angle: number;
	font: TextFont;
	content: string;
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

type Shape = LineShape | ArrowShape | RectangleShape | RoundedRectangleShape | CircleShape | TextShape | FreeHandShape | DotShape | EraserShape;
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

const generateShapeId = () => {
	const randomPart =
		typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
			? crypto.randomUUID()
			: `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	return `shape-${randomPart}`;
};

const isTextShape = (shape: Shape | null | undefined): shape is TextShape => {
	if (!shape) return false;
	return shape.kind === "text" || shape.kind === "textbox" || shape.kind === "rounded-textbox" || shape.kind === "circle-text";
};

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

		case "arrow": {
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

		case "rounded-rectangle": {
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

		case "text":
		case "textbox":
		case "rounded-textbox":
		case "circle-text": {
			const minX = Math.min(shape.x1, shape.x2);
			const maxX = Math.max(shape.x1, shape.x2);
			const minY = Math.min(shape.y1, shape.y2);
			const maxY = Math.max(shape.y1, shape.y2);
			return testX >= minX && testX <= maxX && testY >= minY && testY <= maxY;
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

const getAngleSnappedEndPoint = (
	start: { x: number; y: number },
	end: { x: number; y: number },
	angleStepDegrees = 45,
) => {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const length = Math.hypot(dx, dy);
	if (length === 0) return end;

	const angle = Math.atan2(dy, dx);
	const step = (angleStepDegrees * Math.PI) / 180;
	const snappedAngle = Math.round(angle / step) * step;

	return {
		x: start.x + Math.cos(snappedAngle) * length,
		y: start.y + Math.sin(snappedAngle) * length,
	};
};

const getEqualSizeEndPoint = (start: { x: number; y: number }, end: { x: number; y: number }) => {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const size = Math.max(Math.abs(dx), Math.abs(dy));
	const signX = dx === 0 ? (dy >= 0 ? 1 : -1) : Math.sign(dx);
	const signY = dy === 0 ? (dx >= 0 ? 1 : -1) : Math.sign(dy);

	return {
		x: start.x + signX * size,
		y: start.y + signY * size,
	};
};

const getConstrainedDraftEndPoint = (
	draftShape: Shape,
	start: { x: number; y: number },
	end: { x: number; y: number },
	isShiftPressed: boolean,
) => {
	if (!isShiftPressed) return end;

	switch (draftShape.kind) {
		case "line":
		case "arrow":
			return getAngleSnappedEndPoint(start, end, 45);
		case "rectangle":
		case "rounded-rectangle":
		case "circle":
		case "text":
		case "textbox":
		case "rounded-textbox":
		case "circle-text":
			return getEqualSizeEndPoint(start, end);
		default:
			return end;
	}
};

const drawArrowSegment = (s: p5, shape: { x1: number; y1: number; x2: number; y2: number; color: string; strokeWeight: number }) => {
	const dx = shape.x2 - shape.x1;
	const dy = shape.y2 - shape.y1;
	const length = Math.hypot(dx, dy);
	if (length <= 0.001) return;

	const unitX = dx / length;
	const unitY = dy / length;
	const headLength = Math.min(length * 0.65, Math.max(10, shape.strokeWeight * 4));
	const headHalfWidth = Math.max(4, shape.strokeWeight * 1.8);
	const bodyEndX = shape.x2 - unitX * headLength;
	const bodyEndY = shape.y2 - unitY * headLength;
	const perpX = -unitY;
	const perpY = unitX;
	const leftX = bodyEndX + perpX * headHalfWidth;
	const leftY = bodyEndY + perpY * headHalfWidth;
	const rightX = bodyEndX - perpX * headHalfWidth;
	const rightY = bodyEndY - perpY * headHalfWidth;

	s.noFill();
	s.stroke(shape.color);
	s.strokeWeight(shape.strokeWeight);
	s.line(shape.x1, shape.y1, bodyEndX, bodyEndY);
	s.noStroke();
	s.fill(shape.color);
	s.triangle(shape.x2, shape.y2, leftX, leftY, rightX, rightY);
};

const wrapTextToWidth = (s: p5, text: string, maxWidth: number) => {
	const width = Math.max(1, maxWidth);
	const lines: string[] = [];
	let currentLine = "";

	for (const character of text) {
		if (character === "\n") {
			lines.push(currentLine);
			currentLine = "";
			continue;
		}

		const candidate = `${currentLine}${character}`;
		if (currentLine.length === 0 || s.textWidth(candidate) <= width) {
			currentLine = candidate;
			continue;
		}

		lines.push(currentLine);
		currentLine = character;
	}

	lines.push(currentLine);

	if (lines.length === 0) {
		lines.push("");
	}

	return lines;
};

const getCornerRadius = (shape: { x1: number; y1: number; x2: number; y2: number; strokeWeight: number }) => {
	const width = Math.abs(shape.x2 - shape.x1);
	const height = Math.abs(shape.y2 - shape.y1);
	const maxRadius = Math.max(2, Math.min(width, height) / 2);
	return Math.min(maxRadius, Math.max(8, shape.strokeWeight * 2.2));
};

const moveShape = (shape: Shape, deltaX: number, deltaY: number): Shape => {
	switch (shape.kind) {
		case "dot":
			return { ...shape, x: shape.x + deltaX, y: shape.y + deltaY };

		case "freehand":
		case "eraser":
			return { ...shape, points: shape.points.map((p) => ({ x: p.x + deltaX, y: p.y + deltaY })) };

		case "line":
		case "arrow":
			return { ...shape, x1: shape.x1 + deltaX, y1: shape.y1 + deltaY, x2: shape.x2 + deltaX, y2: shape.y2 + deltaY };

		case "rectangle":
		case "rounded-rectangle":
		case "circle":
		case "circle-text":
		case "text":
		case "textbox":
		case "rounded-textbox":
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
		case "circle-text": {
			const rawMinX = Math.min(shape.x1, shape.x2);
			const rawMaxX = Math.max(shape.x1, shape.x2);
			const rawMinY = Math.min(shape.y1, shape.y2);
			const rawMaxY = Math.max(shape.y1, shape.y2);
			const rawWidth = Math.max(1, rawMaxX - rawMinX);
			const rawHeight = Math.max(1, rawMaxY - rawMinY);
			const circleSide = Math.min(rawWidth, rawHeight);
			const centerX = (rawMinX + rawMaxX) / 2;
			const centerY = (rawMinY + rawMaxY) / 2;
			return {
				minX: centerX - circleSide / 2,
				minY: centerY - circleSide / 2,
				maxX: centerX + circleSide / 2,
				maxY: centerY + circleSide / 2,
			};
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
		case "text":
		case "textbox":
		case "rounded-textbox": {
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
		case "circle-text": {
			const targetSize = getBoundsSize(targetBounds);
			const squareSize = Math.min(targetSize.width, targetSize.height);
			const centerX = (targetBounds.minX + targetBounds.maxX) / 2;
			const centerY = (targetBounds.minY + targetBounds.maxY) / 2;
			return {
				...shape,
				x1: centerX - squareSize / 2,
				y1: centerY - squareSize / 2,
				x2: centerX + squareSize / 2,
				y2: centerY + squareSize / 2,
			};
		}
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
	const bounds = getShapeBoundsIgnoreRotation(shape);
	const distance = (bounds.maxY - bounds.minY) / 2 + 30;
	const localHandle = {
		x: center.x,
		y: center.y - distance,
	};
	const worldHandle = shape.angle !== 0 ? rotatePoint(localHandle, center, shape.angle) : localHandle;
	return {
		handle: "rotation",
		x: worldHandle.x,
		y: worldHandle.y,
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
const DEFAULT_TEXT_FONT: TextFont = "Arial";
const TEXT_FONT_OPTIONS: TextFont[] = ["Arial", "Georgia", "Courier New"];
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
	pickerId,
	label,
	value,
	onChange,
	defaultValue,
	onOpenChange,
	hideLabel,
}: {
	pickerId: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	defaultValue: string;
	onOpenChange?: (pickerId: string, isOpen: boolean) => void;
	hideLabel?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [draftColor, setDraftColor] = useState(() => normalizeHexColor(value, defaultValue));
	const [trianglePoint, setTrianglePoint] = useState({ x: 0.5, y: 0.34 });
	const [wheelHue, setWheelHue] = useState(0);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const wheelRef = useRef<HTMLDivElement | null>(null);
	const triangleRef = useRef<HTMLDivElement | null>(null);
	const dragModeRef = useRef<"wheel" | "triangle" | null>(null);
	const pendingDragEventRef = useRef<{ mode: "wheel" | "triangle"; clientX: number; clientY: number } | null>(null);
	const dragFrameRef = useRef<number | null>(null);

	const currentColor = normalizeHexColor(value, defaultValue);
	const currentRgb = hexToRgb(currentColor) ?? hexToRgb(defaultValue) ?? { r: 0, g: 0, b: 0 };
	const triangleTopColor = hslToRgb(wheelHue, 1, 0.5);
	const triangleVertices = {
		top: { x: 0.5, y: 0.02 },
		left: { x: 0.04, y: 0.92 },
		right: { x: 0.96, y: 0.92 },
	};

	const mixRgb = (colors: Array<{ color: RgbColor; weight: number }>) => {
		const total = colors.reduce((sum, entry) => sum + entry.weight, 0) || 1;
		return rgbToHex({
			r: colors.reduce((sum, entry) => sum + entry.color.r * entry.weight, 0) / total,
			g: colors.reduce((sum, entry) => sum + entry.color.g * entry.weight, 0) / total,
			b: colors.reduce((sum, entry) => sum + entry.color.b * entry.weight, 0) / total,
		});
	};

	const clampPointToTriangle = (point: { x: number; y: number }) => {
		const a = triangleVertices.top;
		const b = triangleVertices.left;
		const c = triangleVertices.right;
		const denominator = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
		const baryA = ((b.y - c.y) * (point.x - c.x) + (c.x - b.x) * (point.y - c.y)) / denominator;
		const baryB = ((c.y - a.y) * (point.x - c.x) + (a.x - c.x) * (point.y - c.y)) / denominator;
		const baryC = 1 - baryA - baryB;

		if (baryA >= 0 && baryB >= 0 && baryC >= 0) {
			return point;
		}

		const clampEdge = (start: { x: number; y: number }, end: { x: number; y: number }) => {
			const dx = end.x - start.x;
			const dy = end.y - start.y;
			const lengthSquared = dx * dx + dy * dy;
			if (lengthSquared === 0) return start;
			const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
			return { x: start.x + dx * t, y: start.y + dy * t };
		};

		const candidates = [
			{ point: clampEdge(a, b), distance: 0 },
			{ point: clampEdge(b, c), distance: 0 },
			{ point: clampEdge(c, a), distance: 0 },
		];
		for (const candidate of candidates) {
			candidate.distance = Math.hypot(candidate.point.x - point.x, candidate.point.y - point.y);
		}
		return candidates.sort((first, second) => first.distance - second.distance)[0]!.point;
	};

	const trianglePointToColor = (point: { x: number; y: number }, hue = wheelHue) => {
		const a = triangleVertices.top;
		const b = triangleVertices.left;
		const c = triangleVertices.right;
		const topColor = hslToRgb(hue, 1, 0.5);
		const denominator = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
		const baryA = ((b.y - c.y) * (point.x - c.x) + (c.x - b.x) * (point.y - c.y)) / denominator;
		const baryB = ((c.y - a.y) * (point.x - c.x) + (a.x - c.x) * (point.y - c.y)) / denominator;
		const baryC = 1 - baryA - baryB;
		return mixRgb([
			{ color: topColor, weight: baryA },
			{ color: { r: 0, g: 0, b: 0 }, weight: baryB },
			{ color: { r: 255, g: 255, b: 255 }, weight: baryC },
		]);
	};

	useEffect(() => {
		const nextHsl = rgbToHsl(currentRgb);
		if (nextHsl.s > 0.001) {
			setWheelHue(nextHsl.h);
		}
	}, [currentRgb.r, currentRgb.g, currentRgb.b]);

	useEffect(() => {
		onOpenChange?.(pickerId, open);
	}, [open, onOpenChange, pickerId]);

	useEffect(() => {
		return () => {
			onOpenChange?.(pickerId, false);
		};
	}, [onOpenChange, pickerId]);

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

	const updateFromWheel = (clientX: number, clientY: number) => {
		const wheel = wheelRef.current;
		if (!wheel) return;
		const rect = wheel.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const angle = Math.atan2(clientY - centerY, clientX - centerX);
		const hue = ((angle * 180) / Math.PI + 450) % 360;
		setWheelHue((previousHue) => (Math.abs(previousHue - hue) < 0.0001 ? previousHue : hue));
		const nextColor = trianglePointToColor(trianglePoint, hue);
		setDraftColor((previousColor) => (previousColor === nextColor ? previousColor : nextColor));
	};

	const updateFromTriangle = (clientX: number, clientY: number) => {
		const triangle = triangleRef.current;
		if (!triangle) return;
		const rect = triangle.getBoundingClientRect();
		const normalizedPoint = clampPointToTriangle({
			x: (clientX - rect.left) / rect.width,
			y: (clientY - rect.top) / rect.height,
		});
		setTrianglePoint(normalizedPoint);
		const nextColor = trianglePointToColor(normalizedPoint);
		setDraftColor((previousColor) => (previousColor === nextColor ? previousColor : nextColor));
	};

	const flushPendingDragUpdate = () => {
		const pending = pendingDragEventRef.current;
		if (!pending) return;
		if (pending.mode === "wheel") {
			updateFromWheel(pending.clientX, pending.clientY);
		} else {
			updateFromTriangle(pending.clientX, pending.clientY);
		}
	};

	const scheduleDragUpdate = (mode: "wheel" | "triangle", clientX: number, clientY: number) => {
		pendingDragEventRef.current = { mode, clientX, clientY };
		if (dragFrameRef.current !== null) return;
		dragFrameRef.current = requestAnimationFrame(() => {
			dragFrameRef.current = null;
			flushPendingDragUpdate();
		});
	};

	useEffect(() => {
		return () => {
			if (dragFrameRef.current !== null) {
				cancelAnimationFrame(dragFrameRef.current);
				dragFrameRef.current = null;
			}
			pendingDragEventRef.current = null;
		};
	}, []);

	const handleWheelPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		dragModeRef.current = "wheel";
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		updateFromWheel(event.clientX, event.clientY);
	};

	const handleWheelPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (dragModeRef.current !== "wheel") return;
		scheduleDragUpdate("wheel", event.clientX, event.clientY);
	};

	const handleTrianglePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		dragModeRef.current = "triangle";
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		updateFromTriangle(event.clientX, event.clientY);
	};

	const handleTrianglePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (dragModeRef.current !== "triangle") return;
		scheduleDragUpdate("triangle", event.clientX, event.clientY);
	};

	const stopDragging = () => {
		dragModeRef.current = null;
		if (dragFrameRef.current !== null) {
			cancelAnimationFrame(dragFrameRef.current);
			dragFrameRef.current = null;
		}
		flushPendingDragUpdate();
		pendingDragEventRef.current = null;
	};

	return (
		<div className="color-picker">
			{hideLabel ? null : <span className="color-picker__label">{label}</span>}
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
						className="color-picker__wheel-area"
						style={{ position: "relative", width: "260px", height: "260px", margin: "0 auto" }}
					>
						<div
							ref={wheelRef}
							className="color-picker__wheel"
							onPointerDown={handleWheelPointerDown}
							onPointerMove={handleWheelPointerMove}
							onPointerUp={stopDragging}
							onPointerLeave={stopDragging}
							style={{
								position: "absolute",
								inset: 0,
								borderRadius: "50%",
								background: "conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
								boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.22)",
								cursor: "crosshair",
							}}
						/>
						<div
							style={{
								position: "absolute",
								inset: "26px",
								borderRadius: "50%",
								background: "var(--surface2)",
								boxShadow: "inset 0 0 0 1px var(--border)",
							}}
						/>
						<div
							ref={triangleRef}
							className="color-picker__triangle"
							onPointerDown={handleTrianglePointerDown}
							onPointerMove={handleTrianglePointerMove}
							onPointerUp={stopDragging}
							onPointerLeave={stopDragging}
							style={{
								position: "absolute",
								left: "50%",
								top: "calc(50% - 20px)",
								width: "170px",
								height: "170px",
								transform: "translate(-50%, -50%)",
								clipPath: "polygon(50% 2%, 4% 92%, 96% 92%)",
								background: `
									linear-gradient(to top right, rgba(0,0,0,1), rgba(0,0,0,0)),
									linear-gradient(to top left, rgba(255,255,255,1), rgba(255,255,255,0)),
									rgb(${triangleTopColor.r}, ${triangleTopColor.g}, ${triangleTopColor.b})
								`,
								boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.28)",
								cursor: "crosshair",
							}}
						>
							<div
								className="color-picker__cursor"
								style={{
									left: `${trianglePoint.x * 100}%`,
									top: `${trianglePoint.y * 100}%`,
									background: currentColor,
								}}
							/>
						</div>
						<div
							className="color-picker__cursor"
							style={{
								left: `${50 + Math.cos((wheelHue - 90) * (Math.PI / 180)) * 41}%`,
								top: `${50 + Math.sin((wheelHue - 90) * (Math.PI / 180)) * 41}%`,
								background: currentColor,
							}}
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
			) : null}
		</div>
	);
}

export default function Canvas() {


	//nando
	const { user } = useContext(AuthContext);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const canvasIdParam = searchParams.get("id");
	const canvasId = canvasIdParam ? Number(canvasIdParam) : null;
	const [saveStatus, setSaveStatus] = useState("");
		const [canvasEntryBlocked, setCanvasEntryBlocked] = useState(false);
	const [saving, setSaving] = useState(false);
	const [canvasName, setCanvasName] = useState("");
	const [members, setMembers] = useState<CanvasMember[]>([]);
	const [conversationId, setConversationId] = useState<number | null>(null);
	const [chatInput, setChatInput] = useState("");
	const [chatMessages, setChatMessages] = useState<CanvasChatMessage[]>([]);
	const [chatStatus, setChatStatus] = useState<string | null>(null);
	const [peerTyping, setPeerTyping] = useState<string | null>(null);
	const [sendingMessage, setSendingMessage] = useState(false);
	const [chatSidebarHeight, setChatSidebarHeight] = useState<number | undefined>(undefined);
	const [activeMemberIds, setActiveMemberIds] = useState<number[]>([]);
	const conversationIdRef = useRef<number | null>(null);
	const userIdRef = useRef<number | null>(user?.id ?? null);
	const remoteDraftsRef = useRef<Map<number, Shape>>(new Map());
	const remoteCursorsRef = useRef<Map<number, RemoteCursor>>(new Map());
	const lastDraftEmitAtRef = useRef(0);
	const lastCursorEmitAtRef = useRef(0);
	const dotRef = useRef(true);
	const dirtyRef = useRef(false);
	const hydratingRef = useRef(false);
	const chatSocketRef = useRef<Socket | null>(null);
	const chatTypingTimeoutRef = useRef<number | null>(null);
		const canvasEntryBlockedRef = useRef(false);
	//nando


	const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND_COLOR);
	const [lineColor, setLineColor] = useState(DEFAULT_LINE_COLOR);
	const [tool, setTool] = useState<Tool>("cursor");
	const [fill, setFill] = useState(false);
	const [strokeWeight, setStrokeWeight] = useState(4);
	const [textFont, setTextFont] = useState<TextFont>(DEFAULT_TEXT_FONT);
	const [zoomPercent, setZoomPercent] = useState(100);
	const [openColorPickers, setOpenColorPickers] = useState<Record<string, boolean>>({});
	const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
	const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
	const selectedShapeIdRef = useRef<string | null>(null);
	const selectedShapeIdsRef = useRef<Set<string>>(new Set());
	const hoveredShapeIdRef = useRef<string | null>(null);
	const hoveredHandleRef = useRef<AnyHandle | null>(null);
    const resizeSessionRef = useRef<{
		shapeId: string;
		handle: ResizeHandle;
		anchor: { x: number; y: number };
		fixedWorldAnchor: { x: number; y: number };
		originalBounds: Bounds;
		originalShape: Shape;
	} | null>(null);
	
	const rotationSessionRef = useRef<{
		shapeId: string;
		originalShape: Shape;
		startAngle: number;
	} | null>(null);

	const editingTextShapeIdRef = useRef<string | null>(null);
	const textEditSnapshotTakenRef = useRef(false);
	const textCaretIndexRef = useRef(0);
	const textSelectionRangeRef = useRef<{ start: number; end: number } | null>(null);

  const controlsRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
	const p5Ref = useRef<p5 | null>(null);

	const settingsRef = useRef({
		backgroundColor: DEFAULT_BACKGROUND_COLOR,
		lineColor: DEFAULT_LINE_COLOR,
		tool: "cursor" as Tool,
		fill: false,
		strokeWeight: 4,
		textFont: DEFAULT_TEXT_FONT,
	});


	const shapesRef = useRef<Shape[]>([]);
	const redoShapesRef = useRef<Shape[][]>([]);
	const undoStatesRef = useRef<Shape[][]>([]);
	const draftShapeRef = useRef<Shape | null>(null);
	const dragStartRef = useRef<{ x: number; y: number } | null>(null);
	const draggedShapeIdRef = useRef<string | null>(null);
	const eraserMarkedShapeIdsRef = useRef<Set<string>>(new Set());
	const eraserTouchLatchRef = useRef<Set<string>>(new Set());
	const eraserLastPointRef = useRef<{ x: number; y: number } | null>(null);
	const marqueeSelectionStartRef = useRef<{ x: number; y: number } | null>(null);
	const marqueeSelectionCurrentRef = useRef<{ x: number; y: number } | null>(null);
	const marqueeSelectionAdditiveRef = useRef(false);
	const marqueeSelectionInitialIdsRef = useRef<string[]>([]);
	const viewRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
	const initializedSketchRef = useRef(false);
	const autosaveTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
	const savingRef = useRef(false);
	const dirtyVersionRef = useRef(0);
	const isAnyColorPickerOpen = Object.values(openColorPickers).some(Boolean);

	//nando
	const authHeader = () => ({
		Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		"Content-Type": "application/json",
	});

	const clearAutosaveTimer = () => {
		if (autosaveTimeoutRef.current !== null) {
			window.clearTimeout(autosaveTimeoutRef.current);
			autosaveTimeoutRef.current = null;
		}
	};

	const scheduleAutosave = () => {
		if (!canvasId || !Number.isInteger(canvasId) || canvasId <= 0) return;
		clearAutosaveTimer();
		autosaveTimeoutRef.current = window.setTimeout(() => {
			autosaveTimeoutRef.current = null;
			if (!dirtyRef.current || hydratingRef.current || savingRef.current) return;
			void saveCanvas(true);
		}, 500); // tempo para autosave pos modificação
	};

	
	const markDirty = () => {
		if (hydratingRef.current) return;
		dirtyRef.current = true;
		dirtyVersionRef.current += 1;
		scheduleAutosave();
	};

	const colorFromUserId = (userId: number) => {
		const hue = (userId * 47) % 360;
		return `hsl(${hue}, 78%, 46%)`;
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
		clearAutosaveTimer();

		setBackgroundColor(snapshot.backgroundColor ?? "#ffffff");
		setLineColor(snapshot.lineColor ?? "#111111");
		setTool(snapshot.tool ?? "freehand");
		setFill(Boolean(snapshot.fill));
		setStrokeWeight(typeof snapshot.strokeWeight === "number" ? Math.min(30, Math.max(1, snapshot.strokeWeight)) : 4);
		setZoomPercent(typeof snapshot.zoomPercent === "number" ? Math.min(500, Math.max(20, snapshot.zoomPercent)) : 100);

		viewRef.current = snapshot.view ?? { scale: 1, offsetX: 0, offsetY: 0 };
		shapesRef.current = Array.isArray(snapshot.shapes) ? snapshot.shapes : [];
		redoShapesRef.current = [];
		dirtyVersionRef.current = 0;
		draftShapeRef.current = null;
		dragStartRef.current = null;
		dotRef.current = true;

		dirtyRef.current = false;
		hydratingRef.current = false;
	};

	const saveCanvas = async (isAutosave = false) => {
		if (!canvasId || !Number.isInteger(canvasId) || canvasId <= 0) {
			setSaveStatus("No canvas id found in URL");
			return;
		}

		if (savingRef.current) return;

		const dirtyVersionAtStart = dirtyVersionRef.current;
		savingRef.current = true;

		setSaving(true);
		setSaveStatus(isAutosave ? "" : "Saving...");

		try {
			const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
			const res = await fetch(`${apiUrl}/canvases/${canvasId}/content`, {
				method: "PUT",
				headers: authHeader(),
				body: JSON.stringify({ content: JSON.stringify(buildSnapshot()) }),
			});
			const data = await res.json();

			if (!res.ok) {
				setSaveStatus(data.error || "Failed to save canvas");
				return;
			}

			if (dirtyVersionRef.current === dirtyVersionAtStart) {
				dirtyRef.current = false;
			}
			setSaveStatus(isAutosave ? "" : "");
		} catch {
			setSaveStatus("Network error while saving");
		} finally {
			savingRef.current = false;
			setSaving(false);
			if (dirtyRef.current) {
				scheduleAutosave();
			}
		}
	};
	//nando



	const applySelection = (nextSelectedIds: string[]) => {
		const uniqueIds = Array.from(new Set(nextSelectedIds));
		selectedShapeIdsRef.current = new Set(uniqueIds);
		setSelectedShapeIds(uniqueIds);
		const singleSelectedId = uniqueIds.length === 1 ? uniqueIds[0]! : null;
		selectedShapeIdRef.current = singleSelectedId;
		setSelectedShapeId(singleSelectedId);
	};

	const getShapeIdsInSelectionRect = (start: { x: number; y: number }, end: { x: number; y: number }) => {
		const minX = Math.min(start.x, end.x);
		const maxX = Math.max(start.x, end.x);
		const minY = Math.min(start.y, end.y);
		const maxY = Math.max(start.y, end.y);

		return shapesRef.current
			.filter((shape) => {
				const bounds = getShapeBounds(shape);
				return bounds.maxX >= minX && bounds.minX <= maxX && bounds.maxY >= minY && bounds.minY <= maxY;
			})
			.map((shape) => shape.id);
	};


	const clearCanvas = () => {
		shapesRef.current = [];
		redoShapesRef.current = [];
		undoStatesRef.current = [];
		draftShapeRef.current = null;
		dragStartRef.current = null;
		draggedShapeIdRef.current = null;
		hoveredShapeIdRef.current = null;
		hoveredHandleRef.current = null;
		resizeSessionRef.current = null;
		rotationSessionRef.current = null;
		editingTextShapeIdRef.current = null;
		textEditSnapshotTakenRef.current = false;
		textCaretIndexRef.current = 0;
		textSelectionRangeRef.current = null;
		applySelection([]);
		eraserMarkedShapeIdsRef.current.clear();
		eraserTouchLatchRef.current.clear();
		eraserLastPointRef.current = null;
		//nando
		dotRef.current = true;
		markDirty();

		//nando
		
	};

	const getShapeById = (shapeId: string | null) => {
		if (!shapeId) return null;
		return shapesRef.current.find((shape) => shape.id === shapeId) ?? null;
	};

	const startTextEditing = (shapeId: string, caretIndex?: number, selectAll?: boolean) => {
		const shape = getShapeById(shapeId);
		const maxCaret = isTextShape(shape) ? shape.content.length : 0;
		editingTextShapeIdRef.current = shapeId;
		const nextCaretIndex = Math.max(0, Math.min(caretIndex ?? maxCaret, maxCaret));
		textCaretIndexRef.current = nextCaretIndex;
		textSelectionRangeRef.current = selectAll ? { start: 0, end: maxCaret } : null;
		textEditSnapshotTakenRef.current = false;
	};

	const stopTextEditing = () => {
		editingTextShapeIdRef.current = null;
		textCaretIndexRef.current = 0;
		textSelectionRangeRef.current = null;
		textEditSnapshotTakenRef.current = false;
	};

	const updateTextShapeContent = (shapeId: string, nextContent: string) => {
		const shapeIndex = shapesRef.current.findIndex((shape) => shape.id === shapeId);
		if (shapeIndex < 0) return;
		const shape = shapesRef.current[shapeIndex];
		if (!isTextShape(shape)) return;
		if (shape.content === nextContent) return;

		if (!textEditSnapshotTakenRef.current) {
			pushUndoSnapshot();
			textEditSnapshotTakenRef.current = true;
		}

		const updatedShape = {
			...shape,
			content: nextContent,
		};
		shapesRef.current[shapeIndex] = updatedShape;
		
		// Broadcast text edits to other clients
		emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-shape-commit", { shape: updatedShape });
	};

	const cloneShape = (shape: Shape): Shape => {
		switch (shape.kind) {
			case "freehand":
				return { ...shape, points: shape.points.map((point) => ({ x: point.x, y: point.y })) };
			case "eraser":
				return { ...shape, points: shape.points.map((point) => ({ x: point.x, y: point.y })) };
			default:
				return { ...shape };
		}
	};

	const cloneShapesState = (shapes: Shape[]) => shapes.map((shape) => cloneShape(shape));

	const syncSelectionAfterStateChange = () => {
		const existingShapeIds = new Set(shapesRef.current.map((shape) => shape.id));
		const currentSelectedIds = Array.from(selectedShapeIdsRef.current);
		const nextSelectedIds = currentSelectedIds.filter((shapeId) => existingShapeIds.has(shapeId));
		if (nextSelectedIds.length !== currentSelectedIds.length) {
			applySelection(nextSelectedIds);
		}

		if (selectedShapeIdRef.current && !existingShapeIds.has(selectedShapeIdRef.current)) {
			hoveredShapeIdRef.current = null;
			hoveredHandleRef.current = null;
		}

		if (editingTextShapeIdRef.current && !existingShapeIds.has(editingTextShapeIdRef.current)) {
			stopTextEditing();
		}
	};

	const pushUndoSnapshot = () => {
		undoStatesRef.current.push(cloneShapesState(shapesRef.current));
		if (undoStatesRef.current.length > HISTORY_LIMIT) {
			undoStatesRef.current.shift();
		}
		redoShapesRef.current = [];
	};

	const commitShape = (shape: Shape) => {
		pushUndoSnapshot();
		shapesRef.current.push(shape);
		//nando
		redoShapesRef.current = [];
		markDirty();
		//nando
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

	const handleColorPickerOpenChange = (pickerId: string, isOpen: boolean) => {
		setOpenColorPickers((previous) => {
			if (isOpen) {
				if (previous[pickerId]) return previous;
				return { ...previous, [pickerId]: true };
			}

			if (!(pickerId in previous)) return previous;
			const next = { ...previous };
			delete next[pickerId];
			return next;
		});
	};

	//nando
	const clearCanvasAndBroadcast = () => {
		if (canvasEntryBlockedRef.current) return;
		clearCanvas();
		emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-clear");
	};

	const commitShapeAndBroadcast = (shape: Shape) => {
		commitShape(shape);
		emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-shape-commit", { shape });
		emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-draft", { shape: null });
	};

	const emitDraftShape = (shape: Shape | null) => {

		emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-draft", { shape });
	};

	const emitCursor = (x?: number, y?: number, visible = true) => {
		emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-cursor", {
			x,
			y,
			visible,
		});
	};

	const emitCursorFromPointer = (x: number, y: number, visible = true) => {
		const now = Date.now();
		if (visible && now - lastCursorEmitAtRef.current < 16) return;
		lastCursorEmitAtRef.current = now;
		emitCursor(x, y, visible);
	};

	const applyHistoryState = (nextState: Shape[]) => {
		shapesRef.current = cloneShapesState(nextState);
		syncSelectionAfterStateChange();
		stopTextEditing();
		draftShapeRef.current = null;
		dragStartRef.current = null;
		resizeSessionRef.current = null;
		rotationSessionRef.current = null;
		markDirty();
	};

	const undoCanvas = (broadcast: boolean) => {
		const previousState = undoStatesRef.current.pop();
		if (!previousState) return;
		redoShapesRef.current.push(cloneShapesState(shapesRef.current));
		if (redoShapesRef.current.length > HISTORY_LIMIT) {
			redoShapesRef.current.shift();
		}
		applyHistoryState(previousState);
		if (broadcast) emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-undo");
	};

	const redoCanvas = (broadcast: boolean) => {
		const nextState = redoShapesRef.current.pop();
		if (!nextState) return;
		undoStatesRef.current.push(cloneShapesState(shapesRef.current));
		if (undoStatesRef.current.length > HISTORY_LIMIT) {
			undoStatesRef.current.shift();
		}
		applyHistoryState(nextState);
		if (broadcast) emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-redo");
	};
	//nando


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
		color: "var(--ink2)",
		fontWeight: 600,
	};
	const controlFieldStyle = {
		display: "flex",
		justifyContent: "center" as const,
		alignItems: "center" as const,
		width: "100%",
		height: "100%",
	};
	const clearButtonStyle = {
		width: "92px",
		height: "34px",
		border: "2px solid #380909",
		borderRadius: "6px",
		background: "#fff5f5",
		color: "#000000",
		fontWeight: 700,
		cursor: "pointer",
	};
	const fillToggleStyle = {
		width: "16px",
		height: "16px",
		margin: 0,
		cursor: "pointer",
		accentColor: "#64748b",
	}
	const toolbarActionButtonStyle = {
		height: "34px",
		padding: "0 14px",
		borderRadius: "8px",
		border: "1px solid var(--border)",
		background: "var(--surface2)",
		color: "var(--ink)",
		fontWeight: 600,
		cursor: "pointer",
		whiteSpace: "nowrap" as const,
	};
	const toolbarCheckboxStyle = {
		width: "16px",
		height: "16px",
		padding: 0,
		margin: 0,
		borderRadius: "4px",
		accentColor: "var(--ink)",
		cursor: "pointer",
		flexShrink: 0,
	};

	useEffect(() => {
		selectedShapeIdRef.current = selectedShapeId;
	}, [selectedShapeId]);

	useEffect(() => {
		canvasEntryBlockedRef.current = canvasEntryBlocked;
	}, [canvasEntryBlocked]);

	useEffect(() => {
		conversationIdRef.current = conversationId;
	}, [conversationId]);

	useEffect(() => {
		userIdRef.current = user?.id ?? null;
	}, [user?.id]);

	useEffect(() => {
		settingsRef.current = {
			backgroundColor: normalizeHexColor(backgroundColor, DEFAULT_BACKGROUND_COLOR),
			lineColor: normalizeHexColor(lineColor, DEFAULT_LINE_COLOR),
			tool,
			fill,
			strokeWeight,
			textFont,
			isAnyColorPickerOpen,
		};
	}, [backgroundColor, lineColor, tool, fill, strokeWeight, textFont, isAnyColorPickerOpen]);

	useEffect(() => {
		const targetShapeId = editingTextShapeIdRef.current ?? selectedShapeIdRef.current;
		if (!targetShapeId) return;
		const shapeIndex = shapesRef.current.findIndex((shape) => shape.id === targetShapeId);
		if (shapeIndex < 0) return;
		const shape = shapesRef.current[shapeIndex];
		if (!isTextShape(shape)) return;
		if (shape.font === textFont) return;

		pushUndoSnapshot();
		shapesRef.current[shapeIndex] = {
			...shape,
			font: textFont,
		};
	}, [textFont]);

	useEffect(() => {
		if (!isAnyColorPickerOpen) return;
		draftShapeRef.current = null;
		dragStartRef.current = null;
		marqueeSelectionStartRef.current = null;
		marqueeSelectionCurrentRef.current = null;
		marqueeSelectionAdditiveRef.current = false;
		marqueeSelectionInitialIdsRef.current = [];
		draggedShapeIdRef.current = null;
		resizeSessionRef.current = null;
		rotationSessionRef.current = null;
		hoveredShapeIdRef.current = null;
		hoveredHandleRef.current = null;
		stopTextEditing();
		eraserTouchLatchRef.current = new Set();
		eraserLastPointRef.current = null;
	}, [isAnyColorPickerOpen]);

	useEffect(() => {
		const host = canvasHostRef.current;
		if (!host) return;

		const updateHeight = () => {
			const nextHeight = host.clientHeight;
			setChatSidebarHeight(nextHeight > 0 ? nextHeight : undefined);
		};

		updateHeight();

		if (typeof ResizeObserver === "undefined") {
			window.addEventListener("resize", updateHeight);
			return () => {
				window.removeEventListener("resize", updateHeight);
			};
		}

		const observer = new ResizeObserver(() => updateHeight());
		observer.observe(host);

		return () => {
			observer.disconnect();
		};
	}, []);



	//nando
		useEffect(() => {
		if (!canvasId || !Number.isInteger(canvasId) || canvasId <= 0) return;
		setActiveMemberIds([]);

		let cancelled = false;

		const loadCanvas = async () => {
			setSaveStatus("Loading...");
			try {
				const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
				const res = await fetch(`${apiUrl}/canvases/${canvasId}`, {
					headers: authHeader(),
				});
				const data = await res.json();
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

				if (!cancelled) setSaveStatus("");
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
				const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
				const res = await fetch(`${apiUrl}/conversations/${conversationId}/messages`, {
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
						self: message.sender?.id === user?.id,
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
	}, [conversationId, user?.id]);

	useEffect(() => {
		if (!user?.name) return;
		setCanvasEntryBlocked(false);

		const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
		const socket = io(apiUrl, {
			auth: { username: user.name },
			withCredentials: true,
		});

		chatSocketRef.current = socket;
		const detachCanvasHandlers = registerCanvasRealtimeHandlers<Shape>(socket, canvasId, {
			onShapeCommit: (shape) => {
				// Check if shape with this ID already exists (update instead of adding)
				const existingIndex = shapesRef.current.findIndex((s) => s.id === shape.id);
				if (existingIndex >= 0) {
					const previousShape = shapesRef.current[existingIndex];
					const didChange = JSON.stringify(previousShape) !== JSON.stringify(shape);
					if (!didChange) return;
					pushUndoSnapshot();
					shapesRef.current[existingIndex] = shape;
					markDirty();
				} else {
					commitShape(shape);
				}
			},
			onShapeDelete: (shapeIds) => {
				const idsToDelete = new Set(shapeIds);
				const hasAnyMatch = shapesRef.current.some((shape) => idsToDelete.has(shape.id));
				if (!hasAnyMatch) return;
				pushUndoSnapshot();
				shapesRef.current = shapesRef.current.filter((shape) => !idsToDelete.has(shape.id));
				syncSelectionAfterStateChange();
				markDirty();
			},
			onClear: () => clearCanvas(),
			onUndo: () => undoCanvas(false),
			onRedo: () => redoCanvas(false),
			onBackground: (color) => {
				setBackgroundColor(color);
				markDirty();
			},
			onPresence: (users) => {
				setActiveMemberIds(users.map((member) => member.userId));
				const activeSet = new Set(users.map((member) => member.userId));
				for (const userId of remoteDraftsRef.current.keys()) {
					if (!activeSet.has(userId)) remoteDraftsRef.current.delete(userId);
				}
				for (const userId of remoteCursorsRef.current.keys()) {
					if (!activeSet.has(userId)) remoteCursorsRef.current.delete(userId);
				}
			},
			onDraft: (userId, shape) => {
				if (!shape) {
					remoteDraftsRef.current.delete(userId);
					return;
				}
				remoteDraftsRef.current.set(userId, shape);
			},
			onCursor: ({ userId, username, x, y, visible }) => {
				if (!visible) {
					remoteCursorsRef.current.delete(userId);
					return;
				}
				remoteCursorsRef.current.set(userId, {
					x,
					y,
					username,
					lastSeen: Date.now(),
				});
			},
		});

		socket.on("conversation-message", ({ conversationId: incomingConversationId, message }) => {
			const activeConversationId = conversationIdRef.current;
			if (!activeConversationId || Number(incomingConversationId) !== activeConversationId) return;
			const currentUserId = userIdRef.current;
			setChatMessages((prev) => [
				...prev,
				{
					from: message.sender?.name ?? "Unknown",
					text: message.content,
					self: message.sender?.id === currentUserId,
				},
			]);
		});

		socket.on("conversation-typing", ({ conversationId: incomingConversationId, from, isTyping }) => {
			const activeConversationId = conversationIdRef.current;
			if (!activeConversationId || Number(incomingConversationId) !== activeConversationId) return;
			setPeerTyping(isTyping ? from : null);
		});

		socket.on("canvas-entry-blocked", ({ canvasId: blockedCanvasId }) => {
			if (!canvasId || Number(blockedCanvasId) !== canvasId) return;
			setCanvasEntryBlocked(true);
			setSaveStatus("This canvas is already open in another window with this account.");
		});

		socket.on("canvas-joined", ({ canvasId: joinedCanvasId }) => {
			if (!canvasId || Number(joinedCanvasId) !== canvasId) return;
			setCanvasEntryBlocked(false);
			setSaveStatus("");
		});

		socket.on("connect", () => {
			setChatStatus(null);
			setCanvasEntryBlocked(false);
			if (canvasEntryBlockedRef.current) return;
			joinCanvasRoom(socket, canvasId);
		});
		socket.on("disconnect", () => {
			setChatStatus("Chat disconnected");
			setActiveMemberIds([]);
			remoteDraftsRef.current.clear();
			remoteCursorsRef.current.clear();
		});

		return () => {
			detachCanvasHandlers();
			if (chatTypingTimeoutRef.current) {
				window.clearTimeout(chatTypingTimeoutRef.current);
				chatTypingTimeoutRef.current = null;
			}
			socket.disconnect();
			chatSocketRef.current = null;
			setActiveMemberIds([]);
			remoteDraftsRef.current.clear();
			remoteCursorsRef.current.clear();
		};
	}, [canvasId, user?.id, user?.name]);

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
		return () => {
			clearAutosaveTimer();
		};
	}, [canvasIdParam]);
	//nando




	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (canvasEntryBlockedRef.current) return;
			if (settingsRef.current.isAnyColorPickerOpen) return;
			if (isEditableElement(event.target)) return;

			const editingShapeId = editingTextShapeIdRef.current;
			if (editingShapeId) {
				const editingShape = getShapeById(editingShapeId);
				if (!isTextShape(editingShape)) {
					stopTextEditing();
					return;
				}

				const content = editingShape.content;
				const contentLength = content.length;
				const caretIndex = Math.max(0, Math.min(textCaretIndexRef.current, contentLength));
				textCaretIndexRef.current = caretIndex;
				const selection = textSelectionRangeRef.current;
				const normalizedSelection = selection
					? {
						start: Math.max(0, Math.min(selection.start, selection.end, contentLength)),
						end: Math.max(0, Math.min(Math.max(selection.start, selection.end), contentLength)),
					}
					: null;
				const hasSelection = !!normalizedSelection && normalizedSelection.end > normalizedSelection.start;

				const replaceSelectionOrInsert = (insertValue: string) => {
					const start = hasSelection ? normalizedSelection!.start : caretIndex;
					const end = hasSelection ? normalizedSelection!.end : caretIndex;
					updateTextShapeContent(editingShapeId, `${content.slice(0, start)}${insertValue}${content.slice(end)}`);
					textCaretIndexRef.current = start + insertValue.length;
					textSelectionRangeRef.current = null;
				};

				if (event.key === "Escape") {
					event.preventDefault();
					stopTextEditing();
					return;
				}

				if (event.altKey) {
					return;
				}

				if (event.key === "ArrowLeft") {
					event.preventDefault();
					textCaretIndexRef.current = hasSelection ? normalizedSelection!.start : Math.max(0, caretIndex - 1);
					textSelectionRangeRef.current = null;
					return;
				}

				if (event.key === "ArrowRight") {
					event.preventDefault();
					textCaretIndexRef.current = hasSelection ? normalizedSelection!.end : Math.min(contentLength, caretIndex + 1);
					textSelectionRangeRef.current = null;
					return;
				}

				if (event.key === "Home") {
					event.preventDefault();
					textCaretIndexRef.current = 0;
					textSelectionRangeRef.current = null;
					return;
				}

				if (event.key === "End") {
					event.preventDefault();
					textCaretIndexRef.current = contentLength;
					textSelectionRangeRef.current = null;
					return;
				}

				if (event.ctrlKey || event.metaKey) {
					if (event.key.toLowerCase() === "a") {
						event.preventDefault();
						textSelectionRangeRef.current = { start: 0, end: contentLength };
						textCaretIndexRef.current = contentLength;
					}
					return;
				}

				if (event.key === "Backspace") {
					event.preventDefault();
					if (hasSelection) {
						replaceSelectionOrInsert("");
						return;
					}
					if (caretIndex === 0) return;
					updateTextShapeContent(editingShapeId, `${content.slice(0, caretIndex - 1)}${content.slice(caretIndex)}`);
					textCaretIndexRef.current = caretIndex - 1;
					textSelectionRangeRef.current = null;
					return;
				}

				if (event.key === "Delete") {
					event.preventDefault();
					if (hasSelection) {
						replaceSelectionOrInsert("");
						return;
					}
					if (caretIndex >= contentLength) return;
					updateTextShapeContent(editingShapeId, `${content.slice(0, caretIndex)}${content.slice(caretIndex + 1)}`);
					textSelectionRangeRef.current = null;
					return;
				}

				if (event.key === "Enter") {
					event.preventDefault();
					replaceSelectionOrInsert("\n");
					return;
				}

				if (event.key === "Tab") {
					event.preventDefault();
					replaceSelectionOrInsert("\t");
					return;
				}

				if (event.key.length === 1) {
					event.preventDefault();
					replaceSelectionOrInsert(event.key);
				}
				return;
			}

			const key = event.key.toLowerCase();
			if (key === "delete" || key === "backspace") {
				if (selectedShapeIdsRef.current.size === 0) return;
				event.preventDefault();
				pushUndoSnapshot();
				const selectedIds = new Set(selectedShapeIdsRef.current);
				shapesRef.current = shapesRef.current.filter((shape) => !selectedIds.has(shape.id));
				applySelection([]);
				hoveredShapeIdRef.current = null;
				hoveredHandleRef.current = null;
				markDirty();
				return;
			}

			if (!(event.ctrlKey || event.metaKey)) return;

			const shouldUndo = key === "z" && !event.shiftKey;
			const shouldRedo = key === "y" || (key === "z" && event.shiftKey);
			if (!shouldUndo && !shouldRedo) return;

			event.preventDefault();

			if (shouldUndo) {
				undoCanvas(true);
				return;
			}

			redoCanvas(true);
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
		let removeDoubleClickListener: (() => void) | null = null;
		const createP5Instance = () => {
			const motionEventTypes = new Set(["deviceorientation", "devicemotion"]);
			const originalAddEventListener = window.addEventListener;
			window.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
				if (motionEventTypes.has(type)) {
					return undefined;
				}
				return originalAddEventListener.call(window, type, listener, options);
			}) as typeof window.addEventListener;

			try {
				return new p5(sketch);
			} finally {
				window.addEventListener = originalAddEventListener;
			}
		};

    const sketch = (s: p5) => {
			const resizeToViewport = () => {
				const controlsHeight = controlsRef.current?.offsetHeight ?? 56;
				const nextHeight = Math.max(s.windowHeight - controlsHeight - 24, 200);
				const nextWidth = Math.max(canvasHostRef.current?.clientWidth ?? s.windowWidth, 320); //nando
				s.resizeCanvas(nextWidth, nextHeight);
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

			const getTextBoxLayout = (shape: TextShape) => {
				const rawMinX = Math.min(shape.x1, shape.x2);
				const rawMaxX = Math.max(shape.x1, shape.x2);
				const rawMinY = Math.min(shape.y1, shape.y2);
				const rawMaxY = Math.max(shape.y1, shape.y2);
				const rawWidth = Math.max(1, rawMaxX - rawMinX);
				const rawHeight = Math.max(1, rawMaxY - rawMinY);
				const isCircleText = shape.kind === "circle-text";
				const boxSide = isCircleText ? Math.min(rawWidth, rawHeight) : rawWidth;
				const boxWidth = isCircleText ? Math.max(1, boxSide) : rawWidth;
				const boxHeight = isCircleText ? Math.max(1, boxSide) : rawHeight;
				const centerX = (rawMinX + rawMaxX) / 2;
				const centerY = (rawMinY + rawMaxY) / 2;
				const minX = isCircleText ? centerX - boxWidth / 2 : rawMinX;
				const maxX = isCircleText ? centerX + boxWidth / 2 : rawMaxX;
				const minY = isCircleText ? centerY - boxHeight / 2 : rawMinY;
				const maxY = isCircleText ? centerY + boxHeight / 2 : rawMaxY;
				const padding = Math.max(4, Math.min(12, Math.min(boxWidth, boxHeight) * 0.08));
				const textSize = Math.max(12, Math.min(shape.strokeWeight * 4, Math.min(boxWidth, boxHeight) * 0.28));
				const lineHeight = textSize * 1.2;
				return {
					minX,
					maxX,
					minY,
					maxY,
					boxWidth,
					boxHeight,
					centerX,
					centerY,
					padding,
					textSize,
					lineHeight,
					isCircleText,
				};
			};

			const getTextCaretPosition = (shape: TextShape, index: number) => {
				const layout = getTextBoxLayout(shape);
				const clampedIndex = Math.max(0, Math.min(index, shape.content.length));
				s.push();
				s.textFont(shape.font || DEFAULT_TEXT_FONT);
				s.textSize(layout.textSize);
				const contentBeforeCaret = shape.content.slice(0, clampedIndex);
				const lines = wrapTextToWidth(s, contentBeforeCaret, Math.max(1, layout.boxWidth - layout.padding * 2));
				const lineIndex = Math.max(0, lines.length - 1);
				const lineText = lines[lineIndex] ?? "";
				const lineWidth = s.textWidth(lineText);
				const x = layout.isCircleText ? layout.centerX - (layout.boxWidth - layout.padding * 2) / 2 + layout.padding + lineWidth : layout.minX + layout.padding + lineWidth;
				s.pop();

				return {
					x: layout.isCircleText
						? x
						: Math.min(layout.maxX - layout.padding, Math.max(layout.minX + layout.padding, x)),
					y: layout.isCircleText
						? layout.centerY - (lines.length * layout.lineHeight) / 2 + lineIndex * layout.lineHeight
						: layout.minY + layout.padding + lineIndex * layout.lineHeight,
					textSize: layout.textSize,
				};
			};

			const getClosestTextCaretIndex = (shape: TextShape, point: { x: number; y: number }) => {
				let bestIndex = 0;
				let bestDistance = Number.POSITIVE_INFINITY;
				for (let index = 0; index <= shape.content.length; index += 1) {
					const caretPosition = getTextCaretPosition(shape, index);
					const dx = point.x - caretPosition.x;
					const dy = point.y - (caretPosition.y + caretPosition.textSize / 2);
					const distance = dx * dx + dy * dy;
					if (distance < bestDistance) {
						bestDistance = distance;
						bestIndex = index;
					}
				}
				return bestIndex;
			};

			const getTouchedShapeIdsAtPoint = (x: number, y: number, eraserTolerance: number) => {
				const touched = new Set<string>();
				for (let index = shapesRef.current.length - 1; index >= 0; index -= 1) {
					const shape = shapesRef.current[index];
					if (!shape) continue;
					if (isPointInShape(x, y, shape, eraserTolerance)) {
						touched.add(shape.id);
					}
				}
				return touched;
			};

			const getTouchedShapeIdsFromEraserPath = (points: Array<{ x: number; y: number }>, strokeWeight: number) => {
				const touched = new Set<string>();
				if (points.length === 0) return touched;
				const eraserTolerance = Math.max(4, strokeWeight / 2);

				const addTouchedAtPoint = (x: number, y: number) => {
					const idsAtPoint = getTouchedShapeIdsAtPoint(x, y, eraserTolerance);
					for (const id of idsAtPoint) touched.add(id);
				};

				addTouchedAtPoint(points[0]!.x, points[0]!.y);
				for (let index = 1; index < points.length; index += 1) {
					const previous = points[index - 1]!;
					const current = points[index]!;
					const dx = current.x - previous.x;
					const dy = current.y - previous.y;
					const distance = Math.hypot(dx, dy);
					const step = Math.max(2, strokeWeight / 2);
					const steps = Math.max(1, Math.ceil(distance / step));

					for (let i = 1; i <= steps; i += 1) {
						const t = i / steps;
						addTouchedAtPoint(previous.x + dx * t, previous.y + dy * t);
					}
				}

				return touched;
			};

			const markTouchedObjectsAtPoint = (x: number, y: number) => {
				const touchedNow = getTouchedShapeIdsAtPoint(x, y, Math.max(4, settingsRef.current.strokeWeight / 2));
				for (const shapeId of touchedNow) {
					if (eraserTouchLatchRef.current.has(shapeId)) continue;
					eraserMarkedShapeIdsRef.current.add(shapeId);
				}
				eraserTouchLatchRef.current = touchedNow;
			};

			const markTouchedObjectsAlongSegment = (start: { x: number; y: number }, end: { x: number; y: number }) => {
				const dx = end.x - start.x;
				const dy = end.y - start.y;
				const distance = Math.hypot(dx, dy);
				const step = Math.max(2, settingsRef.current.strokeWeight / 2);
				const steps = Math.max(1, Math.ceil(distance / step));

				for (let i = 1; i <= steps; i++) {
					const t = i / steps;
					const sampleX = start.x + dx * t;
					const sampleY = start.y + dy * t;
					markTouchedObjectsAtPoint(sampleX, sampleY);
				}
			};

			const commitMarkedEraserDeletes = () => {
				if (eraserMarkedShapeIdsRef.current.size === 0) return;
				pushUndoSnapshot();
				const idsToDelete = eraserMarkedShapeIdsRef.current;
				const idsArray = Array.from(idsToDelete);
				shapesRef.current = shapesRef.current.filter((shape) => !idsToDelete.has(shape.id));

				if (hoveredShapeIdRef.current && idsToDelete.has(hoveredShapeIdRef.current)) {
					hoveredShapeIdRef.current = null;
					hoveredHandleRef.current = null;
				}

				syncSelectionAfterStateChange();

				eraserMarkedShapeIdsRef.current = new Set();
				eraserTouchLatchRef.current = new Set();
				markDirty();
				
				// Broadcast eraser deletions to all connected clients
				emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-shape-delete", { shapeIds: idsArray });
			};

			const syncHoverFromPointer = () => {
				if (settingsRef.current.isAnyColorPickerOpen) {
					hoveredShapeIdRef.current = null;
					hoveredHandleRef.current = null;
					s.cursor(s.ARROW);
					return;
				}

				if (marqueeSelectionStartRef.current) {
					hoveredShapeIdRef.current = null;
					hoveredHandleRef.current = null;
					s.cursor(s.CROSS);
					return;
				}

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
			if (isTextShape(hoveredShape)) {
				s.cursor("text");
				return;
			}
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
			};

			const drawRemoteCursors = () => {
				const now = Date.now();
				for (const [userId, cursor] of remoteCursorsRef.current.entries()) {
					if (now - cursor.lastSeen > 3000) {
						remoteCursorsRef.current.delete(userId);
						continue;
					}

					const cursorColor = colorFromUserId(userId);
					const label = cursor.username;
					const labelX = cursor.x + 10 / viewRef.current.scale;
					const labelY = cursor.y - 8 / viewRef.current.scale;

					s.push();
					s.noStroke();
					s.fill(cursorColor);
					s.ellipseMode(s.CENTER);
					s.ellipse(cursor.x, cursor.y, 8 / viewRef.current.scale, 8 / viewRef.current.scale);
					s.textSize(Math.max(10, 12 / viewRef.current.scale));
					s.fill(cursorColor);
					s.noStroke();
					s.textAlign(s.LEFT, s.TOP);
					s.text(label, labelX, labelY);
					s.pop();
				}
			};
			const drawShape = (shape: Shape, options?: { isSelected?: boolean; isHovered?: boolean; isDraft?: boolean }) => {
				const isSelected = options?.isSelected ?? false;
				const isHovered = options?.isHovered ?? false;
				const isDraft = options?.isDraft ?? false;
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
						const freehandBounds = getShapeBoundsIgnoreRotation(shape);
						s.noFill();
						s.stroke(highlightColor);
						s.strokeWeight(2);
						s.rectMode(s.CORNERS);
						s.rect(freehandBounds.minX, freehandBounds.minY, freehandBounds.maxX, freehandBounds.maxY);
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

				if (shape.kind === "arrow") {
					drawArrowSegment(s, shape);
					if (isSelected || isHovered) {
						drawArrowSegment(s, {
							x1: shape.x1,
							y1: shape.y1,
							x2: shape.x2,
							y2: shape.y2,
							color: highlightColor,
							strokeWeight: 2,
						});
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

				if (shape.kind === "rounded-rectangle") {
					s.stroke(shape.color);
					s.strokeWeight(shape.strokeWeight);
					if (shape.filled) {
						s.fill(shape.color);
					} else {
						s.noFill();
					}
					s.rectMode(s.CORNERS);
					s.rect(shape.x1, shape.y1, shape.x2, shape.y2, getCornerRadius(shape));
					if (isSelected || isHovered) {
						s.noFill();
						s.stroke(highlightColor);
						s.strokeWeight(2);
						s.rect(shape.x1, shape.y1, shape.x2, shape.y2, getCornerRadius(shape));
					}
					if (shape.angle !== 0) s.pop();
					return;
				}

				if (shape.kind === "text" || shape.kind === "textbox" || shape.kind === "rounded-textbox" || shape.kind === "circle-text") {
					const layout = getTextBoxLayout(shape);
					const isEditing = editingTextShapeIdRef.current === shape.id;
					const selection = textSelectionRangeRef.current;
					const hasSelection =
						isEditing &&
						selection !== null &&
						Math.max(selection.start, selection.end) > Math.min(selection.start, selection.end);

					if (shape.kind === "text" && isDraft) {
						const guideContext = s.drawingContext as CanvasRenderingContext2D;
						guideContext.save();
						guideContext.setLineDash([6 / viewRef.current.scale, 4 / viewRef.current.scale]);
						s.noFill();
						s.stroke(isEditing ? "#f59e0b" : "rgba(107,114,128,0.8)");
						s.strokeWeight(Math.max(1 / viewRef.current.scale, 1));
						s.rectMode(s.CORNERS);
						s.rect(layout.minX, layout.minY, layout.maxX, layout.maxY);
						guideContext.restore();
					}

					if (shape.kind === "textbox" || shape.kind === "rounded-textbox") {
						s.noFill();
						s.stroke(isEditing ? "#f59e0b" : shape.color);
						s.strokeWeight(Math.max(1, shape.strokeWeight));
						s.rectMode(s.CORNERS);
						s.rect(
							layout.minX,
							layout.minY,
							layout.maxX,
							layout.maxY,
							shape.kind === "rounded-textbox" ? getCornerRadius(shape) : undefined,
						);
					}

					if (shape.kind === "circle-text") {
						s.noFill();
						s.stroke(isEditing ? "#f59e0b" : shape.color);
						s.strokeWeight(Math.max(1, shape.strokeWeight));
						s.ellipseMode(s.CORNERS);
						s.ellipse(layout.minX, layout.minY, layout.maxX, layout.maxY);
					}

					s.push();
					const context = s.drawingContext as CanvasRenderingContext2D;
					context.save();
					context.beginPath();
					if (layout.isCircleText) {
						const clipRadiusX = Math.max(1, layout.boxWidth / 2 - 1);
						const clipRadiusY = Math.max(1, layout.boxHeight / 2 - 1);
						context.ellipse(layout.centerX, layout.centerY, clipRadiusX, clipRadiusY, 0, 0, Math.PI * 2);
					} else {
						context.rect(layout.minX + 1, layout.minY + 1, layout.boxWidth - 2, layout.boxHeight - 2);
					}
					context.clip();
					s.textAlign(s.LEFT, s.TOP);
					s.textFont(shape.font || DEFAULT_TEXT_FONT);
					s.textSize(layout.textSize);

					if (hasSelection && !layout.isCircleText) {
						s.noStroke();
						s.fill("rgba(59,130,246,0.25)");
						s.rectMode(s.CORNERS);
						s.rect(
							layout.minX + layout.padding,
							layout.minY + layout.padding,
							layout.maxX - layout.padding,
							layout.maxY - layout.padding,
						);
					}

					s.fill(shape.color);
					s.noStroke();

					const displayText = shape.content.length > 0 ? shape.content : isEditing || isDraft ? "Type here..." : "";
					const lines = wrapTextToWidth(s, displayText, Math.max(1, layout.boxWidth - layout.padding * 2));
					const totalTextHeight = lines.length * layout.lineHeight;
					const startY = layout.isCircleText ? layout.centerY - totalTextHeight / 2 : layout.minY + layout.padding;
					for (let index = 0; index < lines.length; index += 1) {
						const line = lines[index]!;
						const lineY = startY + index * layout.lineHeight;
						if (lineY > layout.maxY - layout.padding) break;
						if (layout.isCircleText) {
							const lineWidth = s.textWidth(line);
							s.text(line, layout.centerX - lineWidth / 2, lineY);
						} else {
							s.text(line, layout.minX + layout.padding, lineY);
						}
					}

					if (isEditing && !hasSelection && Math.floor(s.millis() / 500) % 2 === 0) {
						const caretPosition = getTextCaretPosition(shape, textCaretIndexRef.current);
						if (caretPosition.y <= layout.maxY - layout.padding) {
							s.stroke("#111111");
							s.strokeWeight(Math.max(1 / viewRef.current.scale, 1));
							s.line(caretPosition.x, caretPosition.y, caretPosition.x, caretPosition.y + caretPosition.textSize);
						}
					}
					context.restore();
					s.pop();

					if (isSelected || isHovered) {
						s.noFill();
						s.stroke(highlightColor);
						s.strokeWeight(2);
						s.rectMode(s.CORNERS);
						s.rect(layout.minX, layout.minY, layout.maxX, layout.maxY);
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
					if (settingsRef.current.isAnyColorPickerOpen) return;
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

				const handleDoubleClick = (event: MouseEvent) => {
					if (settingsRef.current.isAnyColorPickerOpen) return;
					const canEditText =
						settingsRef.current.tool === "cursor" ||
						settingsRef.current.tool === "text" ||
						settingsRef.current.tool === "textbox" ||
						settingsRef.current.tool === "rounded-textbox" ||
						settingsRef.current.tool === "circle-text";
					if (!canEditText) return;
					const canvasRect = renderer.elt.getBoundingClientRect();
					const worldPoint = screenToWorld(event.clientX - canvasRect.left, event.clientY - canvasRect.top);
					const clickedShape = findShapeAtPoint(worldPoint.x, worldPoint.y);
						if (!isTextShape(clickedShape)) {
						stopTextEditing();
						return;
					}

					applySelection([clickedShape.id]);
						startTextEditing(clickedShape.id, clickedShape.content.length, true);
				};

				renderer.elt.addEventListener("wheel", handleWheel, { passive: false });
				removeWheelListener = () => renderer.elt.removeEventListener("wheel", handleWheel);
				renderer.elt.addEventListener("dblclick", handleDoubleClick);
				removeDoubleClickListener = () => renderer.elt.removeEventListener("dblclick", handleDoubleClick);
				resizeToViewport();
			};

			s.draw = () => {
				syncHoverFromPointer();
					s.background(normalizeHexColor(settingsRef.current.backgroundColor, DEFAULT_BACKGROUND_COLOR));
				s.push();
				s.translate(viewRef.current.offsetX, viewRef.current.offsetY);
				s.scale(viewRef.current.scale);
				const applyErasePreviewStyle = () => {
					const context = s.drawingContext as CanvasRenderingContext2D;
					context.globalAlpha = 0.62;
					context.filter = "grayscale(1) brightness(0.75)";
				};
				for (const shape of shapesRef.current) {
					const isMarkedForErase = eraserMarkedShapeIdsRef.current.has(shape.id);
					if (isMarkedForErase) {
						s.push();
						applyErasePreviewStyle();
					}

					drawShape(shape, {
						isSelected: selectedShapeIdsRef.current.has(shape.id),
						isHovered: shape.id === hoveredShapeIdRef.current,
					});

					if (isMarkedForErase) {
						s.pop();
					}
				}
				if (draftShapeRef.current && draftShapeRef.current.kind !== "eraser") {
					drawShape(draftShapeRef.current, {
						isSelected: false,
						isHovered: false,
						isDraft: true,
					});
				}
				for (const remoteDraftShape of remoteDraftsRef.current.values()) {
					if (remoteDraftShape.kind === "eraser") {
						const touchedIds = getTouchedShapeIdsFromEraserPath(remoteDraftShape.points, remoteDraftShape.strokeWeight);
						for (const shape of shapesRef.current) {
							if (!touchedIds.has(shape.id)) continue;
							s.push();
							applyErasePreviewStyle();
							drawShape(shape, {
								isSelected: selectedShapeIdsRef.current.has(shape.id),
								isHovered: shape.id === hoveredShapeIdRef.current,
							});
							s.pop();
						}
						continue;
					}
					s.push();
					(s.drawingContext as CanvasRenderingContext2D).globalAlpha = 0.45;
					drawShape(remoteDraftShape, {
						isSelected: false,
						isHovered: false,
						isDraft: true,
					});
					s.pop();
				}
				if (marqueeSelectionStartRef.current && marqueeSelectionCurrentRef.current) {
					const start = marqueeSelectionStartRef.current;
					const current = marqueeSelectionCurrentRef.current;
					s.noFill();
					s.stroke("#2563eb");
					s.strokeWeight(1 / viewRef.current.scale);
					const context = s.drawingContext as CanvasRenderingContext2D;
					context.save();
					context.setLineDash([6 / viewRef.current.scale, 4 / viewRef.current.scale]);
					s.rectMode(s.CORNERS);
					s.rect(start.x, start.y, current.x, current.y);
					context.restore();
				}
				const selectedShape = selectedShapeIdRef.current
					? shapesRef.current.find((shape) => shape.id === selectedShapeIdRef.current) ?? null
					: null;
				if (selectedShape && settingsRef.current.tool === "cursor" && selectedShapeIdsRef.current.size === 1) {
					drawSelectionHandles(selectedShape);
				}
				drawRemoteCursors();
				s.pop();
			};

			s.mouseMoved = () => {
				syncHoverFromPointer();
				if (s.mouseX >= 0 && s.mouseX <= s.width && s.mouseY >= 0 && s.mouseY <= s.height) {
					const worldPoint = screenToWorld(s.mouseX, s.mouseY);
					emitCursorFromPointer(worldPoint.x, worldPoint.y, true);
				}
			};

			s.mousePressed = (event: MouseEvent) => {
								if (canvasEntryBlockedRef.current) return;
				if (settingsRef.current.isAnyColorPickerOpen) {
					dragStartRef.current = null;
					marqueeSelectionStartRef.current = null;
					marqueeSelectionCurrentRef.current = null;
					marqueeSelectionAdditiveRef.current = false;
					marqueeSelectionInitialIdsRef.current = [];
					draggedShapeIdRef.current = null;
					resizeSessionRef.current = null;
					rotationSessionRef.current = null;
					draftShapeRef.current = null;
					return;
				}
				if ((event.buttons & 1) === 0) return;
				if (s.mouseX < 0 || s.mouseX > s.width || s.mouseY < 0 || s.mouseY > s.height) return;
				const worldPoint = screenToWorld(s.mouseX, s.mouseY);
			const clickedShape = findShapeAtPoint(worldPoint.x, worldPoint.y);
			const isEditingText =
				isTextShape(clickedShape) &&
				clickedShape.kind !== "circle-text" &&
				(
					settingsRef.current.tool === "cursor" ||
					settingsRef.current.tool === "text" ||
					settingsRef.current.tool === "textbox" ||
					settingsRef.current.tool === "rounded-textbox" ||
					settingsRef.current.tool === "circle-text"
				);				if (!isEditingText) {
					stopTextEditing();
				}

				dragStartRef.current = { x: worldPoint.x, y: worldPoint.y };

				if (
					clickedShape &&
					isTextShape(clickedShape) &&
					clickedShape.kind !== "circle-text" &&
					editingTextShapeIdRef.current === clickedShape.id &&
					(
						settingsRef.current.tool === "cursor" ||
						settingsRef.current.tool === "text" ||
						settingsRef.current.tool === "textbox" ||
						settingsRef.current.tool === "rounded-textbox" ||
						settingsRef.current.tool === "circle-text"
					)
				) {
					textCaretIndexRef.current = getClosestTextCaretIndex(clickedShape, worldPoint);
					textSelectionRangeRef.current = null;
					applySelection([clickedShape.id]);
					dragStartRef.current = null;
					draggedShapeIdRef.current = null;
					marqueeSelectionStartRef.current = null;
					marqueeSelectionCurrentRef.current = null;
					marqueeSelectionAdditiveRef.current = false;
					marqueeSelectionInitialIdsRef.current = [];
					hoveredShapeIdRef.current = clickedShape.id;
					hoveredHandleRef.current = null;
					return;
				}

			if (settingsRef.current.tool === "eraser") {
				eraserTouchLatchRef.current = new Set();
				eraserLastPointRef.current = { x: worldPoint.x, y: worldPoint.y };
				markTouchedObjectsAtPoint(worldPoint.x, worldPoint.y);
				draftShapeRef.current = {
					kind: "eraser",
					id: generateShapeId(),
					points: [{ x: worldPoint.x, y: worldPoint.y }],
					strokeWeight: settingsRef.current.strokeWeight,
					angle: 0,
				} as EraserShape;
				emitDraftShape(draftShapeRef.current);
				draggedShapeIdRef.current = null;
				resizeSessionRef.current = null;
				rotationSessionRef.current = null;
				return;
			}

			if (settingsRef.current.tool === "cursor" && selectedShapeIdRef.current && selectedShapeIdsRef.current.size === 1) {
				const selectedShape = shapesRef.current.find((shape) => shape.id === selectedShapeIdRef.current) ?? null;
				if (selectedShape) {
					const selectedBounds = getShapeBounds(selectedShape);
					const handleRadius = 7 / viewRef.current.scale;
					
					// Check for rotation handle first (no unrotate needed for rotation handle)
					const rotationHandle = getRotationHandlePoint(selectedShape);
					if (Math.abs(worldPoint.x - rotationHandle.x) <= handleRadius && Math.abs(worldPoint.y - rotationHandle.y) <= handleRadius) {
						pushUndoSnapshot();
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
						pushUndoSnapshot();
						// Resize session
						hoveredHandleRef.current = handle;
						
						// Get the anchor point in unrotated space
						const anchorInUnrotated = getOppositeHandlePoint(unrotatedBounds, handle);

						const center = getRotationCenter(selectedShape);
						const anchorInWorld =
							selectedShape.angle !== 0 ? rotatePoint(anchorInUnrotated, center, selectedShape.angle) : anchorInUnrotated;
						
						resizeSessionRef.current = {
							shapeId: selectedShape.id,
							handle,
							anchor: anchorInUnrotated,
							fixedWorldAnchor: anchorInWorld,
							originalBounds: unrotatedBounds,
							originalShape: { ...selectedShape },
						};
						draggedShapeIdRef.current = null;
						return;
					}
				}
			}				// Check if clicking on an existing shape (for drag mode)

				if (clickedShape) {
					if (settingsRef.current.tool === "cursor" && event.ctrlKey) {
						const nextSelection = new Set(selectedShapeIdsRef.current);
						if (nextSelection.has(clickedShape.id)) {
							nextSelection.delete(clickedShape.id);
						} else {
							nextSelection.add(clickedShape.id);
						}
						applySelection(Array.from(nextSelection));
						draggedShapeIdRef.current = null;
						hoveredShapeIdRef.current = clickedShape.id;
						hoveredHandleRef.current = null;
						return;
					}

					const shouldKeepCurrentSelection =
						settingsRef.current.tool === "cursor" &&
						selectedShapeIdsRef.current.size > 1 &&
						selectedShapeIdsRef.current.has(clickedShape.id);
					if (!shouldKeepCurrentSelection) {
						applySelection([clickedShape.id]);
					}
					if (settingsRef.current.tool === "cursor") {
						pushUndoSnapshot();
					}
					marqueeSelectionStartRef.current = null;
					marqueeSelectionCurrentRef.current = null;
					marqueeSelectionAdditiveRef.current = false;
					marqueeSelectionInitialIdsRef.current = [];
					draggedShapeIdRef.current = clickedShape.id;
					hoveredShapeIdRef.current = clickedShape.id;
					hoveredHandleRef.current = null;
					return;
				}

				if (settingsRef.current.tool === "cursor") {
					marqueeSelectionStartRef.current = { x: worldPoint.x, y: worldPoint.y };
					marqueeSelectionCurrentRef.current = { x: worldPoint.x, y: worldPoint.y };
					marqueeSelectionAdditiveRef.current = event.ctrlKey || event.metaKey;
					marqueeSelectionInitialIdsRef.current = Array.from(selectedShapeIdsRef.current);
					draggedShapeIdRef.current = null;
					hoveredShapeIdRef.current = null;
					hoveredHandleRef.current = null;
					return;
				}

				// Clear selection if clicking on empty space
				if (!(settingsRef.current.tool === "cursor" && event.ctrlKey)) {
					applySelection([]);
				}
				hoveredShapeIdRef.current = null;
				hoveredHandleRef.current = null;
				draggedShapeIdRef.current = null;

				// Cursor tool: only selection, no drawing
				if (settingsRef.current.tool === "cursor") {
					return;
				}

				if (settingsRef.current.tool === "freehand") {
					draftShapeRef.current = {
						kind: "freehand",
						id: generateShapeId(),
						points: [{ x: worldPoint.x, y: worldPoint.y }],
						color: normalizeHexColor(settingsRef.current.lineColor, DEFAULT_LINE_COLOR),
						strokeWeight: settingsRef.current.strokeWeight,
						angle: 0,
					} as FreeHandShape;
					emitDraftShape(draftShapeRef.current);
					return;
				}

				if (settingsRef.current.tool === "highlighter") {
					draftShapeRef.current = {
						kind: "freehand",
						id: generateShapeId(),
						points: [{ x: worldPoint.x, y: worldPoint.y }],
						color: "rgba(250, 204, 21, 0.35)",
						strokeWeight: 12,
						angle: 0,
					} as FreeHandShape;
					emitDraftShape(draftShapeRef.current);
					return;
				}

				if (
					settingsRef.current.tool === "text" ||
					settingsRef.current.tool === "textbox" ||
					settingsRef.current.tool === "rounded-textbox" ||
					settingsRef.current.tool === "circle-text"
				) {
					draftShapeRef.current = {
						kind: settingsRef.current.tool,
						id: generateShapeId(),
						x1: worldPoint.x,
						y1: worldPoint.y,
						x2: worldPoint.x,
						y2: worldPoint.y,
						color: normalizeHexColor(settingsRef.current.lineColor, DEFAULT_LINE_COLOR),
						strokeWeight: settingsRef.current.strokeWeight,
						angle: 0,
						font: settingsRef.current.textFont,
						content: "",
					} as TextShape;
					emitDraftShape(draftShapeRef.current);
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
				} as LineShape | ArrowShape | RectangleShape | RoundedRectangleShape | CircleShape;
					emitDraftShape(draftShapeRef.current);
			};

				s.mouseDragged = (event: MouseEvent) => {
										if (canvasEntryBlockedRef.current) return;
					if (settingsRef.current.isAnyColorPickerOpen) return;
					if ((event.buttons & 1) === 0) return;
			if (!dragStartRef.current) return;
			const worldPoint = screenToWorld(s.mouseX, s.mouseY);
				emitCursorFromPointer(worldPoint.x, worldPoint.y, true);

			if (
				settingsRef.current.tool === "cursor" &&
				marqueeSelectionStartRef.current &&
				marqueeSelectionCurrentRef.current &&
				!draggedShapeIdRef.current &&
				!resizeSessionRef.current &&
				!rotationSessionRef.current
			) {
				marqueeSelectionCurrentRef.current = { x: worldPoint.x, y: worldPoint.y };
				const boxedIds = getShapeIdsInSelectionRect(marqueeSelectionStartRef.current, marqueeSelectionCurrentRef.current);
				if (marqueeSelectionAdditiveRef.current) {
					const merged = new Set([...marqueeSelectionInitialIdsRef.current, ...boxedIds]);
					applySelection(Array.from(merged));
				} else {
					applySelection(boxedIds);
				}
				hoveredShapeIdRef.current = null;
				hoveredHandleRef.current = null;
				return;
			}

			if (settingsRef.current.tool === "eraser") {
				const previousPoint = eraserLastPointRef.current;
				if (previousPoint) {
					markTouchedObjectsAlongSegment(previousPoint, worldPoint);
				} else {
					markTouchedObjectsAtPoint(worldPoint.x, worldPoint.y);
				}
				eraserLastPointRef.current = { x: worldPoint.x, y: worldPoint.y };
				if (draftShapeRef.current && draftShapeRef.current.kind === "eraser") {
					draftShapeRef.current = {
						...draftShapeRef.current,
						points: [...draftShapeRef.current.points, { x: worldPoint.x, y: worldPoint.y }],
					};
					const now = Date.now();
					if (now - lastDraftEmitAtRef.current > 25) {
						emitDraftShape(draftShapeRef.current);
						lastDraftEmitAtRef.current = now;
					}
				}
				emitCursorFromPointer(worldPoint.x, worldPoint.y, true);
				return;
			}

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
					applySelection([shapeId]);
					hoveredShapeIdRef.current = shapeId;
					hoveredHandleRef.current = "rotation";
					emitDraftShape(shapesRef.current[shapeIndex]);
				}
				return;
			}

			if (resizeSessionRef.current) {
				const { shapeId, handle, anchor, fixedWorldAnchor, originalBounds, originalShape } = resizeSessionRef.current;
				
				// If the shape is rotated, unrotate pointer into unrotated coordinate space
				let resizePoint = worldPoint;
				if (originalShape.angle !== 0) {
					const center = getRotationCenter(originalShape);
					resizePoint = unrotatePoint(worldPoint, center, originalShape.angle);
				}
				
				const resizedBounds = boundsFromAnchorAndPointer(anchor, resizePoint, handle, originalBounds);
				const shapeIndex = shapesRef.current.findIndex((shape) => shape.id === shapeId);
				if (shapeIndex >= 0) {
					let resizedShape = resizeShapeFromBounds(originalShape, originalBounds, resizedBounds);

					if (originalShape.angle !== 0) {
						const resizedCenter = getRotationCenter(resizedShape);
						const currentWorldOpposite = rotatePoint(anchor, resizedCenter, originalShape.angle);
						const deltaX = fixedWorldAnchor.x - currentWorldOpposite.x;
						const deltaY = fixedWorldAnchor.y - currentWorldOpposite.y;
						resizedShape = moveShape(resizedShape, deltaX, deltaY);
						//emitDraftShape(resizedShape);
					
					}
					shapesRef.current[shapeIndex] = resizedShape;
					emitDraftShape(resizedShape);
					applySelection([shapeId]);
					hoveredShapeIdRef.current = shapeId;
					hoveredHandleRef.current = handle;
					//commitShapeAndBroadcast(resizedShape);
				}
				return;
			}				// If we're dragging a shape, move it
				if (draggedShapeIdRef.current) {
					const deltaX = worldPoint.x - dragStartRef.current.x;
					const deltaY = worldPoint.y - dragStartRef.current.y;
					const shouldMoveSelectionGroup =
						settingsRef.current.tool === "cursor" &&
						selectedShapeIdsRef.current.size > 1 &&
						selectedShapeIdsRef.current.has(draggedShapeIdRef.current);
					if (shouldMoveSelectionGroup) {
						const selectedIds = selectedShapeIdsRef.current;
						shapesRef.current = shapesRef.current.map((shape) =>
							selectedIds.has(shape.id) ? moveShape(shape, deltaX, deltaY) : shape,
						
					);
						emitDraftShape(shapesRef.current.find((shape) => shape.id === draggedShapeIdRef.current) ?? null);
						//commitShapesAndBroadcast(Array.from(selectedIds).map((id) => shapesRef.current.find((shape) => shape.id === id)!));
						hoveredShapeIdRef.current = draggedShapeIdRef.current;
						dragStartRef.current = { x: worldPoint.x, y: worldPoint.y };
						return;
					}

					const shapeIndex = shapesRef.current.findIndex((shapeEntry) => shapeEntry.id === draggedShapeIdRef.current);
					if (shapeIndex >= 0) {
						const shape = shapesRef.current[shapeIndex]!;
						shapesRef.current[shapeIndex] = moveShape(shape, deltaX, deltaY);
						emitDraftShape(shapesRef.current[shapeIndex]);
						hoveredShapeIdRef.current = draggedShapeIdRef.current;
						dragStartRef.current = { x: worldPoint.x, y: worldPoint.y };
						markDirty();
					}
					
					return;
				}

				// Drawing mode
				if (!draftShapeRef.current) return;
				if (draftShapeRef.current.kind === "freehand") {
					draftShapeRef.current = {
						...draftShapeRef.current,
						points: [...draftShapeRef.current.points, { x: worldPoint.x, y: worldPoint.y }],
					};
					const now = Date.now();
					if (now - lastDraftEmitAtRef.current > 25) {
						emitDraftShape(draftShapeRef.current);
						lastDraftEmitAtRef.current = now;
					}
					return;
				}

				const constrainedEndPoint = getConstrainedDraftEndPoint(
					draftShapeRef.current,
					{ x: draftShapeRef.current.x1, y: draftShapeRef.current.y1 },
					{ x: worldPoint.x, y: worldPoint.y },
					event.shiftKey,
				);

				draftShapeRef.current = {
					...draftShapeRef.current,
					x2: constrainedEndPoint.x,
					y2: constrainedEndPoint.y,
				};
				const now = Date.now();
				if (now - lastDraftEmitAtRef.current > 25) {
					emitDraftShape(draftShapeRef.current);
					lastDraftEmitAtRef.current = now;
				}
			};

			s.mouseReleased = () => {
								if (canvasEntryBlockedRef.current) return;
				
				if (settingsRef.current.isAnyColorPickerOpen) {
					dragStartRef.current = null;
					marqueeSelectionStartRef.current = null;
					marqueeSelectionCurrentRef.current = null;
					marqueeSelectionAdditiveRef.current = false;
					marqueeSelectionInitialIdsRef.current = [];
					draggedShapeIdRef.current = null;
					resizeSessionRef.current = null;
					rotationSessionRef.current = null;
					draftShapeRef.current = null;

					return;
				}

				if (settingsRef.current.tool === "cursor" && marqueeSelectionStartRef.current && marqueeSelectionCurrentRef.current) {
					const start = marqueeSelectionStartRef.current;
					const end = marqueeSelectionCurrentRef.current;
					const dragDistance = Math.hypot(end.x - start.x, end.y - start.y);
					const minimumDragDistance = 3 / viewRef.current.scale;

					if (dragDistance < minimumDragDistance) {
						if (!marqueeSelectionAdditiveRef.current) {
							applySelection([]);
						}
					} else {
						const boxedIds = getShapeIdsInSelectionRect(start, end);
						if (marqueeSelectionAdditiveRef.current) {
							const merged = new Set([...marqueeSelectionInitialIdsRef.current, ...boxedIds]);
							applySelection(Array.from(merged));
						} else {
							applySelection(boxedIds);
						}
					}

					marqueeSelectionStartRef.current = null;
					marqueeSelectionCurrentRef.current = null;
					marqueeSelectionAdditiveRef.current = false;
					marqueeSelectionInitialIdsRef.current = [];
					dragStartRef.current = null;
					hoveredShapeIdRef.current = null;
					hoveredHandleRef.current = null;
					return;
				}
				if (rotationSessionRef.current) {
					const shapeIndex = shapesRef.current.findIndex((shape) => shape.id === rotationSessionRef.current!.shapeId);
					if (shapeIndex >= 0) {
						emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-shape-commit", { shape: shapesRef.current[shapeIndex]! });
					}
					rotationSessionRef.current = null;
					dragStartRef.current = null;
					markDirty();
					return;
				}

				if (settingsRef.current.tool === "eraser") {
					commitMarkedEraserDeletes();
					eraserTouchLatchRef.current = new Set();
					eraserLastPointRef.current = null;
				//	dragStartRef.current = null;
				//	draftShapeRef.current = null;
					emitDraftShape(null);
					return;
				}

				if (resizeSessionRef.current) {
					const shapeIndex = shapesRef.current.findIndex((shape) => shape.id === resizeSessionRef.current!.shapeId);
					if (shapeIndex >= 0) {
						emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-shape-commit", { shape: shapesRef.current[shapeIndex]! });
					}
					resizeSessionRef.current = null;
					dragStartRef.current = null;
					markDirty();
					return;
				}

				// If we were dragging a shape, commit the changes
				if (draggedShapeIdRef.current) {
					const shapeIndex = shapesRef.current.findIndex((shape) => shape.id === draggedShapeIdRef.current);
					if (shapeIndex >= 0) {
						emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-shape-commit", { shape: shapesRef.current[shapeIndex]! });
					}
					draggedShapeIdRef.current = null;
					dragStartRef.current = null;
					// The shape position has already been updated in shapesRef during drag
					markDirty();
					return;
				}

				// Drawing mode
				if (!dragStartRef.current || !draftShapeRef.current) return;
				if (draftShapeRef.current.kind === "freehand" && draftShapeRef.current.points.length < 2) {
					draftShapeRef.current = null;
					dragStartRef.current = null;
					return;
				}

				const shapeToCommit = { ...draftShapeRef.current };
				// Minimal size enforcement
				const MIN_SIZE = 8;
				if (isTextShape(shapeToCommit)) {
					const dragDistance = Math.hypot(shapeToCommit.x2 - shapeToCommit.x1, shapeToCommit.y2 - shapeToCommit.y1);
					const minimumTextDragDistance = 3 / viewRef.current.scale;
					if (dragDistance < minimumTextDragDistance) {
						draftShapeRef.current = null;
						dragStartRef.current = null;
						return;
					}

					const minimumWidth = 140;
					const minimumHeight = 56;
					const width = shapeToCommit.x2 - shapeToCommit.x1;
					const height = shapeToCommit.y2 - shapeToCommit.y1;
					const widthDirection = Math.sign(width) || 1;
					const heightDirection = Math.sign(height) || 1;
					const nextWidth = Math.abs(width) < minimumWidth ? minimumWidth * widthDirection : width;
					const nextHeight = Math.abs(height) < minimumHeight ? minimumHeight * heightDirection : height;
					shapeToCommit.x2 = shapeToCommit.x1 + nextWidth;
					shapeToCommit.y2 = shapeToCommit.y1 + nextHeight;

					if (shapeToCommit.kind === "circle-text") {
						const squareEndPoint = getEqualSizeEndPoint(
							{ x: shapeToCommit.x1, y: shapeToCommit.y1 },
							{ x: shapeToCommit.x2, y: shapeToCommit.y2 },
						);
						shapeToCommit.x2 = squareEndPoint.x;
						shapeToCommit.y2 = squareEndPoint.y;
					}
				} else if (
					shapeToCommit.kind !== "freehand" &&
					shapeToCommit.kind !== "eraser"
				) {
					// For all other shapes, enforce minimal size
					const bounds = getShapeBounds(shapeToCommit);
					const width = bounds.maxX - bounds.minX;
					const height = bounds.maxY - bounds.minY;
					if (width < MIN_SIZE || height < MIN_SIZE) {
						draftShapeRef.current = null;
						dragStartRef.current = null;
						return;
					}
				}

				commitShapeAndBroadcast(shapeToCommit);
				emitCanvasEvent(chatSocketRef.current, canvasId, "canvas-shape-commit", { shape: shapeToCommit });
				emitDraftShape(null);
				if (isTextShape(shapeToCommit)) {
					applySelection([shapeToCommit.id]);
					startTextEditing(shapeToCommit.id);
				}
				dragStartRef.current = null;
				draftShapeRef.current = null;
				markDirty();
			};

			s.mouseOut = () => {
				hoveredShapeIdRef.current = null;
				hoveredHandleRef.current = null;
				marqueeSelectionStartRef.current = null;
				marqueeSelectionCurrentRef.current = null;
				marqueeSelectionAdditiveRef.current = false;
				marqueeSelectionInitialIdsRef.current = [];
				eraserTouchLatchRef.current = new Set();
				eraserLastPointRef.current = null;
				emitCursor(undefined, undefined, false);
				s.cursor(settingsRef.current.tool === "cursor" ? s.ARROW : s.CROSS);
			};

			s.windowResized = () => {
				resizeToViewport();
			};
    };

		p5Ref.current = createP5Instance();

		return () => {
			removeWheelListener?.();
			removeDoubleClickListener?.();
			p5Ref.current?.remove();
			p5Ref.current = null;
			if (canvasHostRef.current) {
				canvasHostRef.current.innerHTML = "";
			}
		};
  }, []);

  return (
		<div className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
			<AppTopbar />
			<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
			<div
				ref={controlsRef}
				style={{
					width: "100%",
					display: "grid",
					gridTemplateColumns: "1fr auto 1fr",
					alignItems: "center",
					columnGap: "12px",
					padding: "10px 12px",
					borderRadius: "10px",
					border: "1px solid var(--border)",
					background: "linear-gradient(180deg, var(--surface), var(--surface2))",
					boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
				}}
			>
				<div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Canvas: {canvasName.trim() || "Canvas"}</span>
						<span style={controlFieldStyle}>
							<button type="button" onClick={clearCanvasAndBroadcast} style={toolbarActionButtonStyle}>
								Clear
							</button>
						</span>
					</label>
				</div>

				<div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", flexWrap: "wrap", alignContent: "center" }}>
						<div style={controlLabelStyle}>
							<span style={controlNameStyle}>Background</span>
							<span style={controlFieldStyle}>
								<ColorPickerControl
									pickerId="background"
									label="Background"
									value={backgroundColor}
											onChange={(value) => {
												setBackgroundColor(value);
												markDirty();
											}}
									defaultValue={DEFAULT_BACKGROUND_COLOR}
									onOpenChange={handleColorPickerOpenChange}
									hideLabel
								/>
							</span>
						</div>

						<div style={controlLabelStyle}>
							<span style={controlNameStyle}>Line Color</span>
							<span style={controlFieldStyle}>
								<ColorPickerControl
									pickerId="line"
									label="Line Color"
									value={lineColor}
									onChange={(value) => {
										setLineColor(value);
										markDirty();
									}}
									defaultValue={DEFAULT_LINE_COLOR}
									onOpenChange={handleColorPickerOpenChange}
									hideLabel
								/>
							</span>
						</div>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Tool</span>
						<span style={controlFieldStyle}>
							<select
								value={tool}
								onChange={(event) => {
									setTool(event.target.value as Tool);
									markDirty();
								}}
							>
								<option value="cursor">🖱️ Cursor</option>
								<option value="freehand">✏️ Free Hand</option>
								<option value="highlighter">🖍️ Highlighter</option>
								<option value="eraser">🧽 Eraser</option>
								<option value="line">📏 Line</option>
								<option value="arrow">➡️ Arrow</option>
								<option value="rectangle">▭ Rectangle</option>
								<option value="rounded-rectangle">▢ Rounded Rectangle</option>
								<option value="circle">◯ Circle</option>
								<option value="circle-text">◉ Circle Text</option>
								<option value="text">🔤 Text</option>
								<option value="textbox">📝 Text Box</option>
								<option value="rounded-textbox">📄 Rounded Text Box</option>
							</select>
						</span>
					</label>

					<div style={controlLabelStyle}>
						<span style={controlNameStyle}>Fill Shape</span>
						<span style={{ ...controlFieldStyle, width: "auto", justifyContent: "center" }}>
							<input
								type="checkbox"
								style={toolbarCheckboxStyle}
								checked={fill}
								style={fillToggleStyle}
								onChange={(event) => {
									setFill(event.target.checked);
									markDirty();
								}}
							/>
						</span>
					</div>

					<label style={controlLabelStyle}>
						<span style={controlNameStyle}>Text Font</span>
						<span style={controlFieldStyle}>
							<select
								value={textFont}
								onChange={(event) => {
									setTextFont(event.target.value as TextFont);
									markDirty();
								}}
								style={{ fontFamily: textFont }}
							>
								{TEXT_FONT_OPTIONS.map((fontOption) => (
									<option key={fontOption} value={fontOption} style={{ fontFamily: fontOption }}>
										{fontOption}
									</option>
								))}
							</select>
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
									markDirty();
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

				<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingLeft: "14px" }}>
					<button type="button" onClick={() => navigate("/Canvases")} style={toolbarActionButtonStyle}>
						Leave canvas
					</button>
				</div>
			</div>
			<div style={{ minHeight: "20px", fontSize: "12px", color: "var(--muted-foreground, #64748b)", padding: "0 4px" }}>
				{saveStatus}
			</div>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "10px", alignItems: "stretch" }}>
					<div style={{ position: "relative" }}>
						<div
							ref={canvasHostRef}
							style={{
								minHeight: "320px",
								border: "1px solid var(--border)",
								borderRadius: 8,
								opacity: canvasEntryBlocked ? 0.6 : 1,
								pointerEvents: canvasEntryBlocked ? "none" : "auto",
							}}
						/>
						{canvasEntryBlocked ? (
							<div
								style={{
									position: "absolute",
									inset: 0,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "14px",
									fontWeight: 600,
									color: "#7f1d1d",
									background: "rgba(255,255,255,0.65)",
									borderRadius: 8,
									textAlign: "center",
									padding: "12px",
								}}
							>
								Canvas locked: this account already has this canvas open in another window.
							</div>
						) : null}
					</div>
					<CanvasChatSidebar
						canvasName={canvasName}
						members={members}
						activeMemberIds={activeMemberIds}
						chatStatus={chatStatus}
						messages={chatMessages}
						peerTyping={peerTyping}
						chatInput={chatInput}
						conversationLinked={Boolean(conversationId)}
						sendingMessage={sendingMessage}
						panelHeight={chatSidebarHeight}
						onChatInputChange={handleChatInputChange}
						onSend={handleSendChat}
					/>
					</div>
				</div>
			</div>
  );
}