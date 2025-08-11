// autonomous.js
export function autonomousUpdate(balls, foods, width, height) {
  for (let b of balls) {
    if (b.isSleeping) {
      // Відновлення енергії в сні
      b.power += 0.01;
      if (b.power >= 2) {
        b.power = 2;
        b.isSleeping = false; // прокидаємось
        // Випадковий напрямок після пробудження
        b.vx = (Math.random() - 0.5) * b.speed;
        b.vy = (Math.random() - 0.5) * b.speed;
        b.isMoving = true;
      }
      b.size = 30 + b.power * 10;
      b.updatePosition();
      continue; // кулька спить - не рухаємось далі
    }

    // Якщо рухаємось
    if (b.isMoving) {
      b.move(b.vx, b.vy);

      // Втрачаємо енергію пропорційно руху
      let distMoved = Math.hypot(b.vx, b.vy);
      b.power -= distMoved * 0.002; // зменшена вартість крока
      if (b.power < 0) b.power = 0;

      if (b.power < 1) {
        // Починаємо спати, коли енергія падає нижче 1
        b.isSleeping = true;
        b.isMoving = false;
        b.vx = 0;
        b.vy = 0;
      }
      b.size = 30 + b.power * 10;
      b.updatePosition();
      continue;
    }

    // Якщо не рухаємось і не спимо — намагаємось знайти їжу або жертву

    if (b.power >= 1) {
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
        b.isMoving = true;
        let dx = closestFood.x - b.x;
        let dy = closestFood.y - b.y;
        let dist = Math.hypot(dx, dy);
        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed;
        continue;
      } else {
        b.targetFood = null;
      }

      // Шукаємо жертву слабшу за себе
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
        // Підбігаємо не прямо, а трохи збоку
        let angle = Math.random() * 2 * Math.PI;
        let radius = 30 + Math.random() * 20;
        let targetX = preyCandidate.x + radius * Math.cos(angle);
        let targetY = preyCandidate.y + radius * Math.sin(angle);
        let dx = targetX - b.x;
        let dy = targetY - b.y;
        let dist = Math.hypot(dx, dy);
        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed;
        b.isMoving = true;
        continue;
      } else {
        b.prey = null;
      }
    } else {
      // Якщо енергія менша за 1 і не в сні, то починаємо спати
      b.isSleeping = true;
      b.isMoving = false;
      b.vx = 0;
      b.vy = 0;
    }
  }
}
