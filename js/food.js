export class Food {
  constructor(id, x, y, energy, gameContainer) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.energy = energy;
    this.size = 12;
    this.gameContainer = gameContainer;

    this.div = document.createElement('div');
    this.div.classList.add('food');
    this.div.style.width = this.size + 'px';
    this.div.style.height = this.size + 'px';
    this.div.style.left = this.x + 'px';
    this.div.style.top = this.y + 'px';

    this.div.style.backgroundColor = energy === 0.1 ? '#ffcc00' : energy === 0.2 ? '#ffaa00' : '#ff8800';
    this.div.style.border = '1px solid #bb6600';

    this.gameContainer.appendChild(this.div);
  }

  remove() {
    this.div.remove();
  }
}
