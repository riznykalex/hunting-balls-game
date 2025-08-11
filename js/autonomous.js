export function autonomousActions(balls, foods) {
  for (let b of balls) {
    if (b.isControlled) continue;

    if (b.isSleeping) {
      b.isMoving = false;
      b.vx = 0;
      b.vy = 0;
      b.power += 0.005;
      if (b.power >= 2) {
        b.power = 2;
        b.isSleeping = false;
      }
      b.size = 30 + b.power * 10;
      b.updatePosition();
      continue;
    }

    if (b.power < 1) {
      b.isSleeping = true;
      b.isMoving = false;
      b.vx = 0;
      b.vy = 0;
      b.size = 30 + b.power * 10;
      b.updatePosition();
      continue;
    }

    // Шукаємо їжу
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
      let dx = closestFood.x - b.x;
      let dy = closestFood.y - b.y;
      let dist = Math.hypot(dx, dy);
      b.vx = (dx / dist) * b.speed;
      b.vy = (dy / dist) * b.speed;
      b.isMoving = true;
    } else {
      // Шукаємо жертву
      let preyCandidate = null;
      let minDist = Infinity;
      for (let other of balls) {
        if (other === b || other.isControlled) continue;
        if (other.power < b.power) {
          let dist = Math.hypot(other.x - b.x, other.y - b.y);
          if (dist < minDist && dist < 400) {
            minDist = dist;
            preyCandidate = other;
          }
        }
      }

      if (preyCandidate) {
        let dx = preyCandidate.x - b.x;
        let dy = preyCandidate.y - b.y;
        let dist = Math.hypot(dx, dy);
        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed;
        b.isMoving = true;

        if (dist < 20) {
          const damage = 0.1;
          preyCandidate.power -= damage;
          b.power += damage;
          if (preyCandidate.power <= 0) {
            preyCandidate.div.remove();
            balls.splice(balls.indexOf(preyCandidate), 1);
          }
        }
      } else {
        b.vx = 0;
        b.vy = 0;
        b.isMoving = false;
      }
    }

    if (b.isMoving) {
      b.move(b.vx, b.vy);
      b.power -= Math.hypot(b.vx, b.vy) * 0.007;
      if (b.power < 0) b.power = 0;
      b.size = 30 + b.power * 10;
      b.updatePosition();

      if (b.power <= 0) {
        b.isMoving = false;
        b.isSleeping = true;
      }
    }
  }
}
