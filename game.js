const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const scoreEl = document.getElementById("score");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const gameContainer = document.getElementById("game-container");

const birdImage = new Image();
birdImage.src = "assets/flappy-bird.png";

const pipeImage = new Image();
pipeImage.src = "assets/pipes-image.jpg";

pipeImage.onload = () => {
  console.log("Pipe image loaded");
};

birdImage.onload = () => {
  console.log("Bird image loaded");
};

let gameState = "START";
let canRestart = false;

canvas.width = 480;
canvas.height = 640;

let bird = {
  x: 100,
  y: 100,
  size: 50,
  velY: 0,
  gravity: 0.2,
  jumpPower: -6,
  grounded: false,
  rotation: 0,
  rotationTarget: 0,


jump() {
  this.velY = this.jumpPower;
  this.grounded = false;
},

applyGravity() {
  this.velY += this.gravity;
  this.y += this.velY;
  // tilt bird up when moving upward, down when falling
  this.rotation = this.velY * 0.1

  if (this.rotation > 1) this.rotation = 1;
  if (this.rotation < -1) this.rotation = -1;
  
},

draw() {
    ctx.save();

  // move origin to center of bird
  ctx.translate(this.x + this.size / 2, this.y + this.size / 2);

  // rotate
  ctx.rotate(this.rotation);

  // draw image centered
  ctx.drawImage(
    birdImage,
    -this.size / 2,
    -this.size / 2,
    this.size,
    this.size
  );

  ctx.restore();
    
  }
};


const ground = canvas.height - 1;

const speed = 5;
// pipes and scoring
let pipes = [];
let pipeSpeed = 3;
let pipeSpawnTimer = 0;
const pipeSpawnInterval = 150; // frames
let score = 0;
if (scoreEl) scoreEl.textContent = score;

// AABB overlap test moved out of the per-pipe loop to avoid re-creating
const rectsOverlap = (r1, r2) => !(r1.x + r1.w < r2.x || r1.x > r2.x + r2.w || r1.y + r1.h < r2.y || r1.y > r2.y + r2.h);

function update() {
  // only update during play
  if (gameState !== "PLAY") return;
  if (keys["ArrowRight"] || keys["d"]) bird.x += speed;
  if (keys["ArrowLeft"] || keys["a"]) bird.x -= speed;
  bird.applyGravity();
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
  const birdRect = { x: bird.x, y: bird.y, w: bird.size, h: bird.size };
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= pipeSpeed;

    // scoring when bird passes pipe
    if (!p.passed && p.x + p.width < bird.x) {
      p.passed = true;
      score += 1;
      if (scoreEl) scoreEl.textContent = score;
    }

    // collision detection (AABB)
    const topRect = { x: p.x, y: 0, w: p.width, h: p.gapY };
    const bottomRect = { x: p.x, y: p.gapY + p.gapHeight, w: p.width, h: ground - (p.gapY + p.gapHeight) };

    if (rectsOverlap(birdRect, topRect) || rectsOverlap(birdRect, bottomRect)) {
      gameState = "GAMEOVER";
      if (finalScore) finalScore.textContent = score;
      gameOverScreen.classList.remove("hidden");
      // prevent immediate restart; allow after 2 seconds
      canRestart = false;
      setTimeout(() => {
        canRestart = true;
      }, 2000);
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
    const topHeight = pipe.gapY;
    const bottomY = pipe.gapY + pipe.gapHeight;
    const bottomHeight = ground - bottomY;

    // If we pre-rendered per-pipe bitmaps, draw those (faster than per-frame transforms)
    if (pipe.topImage && pipe.bottomImage) {
      ctx.drawImage(pipe.topImage, pipe.x, 0);
      ctx.drawImage(pipe.bottomImage, pipe.x, bottomY);
    } else if (pipeImage && pipeImage.complete && pipeImage.naturalWidth !== 0) {
      // fallback for pipes created before optimization or if offscreen creation failed
      ctx.save();
      ctx.translate(pipe.x, pipe.gapY);
      ctx.scale(1, -1);
      ctx.drawImage(pipeImage, 0, 0, pipe.width, topHeight);
      ctx.restore();

      ctx.drawImage(pipeImage, pipe.x, bottomY, pipe.width, bottomHeight);
    } else {
      // fallback to simple rectangles if image not loaded
      ctx.fillRect(pipe.x, 0, pipe.width, topHeight);
      ctx.fillRect(pipe.x, bottomY, pipe.width, bottomHeight);
    }
  }
}

const keys = {};
window.addEventListener("keydown", (e) => {
  // handle jump on Space immediately and prevent default scrolling
  if (e.code === "Space") {
    e.preventDefault();
    // START LOGIC
     
      if (gameState === "START") {
        startScreen.classList.add("hidden");
        gameState = "PLAY"
        bird.velY = 0;
        return;
      }

      // JUMP LOGIC
      if (gameState === "PLAY") {
        bird.velY = bird.jumpPower;
        return;
      }

      // RESTART FROM GAMEOVER
      if (gameState === "GAMEOVER" && canRestart) {
        resetGame(); 
        return;
      }
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
  gapY: 65,
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

  const width = 65;
  const gapHeight = singlePipe.gapHeight;
  const topHeight = gapY;
  const bottomHeight = ground - (gapY + gapHeight);

  const pipeObj = {
    x: canvas.width,
    gapY: gapY,
    width: width,
    gapHeight: gapHeight,
    passed: false
  };

  // Pre-render scaled/flipped pipe bitmaps per-pipe to avoid per-frame transforms
  if (pipeImage && pipeImage.complete && pipeImage.naturalWidth !== 0) {
    try {
      const topCanvas = document.createElement('canvas');
      topCanvas.width = width;
      topCanvas.height = Math.max(0, topHeight);
      const tctx = topCanvas.getContext('2d');
      tctx.save();
      tctx.translate(0, topCanvas.height);
      tctx.scale(1, -1);
      tctx.drawImage(pipeImage, 0, 0, pipeImage.width, pipeImage.height, 0, 0, width, topCanvas.height);
      tctx.restore();

      const bottomCanvas = document.createElement('canvas');
      bottomCanvas.width = width;
      bottomCanvas.height = Math.max(0, bottomHeight);
      const bctx = bottomCanvas.getContext('2d');
      bctx.drawImage(pipeImage, 0, 0, pipeImage.width, pipeImage.height, 0, 0, width, bottomCanvas.height);

      pipeObj.topImage = topCanvas;
      pipeObj.bottomImage = bottomCanvas;
    } catch (err) {
      // if offscreen creation fails, fall back to drawing directly each frame
      console.warn('Pipe pre-render failed', err);
    }
  }

  pipes.push(pipeObj);
}

function resetGame() {
  
  // reset bird
  bird.x = 100;
  bird.y = 100;
  bird.velY = 0;
  bird.rotation = 0;
  // resetting the pipes
  pipes = [];
  // reset score
  score = 0;
  if (scoreEl) scoreEl.textContent = score;
  // reset timers
  pipeSpawnTimer = 0;
  // reset game state
  gameState = "PLAY";
  // hide game over screen
  gameOverScreen.classList.add("hidden");
}

// attach restart button
if (restartBtn) restartBtn.addEventListener("click", resetGame);