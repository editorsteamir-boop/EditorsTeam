import React, { useRef } from 'react';

export default function CanvasInteractionHandler({ layer, selected, onMove, onSelect }) {
  const start = useRef(null);

  const handlePointerDown = (event) => {
    onSelect?.(layer.id);
    start.current = {
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!selected || !start.current || event.buttons === 0) return;

    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;

    onMove?.(layer.id, {
      x: dx,
      y: dy,
    });

    start.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerUp = () => {
    start.current = null;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      data-layer-id={layer.id}
    />
  );
}
