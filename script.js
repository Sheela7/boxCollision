const ballColors = [
  "#ff99b7",
  "#aec3ff",
  "#c6b9df",
  "#d0ffa1",
  "#ffffa6",
  "#83D9DC",
  "#B0EFEF",
  "#e4a199",
  "#ce897b",
];

class BallGame {
  constructor(ballQuantity, speed, radius) {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 1400;
    this.canvas.height = 700;
    this.ballQuantity = ballQuantity;
    this.radius = radius;
    this.speed = speed;
    this.balls = [];
  }

  createBalls() {
    for (let i = 1; i <= this.ballQuantity; i++) {
      const colorIndex = i % ballColors.length;
      const ballColor = ballColors[colorIndex];

      let isOverlapping = true;
      let x, y;

      // Generate coordinates until a non-overlapping position is found

      while (isOverlapping) {
        isOverlapping = false;
        x = Math.random() * (this.canvas.width - this.radius * 2) + this.radius;
        y =
          Math.random() * (this.canvas.height - this.radius * 2) + this.radius;

        // Check for overlap with existing balls
        for (let j = 0; j < this.balls.length; j++) {
          const existingBall = this.balls[j];
          const distance = Math.sqrt(
            (x - existingBall.x) ** 2 + (y - existingBall.y) ** 2
          );
          if (distance < this.radius * 2) {
            isOverlapping = true;
            break;
          }
        }
      }

      const dx = (Math.random() - 0.5) * this.speed;
      const dy = (Math.random() - 0.5) * this.speed;
      const ball = new Ball(this.ctx, x, y, dx, dy, this.radius, ballColor);
      this.balls.push(ball);
    }
  }
  //updates animation frame
  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      ball.draw();

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (
        ball.x + ball.radius > this.canvas.width ||
        ball.x - ball.radius < 0
      ) {
        ball.dx = -ball.dx;
      }

      if (
        ball.y + ball.radius > this.canvas.height ||
        ball.y - ball.radius < 0
      ) {
        ball.dy = -ball.dy;
      }

      for (let j = 0; j < this.balls.length; j++) {
        if (i !== j) {
          const otherBall = this.balls[j];
          if (ball.checkCollision(otherBall)) {
            // Perform elastic collision
            BallGame.resolveElasticCollision(ball, otherBall);
          }
        }
      }
    }

    requestAnimationFrame(() => this.update());
  }

  static resolveElasticCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    // Calculate unit normal and unit tangent vectors
    const normalX = dx / distance;
    const normalY = dy / distance;
    const tangentX = -normalY;
    const tangentY = normalX;

    // Calculate initial velocity components along the normal and tangent vectors
    const vel1Normal = ball1.dx * normalX + ball1.dy * normalY;
    const vel1Tangent = ball1.dx * tangentX + ball1.dy * tangentY;
    const vel2Normal = ball2.dx * normalX + ball2.dy * normalY;
    const vel2Tangent = ball2.dx * tangentX + ball2.dy * tangentY;

    // Calculate new normal velocity components after collision using 1D elastic collision formulas
    const newVel1Normal =
      (vel1Normal * (ball1.radius - ball2.radius) +
        2 * ball2.radius * vel2Normal) /
      (ball1.radius + ball2.radius);
    const newVel2Normal =
      (vel2Normal * (ball2.radius - ball1.radius) +
        2 * ball1.radius * vel1Normal) /
      (ball1.radius + ball2.radius);

    // Calculate final velocity vectors by combining normal and tangent components
    const newVel1X = newVel1Normal * normalX + vel1Tangent * tangentX;
    const newVel1Y = newVel1Normal * normalY + vel1Tangent * tangentY;
    const newVel2X = newVel2Normal * normalX + vel2Tangent * tangentX;
    const newVel2Y = newVel2Normal * normalY + vel2Tangent * tangentY;

    // Update ball velocities after collision
    ball1.dx = newVel1X;
    ball1.dy = newVel1Y;
    ball2.dx = newVel2X;
    ball2.dy = newVel2Y;
  }

  initGame() {
    this.createBalls();
    this.update();
  }
}

class Ball {
  constructor(ctx, x, y, dx, dy, radius, color) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  checkCollision(otherBall) {
    const distance = Math.sqrt(
      (this.x - otherBall.x) ** 2 + (this.y - otherBall.y) ** 2
    );
    return distance < this.radius + otherBall.radius;
  }
}

const ballQuantity = 50;
const speed = 10;
const radius = 10;

const canvas = new BallGame(ballQuantity, speed, radius);
canvas.initGame();
