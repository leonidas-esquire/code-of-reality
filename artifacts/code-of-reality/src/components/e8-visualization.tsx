import { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  phase: number;
}

function generateE8Roots(): Point3D[] {
  const points: Point3D[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < 240; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / 240);
    const phi = Math.PI * 2 * i / goldenRatio;
    const r = 2;
    points.push({
      x: r * Math.sin(theta) * Math.cos(phi),
      y: r * Math.sin(theta) * Math.sin(phi),
      z: r * Math.cos(theta),
      phase: (i / 240) * Math.PI * 2,
    });
  }
  return points;
}

const ROOTS = generateE8Roots();

function project(x: number, y: number, z: number, fov: number, cx: number, cy: number) {
  const scale = fov / (fov + z + 3);
  return { sx: cx + x * scale * (cx * 0.55), sy: cy + y * scale * (cy * 0.55), scale };
}

export function E8Visualization({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      timeRef.current += 0.004;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const fov = w * 0.5;

      ctx.clearRect(0, 0, w, h);

      // Deep space background
      ctx.fillStyle = '#010206';
      ctx.fillRect(0, 0, w, h);

      // Stars
      const starSeed = 42;
      for (let i = 0; i < 120; i++) {
        const sx = ((Math.sin(i * 17.3 + starSeed) * 0.5 + 0.5) * w);
        const sy = ((Math.cos(i * 31.7 + starSeed) * 0.5 + 0.5) * h);
        const sa = 0.2 + Math.abs(Math.sin(i * 0.37 + t * 0.5)) * 0.5;
        const sr = 0.5 + Math.abs(Math.sin(i * 0.71)) * 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${sa})`;
        ctx.fill();
      }

      // Rotation matrices
      const cosY = Math.cos(t * 0.25);
      const sinY = Math.sin(t * 0.25);
      const cosZ = Math.cos(t * 0.12);
      const sinZ = Math.sin(t * 0.12);
      const cosX = Math.cos(t * 0.08);
      const sinX = Math.sin(t * 0.08);

      const pulse = 1 + Math.sin(t * 0.5) * 0.06;

      // Project and sort
      const projected = ROOTS.map((p) => {
        // Rotate Y
        let rx = p.x * cosY - p.z * sinY;
        let rz = p.x * sinY + p.z * cosY;
        let ry = p.y;
        // Rotate Z
        const rx2 = rx * cosZ - ry * sinZ;
        const ry2 = rx * sinZ + ry * cosZ;
        rx = rx2; ry = ry2;
        // Rotate X
        const ry3 = ry * cosX - rz * sinX;
        const rz2 = ry * sinX + rz * cosX;
        ry = ry3; rz = rz2;

        rx *= pulse; ry *= pulse; rz *= pulse;
        return { ...project(rx, ry, rz, fov, cx, cy), phase: p.phase, rz };
      });
      projected.sort((a, b) => a.rz - b.rz);

      // Draw edges between nearby points
      const edgeThreshold = (w / 400) * 1.4;
      ctx.lineWidth = 0.4 * devicePixelRatio;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dx = (a.sx - b.sx) / cx;
          const dy = (a.sy - b.sy) / cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < edgeThreshold * 0.35) {
            const alpha = (1 - dist / (edgeThreshold * 0.35)) * 0.15 * Math.min(a.scale, b.scale) * 3;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = `rgba(0,212,255,${Math.min(0.25, alpha)})`;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const pt of projected) {
        const brightness = 0.4 + pt.scale * 0.6;
        const r = pt.scale * 3.5 * devicePixelRatio;
        const hue = 195 + Math.sin(pt.phase + t) * 25;
        const glow = ctx.createRadialGradient(pt.sx, pt.sy, 0, pt.sx, pt.sy, r * 4);
        glow.addColorStop(0, `hsla(${hue},100%,80%,${brightness * 0.9})`);
        glow.addColorStop(0.4, `hsla(${hue},100%,60%,${brightness * 0.4})`);
        glow.addColorStop(1, `hsla(${hue},100%,50%,0)`);
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},100%,90%,${brightness})`;
        ctx.fill();
      }

      // Core glow sphere
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx * 0.28);
      coreGlow.addColorStop(0, `rgba(0,212,255,${0.04 + Math.sin(t) * 0.02})`);
      coreGlow.addColorStop(0.5, `rgba(0,100,200,0.02)`);
      coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, cx * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={className} style={{ width: '100%', height: '100%', background: '#010206' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
