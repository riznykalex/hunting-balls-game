// ball.js
export class Ball {
    constructor(id, x, y, radius, gameElement) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.gameElement = gameElement;

        // �������� �� ����
        this.vx = 0;
        this.vy = 0;

        // ��������� HTML-��������
        this.element = document.createElement("div");
        this.element.className = "ball";
        this.element.style.position = "absolute";
        this.element.style.width = `${this.radius * 2}px`;
        this.element.style.height = `${this.radius * 2}px`;
        this.element.style.borderRadius = "50%";
        this.element.style.background = "#3498db"; // �������� ����

        this.gameElement.appendChild(this.element);
        this.render();
    }

    // ����������� ������� �������
    render() {
        this.element.style.left = `${this.x - this.radius}px`;
        this.element.style.top = `${this.y - this.radius}px`;
    }

    // ��������� �������
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.render();
    }

    // ������ ��������
    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }

    // ��������� ���
    remove() {
        this.element.remove();
    }
}
