"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

const COLORS = ["#3b82f6", "#fbbf24", "#10b981", "#f43f5e", "#8b5cf6", "#f97316"];
const PARTICLE_COUNT = 80;

function makeParticle(canvasW: number): Particle {
  return {
    x: canvasW * 0.3 + Math.random() * canvasW * 0.4,
    y: -10,
    vx: (Math.random() - 0.5) * 6,
    vy: 2 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    alpha: 1,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
  };
}

interface ConfettiProps {
  /** Fire the burst when this becomes true. */
  active: boolean;
}

/**
 * Self-contained canvas confetti burst — no external dependencies.
 * Renders a 300×300 canvas absolutely positioned at the top of its
 * nearest positioned ancestor. Unmounts automatically when done.
 */
export function Confetti({ active }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () =>
      makeParticle(W),
    );

    function tick() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.alpha -= 0.008;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) continue;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      const alive = particles.some((p) => p.alpha > 0 && p.y < canvas.height + 20);
      if (alive) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-10"
      aria-hidden="true"
    />
  );
}
