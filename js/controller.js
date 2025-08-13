// controller.js
// ��������� � ���� ���� ���� (������ ��� ��)

export default class Controller {
    constructor(unit, type = 'ai') {
        this.unit = unit; // ��������� �� ��������� ���
        this.type = type; // 'player' ��� 'ai'
        this.target = null; // ���� ��� ���� �� �����
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
        // ��� �� ������ ��������� ��������� ��� ����
        // ���������, ��� �� ��������
        // this.unit.moveTo(mouseX, mouseY);
    }

    handleAI(environment) {
        if (!this.target) {
            // ������� ��������� ���
            const foods = environment.getFoods();
            if (foods.length > 0) {
                this.target = this.findNearest(foods);
            }
        }

        if (this.target) {
            this.unit.moveTowards(this.target.position);

            // ���� �� ��� �� � 璿���
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
