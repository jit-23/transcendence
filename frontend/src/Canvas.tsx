import { useEffect, useRef, useState } from "react";
import p5 from "p5";

type Tool = "line" | "rectangle" | "circle" | "freehand";

type LineShape = {
	kind: "line";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
};

type RectangleShape = {
	kind: "rectangle";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	filled: boolean;
};

type CircleShape = {
	kind: "circle";
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	color: string;
	filled: boolean;
};

type FreeHandShape = {
	kind: "freehand";
	points: Array<{ x: number; y: number }>;
	color: string;
};

type Shape = LineShape | RectangleShape | CircleShape | FreeHandShape;

export default function Canvas() {
	const [backgroundColor, setBackgroundColor] = useState("#ffffff");
	const [lineColor, setLineColor] = useState("#111111");
	const [tool, setTool] = useState<Tool>("freehand");
	const [fill, setFill] = useState(false);

  const controlsRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
	const p5Ref = useRef<p5 | null>(null);

	const settingsRef = useRef({
		backgroundColor: "#ffffff",
		lineColor: "#111111",
		tool: "freehand" as Tool,
		fill: false,
	});

	const shapesRef = useRef<Shape[]>([]);
	const draftShapeRef = useRef<Shape | null>(null);
	const dragStartRef = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		settingsRef.current = { backgroundColor, lineColor, tool, fill };
	}, [backgroundColor, lineColor, tool, fill]);

  useEffect(() => {
		if (!canvasHostRef.current || p5Ref.current) return;

    const sketch = (s: p5) => {
			const resizeToViewport = () => {
				const controlsHeight = controlsRef.current?.offsetHeight ?? 56;
				const nextHeight = Math.max(s.windowHeight - controlsHeight - 24, 200);
				s.resizeCanvas(s.windowWidth, nextHeight);
			};

			const drawShape = (shape: Shape) => {
				s.stroke(shape.color);
				s.strokeWeight(4);

				if (shape.kind === "freehand") {
					s.noFill();
					s.beginShape();
					for (const point of shape.points) {
						s.vertex(point.x, point.y);
					}
					s.endShape();
					return;
				}

				if (shape.kind === "line") {
					s.noFill();
					s.line(shape.x1, shape.y1, shape.x2, shape.y2);
					return;
				}

				if (shape.kind === "rectangle") {
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
					s.fill(shape.color);
				} else {
					s.noFill();
				}
				s.ellipseMode(s.CORNERS);
				s.ellipse(shape.x1, shape.y1, shape.x2, shape.y2);
			};

			s.setup = () => {
				s.createCanvas(100, 100).parent(canvasHostRef.current!);
				resizeToViewport();
			};

			s.draw = () => {
				s.background(settingsRef.current.backgroundColor);
				for (const shape of shapesRef.current) {
					drawShape(shape);
				}
				if (draftShapeRef.current) {
					drawShape(draftShapeRef.current);
				}
			};

			s.mousePressed = (event: MouseEvent) => {
				if ((event.buttons & 1) === 0) return;
				if (s.mouseX < 0 || s.mouseX > s.width || s.mouseY < 0 || s.mouseY > s.height) return;

				dragStartRef.current = { x: s.mouseX, y: s.mouseY };

				if (settingsRef.current.tool === "freehand") {
					draftShapeRef.current = {
						kind: "freehand",
						points: [{ x: s.mouseX, y: s.mouseY }],
						color: settingsRef.current.lineColor,
					};
					return;
				}

				draftShapeRef.current = {
					kind: settingsRef.current.tool,
					x1: s.mouseX,
					y1: s.mouseY,
					x2: s.mouseX,
					y2: s.mouseY,
					color: settingsRef.current.lineColor,
					filled: settingsRef.current.fill,
				} as LineShape | RectangleShape | CircleShape;
			};

			s.mouseDragged = (event: MouseEvent) => {
				if ((event.buttons & 1) === 0) return;
				if (!dragStartRef.current || !draftShapeRef.current) return;

				if (draftShapeRef.current.kind === "freehand") {
					draftShapeRef.current = {
						...draftShapeRef.current,
						points: [...draftShapeRef.current.points, { x: s.mouseX, y: s.mouseY }],
					};
					return;
				}

				draftShapeRef.current = {
					...draftShapeRef.current,
					x2: s.mouseX,
					y2: s.mouseY,
				};
			};

			s.mouseReleased = () => {
				if (!dragStartRef.current || !draftShapeRef.current) return;
				shapesRef.current.push({ ...draftShapeRef.current });
				dragStartRef.current = null;
				draftShapeRef.current = null;
			};

			s.windowResized = () => {
				resizeToViewport();
			};
    };

		p5Ref.current = new p5(sketch);

		return () => {
			p5Ref.current?.remove();
			p5Ref.current = null;
			if (canvasHostRef.current) {
				canvasHostRef.current.innerHTML = "";
			}
		};
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
			<div ref={controlsRef} style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
				<label>
					Background
					<input
						type="color"
						value={backgroundColor}
						onChange={(event) => setBackgroundColor(event.target.value)}
						style={{ marginLeft: "6px" }}
					/>
				</label>

				<label>
					Line Color
					<input
						type="color"
						value={lineColor}
						onChange={(event) => setLineColor(event.target.value)}
						style={{ marginLeft: "6px" }}
					/>
				</label>

				<label>
					Tool
					<select
						value={tool}
						onChange={(event) => setTool(event.target.value as Tool)}
						style={{ marginLeft: "6px" }}
					>
						<option value="freehand">Free Hand</option>
						<option value="line">Line</option>
						<option value="rectangle">Rectangle</option>
						<option value="circle">Circle</option>
					</select>
				</label>
				<label>
					Fill Shape
					<input
						type="checkbox"
						checked={fill}
						onChange={(event) => setFill(event.target.checked)}
						style={{ marginLeft: "6px" }}
					/>
				</label>
			</div>
      <div ref={canvasHostRef} />
    </div>
  );
}