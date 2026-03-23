import React from "react";

const parseFrac = (s) => {
  if (typeof s === "number") return s;
  if (!String(s).includes("/")) return Number(s);
  const [a, b] = String(s).split("/");
  return Number(a) / Number(b);
};

const fmtFracSvg = (s) => String(s);

function Fraction({ value, small = false }) {
  const text = String(value);
  if (!text.includes("/")) {
    return <span>{text}</span>;
  }
  const [num, den] = text.split("/");
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "middle",
        margin: "0 1px",
        fontSize: small ? "0.8em" : "0.95em",
        lineHeight: 1,
      }}
    >
      <span style={{ display: "block", padding: "0 2px", whiteSpace: "nowrap" }}>{num}</span>
      <span
        style={{
          display: "block",
          width: "100%",
          borderTop: "1px solid currentColor",
          marginTop: "2px",
          padding: "1px 2px 0 2px",
          whiteSpace: "nowrap",
        }}
      >
        {den}
      </span>
    </span>
  );
}

function CoordinatePair({ x, y, small = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", flexWrap: "wrap" }}>
      <span>(</span>
      <Fraction value={x} small={small} />
      <span>,</span>
      <Fraction value={y} small={small} />
      <span>)</span>
    </span>
  );
}

const points = {
  O: { x: "-1", y: "0" },
  P: { x: "-11", y: "-4" },
  neg2P: { x: "5165/9499", y: "-8784/9499" },
  twoP: { x: "9499/5165", y: "-8784/5165" },
  neg3P: { x: "-679733219/375326521", y: "-883659076/375326521" },
  threeP: { x: "-375326521/679733219", y: "883659076/679733219" },
  neg4P: { x: "-6531563383962071/6334630576523495", y: "6696085890501216/6334630576523495" },
  fourP: { x: "-6334630576523495/6531563383962071", y: "-6696085890501216/6531563383962071" },
  neg5P: { x: "5048384306267455380784631/5824662475191962424632819", y: "-2798662276711559924688956/5824662475191962424632819" },
  fiveP: { x: "5824662475191962424632819/5048384306267455380784631", y: "-2798662276711559924688956/5048384306267455380784631" },
  neg6P: { x: "-287663048897224554337446918344405429/399866258624438737232493646244383709", y: "-434021404091091140782000234591618320/399866258624438737232493646244383709" },
  sixP: { x: "-399866258624438737232493646244383709/287663048897224554337446918344405429", y: "434021404091091140782000234591618320/287663048897224554337446918344405429" },
  neg7P: { x: "-678266970930133923578916161648350398206354101381/1637627722378544613543242758851617912968156867151", y: "3386928246329327259763849184510185031406211324804/1637627722378544613543242758851617912968156867151" },
  sevenP: { x: "-1637627722378544613543242758851617912968156867151/678266970930133923578916161648350398206354101381", y: "-3386928246329327259763849184510185031406211324804/678266970930133923578916161648350398206354101381" },
  neg8P: { x: "2110760649231325855047088974560468667532616164397520142622104465/343258303254635343211175484588572430575289938927656972201563791", y: "-2054217703980198940765993621567260834791816664149006217306067776/343258303254635343211175484588572430575289938927656972201563791" },
  eightP: { x: "343258303254635343211175484588572430575289938927656972201563791/2110760649231325855047088974560468667532616164397520142622104465", y: "-2054217703980198940765993621567260834791816664149006217306067776/2110760649231325855047088974560468667532616164397520142622104465" },
  neg9P: { x: "154476802108746166441951315019919837485664325669565431700026634898253202035277999/36875131794129999827197811565225474825492979968971970996283137471637224634055579", y: "4373612677928697257861252602371390152816537558161613618621437993378423467772036/36875131794129999827197811565225474825492979968971970996283137471637224634055579" },
  nineP: { x: "36875131794129999827197811565225474825492979968971970996283137471637224634055579/154476802108746166441951315019919837485664325669565431700026634898253202035277999", y: "4373612677928697257861252602371390152816537558161613618621437993378423467772036/154476802108746166441951315019919837485664325669565431700026634898253202035277999" },
};

