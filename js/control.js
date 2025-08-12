//control.js

export class Controller {
  constructor(balls, gameContainer) {
    this.balls = balls;
    this.gameContainer = gameContainer;
    this.selectedBall = null;
    this.vectorLine = null;
    this.vectorStart = null;
    this.vectorEnd = null;
    this.isSettingVector = false;
    this.vectorTimeout = null;

    this.init();
  }

  init() {
    this.gameContainer.addEventListener('click', (e) => this.handleClick(e));

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.style.position = 'absolute';
    this.svg.style.top = '0';
    this.svg.style.left = '0';
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    this.svg.style.pointerEvents = 'none';
    this.gameContainer.appendChild(this.svg);

    this.vectorLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.vectorLine.setAttribute('stroke-width', '3');
    this.vectorLine.setAttribute('stroke', 'blue');
    this.svg.appendChild(this.vectorLine);
    this.hideVectorLine();
  }

  handleClick(e) {
    const cx = e.clientX;
    const cy = e.clientY;

    if (!this.selectedBall) {
      for (let b of this.balls) {
        let bx = b.x + b.size / 2;
        let by = b.y + b.size / 2;
        let dist = Math.hypot(cx - bx, cy - by);
        if (dist < b.size / 2) {
          this.selectBall(b);
          return;
        }
      }
    } else if (!this.isSettingVector) {
      this.isSettingVector = true;
      this.vectorStart = { x: this.selectedBall.x + this.selectedBall.size / 2, y: this.selectedBall.y + this.selectedBall.size / 2 };
      this.vectorEnd = { x: cx, y: cy };
      this.updateVectorLine();

      if (this.vectorTimeout) clearTimeout(this.vectorTimeout);
      this.vectorTimeout = setTimeout(() => {
        this.clearSelection();
      }, 20000);

      this.mouseMoveHandler = (ev) => this.handleMouseMove(ev);
      this.gameContainer.addEventListener('mousemove', this.mouseMoveHandler);

      this.gameContainer.addEventListener('click', this.confirmVectorHandler = (ev) => this.confirmVector(ev), { once: true });
    }
  }

  selectBall(ball) {
    if (this.selectedBall) {
      this.selectedBall.div.classList.remove('selected');
      this.selectedBall.isControlled = false;
    }
    this.selectedBall = ball;
    this.selectedBall.div.classList.add('selected');
    this.selectedBall.isControlled = true;
  }

  handleMouseMove(e) {
    this.vectorEnd = { x: e.clientX, y: e.clientY };
    this.updateVectorLine();
  }

  updateVectorLine() {
    if (!this.vectorLine || !this.vectorStart || !this.vectorEnd) return;
    this.vectorLine.setAttribute('x1', this.vectorStart.x);
    this.vectorLine.setAttribute('y1', this.vectorStart.y);
    this.vectorLine.setAttribute('x2', this.vectorEnd.x);
    this.vectorLine.setAttribute('y2', this.vectorEnd.y);

    let dx = this.vectorEnd.x - this.vectorStart.x;
    let dy = this.vectorEnd.y - this.vectorStart.y;
    let dist = Math.hypot(dx, dy);

    let energyCost = dist * 0.007;
    if (this.selectedBall.power >= energyCost) {
      this.vectorLine.setAttribute('stroke', 'blue');
    } else {
      this.vectorLine.setAttribute('stroke', 'red');
    }

    this.showVectorLine();
  }

  confirmVector(e) {
    if (!this.selectedBall || !this.vectorStart || !this.vectorEnd) {
      this.clearSelection();
      return;
    }

    let dx = this.vectorEnd.x - this.vectorStart.x;
    let dy = this.vectorEnd.y - this.vectorStart.y;
    let dist = Math.hypot(dx, dy);

    if (dist < 5) {
      this.clearSelection();
      return;
    }

    let speedFactor = this.selectedBall.speed / dist;
    this.selectedBall.vx = dx * speedFactor;
    this.selectedBall.vy = dy * speedFactor;
    this.selectedBall.isMoving = true;

    if (this.vectorTimeout) clearTimeout(this.vectorTimeout);
    this.clearSelection();
  }

  clearSelection() {
    if (this.selectedBall) {
      this.selectedBall.div.classList.remove('selected');
      this.selectedBall.isControlled = false;
    }
    this.selectedBall = null;
    this.isSettingVector = false;
    this.hideVectorLine();

    if (this.mouseMoveHandler) {
      this.gameContainer.removeEventListener('mousemove', this.mouseMoveHandler);
      this.mouseMoveHandler = null;
    }
    if (this.confirmVectorHandler) {
      this.gameContainer.removeEventListener('click', this.confirmVectorHandler);
      this.confirmVectorHandler = null;
    }
  }

  hideVectorLine() {
    if (this.vectorLine) this.vectorLine.style.display = 'none';
  }

  showVectorLine() {
    if (this.vectorLine) this.vectorLine.style.display = 'block';
  }

  update() {
    if (this.selectedBall && this.selectedBall.isControlled && this.selectedBall.isMoving) {
      this.selectedBall.move(this.selectedBall.vx, this.selectedBall.vy);

      let distMoved = Math.hypot(this.selectedBall.vx, this.selectedBall.vy);
      this.selectedBall.power -= distMoved * 0.007;
      if (this.selectedBall.power < 0) this.selectedBall.power = 0;

      this.selectedBall.size = 30 + this.selectedBall.power * 10;
      this.selectedBall.updatePosition();

      if (this.selectedBall.power <= 0) {
        this.selectedBall.isMoving = false;
        this.clearSelection();
      }
    }
  }
}
