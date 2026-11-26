const game = document.getElementById("game-container");
const apple = document.getElementById("apple");
const basket = document.getElementById("basket");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const statusElement = document.getElementById("game-status");
const message = document.getElementById("game-message");
const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");
const leftButton = document.getElementById("left-btn");
const rightButton = document.getElementById("right-btn");

const GAME_WIDTH = 500;
const BASKET_WIDTH = 82;
const APPLE_SIZE = 36;
const BASKET_BOTTOM = 8;
const MOVE_STEP = 24;

let score = 0;
let lives = 3;
let basketX = (GAME_WIDTH - BASKET_WIDTH) / 2;
let appleX = 0;
let appleY = 10;
let fallSpeed = 2.2;
let animationId = null;
let lastFrameTime = 0;
let running = false;
const keys = { left: false, right: false };

function getGameWidth() {
  return game.clientWidth;
}

function placeBasket() {
  const maxX = getGameWidth() - basket.offsetWidth;
  basketX = Math.max(0, Math.min(basketX, maxX));
  basket.style.left = `${basketX}px`;
}

function resetApple() {
  const maxX = Math.max(0, getGameWidth() - APPLE_SIZE);
  appleX = Math.random() * maxX;
  appleY = -APPLE_SIZE;
  apple.style.left = `${appleX}px`;
  apple.style.top = `${appleY}px`;
}

function updateStats() {
  scoreElement.textContent = score;
  livesElement.textContent = lives;
}

function showMessage(title, description) {
  message.innerHTML = "";
  const heading = document.createElement("strong");
  heading.textContent = title;
  const detail = document.createElement("span");
  detail.textContent = description;
  message.append(heading, detail);
  message.classList.remove("hidden");
}

function hideMessage() {
  message.classList.add("hidden");
}

function startGame() {
  if (running) return;
  if (lives <= 0) resetGame();

  running = true;
  statusElement.textContent = "Đang chơi";
  startButton.disabled = true;
  hideMessage();
  lastFrameTime = 0;
  resetApple();
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  running = false;
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  statusElement.textContent = "Game Over";
  startButton.disabled = false;
  showMessage("Game Over", `Bạn đạt ${score} điểm. Nhấn “Chơi lại” để thử lần nữa.`);
}

function resetGame() {
  if (animationId !== null) cancelAnimationFrame(animationId);
  animationId = null;
  running = false;
  score = 0;
  lives = 3;
  fallSpeed = 2.2;
  basketX = (getGameWidth() - BASKET_WIDTH) / 2;
  appleY = 10;
  updateStats();
  placeBasket();
  resetApple();
  statusElement.textContent = "Sẵn sàng";
  startButton.disabled = false;
  showMessage("Sẵn sàng chơi?", "Nhấn “Bắt đầu” rồi dùng phím ← → để di chuyển giỏ.");
}

function updateBasket(deltaRatio) {
  const movement = MOVE_STEP * deltaRatio;
  if (keys.left) basketX -= movement;
  if (keys.right) basketX += movement;
  placeBasket();
}

function isCaught() {
  const basketTop = game.clientHeight - BASKET_BOTTOM - basket.offsetHeight;
  const appleBottom = appleY + APPLE_SIZE;
  const basketRight = basketX + basket.offsetWidth;
  const appleRight = appleX + APPLE_SIZE;

  return appleBottom >= basketTop &&
    appleY <= basketTop + basket.offsetHeight &&
    appleRight >= basketX &&
    appleX <= basketRight;
}

function gameLoop(timestamp) {
  if (!running) return;

  const deltaRatio = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 16.67, 2) : 1;
  lastFrameTime = timestamp;

  updateBasket(deltaRatio);
  appleY += fallSpeed * deltaRatio;
  apple.style.top = `${appleY}px`;

  if (isCaught()) {
    score += 1;
    fallSpeed += 0.18;
    updateStats();
    resetApple();
  } else if (appleY + APPLE_SIZE >= game.clientHeight) {
    lives -= 1;
    updateStats();
    if (lives <= 0) {
      endGame();
      return;
    }
    resetApple();
  }

  animationId = requestAnimationFrame(gameLoop);
}

function setKey(key, pressed) {
  if (key === "ArrowLeft") keys.left = pressed;
  if (key === "ArrowRight") keys.right = pressed;
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    setKey(event.key, true);
  }
});
document.addEventListener("keyup", event => setKey(event.key, false));
window.addEventListener("blur", () => {
  keys.left = false;
  keys.right = false;
});

function bindHoldButton(button, direction) {
  const begin = event => {
    event.preventDefault();
    keys[direction] = true;
  };
  const stop = () => { keys[direction] = false; };
  button.addEventListener("pointerdown", begin);
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointerleave", stop);
  button.addEventListener("pointercancel", stop);
}
bindHoldButton(leftButton, "left");
bindHoldButton(rightButton, "right");

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", resetGame);
window.addEventListener("resize", placeBasket);

placeBasket();
resetApple();
updateStats();
showMessage("Sẵn sàng chơi?", "Nhấn “Bắt đầu” rồi dùng phím ← → để di chuyển giỏ.");
