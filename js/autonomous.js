// autonomous.js
export function autonomousActions(balls, groups, foods) {
  //  ульки, що не в груп≥
  for (let b of balls) {
    if (!b.group) {
      if (b.power < 1) {
        // —пл€ча кулька: зупин€Їмо рух ≥ в≥дновлюЇмо енерг≥ю до 2
        b.isMoving = false;
        b.vx = 0;
        b.vy = 0;
        b.power += 0.005;
        if (b.power > 2) b.power = 2;

        b.size = 30 + b.power * 10;
        b.updatePosition();

        continue;
      }

      // якщо енерг≥€ >= 1 ≥ кулька не рухаЇтьс€ Ч запускаЇмо рух
      if (b.power >= 1 && !b.isMoving) {
        b.isMoving = true;
        b.vx = (Math.random() - 0.5) * b.speed;
        b.vy = (Math.random() - 0.5) * b.speed;
      }
    }
  }

  // ќновленн€ груп
  for (let g of groups) {
    g.update(balls, foods);
  }

  // ≤ндив≥дуальн≥ кульки, що не в груп≥, полюванн€ ≥ пошук њж≥
  for (let b of balls) {
    if (!b.group && b.power >= 1) {
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
