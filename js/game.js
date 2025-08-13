// game.js
import { VERSION } from './version.js';
import { Unit } from './unit.js';
import { Food } from './food.js';
import { vectorToVelocity } from './movement.js';

window.addEventListener('load', () => {
  console.log(`🎮 Hunting Units — версія ${VERSION}`);
});

const gameContainer = document.getElementById('game');
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// робимо контейнер гарантовано правильного розміру
gameContainer.style.position = 'relative';
gameContainer.style.width = `${WIDTH}px`;
gameContainer.style.height = `${HEIGHT}px`;

let units = [];
let foods = [];
let nextUnitId = 0;
let nextFoodId = 0;

// Параметри
const INITIAL_UNITS = 12;
const INITIAL_FOOD = 35;
const MAX_UNITS = 40;
const MAX_FOOD = 80;

// створити одиницю (кульку)
function createUnitRandom() {
  const x = Math.random() * (WIDTH - 60);
  const y = Math.random() * (HEIGHT - 60);
  const energy = Math.random() * 1.8 + 1.2; // 1.2 .. 3.0
  const u = new Unit(nextUnitId++, x, y, energy, gameContainer, WIDTH, HEIGHT);
  // невеликий випадковий початковий рух
  const ang = Math.random() * Math.PI * 2;
  u.setVelocity(Math.cos(ang) * (u.speed * 0.4), Math.sin(ang) * (u.speed * 0.4));
  u.isMoving = true;
  units.push(u);
  return u;
}

// створити їжу
function createFoodRandom() {
  const x = Math.random() * (WIDTH - 20);
  const y = Math.random() * (HEIGHT - 20);
  const energies = [0.1, 0.2, 0.3];
  const en = energies[Math.floor(Math.random() * energies.length)];
  const f = new Food(nextFoodId++, x, y, en, gameContainer);
  foods.push(f);
  return f;
}

// ініціалізація
for (let i = 0; i < INITIAL_UNITS; i++) createUnitRandom();
for (let i = 0; i < INITIAL_FOOD; i++) createFoodRandom();

// Автономна логіка (проста): для кожного юніта знайти найближчу їжу, якщо є — йти на неї.
// якщо немає їжі поруч, шукати слабшу жертву (одиницю) і "підходити" до неї.
// Пріоритет: їжа > атака
function autonomousBehaviour(unit) {
  if (unit.isControlled || unit.isSleeping) return;

  // Пошук їжі в радіусі
  let closestFood = null;
  let minFd = Infinity;
  for (const f of foods) {
    const d = Math.hypot((f.x - unit.x), (f.y - unit.y));
    if (d < minFd) {
      minFd = d;
      closestFood = f;
    }
  }

  if (closestFood && minFd < 300) {
    // рух до їжі
    const targetX = closestFood.x;
    const targetY = closestFood.y;
    const res = vectorToVelocity(unit.x, unit.y, targetX, targetY, unit.speed);
    unit.setVelocity(res.vx, res.vy);
    unit.isMoving = true;
    // якщо вже біля їжі — з'їдаємо
    if (res.dist < (unit.size / 2 + closestFood.size || 20)) {
      unit.energy += closestFood.energy;
      if (unit.energy > 6) unit.energy = 6;
      unit.size = 30 + Math.max(0, unit.energy) * 8;
      // видалити їжу
      closestFood.remove();
      foods.splice(foods.indexOf(closestFood), 1);
      unit.stop(); // зупинитись після прийому їжі
    }
    return;
  }

  // Якщо їжі немає або далеко — шукати слабшу жертву (інший юніт)
  let prey = null;
  let minDist = Infinity;
  for (const other of units) {
    if (other === unit) continue;
    if (other.energy < unit.energy - 0.2) { // трохи слабше
      const d = Math.hypot(other.x - unit.x, other.y - unit.y);
      if (d < minDist && d < 400) {
        minDist = d;
        prey = other;
      }
    }
  }

  if (prey) {
    // рухаємося до жертви (пристосуй далі логіку боєнки)
    const res = vectorToVelocity(unit.x, unit.y, prey.x, prey.y, unit.speed);
    unit.setVelocity(res.vx, res.vy);
    unit.isMoving = true;
    // якщо дуже близько — наносимо "удар"
    if (res.dist < (unit.size / 2 + prey.size / 2 + 6)) {
      const damage = 0.12;
      prey.energy -= damage;
      unit.energy += damage * 0.9; // трохи втрачається
      if (prey.energy <= 0) {
        prey.remove();
        units.splice(units.indexOf(prey), 1);
      }
    }
    return;
  }

  // Нічого — випадковий блукаючий рух (кожен раз трохи змінюємо напрямок)
  if (!unit.isMoving || Math.random() < 0.01) {
    const ang = Math.random() * Math.PI * 2;
    unit.setVelocity(Math.cos(ang) * unit.speed * 0.4, Math.sin(ang) * unit.speed * 0.4);
    unit.isMoving = true;
  }
}

// ігровий цикл з dt
let lastTs = performance.now();
function update(ts = performance.now()) {
  const dt = Math.min(0.1, (ts - lastTs) / 1000); // секунди, clamp до 0.1
  lastTs = ts;

  // для кожного юніта — зробити автономну поведінку (якщо не контролюється)
  for (const u of [...units]) { // копія
    autonomousBehaviour(u);
    u.step(dt, 0.01, 0.9, 2); // налаштовуй коефіцієнти: costPerPixel, sleepRegen/sec, wakeEnergy
  }

  // спонтанно додаємо їжу/юнітів якщо мало
  if (foods.length < Math.min(MAX_FOOD, INITIAL_FOOD + 10) && Math.random() < 0.03) createFoodRandom();
  if (units.length < Math.min(MAX_UNITS, INITIAL_UNITS + 4) && Math.random() < 0.01) createUnitRandom();

  // наступний кадр
  requestAnimationFrame(update);
}

// старт
requestAnimationFrame(update);
