export function autonomousActions(balls, foods) {
  const fightCooldown = new Map(); // ��� ������������� ��� �������� �������� ������

  // ��������� �� ������
  for (let b of balls) {
    // ���� ������ ����� 1 � ������ ����� � ��������
    if (b.power < 1) {
      b.isMoving = false;
      b.vx = 0;
      b.vy = 0;
      b.power += 0.005;
      if (b.power > 2) b.power = 2;
      b.update();
      continue;
    }

    // ���� ������ �������� � ��������� ������� �� �������� ������
    if (b.isMoving) {
      b.update();
      // ������ ����㳿 ��� ���
      let distMoved = Math.hypot(b.vx, b.vy);
      b.power -= distMoved * 0.002;
      if (b.power < 0) b.power = 0;
    } else {
      // ������ ������ ���� ������ ���, ���������� ���
      b.isMoving = true;
      b.vx = (Math.random() - 0.5) * b.speed;
      b.vy = (Math.random() - 0.5) * b.speed;
    }

    // ������ ��������� ���
    let closestFood = null;
    let minFoodDist = Infinity;
    for (let food of foods) {
      let dist = Math.hypot(food.x - b.x, food.y - b.y);
      if (dist < 200 && dist < minFoodDist) {
        minFoodDist = dist;
        closestFood = food;
      }
    }

    if (closestFood) {
      // �������� �� ��
      let dx = closestFood.x - b.x;
      let dy = closestFood.y - b.y;
      let dist = Math.hypot(dx, dy);
      if (dist > 1) {
        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed;
        b.isMoving = true;
      }
    }

    // ���������� �� �������� � ������ �������� (�������)
    for (let other of balls) {
      if (other === b) continue;
      let dist = Math.hypot(other.x - b.x, other.y - b.y);
      if (dist < (b.size + other.size) / 2) {
        // ������� ���� b �������� �� other
        if (b.power > other.power) {
          // ������� ����㳿 ����
          let otherPowerBefore = other.power;

          b.power -= otherPowerBefore;
          other.power = 0;
          other.isMoving = false;
          other.vx = 0;
          other.vy = 0;

          // ���������� ������ ������ ������������ ����� 1 �������,
          // ���� �� ������ ����� �������
          if (!fightCooldown.has(b.id)) {
            fightCooldown.set(b.id, {
              gainedEnergy: otherPowerBefore,
              timestamp: Date.now()
            });
          }

          // ��������� ������ other ���� ���� "�������"
          if (other.power <= 0) {
            other.div.remove();
            other.energyBar.remove();
            balls.splice(balls.indexOf(other), 1);
          }
        }
      }
    }

    // ���������� ���������� ����㳿 ���� ��������
    if (fightCooldown.has(b.id)) {
      let fightData = fightCooldown.get(b.id);
      if (Date.now() - fightData.timestamp >= 1000) {
        b.power += fightData.gainedEnergy;
        if (b.power > 6) b.power = 6;
        fightCooldown.delete(b.id);
      }
    }
  }
}
