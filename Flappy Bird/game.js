const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function update() {
  // game logic goes here
  
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
