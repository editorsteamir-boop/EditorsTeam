export function createProjectSnapshot(layers = []) {
  return {
    version: 1,
    layers,
    updatedAt: new Date().toISOString()
  };
}

export function restoreProject(snapshot) {
  if (!snapshot) return { layers: [] };
  return {
    layers: snapshot.layers || []
  };
}
