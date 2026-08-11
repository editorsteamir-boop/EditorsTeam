export default function FontoExportHandler({ canvasElement }) {
  const exportPNG = () => {
    if (!canvasElement) return null;

    return canvasElement.toDataURL('image/png');
  };

  return {
    exportPNG,
  };
}
