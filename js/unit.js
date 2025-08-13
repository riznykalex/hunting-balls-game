// unit.js
import { moveEntity } from './movement.js';

export class Unit {
  constructor(id, x, y, energy, container, boundsWidth, boundsHeight) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.energy = energy;      // плаваюче число
    this.size = 30 + Math.max(0, this.energy) * 8; // в≥зуально залежить в≥д енерг≥њ
    this.speed = 70;           // п≥ксел≥/сек (регулюй)
    this.vx = 0;
    this.vy = 0;

    this.isMoving = false;
    this.isSleeping = false;
    this.isControlled = false; // поки що без контролера

    this.container = container;
    this.boundsWidth = boundsWidth;
    this.boundsHeight = boundsHeight;

    // DOM
    this.div = document.createElement('div');
    this.div.classList.add('ball');
    this.div.style.position = 'absolute';
    this.div.style.zIndex = 5;

    // показуЇмо енерг≥ю в середин≥
    this.div.textContent = this.energy.toFixed(2);

    // панель енерг≥њ
    this.energyBar = document.createElement('div');
    this.energyBar.classList.add('energy-bar');
    // наповненн€
    this.energyFill = document.createElement('div');
    this.energyFill.classList.add('energy-fill');
    this.energyBar.appendChild(this.energyFill);

    // додаЇмо в DOM
    this.container.appendChild(this.div);
    this.container.appendChild(this.energyBar);

    // початкове в≥дображенн€
    this.updatePosition();
    this.updateEnergyVisual();
  }

  updatePosition() {
    this.div.style.width = `${this.size}px`;
    this.div.style.height = `${this.size}px`;

    // позиц≥юЇмо елемент так, щоб x,y були верхн≥м л≥вим кутом
    this.div.style.left = `${this.x}px`;
    this.div.style.top  = `${this.y}px`;

    // енергобар п≥д кулькою
    this.energyBar.style.left = `${this.x}px`;
    this.energyBar.style.top  = `${this.y + this.size + 4}px`;
    this.energyBar.style.width = `${this.size}px`;
  }

  updateEnergyVisual() {
    const maxE = 6;
    const pct = Math.max(0, Math.min(1, this.energy / maxE));
    this.energyFill.style.width = `${(pct * 100).toFixed(1)}%`;
    if (this.energy <= 1) {
      this.energyFill.style.backgroundColor = '#ff3333';
    } else if (this.energy <= 3) {
      this.energyFill.style.backgroundColor = '#ffcc33';
    } else if (this.energy <= 5) {
      this.energyFill.style.backgroundColor = '#33cc33';
    } else {
      this.energyFill.style.backgroundColor = '#3399ff';
    }
    this.div.textContent = this.energy.toFixed(2);
  }

  // задати вектор руху (vx, vy в п≥ксел€х/сек)
  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.isMoving = (Math.hypot(vx,vy) > 0.001);
  }

  // зупинити
  stop() {
    this.vx = 0;
    this.vy = 0;
    this.isMoving = false;
  }

  // викликаЇтьс€ кожен кадр з dt у секундах
  // повертаЇ фактичну пройдену в≥дстань (п≥ксел≥)
  step(dt, energyCostPerPixel = 0.01, sleepRegenPerSec = 0.6, wakeEnergy = 2) {
    // €кщо п≥д контролем Ч контролер буде викликати setVelocity та/або update, поки що ≥гнор
    if (this.isControlled) {
      // контролер маЇ сам керувати юн≥том
    }

    // якщо спить -> реген
    if (this.isSleeping) {
      this.stop();
      this.energy += sleepRegenPerSec * dt;
      if (this.energy >= wakeEnergy) {
        this.energy = wakeEnergy;
        this.isSleeping = false;
      }
      this.size = 30 + Math.max(0, this.energy) * 8;
      this.updateEnergyVisual();
      this.updatePosition();
      return 0;
    }

    // якщо енерг≥€ впала нижче порогу Ч заснути
    if (this.energy < 1) {
      this.isSleeping = true;
      this.stop();
      this.size = 30 + Math.max(0, this.energy) * 8;
      this.updateEnergyVisual();
      this.updatePosition();
      return 0;
    }

    // €кщо рухаЇмос€ Ч перем≥стити ≥ списати енерг≥ю
    if (this.isMoving) {
      const dist = moveEntity(this, dt); // повертаЇ пройдену в≥дстань (п≥ксел≥)
      // варт≥сть руху
      const cost = dist * energyCostPerPixel;
      this.energy -= cost;
      if (this.energy < 0) this.energy = 0;

      this.size = 30 + Math.max(0, this.energy) * 8;
      this.updateEnergyVisual();
      this.updatePosition();

      if (this.energy <= 0) {
        this.isSleeping = true;
        this.stop();
      }
      return dist;
    } else {
      // стоњмо Ч пов≥льна регенерац≥€ (але лише €кщо >=1 ≥ < wakeEnergy)
      const regen = 0.08 * dt; // пов≥льно в≥дновлюЇтьс€, щоб не було "чудо-п≥дйом≥в"
      if (this.energy < 6) {
        this.energy = Math.min(6, this.energy + regen);
        this.size = 30 + Math.max(0, this.energy) * 8;
        this.updateEnergyVisual();
        this.updatePosition();
      }
      return 0;
    }
  }

  remove() {
    this.div.remove();
    this.energyBar.remove();
  }
}
