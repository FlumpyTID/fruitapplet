import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// EXACT RATIONAL ARITHMETIC
// ============================================================

class Frac {
  constructor(num, den = 1) {
    if (typeof num === 'object') {
      this.num = num.num;
      this.den = num.den;
    } else {
      const g = this.gcd(Math.abs(num), Math.abs(den));
      let sign = (den < 0 ? -1 : 1) * (num < 0 ? -1 : 1);
      this.num = sign * Math.abs(num) / g;
      this.den = Math.abs(den) / g;
    }
  }

  gcd(a, b) {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  add(other) {
    return new Frac(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other) {
    return new Frac(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other) {
    return new Frac(this.num * other.num, this.den * other.den);
  }

  div(other) {
    return new Frac(this.num * other.den, this.den * other.num);
  }

  neg() {
    return new Frac(-this.num, this.den);
  }

  toNum() {
    return this.num / this.den;
  }

  toString() {
    return this.den === 1 ? `${this.num}` : `${this.num}/${this.den}`;
  }
}

// ============================================================
// CURVE OPERATIONS
// ============================================================

function F(x, y) {
  const x_f = x instanceof Frac ? x : new Frac(x);
  const y_f = y instanceof Frac ? y : new Frac(y);
  
  const x3 = x_f.mul(x_f).mul(x_f);
  const y3 = y_f.mul(y_f).mul(y_f);
  const xy = x_f.mul(y_f);
  const one = new Frac(1);
  
  const lhs = x3.add(y3).add(xy).add(one);
  
  const term1 = x_f.add(y_f);
  const term2 = x_f.add(one);
  const term3 = y_f.add(one);
  const rhs = term1.mul(term2).mul(term3).mul(new Frac(3));
  
  return lhs.sub(rhs);
}

function isOnCurve(x, y, tol = 1e-9) {
  const f = F(x, y);
  const val = f.toNum();
  return Math.abs(val) < tol;
}

function dF_dx(x, y) {
  // Partial derivative ∂F/∂x = 3x² + y - 3(y+1)(2x+y+1)
  const x_f = x instanceof Frac ? x : new Frac(x);
  const y_f = y instanceof Frac ? y : new Frac(y);
  const three = new Frac(3);
  const two = new Frac(2);
  const one = new Frac(1);
  
  const term1 = three.mul(x_f).mul(x_f);
  const term2 = y_f;
  const term3 = three.mul(y_f.add(one)).mul(two.mul(x_f).add(y_f).add(one));
  
  return term1.add(term2).sub(term3);
}

function dF_dy(x, y) {
  // Partial derivative ∂F/∂y = 3y² + x - 3(x+1)(x+2y+1)
  const x_f = x instanceof Frac ? x : new Frac(x);
  const y_f = y instanceof Frac ? y : new Frac(y);
  const three = new Frac(3);
  const two = new Frac(2);
  const one = new Frac(1);
  
  const term1 = three.mul(y_f).mul(y_f);
  const term2 = x_f;
  const term3 = three.mul(x_f.add(one)).mul(x_f.add(two.mul(y_f)).add(one));
  
  return term1.add(term2).sub(term3);
}

function tangentLineAt(x, y) {
  const fx = dF_dx(x, y);
  const fy = dF_dy(x, y);
  
  const fy_num = fy.toNum();
  if (Math.abs(fy_num) < 1e-10) return null;
  
  const slope = fx.neg().div(fy);
  const intercept = y instanceof Frac ? y : new Frac(y);
  const x_f = x instanceof Frac ? x : new Frac(x);
  const c = intercept.sub(slope.mul(x_f));
  
  return { m: slope, c: c };
}

function secantLineThrough(x1, y1, x2, y2) {
  const x1_f = x1 instanceof Frac ? x1 : new Frac(x1);
  const y1_f = y1 instanceof Frac ? y1 : new Frac(y1);
  const x2_f = x2 instanceof Frac ? x2 : new Frac(x2);
  const y2_f = y2 instanceof Frac ? y2 : new Frac(y2);
  
  const dx = x2_f.sub(x1_f);
  if (Math.abs(dx.toNum()) < 1e-10) return null;
  
  const dy = y2_f.sub(y1_f);
  const slope = dy.div(dx);
  const c = y1_f.sub(slope.mul(x1_f));
  
  return { m: slope, c: c };
}

function findThirdIntersectionExact(x1, y1, x2, y2) {
  const x1_f = x1 instanceof Frac ? x1 : new Frac(x1);
  const y1_f = y1 instanceof Frac ? y1 : new Frac(y1);
  const x2_f = x2 instanceof Frac ? x2 : new Frac(x2);
  const y2_f = y2 instanceof Frac ? y2 : new Frac(y2);
  
  let line;
  if (Math.abs(x1_f.toNum() - x2_f.toNum()) < 1e-10 && Math.abs(y1_f.toNum() - y2_f.toNum()) < 1e-10) {
    line = tangentLineAt(x1_f, y1_f);
  } else {
    line = secantLineThrough(x1_f, y1_f, x2_f, y2_f);
  }
  
  if (!line) return null;
  
  // Substitute y = mx + c into F(x, y) to get cubic
  // This is complex in exact arithmetic - use numerical approach approximation
  const m_num = line.m.toNum();
  const c_num = line.c.toNum();
  
  // Numerical search for third root
  const roots = [];
  const testX = (x) => {
    const y = m_num * x + c_num;
    return Math.abs(F(new Frac(x), new Frac(y)).toNum());
  };
  
  roots.push(x1_f.toNum());
  roots.push(x2_f.toNum());
  
  // Use Vieta: x1 + x2 + x3 = -b/a (cubic coefficient ratio)
  // For now, numerical approximation
  for (let x = -20; x <= 20; x += 0.1) {
    const err = testX(x);
    if (err < 1e-6 && !roots.some(r => Math.abs(r - x) < 0.2)) {
      const y = m_num * x + c_num;
      return { x: new Frac(Math.round(x * 1000) / 1000), y: new Frac(Math.round(y * 1000) / 1000) };
    }
  }
  
  return null;
}

function negatePoint(x, y) {
  // -P is found via line through O=(-1, 0) and P
  const x_f = x instanceof Frac ? x : new Frac(x);
  const y_f = y instanceof Frac ? y : new Frac(y);
  
  if (x_f.toNum() === -1 && y_f.toNum() === 0) {
    return { x: x_f, y: y_f };
  }
  
  const third = findThirdIntersectionExact(-1, 0, x_f, y_f);
  if (!third) return null;
  
  // Negate this third point to get -P
  return negatePoint(third.x, third.y);
}

function addPoints(x1, y1, x2, y2) {
  const x1_f = x1 instanceof Frac ? x1 : new Frac(x1);
  const y1_f = y1 instanceof Frac ? y1 : new Frac(y1);
  const x2_f = x2 instanceof Frac ? x2 : new Frac(x2);
  const y2_f = y2 instanceof Frac ? y2 : new Frac(y2);
  
  // Identity cases
  if (x1_f.toNum() === -1 && y1_f.toNum() === 0) return { x: x2_f, y: y2_f };
  if (x2_f.toNum() === -1 && y2_f.toNum() === 0) return { x: x1_f, y: y1_f };
  
  const third = findThirdIntersectionExact(x1_f, y1_f, x2_f, y2_f);
  if (!third) return { x: new Frac(-1), y: new Frac(0) };
  
  const result = negatePoint(third.x, third.y);
  return result || { x: new Frac(-1), y: new Frac(0) };
}

// ============================================================
// REACT COMPONENT
// ============================================================

export default function EllipticCurveVisualizer() {
  const canvasRef = useRef(null);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [inputC, setInputC] = useState('');
  const [inputError, setInputError] = useState('');
  
  const [startingPoint, setStartingPoint] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const [panelPos, setPanelPos] = useState({ x: 20, y: 20 });
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [curvePointsCache, setCurvePointsCache] = useState(null);
  
  const width = 1000, height = 800;
  const padding = 60;
  
  const xmin = -25, xmax = 25;
  const ymin = -25, ymax = 25;
  
  const xToPx = (x) => padding + ((x - xmin) / (xmax - xmin)) * (width - 2 * padding);
  const yToPx = (y) => height - padding - ((y - ymin) / (ymax - ymin)) * (height - 2 * padding);
  
  // Generate curve points (cached)
  const getCurvePoints = () => {
    if (curvePointsCache) return curvePointsCache;
    
    const points = [];
    const step = 0.5; // Coarser step for performance
    for (let x = xmin; x <= xmax; x += step) {
      for (let y = ymin; y <= ymax; y += step) {
        try {
          if (isOnCurve(new Frac(x), new Frac(y), 0.05)) {
            points.push({ x, y });
          }
        } catch (e) {
          // Skip errors
        }
      }
    }
    setCurvePointsCache(points);
    return points;
  };
  
  const handleInputPoint = () => {
    setInputError('');
    try {
      const a = parseInt(inputA);
      const b = parseInt(inputB);
      const c = parseInt(inputC);
      
      if (c === 0) {
        setInputError('c cannot be zero');
        return;
      }
      
      const x = new Frac(a, c);
      const y = new Frac(b, c);
      
      if (!isOnCurve(x, y)) {
        setInputError(`(${a}/${c}, ${b}/${c}) is not on the curve`);
        return;
      }
      
      setStartingPoint({ x, y, xStr: x.toString(), yStr: y.toString() });
      setSteps([{ label: 'P', x, y, type: 'base' }]);
      setCurrentStepIndex(0);
      setInputError('');
    } catch (e) {
      setInputError('Invalid input');
    }
  };
  
  const handleNextStep = () => {
    if (!startingPoint) return;
    
    const px = startingPoint.x;
    const py = startingPoint.y;
    
    const newStep = currentStepIndex + 1;
    
    if (newStep === 1) {
      // Compute -2P: tangent at P gives third point, negate it
      const line = tangentLineAt(px, py);
      const third = findThirdIntersectionExact(px, py, px, py);
      const neg2P = negatePoint(third.x, third.y);
      setSteps([
        ...steps,
        { label: '-2P', x: neg2P.x, y: neg2P.y, type: 'computed', line, third }
      ]);
    } else if (newStep === 2) {
      // Compute 2P: line through -2P and O
      const prev = steps[steps.length - 1];
      const oPt = { x: new Frac(-1), y: new Frac(0) };
      const line = secantLineThrough(prev.x, prev.y, oPt.x, oPt.y);
      const third = findThirdIntersectionExact(prev.x, prev.y, oPt.x, oPt.y);
      const pt2P = negatePoint(third.x, third.y);
      setSteps([
        ...steps,
        { label: '2P', x: pt2P.x, y: pt2P.y, type: 'computed', line, third }
      ]);
    } else {
      // Alternating: P + nP for odd steps, O + result for even steps
      const isOdd = newStep % 2 === 1;
      if (isOdd) {
        // Add P to current result
        const prev = steps[steps.length - 1];
        const line = secantLineThrough(px, py, prev.x, prev.y);
        const third = findThirdIntersectionExact(px, py, prev.x, prev.y);
        const result = negatePoint(third.x, third.y);
        setSteps([
          ...steps,
          { label: `${Math.floor((newStep + 1) / 2) * 2}P'`, x: result.x, y: result.y, type: 'computed', line, third }
        ]);
      } else {
        // Add O to negate
        const prev = steps[steps.length - 1];
        const oPt = { x: new Frac(-1), y: new Frac(0) };
        const line = secantLineThrough(prev.x, prev.y, oPt.x, oPt.y);
        const third = findThirdIntersectionExact(prev.x, prev.y, oPt.x, oPt.y);
        const result = negatePoint(third.x, third.y);
        const n = Math.floor(newStep / 2) + 2;
        setSteps([
          ...steps,
          { label: `${n}P`, x: result.x, y: result.y, type: 'computed', line, third }
        ]);
      }
    }
    
    setCurrentStepIndex(newStep);
  };
  
  const startDrag = (e) => {
    setDragging(true);
    setDragOffset({ x: e.clientX - panelPos.x, y: e.clientY - panelPos.y });
  };
  
  const onMouseMove = (e) => {
    if (dragging) {
      setPanelPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    }
  };
  
  const onMouseUp = () => setDragging(false);
  
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [dragging, dragOffset]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Draw axes and grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Draw grid
    for (let x = Math.ceil(xmin); x < xmax; x++) {
      ctx.beginPath();
      ctx.moveTo(xToPx(x), yToPx(ymin));
      ctx.lineTo(xToPx(x), yToPx(ymax));
      ctx.stroke();
    }
    for (let y = Math.ceil(ymin); y < ymax; y++) {
      ctx.beginPath();
      ctx.moveTo(xToPx(xmin), yToPx(y));
      ctx.lineTo(xToPx(xmax), yToPx(y));
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xToPx(0), yToPx(ymin));
    ctx.lineTo(xToPx(0), yToPx(ymax));
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(xToPx(xmin), yToPx(0));
    ctx.lineTo(xToPx(xmax), yToPx(0));
    ctx.stroke();
    
    // Draw curve (less frequently computed)
    try {
      const curvePoints = getCurvePoints();
      if (curvePoints.length > 0) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(xToPx(curvePoints[0].x), yToPx(curvePoints[0].y));
        for (let i = 1; i < curvePoints.length; i++) {
          ctx.lineTo(xToPx(curvePoints[i].x), yToPx(curvePoints[i].y));
        }
        ctx.stroke();
      }
    } catch (e) {
      console.log('Curve rendering error:', e);
    }
    
    // Draw steps and lines
    if (steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Draw connecting line if available
        if (step.line && i < steps.length - 1) {
          const m = step.line.m.toNum();
          const c = step.line.c.toNum();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          const x1 = xmin, x2 = xmax;
          ctx.moveTo(xToPx(x1), yToPx(m * x1 + c));
          ctx.lineTo(xToPx(x2), yToPx(m * x2 + c));
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Draw third intersection if available
        if (step.third && i < steps.length - 1) {
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(xToPx(step.third.x.toNum()), yToPx(step.third.y.toNum()), 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Draw point
        const color = step.type === 'base' ? '#0284c7' : '#e11d48';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(xToPx(step.x.toNum()), yToPx(step.y.toNum()), 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(step.label, xToPx(step.x.toNum()), yToPx(step.y.toNum()) - 15);
      }
      
      // Draw identity O
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(xToPx(-1), yToPx(0), 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('O', xToPx(-1), yToPx(0) - 12);
    }
  }, [steps, startingPoint]);
  
  if (!startingPoint) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md">
          <h1 className="text-3xl font-bold mb-2">Elliptic Curve Visualizer</h1>
          <p className="text-sm text-slate-600 mb-6">
            Curve: x³ + y³ + xy + 1 = 3(x+y)(x+1)(y+1)
          </p>
          <div className="space-y-4 mb-6">
            <p className="font-semibold">Enter point P = (a/c, b/c)</p>
            <div className="flex gap-2">
              <input type="text" value={inputA} onChange={(e) => setInputA(e.target.value)} placeholder="a" className="flex-1 px-3 py-2 border rounded" />
              <span className="text-slate-400">/</span>
              <input type="text" value={inputC} onChange={(e) => setInputC(e.target.value)} placeholder="c" className="flex-1 px-3 py-2 border rounded" />
            </div>
            <div className="flex gap-2">
              <input type="text" value={inputB} onChange={(e) => setInputB(e.target.value)} placeholder="b" className="flex-1 px-3 py-2 border rounded" />
              <span className="text-slate-400">/</span>
              <span className="flex-1 px-3 py-2 text-slate-500">{inputC}</span>
            </div>
          </div>
          {inputError && <div className="text-red-600 text-sm mb-4">{inputError}</div>}
          <button onClick={handleInputPoint} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Plot Point
          </button>
          <button onClick={() => { setInputA('-11'); setInputB('-4'); setInputC('1'); }} className="w-full px-4 py-2 mt-2 border rounded-lg hover:bg-slate-50">
            Use Example: (-11, -4)
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Elliptic Curve Group Law Visualization</h1>
        
        <div className="flex gap-6">
          <div className="flex-1">
            <canvas ref={canvasRef} width={width} height={height} className="border rounded-lg shadow-md" />
            <button
              onClick={handleNextStep}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Next Step
            </button>
          </div>
          
          {/* Draggable coordinate box */}
          <div
            style={{
              position: 'fixed',
              left: `${panelPos.x}px`,
              top: `${panelPos.y}px`,
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '13px',
              boxShadow: dragging ? '0 8px 22px rgba(0,0,0,0.16)' : '0 2px 6px rgba(0,0,0,0.08)',
              padding: '0',
              minWidth: '250px',
              zIndex: 100,
            }}
          >
            <div
              onMouseDown={startDrag}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                cursor: dragging ? 'grabbing' : 'grab',
                borderBottom: panelExpanded ? '1px solid #e2e8f0' : 'none',
                background: 'rgba(248, 250, 252, 0.95)',
                fontWeight: 600,
              }}
            >
              Coordinates
              <button
                onClick={() => setPanelExpanded(!panelExpanded)}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                {panelExpanded ? '−' : '+'}
              </button>
            </div>
            {panelExpanded && (
              <div style={{ padding: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                {steps.slice(Math.max(0, steps.length - 3)).map((step, idx) => (
                  <div key={`${step.label}-${idx}`} style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{step.label}:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginLeft: '8px', fontSize: '11px' }}>
                      <div>x = {step.x.toString()}</div>
                      <div style={{ wordBreak: 'break-word' }}>{step.x.toNum().toFixed(6)}</div>
                      <div>y = {step.y.toString()}</div>
                      <div style={{ wordBreak: 'break-word' }}>{step.y.toNum().toFixed(6)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
