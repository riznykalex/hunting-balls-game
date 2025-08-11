export function autonomousActions(balls, foods) {
  const speedMultiplier = 2; // зб≥льшуЇмо крок руху

  for (let b of balls) {
    // якщо кулька спить Ч в≥дновлюЇмо енерг≥ю, рух заборонено
    if (b.isSleeping) {
      b.isMoving = false;
      b.vx = 0;
      b.vy = 0;

      b.power += 0.005; // швидк≥сть в≥дновленн€
      if (b.power >= 2) {
        b.power = 2;
        b.isSleeping = false; // прокинулась
      }
    }
    // якщо енерг≥€ впала нижче 1 Ч починаЇмо сон
    else if (b.power < 1) {
      b.isSleeping = true;
      b.isMoving = false;
      b.vx = 0;
      b.vy = 0;
    }
    else {
      // якщо кулька достатньо "прокинулась" ≥ не рухаЇтьс€ Ч даЇмо випадковий рух
      if (!b.isMoving) {
        b.isMoving = true;
        b.vx = (Math.random() - 0.5) * b.speed * speedMultiplier;
        b.vy = (Math.random() - 0.5) * b.speed * speedMultiplier;
      }

      // –ух кульки
      b.move(b.vx, b.vy);

      // ¬трачаЇмо енерг≥ю пропорц≥йно руху
      let distMoved = Math.hypot(b.vx, b.vy);
      b.power -= distMoved * 0.004; // зменшено втрату енерг≥њ
      if (b.power < 0) b.power = 0;

      // --- Ћог≥ка пошуку њж≥ ---
      let closestFood = null;
      let minFoodDist = Infinity;
      for (let food of foods) {
        let dist = Math.hypot(food.x - b.x, food.y - b.y);
        if (dist < 200 && dist < minFoodDist) {
          minFoodDist = dist;
          closestFood = food;
        }
      }

      if (closestFood) {
        b.targetFood = closestFood;
        let dx = closestFood.x - b.x;
        let dy = closestFood.y - b.y;
        let dist = Math.hypot(dx, dy);
        b.vx = (dx / dist) * b.speed * speedMultiplier;
        b.vy = (dy / dist) * b.speed * speedMultiplier;
        b.isMoving = true;
      } else {
        b.targetFood = null;
      }

      // --- Ћог≥ка поЇдинк≥в з ≥ншими кульками ---
      let preyCandidate = null;
      let minDist = Infinity;
      for (let other of balls) {
        if (other === b) continue;
        if (other.power < b.power) {
          let dist = Math.hypot(other.x - b.x, other.y - b.y);
          if (dist < minDist && dist < 400) {
            minDist = dist;
            preyCandidate = other;
          }
        }
      }

      if (preyCandidate) {
        b.prey = preyCandidate;
        let angle = Math.random() * 2 * Math.PI;
        let radius = 50 + Math.random() * 30;
        let targetX = preyCandidate.x + radius * Math.cos(angle);
        let targetY = preyCandidate.y + radius * Math.sin(angle);
        let dx = targetX - b.x;
        let dy = targetY - b.y;
        let dist = Math.hypot(dx, dy);
        b.vx = (dx / dist) * b.speed * speedMultiplier;
        b.vy = (dy / dist) * b.speed * speedMultiplier;
        b.isMoving = true;
      } else {
        b.prey = null;
      }
    }

    // ќновленн€ розм≥ру та позиц≥њ
    b.size = 30 + b.power * 10;
    b.updatePosition();
  }
}
