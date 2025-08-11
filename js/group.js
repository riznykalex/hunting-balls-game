import { moveEntity } from './movement.js';

export class Group {
  constructor(id, members) {
    this.id = id;
    this.members = members; // масив Ball
    this.vx = 0;
    this.vy = 0;
    this.speed = 1.2;
    this.isMoving = false;
    this.prey = null;
    this.targetFood = null;
    this.updateCenter();
  }

  updateCenter() {
    if (this.members.length === 0) return;
    let sumX = 0, sumY = 0;
    for (let m of this.members) {
      sumX += m.x + m.size / 2;
      sumY += m.y + m.size / 2;
    }
    this.centerX = sumX / this.members.length;
    this.centerY = sumY / this.members.length;
  }

  totalPower() {
    return this.members.reduce((sum, m) => sum + m.power, 0);
  }

  averagePower() {
    return this.totalPower() / this.members.length;
  }

  autonomousHunt(balls, foods) {
    if (this.averagePower() < 1) { // відпочиваємо, якщо сила дуже мала
      this.isMoving = false;
      this.vx = 0;
      this.vy = 0;
      this.prey = null;
      this.targetFood = null;
      return;
    }

    // Шукаємо найближчу їжу
    let closestFood = null;
    let minFoodDist = Infinity;
    for (let food of foods) {
      let dist = Math.hypot(food.x - this.centerX, food.y - this.centerY);
      if (dist < 200 && dist < minFoodDist) {
        minFoodDist = dist;
        closestFood = food;
      }
    }

    if (closestFood) {
      this.prey = null;
      this.targetFood = closestFood;
      this.isMoving = true;

      let dx = closestFood.x - this.centerX;
      let dy = closestFood.y - this.centerY;
      let dist = Math.hypot(dx, dy);
      if (dist > 1) {
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
      return;
    } else {
      this.targetFood = null;
    }

    // Шукаємо жертву (окрему кульку, не в групі)
    let preyCandidate = null;
    let minDist = Infinity;
    for (let b of balls) {
      if (this.members.includes(b)) continue; // не полюємо на себе
      if (b.group) continue; // пропускаємо кульки в інших групах
      if (b.power < this.averagePower()) {
        let dist = Math.hypot(b.x - this.centerX, b.y - this.centerY);
        if (dist < minDist && dist < 400) {
          minDist = dist;
          preyCandidate = b;
        }
      }
    }

    if (preyCandidate) {
      this.prey = preyCandidate;

      let dx = preyCandidate.x - this.centerX;
      let dy = preyCandidate.y - this.centerY;
      let dist = Math.hypot(dx, dy);

      let energyNeeded = dist * 0.005;
      if (this.totalPower() >= energyNeeded) {
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
        this.isMoving = true;
      } else {
        this.isMoving = false;
        this.vx = 0;
        this.vy = 0;
      }
    } else {
      this.isMoving = false;
      this.vx = 0;
      this.vy = 0;
      this.prey = null;
    }
  }

  move() {
    if (!this.isMoving) return;
    this.updateCenter();

    // Функція для плавного наближення (lerp)
    const lerp = (start, end, t) => start + (end - start) * t;

    for (let i = 0; i < this.members.length; i++) {
      let m = this.members[i];

      // Визначаємо цільову позицію кульки по колу навколо центру групи
      let angle = (2 * Math.PI / this.members.length) * i;
      let offsetRadius = 20;
      let targetX = this.centerX + offsetRadius * Math.cos(angle) - m.size / 2;
      let targetY = this.centerY + offsetRadius * Math.sin(angle) - m.size / 2;

      // Рухаємо кульку в напрямку руху групи через moveEntity (врахуємо витрату/регена енергії)
      moveEntity(m, this.vx, this.vy, m.width, m.height);

      // Плавно наближаємо кульку до цільової позиції
      m.x = lerp(m.x, targetX, 0.1);
      m.y = lerp(m.y, targetY, 0.1);

      // Оновлюємо розмір та позицію після зміни координат
      m.size = 30 + m.power * 10;
      m.updatePosition();
    }

    this.updateCenter();
  }

  update(balls, foods) {
    this.autonomousHunt(balls, foods);
    this.move();
  }
}
