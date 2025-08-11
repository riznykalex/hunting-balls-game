// autonomous.js
export function autonomousActions(balls, groups, foods) {
  // Обробка кульок, які не в групах
  for (let b of balls) {
    if (!b.group) {
      if (b.power < 2) {
        // Спляча кулька: зупиняємо рух і відновлюємо енергію до 2
        b.isMoving = false;
        b.vx = 0;
        b.vy = 0;
        b.power += 0.005;
        if (b.power > 2) b.power = 2;

        b.size = 30 + b.power * 10;
        b.updatePosition();

        // Не робимо інші дії, поки не відновиться
        continue;
      }

      // Якщо енергія >=2 і кулька не рухається — запускаємо рух
      if (b.power >= 2 && !b.isMoving) {
        b.isMoving = true;
        b.vx = (Math.random() - 0.5) * b.speed;
        b.vy = (Math.random() - 0.5) * b.speed;
      }
    }
  }

  // Оновлення груп
  for (let i = groups.length - 1; i >= 0; i--) {
    let g = groups[i];

    // Якщо група не рухається — розпадаємо її
    if (!g.isMoving) {
      for (let m of g.members) {
        m.group = null;
        // Відновлення енергії у кожного члена групи (якщо треба)
        if (m.power < 2) {
          m.isMoving = false;
          m.vx = 0;
          m.vy = 0;
          m.power += 0.005;
          if (m.power > 2) m.power = 2;
          m.size = 30 + m.power * 10;
          m.updatePosition();
        } else {
          // Якщо енергія достатня — запускаємо рух індивідуального бенгла
          if (!m.isMoving) {
            m.isMoving = true;
            m.vx = (Math.random() - 0.5) * m.speed;
            m.vy = (Math.random() - 0.5) * m.speed;
          }
        }
      }
      groups.splice(i, 1);
      continue; // Переходимо до наступної групи
    }

    g.update(balls, foods);
  }

  // Логіка пошуку їжі та полювання для кульок, що не в групах та з достатньою енергією
  for (let b of balls) {
    if (!b.group && b.power >= 2) {
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
        b.prey = null;
        b.targetFood = closestFood;
        b.isMoving = true;
        let dx = closestFood.x - b.x;
        let dy = closestFood.y - b.y;
        let dist = Math.hypot(dx, dy);
        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed;
      } else {
        b.targetFood = null;
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
          b.vx = (dx / dist) * b.speed;
          b.vy = (dy / dist) * b.speed;
          b.isMoving = true;
        } else {
          b.isMoving = false;
          b.vx = 0;
          b.vy = 0;
          b.prey = null;
        }
      }
      b.update();
    }
  }
}
