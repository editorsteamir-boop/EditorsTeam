export default function ResizeHandle({ onResize }) {
  return {
    startResize: (delta) => {
      if (onResize) onResize(delta);
    }
  };
}
