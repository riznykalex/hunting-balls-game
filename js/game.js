import { VERSION } from './version.js';
import { Ball } from './ball.js';
import { Food } from './food.js';
import { autonomousActions } from './autonomous.js';

window.addEventListener('load', () => {
  console.log(`🎮 Hunting Balls Game — версія ${VERSION}`);
});

const game = document.getElementById('game');
const width = window.innerWidth;
const height = window.innerHeight;

let balls = [];
let foods = [];
let nextBallId = 0;
let nextFoodId = 0;

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

function ballsEatFood() {
  for (let b of balls) {
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

function handleFights() {
  // Логіка боїв між кульками - виконуємо тут
  for (let attacker of balls) {
    if (!attacker.isMoving || attacker.power < 1) continue;

    for (let target of balls) {
      if (attacker === target) continue;
      if (target.power >= attacker.power) continue;

      let dist = Math.hypot(target.x - attacker.x, target.y - attacker.y);
      if (dist < 40) {
        // Поєдинок
        let damage = target.power;
        attacker.power -= damage;
        if (attacker.power < 0) attacker.power = 0;

        // Переможець отримує енергію переможеного через 1 секунду
        setTimeout(() => {
          if (balls.includes(attacker)) {
            attacker.power += damage;
            if (attacker.power > 6) attacker.power = 6;
            attacker.size = 30 + attacker.power * 10;
            attacker.updatePosition();
          }
        }, 1000);

        // Вбиваємо ціль, якщо енергія <= 0
        target.power -= damage;
        if (target.power <= 0) {
          balls.splice(balls.indexOf(target), 1);
          target.div.remove();
          target.energyBar.remove();
        } else {
          target.size = 30 + target.power * 10;
          target.updatePosition();
        }
      }
    }
  }
}

function update() {
  autonomousActions(balls, foods);
  ballsEatFood();
  handleFights();
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
