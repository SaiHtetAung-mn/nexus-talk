import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const resolvedRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + resolvedRadius, y);
  context.arcTo(x + width, y, x + width, y + height, resolvedRadius);
  context.arcTo(x + width, y + height, x, y + height, resolvedRadius);
  context.arcTo(x, y + height, x, y, resolvedRadius);
  context.arcTo(x, y, x + width, y, resolvedRadius);
  context.closePath();
}

function drawMessageBubble(
  context: CanvasRenderingContext2D,
  position: Point,
  width: number,
  color: string,
  lines: number[],
  progress: number,
) {
  const height = 38 + lines.length * 12;
  context.save();
  context.globalAlpha = progress;
  context.translate(0, (1 - progress) * 10);

  roundedRect(context, position.x, position.y, width, height, 16);
  context.fillStyle = color;
  context.fill();

  lines.forEach((lineWidth, index) => {
    roundedRect(
      context,
      position.x + 18,
      position.y + 18 + index * 16,
      lineWidth,
      6,
      3,
    );
    context.fillStyle = color === "#0f172a" ? "#ffffff" : "#94a3b8";
    context.globalAlpha = progress * 0.7;
    context.fill();
    context.globalAlpha = progress;
  });

  context.restore();
}

function drawTypingIndicator(
  context: CanvasRenderingContext2D,
  time: number,
  x: number,
  y: number,
) {
  roundedRect(context, x, y, 78, 38, 18);
  context.fillStyle = "#f1f5f9";
  context.fill();

  for (let index = 0; index < 3; index += 1) {
    const pulse = Math.sin(time * 0.008 + index * 0.8) * 0.5 + 0.5;
    context.beginPath();
    context.arc(x + 25 + index * 15, y + 19 - pulse * 3, 4, 0, Math.PI * 2);
    context.fillStyle = "#64748b";
    context.globalAlpha = 0.45 + pulse * 0.45;
    context.fill();
  }

  context.globalAlpha = 1;
}

function drawScene(context: CanvasRenderingContext2D, time: number) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  const scaleX = width / 560;
  const scaleY = height / 420;

  context.save();
  context.scale(scaleX, scaleY);
  context.clearRect(0, 0, 560, 420);

  const float = Math.sin(time * 0.0018) * 5;
  const blink = Math.sin(time * 0.004) > 0.94;
  const replyProgress = Math.min(1, Math.max(0, (Math.sin(time * 0.0012) + 1) / 1.4));

  context.fillStyle = "#f8fafc";
  roundedRect(context, 54, 36, 452, 340, 28);
  context.fill();

  context.strokeStyle = "#e2e8f0";
  context.lineWidth = 1;
  context.stroke();

  context.fillStyle = "#e2e8f0";
  roundedRect(context, 154, 70, 252, 22, 11);
  context.fill();

  drawMessageBubble(context, { x: 120, y: 122 }, 196, "#f1f5f9", [112, 148], 1);
  drawMessageBubble(
    context,
    { x: 244, y: 202 },
    194,
    "#0f172a",
    [118, 92],
    0.9 + replyProgress * 0.1,
  );
  drawTypingIndicator(context, time, 122, 288);

  context.save();
  context.translate(274, 326 + float);

  context.fillStyle = "#0f172a";
  roundedRect(context, -82, -20, 164, 92, 32);
  context.fill();

  context.fillStyle = "#cbd5e1";
  roundedRect(context, -56, 28, 112, 70, 26);
  context.fill();

  context.fillStyle = "#f8d5bd";
  context.beginPath();
  context.arc(0, -56, 44, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#111827";
  context.beginPath();
  context.arc(0, -72, 46, Math.PI, Math.PI * 2);
  context.fill();
  roundedRect(context, -45, -82, 90, 42, 24);
  context.fill();

  context.fillStyle = "#0f172a";
  context.beginPath();
  context.arc(-16, -54, blink ? 1 : 3, 0, Math.PI * 2);
  context.arc(16, -54, blink ? 1 : 3, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#9f6b53";
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, -42, 11, 0.15, Math.PI - 0.15);
  context.stroke();

  context.fillStyle = "#111827";
  roundedRect(context, 42, -12, 64, 104, 14);
  context.fill();

  context.fillStyle = "#f8fafc";
  roundedRect(context, 48, -2, 52, 84, 10);
  context.fill();

  context.fillStyle = "#e2e8f0";
  roundedRect(context, 58, 12, 32, 6, 3);
  context.fill();
  roundedRect(context, 58, 28, 26 + replyProgress * 12, 6, 3);
  context.fill();
  roundedRect(context, 58, 44, 34, 6, 3);
  context.fill();

  context.fillStyle = "#f8d5bd";
  context.beginPath();
  context.ellipse(38, 58, 24, 13, 0.2, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(90, 72, 20, 11, -0.2, 0, Math.PI * 2);
  context.fill();

  context.restore();

  context.restore();
}

export function MessagingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const activeCanvas = canvas;
    const drawingContext = context;
    let animationFrame = 0;
    let reducedMotion = false;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function resize() {
      const rect = activeCanvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      activeCanvas.width = Math.max(1, Math.floor(rect.width * pixelRatio));
      activeCanvas.height = Math.max(1, Math.floor(rect.height * pixelRatio));
    }

    function render(time: number) {
      drawScene(drawingContext, reducedMotion ? 0 : time);
      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function handleMotionPreferenceChange() {
      reducedMotion = mediaQuery.matches;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(render);
    }

    resize();
    handleMotionPreferenceChange();
    window.addEventListener("resize", resize);
    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full min-h-[360px] w-full"
      aria-label="Animated illustration of a person messaging"
      role="img"
    />
  );
}
