export const createLayer = (asset) => ({
  id: `layer_${Date.now()}`,
  type: asset.type || 'text_box',
  asset_id: asset.id,
  style_id: asset.style_id || null,
  x: 100,
  y: 100,
  scale: 1
});

export const addLayer = (layers, asset) => [
  ...layers,
  createLayer(asset)
];
