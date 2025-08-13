// controller.js
// Контролер — керує діями юнітів (гравця або ІІ)

export default class Controller {
    constructor(unit, type = 'ai') {
        this.unit = unit; // посилання на керований юніт
        this.type = type; // 'player' або 'ai'
        this.target = null; // ціль для руху чи атаки
    }

    setTarget(target) {
        this.target = target;
    }

    clearTarget() {
        this.target = null;
    }

    update(environment) {
        if (this.type === 'player') {
            this.handlePlayerInput();
        } else {
            this.handleAI(environment);
        }
    }

    handlePlayerInput() {
        // Тут ми можемо прив’язати клавіатуру або мишу
        // Наприклад, рух за курсором
        // this.unit.moveTo(mouseX, mouseY);
    }

    handleAI(environment) {
        if (!this.target) {
            // Вибрати найближчу їжу
            const foods = environment.getFoods();
            if (foods.length > 0) {
                this.target = this.findNearest(foods);
            }
        }

        if (this.target) {
            this.unit.moveTowards(this.target.position);

            // Якщо ми біля їжі — з’їсти
            const dist = this.unit.distanceTo(this.target.position);
            if (dist < this.unit.size) {
                environment.consume(this.target);
                this.target = null;
            }
        }
    }

    findNearest(objects) {
        let nearest = null;
        let minDist = Infinity;
        for (let obj of objects) {
            const dist = this.unit.distanceTo(obj.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = obj;
            }
        }
        return nearest;
    }
}
