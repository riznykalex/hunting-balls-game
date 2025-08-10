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
    if (this.totalPower() < this.members.length) { // якщо середня сила менша 1, відпочиваємо
      this.isMoving = false;
      this.vx = 0;
      this.vy = 0;
      this.prey = null;
      this.targetFood = null;
      return;
    }

    // Шукаємо їжу поруч (радіус 200)
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

    // Якщо їжі немає — шукаємо слабшого ворога (кульку або іншу групу)
    let preyCandidate = null;
    let minDist = Infinity;

    // Перевірка індивідуальних кульок (не в групах)
    for (let b of balls) {
      if (this.members.includes(b)) continue; // не полюємо на себе
      if (b.group) continue; // пропускаємо кульки в інших групах (щоб полювати на групи, треба інша логіка)
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
    } else {
      // Рух випадковий для активності
      this.isMoving = false;
      this.vx = 0;
      this.vy = 0;
      this.prey = null;
      return;
    }

    // Цільові координати для руху
    let targetX = this.prey.x;
    let targetY = this.prey.y;

    let dx = targetX - this.centerX;
    let dy = targetY - this.centerY;
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
  }

  move() {
    if (!this.isMoving) return;
    this.updateCenter();

    for (let i = 0; i < this.members.length; i++) {
      let m = this.members[i];
      // Зсув по колу для візуалізації "липкості"
      let angle = (2 * Math.PI / this.members.length) * i;
      let offsetRadius = 20;
      let targetX = this.centerX + offsetRadius * Math.cos(angle) - m.size / 2;
      let targetY = this.centerY + offsetRadius * Math.sin(angle) - m.size / 2;

      // Вектор руху для даного учасника
      let dx = this.vx;
      let dy = this.vy;

      // Оновлюємо позицію кульки
      m.move(dx, dy);
      // Примусово ставимо близько до цілі (щоб не розбігались)
      if (Math.abs(m.x - targetX) > 4) m.x = targetX;
      if (Math.abs(m.y - targetY) > 4) m.y = targetY;

      // Втрата енергії пропорційна руху
      let distMoved = Math.hypot(dx, dy);
      m.power -= distMoved * 0.007;
      if (m.power < 0) m.power = 0;

      m.size = 30 + m.power * 10;
      m.updatePosition();
    }
    this.updateCenter();
  }
}
