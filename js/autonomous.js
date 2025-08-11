// autonomous.js
export function autonomousActions(balls, foods, width, height) {
  // Функція для випадкового руху
  function randomMove(ball) {
    ball.vx = (Math.random() - 0.5) * ball.speed;
    ball.vy = (Math.random() - 0.5) * ball.speed;
    ball.isMoving = true;
  }

  // Обробка кожної кульки
  for (let b of balls) {
    if (b.power < 1) {
      // Сон: не рухаємось, відновлюємось до 2 енергії
      b.isMoving = false;
      b.vx = 0;
      b.vy = 0;
      b.power += 0.005;
      if (b.power > 2) b.power = 2;
      b.size = 30 + b.power * 10;
      b.updatePosition();
      continue;
    }

    // Якщо кулька рухається, то не спить і втрачає енергію
    if (b.isMoving) {
      let distMoved = Math.hypot(b.vx, b.vy);
      b.power -= distMoved * 0.0025; // Зменшений коефіцієнт для меншої втрати енергії
      if (b.power < 0) b.power = 0;
      b.size = 30 + b.power * 10;
      b.updatePosition();
    } else {
      // Якщо не рухається і power >= 1, то починаємо рухатися випадково
      randomMove(b);
    }

    // Шукаємо найближчу їжу
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
      b.prey = null;
      // Рух до їжі
      let dx = closestFood.x - b.x;
      let dy = closestFood.y - b.y;
      let dist = Math.hypot(dx, dy);
      b.vx = (dx / dist) * b.speed;
      b.vy = (dy / dist) * b.speed;
      b.isMoving = true;
    } else {
      b.targetFood = null;

      // Шукаємо жертву для поєдинку
      let preyCandidate = null;
      let minDist = Infinity;
      for (let other of balls) {
        if (other === b) continue;
        if (other.power < b.power) {
          let dist = Math.hypot(other.x - b.x, other.y - b.y);
          if (dist < minDist && dist < 300) {
            minDist = dist;
            preyCandidate = other;
          }
        }
      }

      if (preyCandidate) {
        b.prey = preyCandidate;
        // Рух до жертви
        let dx = preyCandidate.x - b.x;
        let dy = preyCandidate.y - b.y;
        let dist = Math.hypot(dx, dy);
        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed;
        b.isMoving = true;
      } else {
        b.prey = null;
        // Якщо ні їжі ні жертви, рухаємося випадково
        randomMove(b);
      }
    }

    b.update();
  }
}
