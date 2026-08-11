import React from "react";

export default function FontoDragDropHandler({ asset, onApply }) {
  function handleDrop(e) {
    e.preventDefault();
    if (asset && onApply) {
      onApply({
        id: asset.id,
        type: asset.type,
        url: asset.image_url,
        style: asset.effects_json || {},
        position: { x: 100, y: 100 }
      });
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("fonto-asset", JSON.stringify(asset));
      }}
      onDrop={handleDrop}
    >
      {asset?.name || "Fonto Asset"}
    </div>
  );
}
