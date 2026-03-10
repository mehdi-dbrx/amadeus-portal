import { useEffect, useRef } from 'react';

/**
 * Canvas animated background inspired by airops-landing.html.
 * Renders behind all content (fixed, z-0). Does not change existing layout or design.
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const c = canvas;
    const ctx2 = ctx;

    let W = 0;
    let H = 0;
    let t = 0;
    let animId: number;

    const PLANE_SPACING = 420;
    const planes = [
      { x: -100, y: 0, speed: 0.35, scale: 0.88, arc: 0.14, startY: 0.72, opacity: 0.5 },
      { x: -100 - PLANE_SPACING, y: 0, speed: 0.28, scale: 0.75, arc: -0.1, startY: 0.82, opacity: 0.45 },
      { x: -100 - PLANE_SPACING * 2, y: 0, speed: 0.42, scale: 0.92, arc: 0.12, startY: 0.65, opacity: 0.52 },
      { x: -100 - PLANE_SPACING * 3, y: 0, speed: 0.25, scale: 0.68, arc: -0.08, startY: 0.78, opacity: 0.4 },
      { x: -100 - PLANE_SPACING * 4, y: 0, speed: 0.38, scale: 0.85, arc: 0.1, startY: 0.88, opacity: 0.48 },
      { x: -100 - PLANE_SPACING * 5, y: 0, speed: 0.32, scale: 0.78, arc: -0.15, startY: 0.7, opacity: 0.42 },
    ];

    const particles = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
      r: Math.random() * 1.2 + 0.8,
    }));

    const trails: { x: number; y: number }[][] = planes.map(() => []);

    function resize() {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
      planes[0].startY = H * 0.72;
      planes[1].startY = H * 0.82;
      planes[2].startY = H * 0.65;
      planes[3].startY = H * 0.78;
      planes[4].startY = H * 0.88;
      planes[5].startY = H * 0.7;
    }

    function drawPlane(
      cx: number,
      cy: number,
      scale: number,
      opacity: number,
      angle: number,
      isDark: boolean
    ) {
      ctx2.save();
      ctx2.translate(cx, cy);
      ctx2.rotate(angle);
      ctx2.scale(scale, scale);
      ctx2.globalAlpha = opacity;

      const fuselage = isDark ? 'rgba(0,220,255,0.9)' : 'rgba(14,116,144,0.85)';
      const wing = isDark ? 'rgba(0,180,255,0.75)' : 'rgba(2,132,199,0.7)';
      const tail = isDark ? 'rgba(0,240,255,0.6)' : 'rgba(7,89,133,0.75)';
      const glowStart = isDark ? 'rgba(0,240,255,0.25)' : 'rgba(14,165,233,0.15)';
      const glowEnd = isDark ? 'rgba(0,240,255,0)' : 'rgba(14,165,233,0)';

      ctx2.beginPath();
      ctx2.moveTo(40, 0);
      ctx2.bezierCurveTo(20, -4, -30, -5, -42, -3);
      ctx2.bezierCurveTo(-30, -5, -30, 5, -42, 3);
      ctx2.bezierCurveTo(-30, 5, 20, 4, 40, 0);
      ctx2.fillStyle = fuselage;
      ctx2.fill();

      ctx2.beginPath();
      ctx2.moveTo(5, -2);
      ctx2.lineTo(-10, -32);
      ctx2.lineTo(-28, -28);
      ctx2.lineTo(-22, -2);
      ctx2.closePath();
      ctx2.fillStyle = wing;
      ctx2.fill();

      ctx2.beginPath();
      ctx2.moveTo(5, 2);
      ctx2.lineTo(-10, 32);
      ctx2.lineTo(-28, 28);
      ctx2.lineTo(-22, 2);
      ctx2.closePath();
      ctx2.fill();

      ctx2.beginPath();
      ctx2.moveTo(-32, -2);
      ctx2.lineTo(-42, -16);
      ctx2.lineTo(-44, -2);
      ctx2.closePath();
      ctx2.fillStyle = tail;
      ctx2.fill();

      const grd = ctx2.createRadialGradient(10, 0, 2, 10, 0, 38);
      grd.addColorStop(0, glowStart);
      grd.addColorStop(1, glowEnd);
      ctx2.beginPath();
      ctx2.arc(10, 0, 38, 0, Math.PI * 2);
      ctx2.fillStyle = grd;
      ctx2.fill();

      ctx2.restore();
    }

    function drawFractalTri(
      x: number,
      y: number,
      size: number,
      depth: number,
      alpha: number,
      isDark: boolean
    ) {
      if (depth === 0 || size < 3) return;
      const h = size * 0.866;

      ctx2.globalAlpha = isDark ? alpha : alpha * 0.2;
      const g = 160 + depth * 18;
      const b = 220 + depth * 10;
      const a = isDark ? 0.06 + depth * 0.025 : 0.04 + depth * 0.01;
      ctx2.strokeStyle = `rgba(0,${g},${b},${a})`;
      ctx2.lineWidth = 0.5;
      ctx2.beginPath();
      ctx2.moveTo(x, y - h * 0.667);
      ctx2.lineTo(x - size / 2, y + h * 0.333);
      ctx2.lineTo(x + size / 2, y + h * 0.333);
      ctx2.closePath();
      ctx2.stroke();

      const half = size / 2;
      const qh = h / 2;
      drawFractalTri(x, y - h * 0.667 + qh * 0.667, half, depth - 1, alpha * 0.88, isDark);
      drawFractalTri(x - half / 2 - half * 0.25, y + h * 0.333 - qh * 0.333, half, depth - 1, alpha * 0.88, isDark);
      drawFractalTri(x + half / 2 + half * 0.25, y + h * 0.333 - qh * 0.333, half, depth - 1, alpha * 0.88, isDark);
    }

    function drawHexGrid(isDark: boolean) {
      const r = 38;
      const cols = Math.ceil(W / (r * 1.73)) + 2;
      const rows = Math.ceil(H / (r * 1.5)) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * r * 1.732 + (row % 2) * r * 0.866;
          const cy = row * r * 1.5;
          const pulse = Math.sin(t * 0.6 + cx * 0.008 + cy * 0.006) * 0.5 + 0.5;
          ctx2.globalAlpha = isDark ? 0.025 + pulse * 0.035 : 0.015 + pulse * 0.02;
          const g = 140 + pulse * 80;
          const b = 200 + pulse * 55;
          ctx2.strokeStyle = isDark ? `rgba(0,${g},${b},1)` : `rgba(56,189,248,${0.25 + pulse * 0.15})`;
          ctx2.lineWidth = 0.6;
          ctx2.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const px = cx + r * Math.cos(a);
            const py = cy + r * Math.sin(a);
            i === 0 ? ctx2.moveTo(px, py) : ctx2.lineTo(px, py);
          }
          ctx2.closePath();
          ctx2.stroke();
        }
      }
    }

    const NET_LINK_DISTANCE = 200;
    const NET_LINK_MAX_ALPHA_DARK = 0.45;
    const NET_LINK_MAX_ALPHA_LIGHT = 0.28;

    function drawParticles(isDark: boolean) {
      const pointColor = isDark ? '#00f5ff' : '#0284c7';
      const pointGlow = isDark ? 'rgba(0, 245, 255, 0.6)' : 'rgba(14, 165, 233, 0.4)';
      const linkMaxAlpha = isDark ? NET_LINK_MAX_ALPHA_DARK : NET_LINK_MAX_ALPHA_LIGHT;

      const coords = particles.map((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
        return { x: p.x * W, y: p.y * H, r: p.r };
      });

      for (let i = 0; i < coords.length; i++) {
        const a = coords[i];
        for (let j = i + 1; j < coords.length; j++) {
          const b = coords[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < NET_LINK_DISTANCE) {
            const alpha = (1 - dist / NET_LINK_DISTANCE) * linkMaxAlpha;
            ctx2.globalAlpha = alpha;
            ctx2.strokeStyle = pointColor;
            ctx2.lineWidth = isDark ? 1.2 : 1;
            ctx2.beginPath();
            ctx2.moveTo(a.x, a.y);
            ctx2.lineTo(b.x, b.y);
            ctx2.stroke();
          }
        }
      }

      for (const { x: px, y: py, r } of coords) {
        ctx2.globalAlpha = isDark ? 0.95 : 0.85;
        ctx2.shadowColor = pointGlow;
        ctx2.shadowBlur = isDark ? 8 : 6;
        ctx2.fillStyle = pointColor;
        ctx2.beginPath();
        ctx2.arc(px, py, r, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.shadowBlur = 0;
      }
    }

    function drawTrail(trail: { x: number; y: number }[], isDark: boolean) {
      if (trail.length < 2) return;
      const color = isDark ? '#0af0ff' : 'rgba(2, 132, 199, 0.5)';
      for (let i = 1; i < trail.length; i++) {
        const alpha = (i / trail.length) * (isDark ? 0.35 : 0.25);
        ctx2.globalAlpha = alpha;
        ctx2.strokeStyle = color;
        ctx2.lineWidth = 1;
        ctx2.beginPath();
        ctx2.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx2.lineTo(trail[i].x, trail[i].y);
        ctx2.stroke();
      }
    }

    function frame() {
      t += 0.012;
      const isDark = document.documentElement.classList.contains('dark');

      ctx2.clearRect(0, 0, W, H);

      const bgGrad = ctx2.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, W * 0.75);
      if (isDark) {
        bgGrad.addColorStop(0, '#071428');
        bgGrad.addColorStop(1, '#04080f');
      } else {
        bgGrad.addColorStop(0, '#e0f2fe');
        bgGrad.addColorStop(0.6, '#f0f9ff');
        bgGrad.addColorStop(1, '#f8fafc');
      }
      ctx2.globalAlpha = 1;
      ctx2.fillStyle = bgGrad;
      ctx2.fillRect(0, 0, W, H);

      drawHexGrid(isDark);

      const seeds: [number, number, number][] = [
        [W * 0.12, H * 0.22, 200],
        [W * 0.82, H * 0.15, 160],
        [W * 0.65, H * 0.78, 180],
        [W * 0.08, H * 0.75, 140],
        [W * 0.92, H * 0.62, 120],
      ];
      for (const [fx, fy, fs] of seeds) {
        const pulse = Math.sin(t * 0.4 + fx * 0.003) * 0.12 + 0.88;
        drawFractalTri(fx, fy, fs * pulse, 4, 0.9, isDark);
      }

      drawParticles(isDark);

      for (let i = 0; i < planes.length; i++) {
        const pl = planes[i];
        pl.x += pl.speed;
        if (pl.x > W + 120) {
          pl.x = -120 - i * PLANE_SPACING;
          trails[i] = [];
        }

        const progress = pl.x / W;
        const arcY = pl.startY + Math.sin(progress * Math.PI) * H * pl.arc;
        const angle = Math.cos(progress * Math.PI) * pl.arc * 1.2;

        trails[i].push({ x: pl.x, y: arcY });
        if (trails[i].length > 80) trails[i].shift();

        drawTrail(trails[i], isDark);
        drawPlane(pl.x, arcY, pl.scale, pl.opacity, angle, isDark);
      }

      ctx2.globalAlpha = 1;
      animId = requestAnimationFrame(frame);
    }

    const onResize = () => {
      resize();
    };
    window.addEventListener('resize', onResize);
    resize();
    frame();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-full w-full opacity-90 dark:opacity-[0.85]"
      aria-hidden
    />
  );
}
