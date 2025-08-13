// unit.js
import { moveEntity } from './movement.js';

export class Unit {
  constructor(id, x, y, energy, container, boundsWidth, boundsHeight) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.energy = energy;      // �������� �����
    this.size = 30 + Math.max(0, this.energy) * 8; // �������� �������� �� ����㳿
    this.speed = 70;           // �����/��� (�������)
    this.vx = 0;
    this.vy = 0;

    this.isMoving = false;
    this.isSleeping = false;
    this.isControlled = false; // ���� �� ��� ����������

    this.container = container;
    this.boundsWidth = boundsWidth;
    this.boundsHeight = boundsHeight;

    // DOM
    this.div = document.createElement('div');
    this.div.classList.add('ball');
    this.div.style.position = 'absolute';
    this.div.style.zIndex = 5;

    // �������� ������ � �������
    this.div.textContent = this.energy.toFixed(2);

    // ������ ����㳿
    this.energyBar = document.createElement('div');
    this.energyBar.classList.add('energy-bar');
    // ����������
    this.energyFill = document.createElement('div');
    this.energyFill.classList.add('energy-fill');
    this.energyBar.appendChild(this.energyFill);

    // ������ � DOM
    this.container.appendChild(this.div);
    this.container.appendChild(this.energyBar);

    // ��������� �����������
    this.updatePosition();
    this.updateEnergyVisual();
  }

  updatePosition() {
    this.div.style.width = `${this.size}px`;
    this.div.style.height = `${this.size}px`;

    // ���������� ������� ���, ��� x,y ���� ������ ���� �����
    this.div.style.left = `${this.x}px`;
    this.div.style.top  = `${this.y}px`;

    // ��������� �� �������
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

  // ������ ������ ���� (vx, vy � �������/���)
  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.isMoving = (Math.hypot(vx,vy) > 0.001);
  }

  // ��������
  stop() {
    this.vx = 0;
    this.vy = 0;
    this.isMoving = false;
  }

  // ����������� ����� ���� � dt � ��������
  // ������� �������� �������� ������� (�����)
  step(dt, energyCostPerPixel = 0.01, sleepRegenPerSec = 0.6, wakeEnergy = 2) {
    // ���� �� ��������� � ��������� ���� ��������� setVelocity ��/��� update, ���� �� �����
    if (this.isControlled) {
      // ��������� �� ��� �������� �����
    }

    // ���� ����� -> �����
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

    // ���� ������ ����� ����� ������ � �������
    if (this.energy < 1) {
      this.isSleeping = true;
      this.stop();
      this.size = 30 + Math.max(0, this.energy) * 8;
      this.updateEnergyVisual();
      this.updatePosition();
      return 0;
    }

    // ���� �������� � ���������� � ������� ������
    if (this.isMoving) {
      const dist = moveEntity(this, dt); // ������� �������� ������� (�����)
      // ������� ����
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
      // ����� � ������� ����������� (��� ���� ���� >=1 � < wakeEnergy)
      const regen = 0.08 * dt; // ������� ������������, ��� �� ���� "����-������"
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
