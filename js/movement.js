// movement.js
export function moveEntity(entity, dx, dy, boundsWidth, boundsHeight) {
  entity.x += dx;
  entity.y += dy;

  // Обмеження по екрану
  entity.x = Math.min(Math.max(0, entity.x), boundsWidth - entity.size);
  entity.y = Math.min(Math.max(0, entity.y), boundsHeight - entity.size);

  if (entity.updatePosition) {
    entity.updatePosition();
  }
}
