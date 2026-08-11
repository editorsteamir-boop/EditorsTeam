export default function FontoExportHandler({ canvasElement, filename = 'fonto-export.png' }) {
  const exportPNG = () => {
    if (!canvasElement) return null;

    const dataUrl = canvasElement.toDataURL('image/png');

    return {
      filename,
      format: 'png',
      dataUrl,
    };
  };

  return {
    exportPNG,
  };
}
