export default class Food {
    constructor(x, y, size = 5, color = 'green') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }

    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}
