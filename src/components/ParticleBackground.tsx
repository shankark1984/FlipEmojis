import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  active?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  currentStreak?: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  alphaChange: number;
  color: string;
  angle: number;
  angleSpeed: number;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  active = true,
  currentStreak = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference or headless environment
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const isHeadless = Boolean(
      (navigator as unknown as { webdriver?: boolean }).webdriver ||
      /HeadlessChrome/i.test(navigator.userAgent)
    );

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palette based on theme and streak
    const getColors = () => {
      if (currentStreak >= 3) {
        // High streak: warm energetic embers
        return [
          'rgba(245, 158, 11, ', // Amber
          'rgba(249, 115, 22, ', // Orange
          'rgba(239, 68, 68, ',  // Red
          'rgba(251, 191, 36, ', // Gold
        ];
      }
      // Standard atmospheric: dreamy stardust & mystic emoji embers
      return [
        'rgba(245, 158, 11, ',  // Soft Amber
        'rgba(168, 85, 247, ',  // Soft Violet
        'rgba(59, 130, 246, ',  // Celestial Blue
        'rgba(16, 185, 129, ',  // Emerald Glow
        'rgba(251, 191, 36, ',  // Pale Gold
      ];
    };

    const colors = getColors();
    const particleCount = isHeadless ? 15 : Math.min(45, Math.floor((width * height) / 25000));

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: (Math.random() * 0.35 + 0.1) * -1, // gentle upward drift
        speedX: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.4 + 0.1,
        alphaChange: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    // Static render for reduced motion or headless testing
    if (prefersReducedMotion || isHeadless) {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha * 0.5})`;
        ctx.fill();
      });
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // Smooth animation loop
    let lastTime = performance.now();
    const render = (time: number) => {
      // Throttle slightly to ensure ultra-smooth 40-60fps with low CPU
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY * (dt * 60);
        p.angle += p.angleSpeed * (dt * 60);
        p.x += Math.sin(p.angle) * 0.4 + p.speedX * (dt * 60);

        p.alpha += p.alphaChange;
        if (p.alpha <= 0.08 || p.alpha >= 0.45) {
          p.alphaChange = -p.alphaChange;
        }

        // Wrap around edges
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw particle with gentle glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
        gradient.addColorStop(0, `${p.color}${p.alpha})`);
        gradient.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core bright center
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.min(1, p.alpha * 1.8)})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, currentStreak]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
};
