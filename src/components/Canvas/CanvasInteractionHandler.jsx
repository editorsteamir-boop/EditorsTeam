import React from 'react';

export default function CanvasInteractionHandler({ layer, onMove, onSelect }) {
  const handlePointerMove = (event) => {
    if (!event.buttons) return;

    onMove?.(layer.id, {
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div
      onPointerDown={() => onSelect?.(layer.id)}
      onPointerMove={handlePointerMove}
      data-layer-id={layer.id}
    />
  );
}
