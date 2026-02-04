const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const scoreEl = document.getElementById("score");
const finalScore = document.getElementById("finalScore");

let gameState = "START";

canvas.width = 480;
canvas.height = 640;

let bird = {
  x: 100,
  y: 100,
  size: 50,
  velY: 0,
  gravity: 0.6,
  jumpPower: -15,
  grounded: false,


jump() {
  if (!this.grounded) return;

  this.velY = this.jumpPower;
  this.grounded = false;
},

applyGravity() {
  this.velY += this.gravity;
  this.y += this.velY;
  
},

draw() {
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
};


const ground = canvas.height - 100;

const speed = 5;

function update() {
  // game logic goes here
  if (gameState === "START") return;
  if (keys["ArrowRight"] || keys["d"]) bird.x += speed;
  if (keys["ArrowLeft"] || keys["a"]) bird.x -= speed;
  bird.applyGravity();
  if (bird.y + bird.size >= ground) {
    bird.y = ground - bird.size;
    bird.velY = 0;
    bird.grounded = true;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(bird.x, bird.y, bird.size, bird.size);
}

const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

window.addEventListener("keyup", (e) => {
  keys[e.key] = true;
  if (e.code === "Space") {
    bird.jump();
  }
});