import { useMemo, useState } from "react";

export default function LayerManager({ initialLayers = [], onChange }) {
  const [layers, setLayers] = useState(initialLayers);
  const [activeId, setActiveId] = useState(null);

  const activeLayer = useMemo(
    () => layers.find((layer) => layer.id === activeId),
    [layers, activeId]
  );

  function addLayer(asset) {
    const layer = {
      id: `layer_${Date.now()}`,
      type: asset.type || "text_box",
      asset_id: asset.id,
      style_id: asset.style_id || null,
      x: 100,
      y: 100,
      scale: 1,
    };

    const next = [...layers, layer];
    setLayers(next);
    setActiveId(layer.id);
    onChange?.(next);
  }

  function updateLayer(id, changes) {
    const next = layers.map((layer) =>
      layer.id === id ? { ...layer, ...changes } : layer
    );

    setLayers(next);
    onChange?.(next);
  }

  function removeLayer(id) {
    const next = layers.filter((layer) => layer.id !== id);
    setLayers(next);
    setActiveId(null);
    onChange?.(next);
  }

  return {
    layers,
    activeLayer,
    setActiveId,
    addLayer,
    updateLayer,
    removeLayer,
  };
}
