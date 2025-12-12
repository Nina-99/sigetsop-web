import React, { useEffect, useRef, useState } from "react";

type Props = { src: string; onConfirm: (points: number[][]) => void };

export default function ImageCropper({ src, onConfirm }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [points, setPoints] = useState<number[][]>([]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
      draw();
    };
  }, [src]);

  function draw() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    // draw points
    ctx.fillStyle = "red";
    points.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function handleClick(e: React.MouseEvent) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    if (points.length < 4) setPoints((p) => [...p, [x, y]]);
    else alert("Ya seleccionaste 4 puntos");
    setTimeout(draw, 10);
  }

  function handleConfirm() {
    if (points.length !== 4) return alert("Selecciona 4 puntos");
    onConfirm(points);
  }

  function handleReset() {
    setPoints([]);
    setTimeout(draw, 10);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ maxWidth: "100%", border: "1px solid #ccc" }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleConfirm}>Confirmar puntos</button>
        <button onClick={handleReset} style={{ marginLeft: 8 }}>
          Reset
        </button>
        <p>
          Selecciona en orden: superior-izquierda, superior-derecha,
          inferior-derecha, inferior-izquierda
        </p>
      </div>
    </div>
  );
}
