"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    const initNodes = () => {
      const nodeCount = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 50);
      nodesRef.current = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 1,
      }));
    };

    const drawNode = (node: Node, opacity: number = 1) => {
      if (!ctx) return;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3);
      gradient.addColorStop(0, `rgba(0, 255, 136, ${opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(0, 255, 209, ${opacity * 0})`);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.fillStyle = `rgba(0, 255, 136, ${opacity * 0.6})`;
      ctx.fill();
    };

    const drawConnection = (n1: Node, n2: Node, distance: number, maxDistance: number) => {
      if (!ctx) return;
      const opacity = (1 - distance / maxDistance) * 0.15;
      
      const gradient = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
      gradient.addColorStop(0, `rgba(0, 255, 209, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(0, 255, 136, ${opacity * 1.2})`);
      gradient.addColorStop(1, `rgba(0, 255, 209, ${opacity})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const maxDistance = 150;
      const nodes = nodesRef.current;

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse < 200) {
          node.vx += dx * 0.00005;
          node.vy += dy * 0.00005;
        }

        node.vx *= 0.99;
        node.vy *= 0.99;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            drawConnection(nodes[i], nodes[j], distance, maxDistance);
          }
        }
      }

      nodes.forEach((node) => {
        const pulse = Math.sin(Date.now() * 0.001 + node.x * 0.01) * 0.3 + 0.7;
        drawNode(node, pulse);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: "radial-gradient(ellipse at center, rgba(0, 31, 31, 0.4) 0%, rgba(0, 0, 0, 0.95) 100%)",
        opacity: 0.6,
      }}
    />
  );
}
