// movement.js
export function moveEntity(entity, dx, dy, boundsWidth, boundsHeight, options = {}) {
  const { energyLossRate = 0.007, energyRegenRate = 0.001, maxEnergy = 6 } = options;

  if (dx !== 0 || dy !== 0) {
    // Рух
    entity.x += dx;
    entity.y += dy;

    // Обмеження по екрану
    entity.x = Math.min(Math.max(0, entity.x), boundsWidth - entity.size);
    entity.y = Math.min(Math.max(0, entity.y), boundsHeight - entity.size);

    // Витрата енергії при русі
    let distMoved = Math.hypot(dx, dy);
    entity.power -= distMoved * energyLossRate;
    if (entity.power < 0) entity.power = 0;
  } else {
    // Регенерація енергії, якщо стоїмо
    entity.power += energyRegenRate;
    if (entity.power > maxEnergy) entity.power = maxEnergy;
  }

  // Оновлення розміру залежно від енергії
  entity.size = 30 + entity.power * 10;

  // Оновлення позиції на екрані, якщо є метод
  if (entity.updatePosition) {
    entity.updatePosition();
  }
}
