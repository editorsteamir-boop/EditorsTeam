export default function StyleApplier({ layer, style, onApply }) {
  if (!layer || !style) return null;

  const applyStyle = () => {
    const updatedLayer = {
      ...layer,
      style_id: style.id,
      effects: style.effects_json || {},
      font: style.font || layer.font,
      color: style.color || layer.color,
    };

    if (onApply) onApply(updatedLayer);
  };

  return {
    applyStyle,
  };
}
