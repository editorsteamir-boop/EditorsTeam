import React from 'react';

export default function LayerRenderer({ layers = [], onSelect }) {
  return (
    <>
      {layers.map((layer) => (
        <div
          key={layer.id}
          onClick={() => onSelect?.(layer.id)}
          style={{
            position: 'absolute',
            left: layer.x || 0,
            top: layer.y || 0,
            transform: `scale(${layer.scale || 1})`,
            cursor: 'move'
          }}
        >
          {layer.image_url ? (
            <img src={layer.image_url} alt={layer.id} />
          ) : (
            <span>{layer.text || 'Fonto Layer'}</span>
          )}
        </div>
      ))}
    </>
  );
}
