// movement.js
// Відповідальний за переміщення в межах кордонів і повернення фактично пройденої відстані.

export function moveEntity(entity, dt) {
  // entity: має vx, vy (пікселі / сек), x, y, size, width, height
  // dt: seconds
  const dx = entity.vx * dt;
  const dy = entity.vy * dt;

  let nextX = entity.x + dx;
  let nextY = entity.y + dy;

  // обмеження по межах (розміщуємо так, щоб елемент був повністю в полі)
  const minX = 0;
  const minY = 0;
  const maxX = Math.max(0, entity.boundsWidth - entity.size);
  const maxY = Math.max(0, entity.boundsHeight - entity.size);

  // підрізаємо координати
  if (nextX < minX) nextX = minX;
  if (nextX > maxX) nextX = maxX;
  if (nextY < minY) nextY = minY;
  if (nextY > maxY) nextY = maxY;

  const actualDx = nextX - entity.x;
  const actualDy = nextY - entity.y;
  const dist = Math.hypot(actualDx, actualDy);

  entity.x = nextX;
  entity.y = nextY;

  // оновлює візуально (якщо є метод)
  if (entity.updatePosition) entity.updatePosition();

  return dist;
}

// невелика допоміжна функція для нормалізації вектора і множення на швидкість
export function vectorToVelocity(srcX, srcY, dstX, dstY, speed) {
  const dx = dstX - srcX;
  const dy = dstY - srcY;
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-6) return { vx: 0, vy: 0, dist: 0 };
  return { vx: (dx / dist) * speed, vy: (dy / dist) * speed, dist };
}
