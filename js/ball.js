// ball.js
export class Ball {
    constructor(id, x, y, power, gameElement, width, height) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.power = power; // наприклад, впливає на швидкість або розмір
        this.gameElement = gameElement;
        this.width = width || 30;
        this.height = height || 30;
        this.speedX = 0;
        this.speedY = 0;

        // Створення HTML-елемента
        this.element = document.createElement("div");
        this.element.className = "ball";
        this.element.style.position = "absolute";
        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
        this.element.style.borderRadius = "50%";
        this.element.style.background = this.getRandomColor();

        // Додаємо на поле
        this.gameElement.appendChild(this.element);

        // Початкове відображення
        this.render();
    }

    // Випадковий колір
    getRandomColor() {
        const colors = ["red", "blue", "green", "orange", "purple", "pink"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Відображення позиції
    render() {
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
    }

    // Оновлення руху
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.render();
    }

    // Задати напрямок руху
    setDirection(dx, dy) {
        this.speedX = dx;
        this.speedY = dy;
    }

    // Видалення з гри
    remove() {
        this.element.remove();
    }
}