const A = (name) => ({
  ...points[name],
  xNum: parseFrac(points[name].x),
  yNum: parseFrac(points[name].y),
  name,
});

const slopeTangentAtP = 134 / 503;

const steps = [
  {
    title: "Start with P",
    description: "We begin with the point P on the cubic.",
    points: [{ label: "P", ...A("P"), kind: "point" }],
    segments: [],
  },
  {
    title: "Tangent at P gives -2P",
    description: "Draw the tangent line at P. Its third intersection with the cubic is -2P.",
    points: [
      { label: "P", ...A("P"), kind: "point" },
      { label: "-2P", ...A("neg2P"), kind: "intersection" },
    ],
    segments: [{ type: "tangent", at: A("P"), slope: slopeTangentAtP, label: "tangent at P" }],
  },
  {
    title: "Line through O and -2P gives 2P",
    description: "Draw the line through O and -2P. The third intersection is 2P.",
    points: [
      { label: "O", ...A("O"), kind: "identity" },
      { label: "-2P", ...A("neg2P"), kind: "intersection" },
      { label: "2P", ...A("twoP"), kind: "result" },
    ],
    segments: [{ type: "secant", through: [A("O"), A("neg2P")], label: "line through O and -2P" }],
  },
  {
    title: "Secant through P and 2P gives -3P",
    description: "Draw the secant through P and 2P. Its third intersection is -3P.",
    points: [
      { label: "P", ...A("P"), kind: "point" },
      { label: "2P", ...A("twoP"), kind: "result" },
      { label: "-3P", ...A("neg3P"), kind: "intersection" },
    ],
    segments: [{ type: "secant", through: [A("P"), A("twoP")], label: "secant through P and 2P" }],
  },
  {
    title: "Line through O and -3P gives 3P",
    description: "Draw the line through O and -3P. The third intersection is 3P.",
    points: [
      { label: "O", ...A("O"), kind: "identity" },
      { label: "-3P", ...A("neg3P"), kind: "intersection" },
      { label: "3P", ...A("threeP"), kind: "result" },
    ],
    segments: [{ type: "secant", through: [A("O"), A("neg3P")], label: "line through O and -3P" }],
  },
  {
    title: "Secant through P and 3P gives -4P",
    description: "Draw the secant through P and 3P. Its third intersection is -4P.",
    points: [
      { label: "P", ...A("P"), kind: "point" },
      { label: "3P", ...A("threeP"), kind: "result" },
      { label: "-4P", ...A("neg4P"), kind: "intersection" },
    ],
    segments: [{ type: "secant", through: [A("P"), A("threeP")], label: "secant through P and 3P" }],
  },
  {
    title: "Line through O and -4P gives 4P",
    description: "Draw the line through O and -4P. The third intersection is 4P.",
    points: [
      { label: "O", ...A("O"), kind: "identity" },
      { label: "-4P", ...A("neg4P"), kind: "intersection" },
      { label: "4P", ...A("fourP"), kind: "result" },
    ],
    segments: [{ type: "secant", through: [A("O"), A("neg4P")], label: "line through O and -4P" }],
  },
  {
    title: "Secant through P and 4P gives -5P",
    description: "Draw the secant through P and 4P. Its third intersection is -5P.",
    points: [
      { label: "P", ...A("P"), kind: "point" },
      { label: "4P", ...A("fourP"), kind: "result" },
      { label: "-5P", ...A("neg5P"), kind: "intersection" },
    ],
    segments: [{ type: "secant", through: [A("P"), A("fourP")], label: "secant through P and 4P" }],
  },
  {
    title: "Line through O and -5P gives 5P",
    description: "Draw the line through O and -5P. The third intersection is 5P.",
    points: [
      { label: "O", ...A("O"), kind: "identity" },
      { label: "-5P", ...A("neg5P"), kind: "intersection" },
      { label: "5P", ...A("fiveP"), kind: "result" },
    ],
    segments: [{ type: "secant", through: [A("O"), A("neg5P")], label: "line through O and -5P" }],
  },
  {
    title: "Secant through P and 5P gives -6P",
    description: "Draw the secant through P and 5P. Its third intersection is -6P.",
    points: [
      { label: "P", ...A("P"), kind: "point" },
      { label: "5P", ...A("fiveP"), kind: "result" },
      { label: "-6P", ...A("neg6P"), kind: "intersection" },
    ],
    segments: [{ type: "secant", through: [A("P"), A("fiveP")], label: "secant through P and 5P" }],
  },
  {
    title: "Line through O and -6P gives 6P",
    description: "Draw the line through O and -6P. The third intersection is 6P.",
    points: [
      { label: "O", ...A("O"), kind: "identity" },
      { label: "-6P", ...A("neg6P"), kind: "intersection" },
      { label: "6P", ...A("sixP"), kind: "result" },
    ],
    segments: [{ type: "secant", through: [A("O"), A("neg6P")], label: "line through O and -6P" }],
  },
  {
    title: "Secant through P and 6P gives -7P",
    description: "Draw the secant through P and 6P. Its third intersection is -7P.",
    points: [
      { label: "P", ...A("P"), kind: "point" },
      { label: "6P", ...A("sixP"), kind: "result" },
      { label: "-7P", ...A("neg7P"), kind: "intersection" },
    ],
    segments: [{ type: "secant", through: [A("P"), A("sixP")], label: "secant through P and 6P" }],
  },
  {
    title: "Line through O and -7P gives 7P",
    description: "Draw the line through O and -7P. The third intersection is 7P.",
    points: [
      { label: "O", ...A("O"), kind: "identity" },
      { label: "-7P", ...A("neg7P"), kind: "intersection" },
      { label: "7P", ...A("sevenP"), kind: "result" },
    ],
    segments: [{ type: "secant", through: [A("O"), A("neg7P")], label: "line through O and -7P" }],
  },
  {
    title: "Secant through P and 7P gives -8P",
    description: "Draw the secant through P and 7P. Its third intersection is -8P.",
    points: [
      { label: "P", ...A("P"), kind: "point" },
      { label: "7P", ...A("sevenP"), kind: "result" },
      { label: "-8P", ...A("neg8P"), kind: "intersection" },
    ],
    segments: [{ type: "secant", through: [A("P"), A("sevenP")], label: "secant through P and 7P" }],
  },
  {
    title: "Line through O and -8P gives 8P",
    description: "Draw the line through O and -8P. The third intersection is 8P.",
    points: [
      { label: "O", ...A("O"), kind: "identity" },
      { label: "-8P", ...A("neg8P"), kind: "intersection" },
      { label: "8P", ...A("eightP"), kind: "result" },
    ],
    segments: [{ type: "secant", through: [A("O"), A("neg8P")], label: "line through O and -8P" }],
  },
  {
    title: "Secant through P and 8P gives -9P",
    description: "Draw the secant through P and 8P. Its third intersection is -9P.",
    points: [
      { label: "P", ...A("P"), kind: "point" },
      { label: "8P", ...A("eightP"), kind: "result" },
      { label: "-9P", ...A("neg9P"), kind: "intersection" },
    ],
    segments: [{ type: "secant", through: [A("P"), A("eightP")], label: "secant through P and 8P" }],
  },
  {
    title: "Line through O and -9P gives 9P",
    description: "Draw the line through O and -9P. The third intersection is 9P.",
    points: [
      { label: "O", ...A("O"), kind: "identity" },
      { label: "-9P", ...A("neg9P"), kind: "intersection" },
      { label: "9P", ...A("nineP"), kind: "result" },
    ],
    segments: [{ type: "secant", through: [A("O"), A("neg9P")], label: "line through O and -9P" }],
  },
];

