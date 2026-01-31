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
};

jump(); {
  this.velY = this.jumpPower;
  this.grounded = false;
  this.velY += 10; // small boost to jump

};

const ground = canvas.height - 100;

const speed = 5;

function update() {
  // game logic goes here
  if (gameState === "START") return;
  if (keys["ArrowRight"] || keys["d"]) box.x += speed;
  if (keys["ArrowLeft"] || keys["a"]) box.x -= speed;
  box.velY += box.gravity;
  box.y += box.velY;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(box.x, box.y, box.size, box.size);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

