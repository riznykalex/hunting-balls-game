// game.js

import { VERSION } from './version.js';
import { Ball } from './ball.js';
import { Food } from './food.js';
import { autonomousActions } from './autonomous.js';
import { Controller } from './control.js';

window.addEventListener('load', () => {
  console.log(`🎮 Hunting Balls Game — версія ${VERSION}`);
});

// === Параметри гри ===
const game = document.getElementById('game');
const width = window.innerWidth;
const height = window.innerHeight;

// Щоб контейнер займав весь екран
game.style.position = 'relative';
game.style.width = width + 'px';
game.style.height = height + 'px';
game.style.background = '#eef';
game.style.overflow = 'hidden';

let balls = [];
let foods = [];
let nextBallId = 0;
let nextFoodId = 0;

// Створення кульки
function createBallRandom() {
  let x = Math.random() * (width - 60);
  let y = Math.random() * (height - 60);
  let power = Math.random() * 1.5 + 1.5;

  let ball = new Ball(nextBallId++, x, y, power, game, width, height);
  ball.render(); // 🟢 ВАЖЛИВО — малюємо
  balls.push(ball);
  return ball;
}

// Створення їжі
function createFoodRandom() {
  let x = Math.random() * (width - 20);
  let y = Math.random() * (height - 20);
  let energies = [0.1, 0.2, 0.3];
  let energy = energies[Math.floor(Math.random() * energies.length)];

  let food = new Food(nextFoodId++, x, y, energy, game);
  food.render(); // 🟢 ВАЖЛИВО — малюємо
  foods.push(food);
  return food;
}

// Початкові об’єкти
for (let i = 0; i < 15; i++) createBallRandom();
for (let i = 0; i < 40; i++) createFoodRandom();

// Контролер
const controller = new Controller(balls, game);

// Оновлення стану
function update() {
  autonomousActions(balls, foods);
  controller.update();
}

// Ігровий цикл
function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}

// Додавання нових об’єктів з часом
setInterval(() => {
  if (balls.length < 30) createBallRandom();
}, 4000);

setInterval(() => {
  if (foods.length < 50) createFoodRandom();
}, 3000);

gameLoop();
