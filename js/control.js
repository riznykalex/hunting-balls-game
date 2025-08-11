//control.js

export class Controller {
  constructor(balls, gameContainer, controlTimeout = 20000) {
    this.balls = balls;
    this.game = gameContainer;
    this.selectedBall = null;
    this.lastCommandTime = 0;
    this.controlTimeout = controlTimeout;

    this.init();
  }

  init() {
    this.game.addEventListener('click', (e) => this.handleClick(e));
  }

  handleClick(e) {
    const cx = e.clientX;
    const cy = e.clientY;

    if (!this.selectedBall) {
      // Перший клік - вибрати кульку
      for (let b of this.balls) {
        const bx = b.x + b.size / 2;
        const by = b.y + b.size / 2;
        const dist = Math.hypot(cx - bx, cy - by);
        if (dist < b.size / 2) {
          if (this.selectedBall) this.selectedBall.div.classList.remove('selected');
          this.selectedBall = b;
          this.selectedBall.div.classList.add('selected');
          this.selectedBall.isControlled = false;
          this.lastCommandTime = Date.now();
          break;
        }
      }
    } else {
      // Другий клік - задати вектор руху
      const dx = cx - (this.selectedBall.x + this.selectedBall.size / 2);
      const dy = cy - (this.selectedBall.y + this.selectedBall.size / 2);
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        this.selectedBall.vx = (dx / dist) * this.selectedBall.speed;
        this.selectedBall.vy = (dy / dist) * this.selectedBall.speed;
        this.selectedBall.isMoving = true;
        this.selectedBall.isControlled = true;
        this.selectedBall.targetFood = null;
        this.selectedBall.prey = null;
        this.lastCommandTime = Date.now();
      }
    }
  }

  update() {
    const now = Date.now();

    if (this.selectedBall && this.selectedBall.isControlled) {
      if (now - this.lastCommandTime > this.controlTimeout) {
        // Таймаут керування - скидаємо контроль
        this.selectedBall.isControlled = false;
        this.selectedBall.isMoving = false;
        this.selectedBall.vx = 0;
        this.selectedBall.vy = 0;
        this.selectedBall.div.classList.remove('selected');
        this.selectedBall = null;
      } else {
        // Рух кульки під контролем
        this.selectedBall.move(this.selectedBall.vx, this.selectedBall.vy);

        // Втрата енергії під час руху
        let distMoved = Math.hypot(this.selectedBall.vx, this.selectedBall.vy);
        this.selectedBall.power -= distMoved * 0.004;
        if (this.selectedBall.power < 0) this.selectedBall.power = 0;

        this.selectedBall.size = 30 + this.selectedBall.power * 10;
        this.selectedBall.updatePosition();

        // Пропускаємо інші автоматичні дії для цієї кульки
      }
    }
  }
}