function lineEndpoints(segment, world) {
  const pts = [];
  if (segment.type === "tangent") {
    const a = segment.at;
    const m = segment.slope;
    const b = a.yNum - m * a.xNum;
    const yAtXmin = m * world.xmin + b;
    const yAtXmax = m * world.xmax + b;
    const xAtYmin = Math.abs(m) < 1e-12 ? null : (world.ymin - b) / m;
    const xAtYmax = Math.abs(m) < 1e-12 ? null : (world.ymax - b) / m;
    if (yAtXmin >= world.ymin && yAtXmin <= world.ymax) pts.push({ x: world.xmin, y: yAtXmin });
    if (yAtXmax >= world.ymin && yAtXmax <= world.ymax) pts.push({ x: world.xmax, y: yAtXmax });
    if (xAtYmin !== null && Number.isFinite(xAtYmin) && xAtYmin >= world.xmin && xAtYmin <= world.xmax) pts.push({ x: xAtYmin, y: world.ymin });
    if (xAtYmax !== null && Number.isFinite(xAtYmax) && xAtYmax >= world.xmin && xAtYmax <= world.xmax) pts.push({ x: xAtYmax, y: world.ymax });
  } else {
    const [a, b] = segment.through;
    const dx = b.xNum - a.xNum;
    const dy = b.yNum - a.yNum;
    if (Math.abs(dx) < 1e-12) {
      if (a.xNum >= world.xmin && a.xNum <= world.xmax) {
        pts.push({ x: a.xNum, y: world.ymin });
        pts.push({ x: a.xNum, y: world.ymax });
      }
    } else {
      const m = dy / dx;
      const c = a.yNum - m * a.xNum;
      const yAtXmin = m * world.xmin + c;
      const yAtXmax = m * world.xmax + c;
      const xAtYmin = (world.ymin - c) / m;
      const xAtYmax = (world.ymax - c) / m;
      if (yAtXmin >= world.ymin && yAtXmin <= world.ymax) pts.push({ x: world.xmin, y: yAtXmin });
      if (yAtXmax >= world.ymin && yAtXmax <= world.ymax) pts.push({ x: world.xmax, y: yAtXmax });
      if (Number.isFinite(xAtYmin) && xAtYmin >= world.xmin && xAtYmin <= world.xmax) pts.push({ x: xAtYmin, y: world.ymin });
      if (Number.isFinite(xAtYmax) && xAtYmax >= world.xmin && xAtYmax <= world.xmax) pts.push({ x: xAtYmax, y: world.ymax });
    }
  }
  const unique = [];
  for (const p of pts) {
    if (!unique.some((q) => Math.abs(p.x - q.x) < 1e-8 && Math.abs(p.y - q.y) < 1e-8)) unique.push(p);
  }
  return unique.slice(0, 2);
}

