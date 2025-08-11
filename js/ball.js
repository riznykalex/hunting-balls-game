import { moveEntity } from './movement.js';

export class Ball {
  constructor(id, x, y, power, gameContainer, width, height) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.power = power; // 1..6
    this.size = 30 + this.power * 10;
    this.speed = 1.5;
    this.isMoving = false;
    this.vx = 0;
    this.vy = 0;
    this.prey = null;
    this.targetFood = null;
    this.group = null;

    this.width = width;
    this.height = height;
    this.gameContainer = gameContainer;

    this.div = document.createElement('div');
    this.div.classList.add('ball');

    this.energyText = document.createElement('span');
    this.energyText.style.userSelect = 'none';
    this.energyText.style.pointerEvents = 'none';
    this.energyText.style.fontSize = '12px';
    this.energyText.style.fontWeight = 'bold';
    this.energyText.style.color = 'white';
    this.energyText.style.position = 'absolute';
    this.energyText.style.top = '50%';
    this.energyText.style.left = '50%';
    this.energyText.style.transform = 'translate(-50%, -50%)';
    this.energyText.style.whiteSpace = 'nowrap';

    this.div.appendChild(this.energyText);
    this.gameContainer.appendChild(this.div);

    this.energyBar = document.createElement('div');
    this.energyBar.classList.add('energy-bar');
    this.gameContainer.appendChild(this.energyBar);

    this.energyFill = document.createElement('div');
    this.energyFill.classList.add('energy-fill');
    this.energyBar.appendChild(this.energyFill);

    this.updatePosition();
    this.updateEnergyBar();
  }

  updateEnergyBar() {
    let maxPower = 6;
    let pct = Math.min(this.power / maxPower, 1);
    this.energyFill.style.width = (pct * 100) + '%';

    if (this.power <= 1) {
      this.energyFill.style.backgroundColor = '#ff3333';
    } else if (this.power <= 3) {
      this.energyFill.style.backgroundColor = '#ffcc33';
    } else if (this.power <= 5) {
      this.energyFill.style.backgroundColor = '#33cc33';
    } else {
      this.energyFill.style.backgroundColor = '#3399ff';
    }

    this.energyText.textContent = this.power.toFixed(2);
  }

  updatePosition() {
    this.div.style.width = this.size + 'px';
    this.div.style.height = this.size + 'px';
    this.div.style.left = this.x + 'px';
    this.div.style.top = this.y + 'px';

    this.energyBar.style.width = this.size + 'px';
    this.energyBar.style.left = this.x + 'px';
    this.energyBar.style.top = (this.y + this.size + 2) + 'px';

    this.updateEnergyBar();
  }

  move(dx, dy) {
    moveEntity(this, dx, dy, this.width, this.height);
  }

  update() {
    if (this.isMoving) {
      this.move(this.vx, this.vy);
      let distMoved = Math.hypot(this.vx, this.vy);
      this.power -= distMoved * 0.007;
      if (this.power < 0) this.power = 0;
    } else {
      this.power += 0.001;
      if (this.power > 6) this.power = 6;
    }

    this.size = 30 + this.power * 10;
    this.updatePosition();
  }
}
