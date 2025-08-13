export default class Unit {
    constructor(x, y, size = 10, color = 'blue') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.energy = 100;
    }

    update() {
        // Енергоспоживання
        this.energy -= 0.05;
        if (this.energy < 0) this.energy = 0;
    }

    render(ctx) {
        // Малюємо кулю
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Малюємо енергію над кулею
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.floor(this.energy), this.x, this.y - this.size - 2);
    }
}
