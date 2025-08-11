import { VERSION } from './version.js';
import { Ball } from './ball.js';
import { Food } from './food.js';
import { autonomousActions } from './autonomous.js';
import { Controller } from './control.js';

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
    if (b.isControlled) continue;  // кулька під контролем не їсть автоматично

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
  controller.update();
  autonomousActions(balls, foods);
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

for (let i = 0; i < 40; i++) {  // більше їжі
  createFoodRandom();
}

setInterval(() => {
  if (balls.length < 30) {
    createBallRandom();
  }
}, 4000);

setInterval(() => {
  if (foods.length < 60) {  // більше їжі
    createFoodRandom();
  }
}, 3000);

const controller = new Controller(balls, game);

gameLoop();
