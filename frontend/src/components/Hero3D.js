import { useEffect, useRef } from "react";

export default function Hero3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 150;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.offsetWidth;
        this.y = Math.random() * canvas.offsetHeight;
        this.z = Math.random() * 400;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.vz = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 2 + 1;
        this.isCyan = Math.random() > 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        if (this.x < 0 || this.x > canvas.offsetWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.offsetHeight) this.vy *= -1;
        if (this.z < 0 || this.z > 400) this.vz *= -1;
      }
      draw() {
        const perspective = 400 / (400 + this.z);
        const sx = this.x * perspective + (canvas.offsetWidth * (1 - perspective)) / 2;
        const sy = this.y * perspective + (canvas.offsetHeight * (1 - perspective)) / 2;
        const r = this.radius * perspective;
        const alpha = 0.3 + perspective * 0.7;
        const color = this.isCyan ? `rgba(6, 182, 212, ${alpha})` : `rgba(16, 185, 129, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, r + 3, 0, Math.PI * 2);
        ctx.fillStyle = this.isCyan ? `rgba(6, 182, 212, ${alpha * 0.15})` : `rgba(16, 185, 129, ${alpha * 0.15})`;
        ctx.fill();
        return { sx, sy, perspective };
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const projected = particles.map((p) => { p.update(); return { ...p.draw(), particle: p }; });
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].sx - projected[j].sx;
          const dy = projected[i].sy - projected[j].sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(projected[i].sx, projected[i].sy);
            ctx.lineTo(projected[j].sx, projected[j].sy);
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      style={{ width: "100%", height: "100%" }}
      data-testid="hero-3d-canvas"
    />
  );
}
