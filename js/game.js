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

for (let i = 0; i < 15; i++) {
  createBallRandom();
}

for (let i = 0; i < 40; i++) {
  createFoodRandom();
}

const controller = new Controller(balls, game);

function update() {
  autonomousActions(balls, foods);
  controller.update();
}

function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

setInterval(() => {
  if (balls.length < 30) {
    createBallRandom();
  }
}, 4000);

setInterval(() => {
  if (foods.length < 50) {
    createFoodRandom();
  }
}, 3000);

gameLoop();