export default function EllipticCurveChordTangentVisualizer() {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [panelPos, setPanelPos] = React.useState({ x: 10, y: 10 });
  const [panelExpanded, setPanelExpanded] = React.useState(true);
  const [dragging, setDragging] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const step = steps[stepIndex];

  const world = { xmin: -12.5, xmax: 7.5, ymin: -8.5, ymax: 6.5 };
  const width = 820;
  const height = 540;
  const pad = 28;

  const xToPx = (x) => pad + ((x - world.xmin) / (world.xmax - world.xmin)) * (width - 2 * pad);
  const yToPx = (y) => height - pad - ((y - world.ymin) / (world.ymax - world.ymin)) * (height - 2 * pad);

  const curve = React.useCallback(
    (x, y) => x * x * x + y * y * y + x * y + 1 - 3 * (x + y) * (x + 1) * (y + 1),
    [],
  );

  const curveSegments = React.useMemo(() => {
    const cols = 360;
    const rows = 240;
    const segs = [];
    const interp = (p1, v1, p2, v2) => {
      const t = v1 === v2 ? 0.5 : v1 / (v1 - v2);
      return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
    };
    for (let i = 0; i < cols; i += 1) {
      for (let j = 0; j < rows; j += 1) {
        const x0 = world.xmin + (i / cols) * (world.xmax - world.xmin);
        const x1 = world.xmin + ((i + 1) / cols) * (world.xmax - world.xmin);
        const y0 = world.ymin + (j / rows) * (world.ymax - world.ymin);
        const y1 = world.ymin + ((j + 1) / rows) * (world.ymax - world.ymin);
        const p00 = { x: x0, y: y0 };
        const p10 = { x: x1, y: y0 };
        const p11 = { x: x1, y: y1 };
        const p01 = { x: x0, y: y1 };
        const v00 = curve(p00.x, p00.y);
        const v10 = curve(p10.x, p10.y);
        const v11 = curve(p11.x, p11.y);
        const v01 = curve(p01.x, p01.y);
        const edges = [];
        if (v00 === 0) edges.push(p00);
        if (v10 === 0) edges.push(p10);
        if (v11 === 0) edges.push(p11);
        if (v01 === 0) edges.push(p01);
        if (v00 * v10 < 0) edges.push(interp(p00, v00, p10, v10));
        if (v10 * v11 < 0) edges.push(interp(p10, v10, p11, v11));
        if (v11 * v01 < 0) edges.push(interp(p11, v11, p01, v01));
        if (v01 * v00 < 0) edges.push(interp(p01, v01, p00, v00));
        if (edges.length === 2) segs.push([edges[0], edges[1]]);
        else if (edges.length === 4) {
          segs.push([edges[0], edges[1]]);
          segs.push([edges[2], edges[3]]);
        }
      }
    }
    return segs;
  }, [curve]);

  const pointColor = (kind) => {
    if (kind === "identity") return "text-emerald-600";
    if (kind === "intersection") return "text-amber-600";
    if (kind === "result") return "text-rose-600";
    return "text-sky-600";
  };

  const panelWidth = panelExpanded ? 320 : 150;
  const panelHeight = panelExpanded ? 210 : 44;

  const clampPanelPosition = React.useCallback(
    (x, y) => ({
      x: Math.max(10, Math.min(width - panelWidth - 10, x)),
      y: Math.max(10, Math.min(height - panelHeight - 10, y)),
    }),
    [height, panelHeight, panelWidth, width],
  );

  React.useEffect(() => {
    setPanelPos((pos) => clampPanelPosition(pos.x, pos.y));
  }, [clampPanelPosition]);

  const startDrag = (event) => {
    event.preventDefault();
    setDragging(true);
    dragOffsetRef.current = {
      x: event.clientX - panelPos.x,
      y: event.clientY - panelPos.y,
    };
  };

  React.useEffect(() => {
    if (!dragging) return undefined;

    const onMove = (event) => {
      setPanelPos(
        clampPanelPosition(
          event.clientX - dragOffsetRef.current.x,
          event.clientY - dragOffsetRef.current.y,
        ),
      );
    };

    const onUp = () => setDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [clampPanelPosition, dragging]);

  return (
    <div className={`${isFullscreen ? "fixed inset-0 overflow-hidden" : "min-h-screen"} bg-white text-slate-900 ${isFullscreen ? "p-0" : "p-6"}`}>
      <div className={`${isFullscreen ? "w-full h-full" : "max-w-7xl mx-auto"}`}>
        <div className={`bg-white ${isFullscreen ? "rounded-none shadow-none border-0 p-2 h-full flex flex-col" : "rounded-2xl shadow-sm border p-4"}`}>
          <div className={`flex items-center justify-between gap-3 ${isFullscreen ? "mb-0" : "mb-3"}`}>
            <div className={`${isFullscreen ? "hidden" : ""}`}>
              <h1 className="text-2xl font-semibold tracking-tight">Chord–tangent visualization on the cubic</h1>
              <p className="text-sm text-slate-600 mt-1">
                Curve: <span className="font-mono">x^3 + y^3 + xy + 1 = 3(x+y)(x+1)(y+1)</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-sm text-slate-500 ${isFullscreen ? "hidden" : ""}`}>Step {stepIndex + 1} of {steps.length}</div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="px-3 py-2 rounded-xl border shadow-sm hover:bg-slate-50"
              >
                {isFullscreen ? "✕" : "⛶"}
              </button>
            </div>
          </div>

          <div className={`rounded-2xl border overflow-hidden bg-slate-50 ${isFullscreen ? "flex-1 rounded-none border-0" : ""}`}>
            <svg viewBox={`0 0 ${width} ${height}`} className={`${isFullscreen ? "w-full h-full" : "w-full h-auto"} block`}>
              <rect x="0" y="0" width={width} height={height} fill="#f8fafc" />

              <line x1={xToPx(0)} y1={yToPx(world.ymin)} x2={xToPx(0)} y2={yToPx(world.ymax)} stroke="currentColor" strokeOpacity="0.2" />
              <line x1={xToPx(world.xmin)} y1={yToPx(0)} x2={xToPx(world.xmax)} y2={yToPx(0)} stroke="currentColor" strokeOpacity="0.2" />

              {curveSegments.map((seg, idx) => (
                <line
                  key={`curve-${idx}`}
                  x1={xToPx(seg[0].x)}
                  y1={yToPx(seg[0].y)}
                  x2={xToPx(seg[1].x)}
                  y2={yToPx(seg[1].y)}
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              ))}

              {step.segments.map((seg, idx) => {
                const [p1, p2] = lineEndpoints(seg, world);
                if (!p1 || !p2) return null;
                return (
                  <g key={`segment-${idx}`}>
                    <line
                      x1={xToPx(p1.x)}
                      y1={yToPx(p1.y)}
                      x2={xToPx(p2.x)}
                      y2={yToPx(p2.y)}
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="8 6"
                    />
                  </g>
                );
              })}

              {step.points.map((pt, idx) => {
                const fill = pt.kind === "identity" ? "#059669" : pt.kind === "intersection" ? "#d97706" : pt.kind === "result" ? "#e11d48" : "#0284c7";
                const px = xToPx(pt.xNum);
                const py = yToPx(pt.yNum);
                const dx = idx % 2 === 0 ? 10 : -10;
                const anchor = idx % 2 === 0 ? "start" : "end";
                return (
                  <g key={`${pt.label}-${idx}`}>
                    <circle cx={px} cy={py} r="5.5" fill={fill} />
                    <text x={px + dx} y={py - 10} textAnchor={anchor} className="text-[13px] fill-slate-900 font-medium">
                      {pt.label}
                    </text>
                  </g>
                );
              })}

              {/* Coordinate panel */}
              <foreignObject x={panelPos.x} y={panelPos.y} width={panelWidth} height={panelHeight}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.94)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: dragging ? "0 8px 22px rgba(0,0,0,0.16)" : "0 2px 6px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    width: `${panelWidth}px`,
                    height: `${panelHeight}px`,
                    userSelect: "none",
                  }}
                >
                  <div
                    onMouseDown={startDrag}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      cursor: dragging ? "grabbing" : "grab",
                      borderBottom: panelExpanded ? "1px solid #e2e8f0" : "none",
                      background: "rgba(248,250,252,0.95)",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>Coordinates</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPanelExpanded((v) => !v);
                      }}
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      {panelExpanded ? "Collapse" : "Expand"}
                    </button>
                  </div>
                  {panelExpanded && (
                    <div
                      style={{
                        padding: "10px",
                        maxHeight: `${panelHeight - 44}px`,
                        overflow: "auto",
                      }}
                    >
                      {step.points.map((pt) => (
                        <div key={`overlay-${pt.label}`} style={{ marginBottom: "6px" }}>
                          <span style={{ fontWeight: 600 }}>{pt.label}: </span>
                          <CoordinatePair x={pt.x} y={pt.y} small />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </foreignObject>
            </svg>
          </div>

          <div className={`${isFullscreen ? "fixed bottom-4 left-4 right-4 flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-lg border" : "mt-4 flex flex-wrap gap-3"}`}>
            <button onClick={() => setStepIndex((s) => Math.max(0, s - 1))} disabled={stepIndex === 0} className="px-4 py-2 rounded-xl border shadow-sm disabled:opacity-40">
              Previous step
            </button>
            <button onClick={() => setStepIndex((s) => Math.min(steps.length - 1, s + 1))} disabled={stepIndex === steps.length - 1} className="px-4 py-2 rounded-xl border shadow-sm disabled:opacity-40">
              Next step
            </button>
            <button onClick={() => setStepIndex(0)} className={`px-4 py-2 rounded-xl border shadow-sm ${isFullscreen ? "hidden" : ""}`}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
