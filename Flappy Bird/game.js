const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const scoreEl = document.getElementById("score");
const finalScore = document.getElementById("finalScore");

let gameState = "PLAY";

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
// pipes and scoring
let pipes = [];
let pipeSpeed = 3;
let pipeSpawnTimer = 0;
const pipeSpawnInterval = 150; // frames
let score = 0;
scoreEl.textContent = score;

function update() {
  // only update during play
  if (gameState !== "PLAY") return;
  if (keys["ArrowRight"] || keys["d"]) bird.x += speed;
  if (keys["ArrowLeft"] || keys["a"]) bird.x -= speed;
  bird.applyGravity();
  if (bird.y + bird.size >= ground) {
    bird.y = ground - bird.size;
    bird.velY = 0;
    bird.grounded = true;
  }
  // clamp horizontal position so bird stays on canvas
  if (bird.x < 0) bird.x = 0;
  if (bird.x + bird.size > canvas.width) bird.x = canvas.width - bird.size;

  // spawn pipes
  pipeSpawnTimer -= 1;
  if (pipeSpawnTimer <= 0) {
    createPipe();
    pipeSpawnTimer = pipeSpawnInterval;
  }

  // update pipes (move, score, collision, cleanup)
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= pipeSpeed;

    // scoring when bird passes pipe
    if (!p.passed && p.x + p.width < bird.x) {
      p.passed = true;
      score += 1;
      scoreEl.textContent = score;
    }

    // collision detection (AABB)
    const birdRect = { x: bird.x, y: bird.y, w: bird.size, h: bird.size };
    const topRect = { x: p.x, y: 0, w: p.width, h: p.gapY };
    const bottomRect = { x: p.x, y: p.gapY + p.gapHeight, w: p.width, h: ground - (p.gapY + p.gapHeight) };
    const rectsOverlap = (r1, r2) => !(r1.x + r1.w < r2.x || r1.x > r2.x + r2.w || r1.y + r1.h < r2.y || r1.y > r2.y + r2.h);

    if (rectsOverlap(birdRect, topRect) || rectsOverlap(birdRect, bottomRect)) {
      gameState = "GAMEOVER";
      finalScore.textContent = score;
    }

    // remove offscreen pipes
    if (p.x + p.width < 0) {
      pipes.splice(i, 1);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  bird.draw();

  for (let pipe of pipes) {
    // top pipe 
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
    // bottom pipe
    ctx.fillRect(
      pipe.x,
      pipe.gapY + pipe.gapHeight,
      pipe.width,
      ground - (pipe.gapY + pipe.gapHeight)
    )
  }
}

const keys = {};
window.addEventListener("keydown", (e) => {
  // handle jump on Space immediately and prevent default scrolling
  if (e.code === "Space") {
    e.preventDefault();
    bird.jump();
    return;
  }
  keys[e.key] = true;
});

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

window.addEventListener("keyup", (e) => {
  // release key state on keyup
  keys[e.key] = false;
});

let singlePipe = {
  x: 300,
  gapY: 50,
  gapHeight: 200,
};

function getRandomGapY() {
  const minGapY = 50;
  // max gap Y should be measured from the top down to leave room for the gap
  // ensure we compute it relative to the ground and the gap height
  const maxGapY = ground - singlePipe.gapHeight - 50;
  // return integer Y between minGapY and maxGapY (inclusive)
  return Math.floor(Math.random() * (maxGapY - minGapY + 1) + minGapY);
}

function createPipe() {
  const gapY = getRandomGapY();

  pipes.push({
    x: canvas.width,
    gapY: gapY,
    width: 60,
    gapHeight: singlePipe.gapHeight,
    passed: false // track if bird has passed this pipe for scoring
  });
}


