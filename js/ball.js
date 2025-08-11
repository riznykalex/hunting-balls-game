export class Ball {
  constructor(id, x, y, power, game, width, height) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.power = power;
    this.size = 30 + power * 10;
    this.speed = 2;
    this.isMoving = false;
    this.isControlled = false;
    this.isSleeping = false;
    this.vx = 0;
    this.vy = 0;
    this.game = game;
    this.width = width;
    this.height = height;

    this.div = document.createElement('div');
    this.div.classList.add('ball');
    this.div.style.position = 'absolute';
    this.updatePosition();
    this.game.appendChild(this.div);
  }

  move(vx, vy) {
    this.x += vx;
    this.y += vy;

    // обмеження по межах вікна
    this.x = Math.max(0, Math.min(this.x, this.width - this.size));
    this.y = Math.max(0, Math.min(this.y, this.height - this.size));

    this.updatePosition();
  }

  updatePosition() {
    this.div.style.width = this.size + 'px';
    this.div.style.height = this.size + 'px';
    this.div.style.left = this.x + 'px';
    this.div.style.top = this.y + 'px';
  }
}
