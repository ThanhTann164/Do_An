import React, { useEffect, useRef } from 'react';

const MiniChart = ({ data, color = '#3b82f6', height = 60 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height: canvasHeight } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Calculate dimensions
    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = canvasHeight - padding * 2;

    // Find min and max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Calculate points
    const points = data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((d.value - minValue) / valueRange) * chartHeight
    }));

    // Draw gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '10');

    // Draw area
    ctx.beginPath();
    ctx.moveTo(points[0].x, canvasHeight - padding);
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, canvasHeight - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw points
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

  }, [data, color]);

  // Generate sample data if none provided
  const sampleData = data || Array.from({ length: 7 }, (_, i) => ({
    value: Math.random() * 100 + 20,
    label: `Day ${i + 1}`
  }));

  return (
    <div className="mini-chart" style={{ width: '100%', height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        width={200}
        height={height}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default MiniChart;




