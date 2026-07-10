import { STORE } from '../constants/gameConstants.js';

const GRID_ORIGIN = 50;
const GRID_SCALE = 10;
const FLOOR_ITEM_MARGIN = 8;

export function isWallFurniture(type) {
  return type === 'prabowoPicture' || type === 'gibranPicture';
}

export function getStoreCoordinateBounds(storeSize, type = null) {
  const size = storeSize === 'large' ? STORE.UPGRADED_SIZE : STORE.BASE_SIZE;
  const margin = isWallFurniture(type) ? 0 : FLOOR_ITEM_MARGIN;
  const halfWidth = (size.width * GRID_SCALE) / 2;
  const halfDepth = (size.depth * GRID_SCALE) / 2;

  return {
    minX: GRID_ORIGIN - halfWidth + margin,
    maxX: GRID_ORIGIN + halfWidth - margin,
    minY: GRID_ORIGIN - halfDepth + margin,
    maxY: GRID_ORIGIN + halfDepth - margin,
  };
}

export function clampStorePosition(position, storeSize, type = null) {
  const bounds = getStoreCoordinateBounds(storeSize, type);

  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
  };
}
