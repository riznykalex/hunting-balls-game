import { moveEntity } from './movement.js';

export class Group {
  constructor(id, members) {
    this.id = id;
    this.members = members; // Масив кульок
    this.isMoving = false;
    this.vx = 0;
    this.vy = 0;
    this.prey = null;
    this.targetFood = null;
    this.speed = 1.5;

    this.centerX = 0;
    this.centerY = 0;

    this.updateCenter();
  }

  updateCenter() {
    if (this.members.length === 0) {
      this.centerX = 0;
      this.centerY = 0;
      return;
    }
    let sumX = 0;
    let sumY = 0;
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
    if (this.members.length === 0) return 0;
    return this.totalPower() / this.members.length;
  }

  autonomousHunt(balls, foods) {
    if (this.averagePower() < 1) {
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
        this.isMoving = false;
      }
      return;
    } else {
      this.targetFood = null;
    }

    // Шукаємо жертву
    let preyCandidate = null;
    let minDist = Infinity;
    for (let b of balls) {
      if (this.members.includes(b)) continue;
      if (b.group) continue;
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

      // Витрати енергії на рух (приблизно)
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

    // Якщо швидкість дуже мала — зупиняємо рух
    if (Math.abs(this.vx) < 0.01 && Math.abs(this.vy) < 0.01) {
      this.isMoving = false;
      this.vx = 0;
      this.vy = 0;
      return;
    }

    // Переміщаємо кожного члена групи на vx, vy з врахуванням меж екрану
    for (let m of this.members) {
      moveEntity(m, this.vx, this.vy, m.width, m.height);

      // Витрачаємо енергію пропорційно руху
      let distMoved = Math.hypot(this.vx, this.vy);
      m.power -= distMoved * 0.007;
      if (m.power < 0) m.power = 0;

      // Розмір залежить від енергії
      m.size = 30 + m.power * 10;
      m.updatePosition();

      // Відновлення енергії якщо кулька спокійна і не рухається
      if (!this.isMoving && m.power < 6) {
        m.power += 0.002; // трохи повільніше ніж в індивідуальних
        if (m.power > 6) m.power = 6;
      }
    }
  }

  update(balls, foods) {
    this.autonomousHunt(balls, foods);
    if (this.isMoving) {
      this.move();
    }
  }
}
