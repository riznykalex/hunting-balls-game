// food.js
export class Food {
  constructor(id, x, y, energy, container) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.energy = energy; // скільки додає
    this.size = 12;
    this.container = container;

    this.div = document.createElement('div');
    this.div.classList.add('food');
    this.div.style.left = `${this.x}px`;
    this.div.style.top  = `${this.y}px`;
    this.container.appendChild(this.div);
  }

  remove() {
    this.div.remove();
  }
}
