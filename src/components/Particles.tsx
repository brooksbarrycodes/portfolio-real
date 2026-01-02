import React, { useEffect, useMemo, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export type ParticlesProps = {
  enableMouse?: boolean;
  maxFps?: number;
  count?: number;
  color?: string;
  linkColor?: string;
  backgroundColor?: string;
  speed?: number;
  maxRadius?: number;
  minRadius?: number;
  linkDistance?: number;
  linkOpacity?: number;
  mouseRadius?: number;
  mouseForce?: number; // positive repels, negative attracts
  className?: string;
  style?: React.CSSProperties;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Particles({
  enableMouse = false,
  maxFps = 30,
  count = 90,
  color = 'rgba(233, 242, 242, 0.75)',
  linkColor = 'rgba(20, 76, 94, 0.35)',
  backgroundColor = 'transparent',
  speed = 0.25,
  minRadius = 1,
  maxRadius = 2.5,
  linkDistance = 150,
  linkOpacity = 0.35,
  mouseRadius = 180,
  mouseForce = 1.3,
  className,
  style,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 1, h: 1 });
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: minRadius + Math.random() * (maxRadius - minRadius),
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth ?? window.innerWidth;
      const h = parent?.clientHeight ?? window.innerHeight;
      sizeRef.current = { w, h };
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    // Listen on the window so clicks on CDs still work (canvas is non-interactive)
    if (enableMouse) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('mouseout', onMouseLeave);
    }

    let last = performance.now();
    let lastFrame = 0;
    const tick = (now: number) => {
      const minDt = 1000 / maxFps;
      if (document.visibilityState === 'hidden') {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (now - lastFrame < minDt) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;
      const dt = clamp((now - last) / 16.6667, 0.25, 2.5);
      last = now;

      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, w, h);
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mr2 = mouseRadius * mouseRadius;

      for (const p of particles) {
        const px = p.x * w;
        const py = p.y * h;

        const dx = px - mx;
        const dy = py - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < mr2) {
          const d = Math.max(12, Math.sqrt(d2));
          const f = (1 - d / mouseRadius) * mouseForce;
          p.vx += (dx / d) * f * 0.0025 * dt;
          p.vy += (dy / d) * f * 0.0025 * dt;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        if (p.y < -0.05) p.y = 1.05;
        if (p.y > 1.05) p.y = -0.05;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const ax = a.x * w;
        const ay = a.y * h;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const bx = b.x * w;
          const by = b.y * h;
          const dx = ax - bx;
          const dy = ay - by;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDistance) {
            const alpha = (1 - d / linkDistance) * linkOpacity;
            // cheap way to scale alpha on an rgba() string
            ctx.strokeStyle = linkColor.replace(/[\d.]+\)\s*$/, `${alpha})`);
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = color;
      for (const p of particles) {
        const x = p.x * w;
        const y = p.y * h;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      if (enableMouse) {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseout', onMouseLeave);
      }
      ro.disconnect();
    };
  }, [backgroundColor, color, linkColor, linkDistance, linkOpacity, maxRadius, minRadius, mouseForce, mouseRadius, particles, enableMouse, maxFps]);

  return <canvas ref={canvasRef} className={className} style={style} />;
}
