import React, { useRef, useState, useEffect } from "react";
import classes from "./WriteBoard.module.css"
const WriteBoard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [eraserMode, setEraserMode] = useState(false);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (eraserMode) {
      ctx.strokeStyle = "#FFFFFF"; // Set eraser color to white
    } else {
      ctx.strokeStyle = brushColor;
    }
    ctx.lineWidth = brushSize;
  }, [brushColor, brushSize, eraserMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach((line) => {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.size;
      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      ctx.stroke();
    });
  }, [lines]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    setLines((prevLines) => [
      ...prevLines,
      {
        color: eraserMode ? "#FFFFFF" : brushColor,
        size: brushSize,
        points: [{ x: offsetX, y: offsetY }],
      },
    ]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const { offsetX, offsetY } = e.nativeEvent;
    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];
      const newPoints = [...lastLine.points, { x: offsetX, y: offsetY }];
      return [...prevLines.slice(0, -1), { ...lastLine, points: newPoints }];
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setLines((prevLines) => prevLines.slice(0, -1));
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setLines([]);
  };

  const toggleEraserMode = () => {
    setEraserMode((prevMode) => !prevMode);
  };

  return (
    <div className={classes.Whiteboard}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div>
        <label>Color:</label>
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
        />
        <label>Brush Size:</label>
        <input
          type="number"
          value={brushSize.toString()}
          min="1"
          max="20"
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
        />
      </div>
      <div>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleClear}>Clear</button>
        <button onClick={toggleEraserMode}>
          {eraserMode ? "Use Brush" : "Use Eraser"}
        </button>
      </div>
    </div>
  );
};

export default WriteBoard;
