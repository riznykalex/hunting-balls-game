// food.js
export class Food {
  constructor(x, y, radius = 5, color = 'green') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
