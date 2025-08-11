export function autonomousActions(balls, groups, foods) {
  // ≤ндив≥дуальн≥ кульки
  for (let b of balls) {
    if (!b.group) {
      if (b.power >= 2) {
        if (!b.isMoving) {
          b.isMoving = true;
          b.vx = (Math.random() - 0.5) * b.speed;
          b.vy = (Math.random() - 0.5) * b.speed;
        }
      } else if (b.power < 1) {
        // —пить, поки не в≥дновитьс€ до 2
        b.isMoving = false;
        b.vx = 0;
        b.vy = 0;
      }
    }
  }

  // √рупи кульок
  for (let g of groups) {
    // –ухаЇмось та шукаЇмо њжу/жертву
    g.update(balls, foods);

    // якщо група не рухаЇтьс€ Ч розд≥л€Їмось
    if (!g.isMoving) {
      for (let m of g.members) {
        m.group = null;
      }
      groups.splice(groups.indexOf(g), 1);
    }
  }

  // ≤ндив≥дуальна повед≥нка кульок що не в групах
  for (let b of balls) {
    if (!b.group) {
      if (b.power < 1) {
        b.power += 0.005; // регенерац≥€ енерг≥њ п≥д час сну
        if (b.power > 2) b.power = 2; // в≥дновлюЇмось до 2 ≥ прокидаЇмось
      }

      if (b.power >= 2) {
        // якщо Ї њжа поблизу Ч рухаЇмось до нењ
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
          // якщо немаЇ њж≥ Ч шукаЇмо жертву слабшу кульку
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
      }
      b.update();
    }
  }
}
