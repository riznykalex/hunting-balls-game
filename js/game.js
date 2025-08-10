import { Ball } from './ball.js';
import { Group } from './group.js';
import { Food } from './food.js';

const game = document.getElementById('game');
const width = window.innerWidth;
const height = window.innerHeight;

let balls = [];
let groups = [];
let foods = [];
let nextBallId = 0;
let nextFoodId = 0;
let nextGroupId = 0;

function createBallRandom() {
  let x = Math.random() * (width - 60);
  let y = Math.random() * (height - 60);
  let power = Math.random() * 1.5 + 1.5;
  let ball = new Ball(nextBallId++, x, y, power, game, width, height);
  balls.push(ball);
  return ball;
}

function createFoodRandom() {
  let x = Math.random() * (width - 20);
  let y = Math.random() * (height - 20);
  let energies = [0.1, 0.2, 0.3];
  let energy = energies[Math.floor(Math.random() * energies.length)];
  let food = new Food(nextFoodId++, x, y, energy, game);
  foods.push(food);
  return food;
}

function clusterizeBalls() {
  groups = [];
  // Очищаємо посилання в кульках
  for (let b of balls) {
    b.group = null;
  }

  let used = new Set();

  for (let i = 0; i < balls.length; i++) {
    if (used.has(balls[i])) continue;
    let clusterMembers = [balls[i]];
    used.add(balls[i]);

    for (let j = i + 1; j < balls.length; j++) {
      if (used.has(balls[j])) continue;
      let b1 = balls[i];
      let b2 = balls[j];
      let dist = Math.hypot(
        b1.x + b1.size / 2 - (b2.x + b2.size / 2),
        b1.y + b1.size / 2 - (b2.y + b2.size / 2)
      );
      if (dist < 50 && Math.abs(b1.power - b2.power) <= 1) {
        clusterMembers.push(b2);
        used.add(b2);
      }
    }

    if (clusterMembers.length > 1) {
      let group = new Group(nextGroupId++, clusterMembers);
      groups.push(group);
      for (let m of clusterMembers) {
        m.group = group;
      }
    }
  }
}

function autonomousActions() {
  for (let b of balls) {
    if (!b.group) {
      if (b.power >= 1) {
        b.isMoving = true;
        b.vx = (Math.random() - 0.5) * b.speed;
        b.vy = (Math.random() - 0.5) * b.speed;
        b.move(b.vx, b.vy);
      } else {
        b.isMoving = false;
      }
    }
  }

  for (let g of groups) {
    g.autonomousHunt(balls, foods);
    g.move();
  }

  for (let b of balls) {
    if (!b.group) {
      if (b.power < 1) {
        b.power += 0.005;
        if (b.power > 2) b.power = 2;
        b.size = 30 + b.power * 10;
        b.updatePosition();
        continue;
      }

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
        b.prey = null;
        b.targetFood = closestFood;
        b.isMoving = true;
        let dx = closestFood.x - b.x;
        let dy = closestFood.y - b.y;
        let dist = Math.hypot(dx, dy);
        b.vx = (dx / dist) * b.speed;
        b.vy = (dy / dist) * b.speed;
      } else {
        b.targetFood = null;
        let preyCandidate = null;
        let minDist = Infinity;
        for (let other of balls) {
          if (other === b) continue;
          if (other.power < b.power) {
            let dist = Math.hypot(other.x - b.x, other.y - b.y);
            if (dist < minDist && dist < 400) {
              minDist = dist;
              preyCandidate = other;
            }
          }
        }
        if (preyCandidate) {
          b.prey = preyCandidate;
          let angle = Math.random() * 2 * Math.PI;
          let radius = 50 + Math.random() * 30;
          let targetX = preyCandidate.x + radius * Math.cos(angle);
          let targetY = preyCandidate.y + radius * Math.sin(angle);
          let dx = targetX - b.x;
          let dy = targetY - b.y;
          let dist = Math.hypot(dx, dy);
          b.vx = (dx / dist) * b.speed;
          b.vy = (dy / dist) * b.speed;
          b.isMoving = true;
        } else {
          b.isMoving = false;
          b.vx = 0;
          b.vy = 0;
          b.prey = null;
        }
      }
      b.move(b.vx, b.vy);
    }
  }
}

function groupsEatFood() {
  for (let g of groups) {
    if (!g.isMoving) continue;

    if (g.targetFood) {
      let dist = Math.hypot(g.targetFood.x - g.centerX, g.targetFood.y - g.centerY);
      if (dist < 40) {
        let addEnergy = g.targetFood.energy / g.members.length;
        for (let m of g.members) {
          m.power += addEnergy;
          if (m.power > 6) m.power = 6;
          m.size = 30 + m.power * 10;
          m.updatePosition();
        }
        g.targetFood.remove();
        foods.splice(foods.indexOf(g.targetFood), 1);
        g.targetFood = null;
        g.isMoving = false;
        g.vx = 0;
        g.vy = 0;
      }
    }
  }
}

function groupsHunt() {
  for (let g of groups) {
    if (!g.isMoving || !g.prey) continue;
    let prey = g.prey;
    if (prey.group === g) {
      g.prey = null;
      continue;
    }

    let dist = Math.hypot(prey.x - g.centerX, prey.y - g.centerY);
    if (dist < 40) {
      let damage = 0.15;
      prey.power -= damage;
      if (prey.power < 0) prey.power = 0;

      let addEnergy = damage / g.members.length;
      for (let m of g.members) {
        m.power += addEnergy;
        if (m.power > 6) m.power = 6;
        m.size = 30 + m.power * 10;
        m.updatePosition();
      }

      if (prey.power <= 0) {
        balls.splice(balls.indexOf(prey), 1);
        prey.div.remove();
        prey.energyBar.remove();
        g.prey = null;
      }
    }
  }
}

function ballsEatFood() {
  for (let b of balls) {
    if (b.group) continue;

    if (b.isMoving && b.targetFood) {
      let dist = Math.hypot(b.targetFood.x - b.x, b.targetFood.y - b.y);
      if (dist < 20) {
        b.power += b.targetFood.energy;
        if (b.power > 6) b.power = 6;
        b.size = 30 + b.power * 10;
        b.updatePosition();

        b.targetFood.remove();
        foods.splice(foods.indexOf(b.targetFood), 1);
        b.targetFood = null;
        b.isMoving = false;
        b.vx = 0;
        b.vy = 0;
      }
    }
  }
}

function update() {
  clusterizeBalls();
  autonomousActions();
  groupsEatFood();
  groupsHunt();
  ballsEatFood();
}

function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

// --- Ініціалізація ---

for (let i = 0; i < 15; i++) {
  createBallRandom();
}

for (let i = 0; i < 30; i++) {
  createFoodRandom();
}

setInterval(() => {
  if (balls.length < 30) {
    createBallRandom();
  }
}, 4000);

setInterval(() => {
  if (foods.length < 40) {
    createFoodRandom();
  }
}, 3000);

gameLoop();

let selectedBall = null;
game.addEventListener('click', (e) => {
  let cx = e.clientX;
  let cy = e.clientY;
  for (let b of balls) {
    let bx = b.x + b.size / 2;
    let by = b.y + b.size / 2;
    let dist = Math.hypot(cx - bx, cy - by);
    if (dist < b.size / 2) {
      if (selectedBall) selectedBall.div.classList.remove('selected');
      selectedBall = b;
      selectedBall.div.classList.add('selected');
      break;
    }
  }
});
