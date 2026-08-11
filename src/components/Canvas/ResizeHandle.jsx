export default function ResizeHandle({ layer, onResize }) {
  const handleResize = (event) => {
    const width = Math.max(20, event.clientX - layer.x);
    const height = Math.max(20, event.clientY - layer.y);
    if (onResize) onResize(layer.id, { width, height });
  };

  return {
    id: layer.id,
    startResize: handleResize,
    width: layer.width || 100,
    height: layer.height || 100,
  };
}
