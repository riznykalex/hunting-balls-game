const game = document.getElementById('game');
const width = window.innerWidth;
const height = window.innerHeight;

// --- Ball клас ---
class Ball {
  constructor(id, x, y, power) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.power = power; // 1..6
    this.size = 30 + this.power * 10;
    this.speed = 1.5;
    this.isMoving = false;
    this.vx = 0;
    this.vy = 0;
    this.prey = null;
    this.targetFood = null;
    this.group = null; // посилання на групу, якщо в ній
    this.div = document.createElement('div');
    this.div.classList.add('ball');
    this.div.style.width = this.size + 'px';
    this.div.style.height = this.size + 'px';
    this.div.style.left = this.x + 'px';
    this.div.style.top = this.y + 'px';
    this.div.style.backgroundColor = '#555';
    this.div.textContent = '';
    game.appendChild(this.div);

    // Панель енергії
    this.energyBar = document.createElement('div');
    this.energyBar.classList.add('energy-bar');
    this.energyBar.style.width = this.size + 'px';
    this.energyBar.style.left = this.x + 'px';
    this.energyBar.style.top = (this.y + this.size + 2) + 'px';
    game.appendChild(this.energyBar);

    this.energyFill = document.createElement('div');
    this.energyFill.classList.add('energy-fill');
    this.energyBar.appendChild(this.energyFill);
  }
  updateEnergyBar(){
    let maxPower = 6;
    let pct = Math.min(this.power / maxPower, 1);
    this.energyFill.style.width = (pct * 100) + '%';

    if(this.power <= 1){
      this.energyFill.style.backgroundColor = '#ff3333'; // червоний
    } else if(this.power <= 3){
      this.energyFill.style.backgroundColor = '#ffcc33'; // жовтий
    } else if(this.power <= 5){
      this.energyFill.style.backgroundColor = '#33cc33'; // зелений
    } else {
      this.energyFill.style.backgroundColor = '#3399ff'; // синій
    }
  }
  updatePosition() {
    this.div.style.left = this.x + 'px';
    this.div.style.top = this.y + 'px';
    this.div.style.width = this.size + 'px';
    this.div.style.height = this.size + 'px';

    this.energyBar.style.left = this.x + 'px';
    this.energyBar.style.top = (this.y + this.size + 2) + 'px';
    this.energyBar.style.width = this.size + 'px';

    this.updateEnergyBar();
  }
  move(dx, dy){
    this.x += dx;
    this.y += dy;

    this.x = Math.min(Math.max(0, this.x), width - this.size);
    this.y = Math.min(Math.max(0, this.y), height - this.size);

    this.updatePosition();
  }
}

// --- Group клас ---
class Group {
  constructor(id, members) {
    this.id = id;
    this.members = members; // масив Ball
    this.vx = 0;
    this.vy = 0;
    this.speed = 1.2; // трохи повільніше за одиночну кульку
    this.isMoving = false;
    this.prey = null;
    this.targetFood = null;
    this.updateCenter();
  }
  updateCenter(){
    if(this.members.length === 0) return;
    let sumX = 0, sumY = 0;
    for(let m of this.members){
      sumX += m.x + m.size/2;
      sumY += m.y + m.size/2;
    }
    this.centerX = sumX / this.members.length;
    this.centerY = sumY / this.members.length;
  }
  totalPower(){
    return this.members.reduce((sum, m) => sum + m.power, 0);
  }
  averagePower(){
    return this.totalPower() / this.members.length;
  }
  autonomousHunt(balls, foods){
    if(this.totalPower() < this.members.length){ // якщо середня сила менша 1, відпочиваємо
      this.isMoving = false;
      this.vx = 0;
      this.vy = 0;
      this.prey = null;
      this.targetFood = null;
      return;
    }

    // Шукаємо їжу поруч (радіус 200)
    let closestFood = null;
    let minFoodDist = Infinity;
    for(let food of foods){
      let dist = Math.hypot(food.x - this.centerX, food.y - this.centerY);
      if(dist < 200 && dist < minFoodDist){
        minFoodDist = dist;
        closestFood = food;
      }
    }
    if(closestFood){
      this.prey = null;
      this.targetFood = closestFood;
      this.isMoving = true;
      let dx = closestFood.x - this.centerX;
      let dy = closestFood.y - this.centerY;
      let dist = Math.hypot(dx, dy);
      if(dist > 1){
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
      return;
    } else {
      this.targetFood = null;
    }

    // Якщо їжі немає — шукаємо слабшого ворога (кульку або іншу групу)
    let preyCandidate = null;
    let minDist = Infinity;

    // Перевірка індивідуальних кульок (не в групах)
    for(let b of balls){
      if(this.members.includes(b)) continue; // не полюємо на себе
      if(b.group) continue; // пропускаємо кульки в інших групах (щоб полювати на групи, треба інша логіка)
      if(b.power < this.averagePower()){
        let dist = Math.hypot(b.x - this.centerX, b.y - this.centerY);
        if(dist < minDist && dist < 400){
          minDist = dist;
          preyCandidate = b;
        }
      }
    }

    if(preyCandidate){
      this.prey = preyCandidate;
    } else {
      // Рух випадковий для активності
      this.isMoving = false;
      this.vx = 0;
      this.vy = 0;
      this.prey = null;
      return;
    }

    // Цільові координати для руху
    let targetX = this.prey.x;
    let targetY = this.prey.y;

    let dx = targetX - this.centerX;
    let dy = targetY - this.centerY;
    let dist = Math.hypot(dx, dy);

    let energyNeeded = dist * 0.005;
    if(this.totalPower() >= energyNeeded){
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
      this.isMoving = true;
    } else {
      this.isMoving = false;
      this.vx = 0;
      this.vy = 0;
    }
  }
  move(){
    if(!this.isMoving) return;
    // Рухаємо кожного учасника з невеликими зсувами
    this.updateCenter();

    for(let i=0; i<this.members.length; i++){
      let m = this.members[i];
      // Зсув по колу для візуалізації "липкості"
      let angle = (2*Math.PI / this.members.length) * i;
      let offsetRadius = 20;
      let targetX = this.centerX + offsetRadius * Math.cos(angle) - m.size/2;
      let targetY = this.centerY + offsetRadius * Math.sin(angle) - m.size/2;

      // Вектор руху для даного учасника
      let dx = this.vx;
      let dy = this.vy;

      // Оновлюємо позицію кульки
      m.move(dx, dy);
      // Примусово ставимо близько до цілі (щоб не розбігались)
      if(Math.abs(m.x - targetX) > 4) m.x = targetX;
      if(Math.abs(m.y - targetY) > 4) m.y = targetY;

      // Втрата енергії пропорційна руху
      let distMoved = Math.hypot(dx, dy);
      m.power -= distMoved * 0.007;
      if(m.power < 0) m.power = 0;

      m.size = 30 + m.power * 10;
      m.updatePosition();
    }
    this.updateCenter();
  }
}

// --- Food клас ---
class Food {
  constructor(id, x, y, energy){
    this.id = id;
    this.x = x;
    this.y = y;
    this.energy = energy;
    this.size = 12;
    this.div = document.createElement('div');
    this.div.classList.add('food');
    this.div.style.width = this.size + 'px';
    this.div.style.height = this.size + 'px';
    this.div.style.left = this.x + 'px';
    this.div.style.top = this.y + 'px';
    this.div.style.backgroundColor = energy === 0.1 ? '#ffcc00' : energy === 0.2 ? '#ffaa00' : '#ff8800';
    this.div.style.border = '1px solid #bb6600';
    game.appendChild(this.div);
  }
  remove(){
    this.div.remove();
  }
}

// --- Глобальні змінні ---
let balls = [];
let groups = [];
let foods = [];
let nextBallId = 0;
let nextFoodId = 0;
let nextGroupId = 0;

// --- Функції створення ---
function createBallRandom(){
  let x = Math.random() * (width - 60);
  let y = Math.random() * (height - 60);
  let power = Math.random()*1.5 + 1.5;
  let ball = new Ball(nextBallId++, x, y, power);
  balls.push(ball);
  return ball;
}

function createFoodRandom(){
  let x = Math.random() * (width - 20);
  let y = Math.random() * (height - 20);
  let energies = [0.1, 0.2, 0.3];
  let energy = energies[Math.floor(Math.random()*energies.length)];
  let food = new Food(nextFoodId++, x, y, energy);
  foods.push(food);
  return food;
}

// --- Кластеризація кульок ---
function clusterizeBalls(){
  groups = [];
  // Спочатку очищаємо посилання в кульках
  for(let b of balls){
    b.group = null;
  }

  let used = new Set();

  for(let i=0; i<balls.length; i++){
    if(used.has(balls[i])) continue;
    let clusterMembers = [balls[i]];
    used.add(balls[i]);

    for(let j=i+1; j<balls.length; j++){
      if(used.has(balls[j])) continue;
      let b1 = balls[i];
      let b2 = balls[j];
      let dist = Math.hypot((b1.x + b1.size/2) - (b2.x + b2.size/2), (b1.y + b1.size/2) - (b2.y + b2.size/2));
      if(dist < 50 && Math.abs(b1.power - b2.power) <= 1){
        clusterMembers.push(b2);
        used.add(b2);
      }
    }

    if(clusterMembers.length > 1){
      let group = new Group(nextGroupId++, clusterMembers);
      groups.push(group);
      for(let m of clusterMembers){
        m.group = group;
      }
    }
  }
}

// --- Автоматичне полювання ---
// Обробляємо групи і одиночні кульки
function autonomousActions(){

for(let b of balls){
  if(!b.group){
    if(b.power >= 1){
      b.isMoving = true;
      b.vx = (Math.random() - 0.5) * b.speed;
      b.vy = (Math.random() - 0.5) * b.speed;
      b.move();
    } else {
      b.isMoving = false;
    }
  }
}


  for(let g of groups){
    g.autonomousHunt(balls, foods);
    g.move();
  }
  for(let b of balls){
    if(!b.group){
      // Автономний хант і рух
      if(b.power < 1){
        b.power += 0.005;
        if(b.power > 2) b.power = 2;
        b.size = 30 + b.power * 10;
        b.updatePosition();
        continue;
      }
      // Шукаємо їжу і ворогів
      let closestFood = null;
      let minFoodDist = Infinity;
      for(let food of foods){
        let dist = Math.hypot(food.x - b.x, food.y - b.y);
        if(dist < 200 && dist < minFoodDist){
          minFoodDist = dist;
          closestFood = food;
        }
      }

      if(closestFood){
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
        // Шукаємо слабшу жертву
        let preyCandidate = null;
        let minDist = Infinity;
        for(let other of balls){
          if(other === b) continue;
          if(other.power < b.power){
            let dist = Math.hypot(other.x - b.x, other.y - b.y);
            if(dist < minDist && dist < 400){
              minDist = dist;
              preyCandidate = other;
            }
          }
        }
        if(preyCandidate){
          b.prey = preyCandidate;
          // Пастка - рух не прямо на жертву, а поруч
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
      b.move();
    }
  }
}

// --- Рух і збирання їжі групами ---
function groupsEatFood(){
  for(let g of groups){
    if(!g.isMoving) continue;

    if(g.targetFood){
      let dist = Math.hypot(g.targetFood.x - g.centerX, g.targetFood.y - g.centerY);
      if(dist < 40){
        // Збираємо їжу: розподіляємо енергію порівну
        let addEnergy = g.targetFood.energy / g.members.length;
        for(let m of g.members){
          m.power += addEnergy;
          if(m.power > 6) m.power = 6;
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

// --- Рух і полювання групою ---
function groupsHunt(){
  for(let g of groups){
    if(!g.isMoving || !g.prey) continue;
    // Якщо жертва групи - одиночна кулька
    let prey = g.prey;
    if(prey.group === g) { 
      // Власна кулька - ігноруємо
      g.prey = null;
      continue;
    }

    let dist = Math.hypot(prey.x - g.centerX, prey.y - g.centerY);
    if(dist < 40){
      // Полювання: зменшуємо енергію жертви, збільшуємо енергію групи
      let damage = 0.15;
      prey.power -= damage;
      if(prey.power < 0) prey.power = 0;

      let addEnergy = damage / g.members.length;
      for(let m of g.members){
        m.power += addEnergy;
        if(m.power > 6) m.power = 6;
        m.size = 30 + m.power * 10;
        m.updatePosition();
      }

      // Якщо жертва вмерла - прибираємо її
      if(prey.power <= 0){
        balls.splice(balls.indexOf(prey), 1);
        prey.div.remove();
        prey.energyBar.remove();
        g.prey = null;
      }
    }
  }
}

// --- Збирання їжі одиночними кульками ---
function ballsEatFood(){
  for(let b of balls){
    if(b.group) continue; // групи вже їдять їжу

    if(b.isMoving && b.targetFood){
      let dist = Math.hypot(b.targetFood.x - b.x, b.targetFood.y - b.y);
      if(dist < 20){
        b.power += b.targetFood.energy;
        if(b.power > 6) b.power = 6;
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

// --- Оновлення ---
function update(){
  clusterizeBalls();
  autonomousActions();
  groupsEatFood();
  groupsHunt();
  ballsEatFood();
}

function gameLoop(){
  update();
  requestAnimationFrame(gameLoop);
}

// --- Створюємо початкові кульки ---
for(let i=0; i<15; i++){
  createBallRandom();
}

// --- Створюємо їжу ---
for(let i=0; i<30; i++){
  createFoodRandom();
}

// --- Додаємо нові кульки періодично ---
setInterval(() => {
  if(balls.length < 30){
    createBallRandom();
  }
}, 4000);

// --- Додаємо їжу ---
setInterval(() => {
  if(foods.length < 40){
    createFoodRandom();
  }
}, 3000);

// --- Запускаємо гру ---
gameLoop();

// --- Обробка кліків для вибору кульки ---
let selectedBall = null;
game.addEventListener('click', (e) => {
  let cx = e.clientX;
  let cy = e.clientY;
  for(let b of balls){
    let bx = b.x + b.size/2;
    let by = b.y + b.size/2;
    let dist = Math.hypot(cx - bx, cy - by);
    if(dist < b.size/2){
      if(selectedBall) selectedBall.div.classList.remove('selected');
      selectedBall = b;
      selectedBall.div.classList.add('selected');
      break;
    }
  }
});
