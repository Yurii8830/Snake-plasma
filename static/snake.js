const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20;

const logo = new Image();
logo.src = "/static/logo.png";

const foodSize = box * 1.2;

let snake = [];
let food;
let direction = "RIGHT";
let score = 0;
let game = null;
let isPaused = false;

document.addEventListener("keydown", keyHandler);

function keyHandler(e) {
  const key = e.key;
  if ((key === "ArrowLeft" || key === "a") && direction !== "RIGHT") direction = "LEFT";
  else if ((key === "ArrowUp" || key === "w") && direction !== "DOWN") direction = "UP";
  else if ((key === "ArrowRight" || key === "d") && direction !== "LEFT") direction = "RIGHT";
  else if ((key === "ArrowDown" || key === "s") && direction !== "UP") direction = "DOWN";
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

function drawGrid() {
  ctx.strokeStyle = "#00664466";
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += box) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += box) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function draw() {
  if (isPaused) return;

  let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#00412e');
  gradient.addColorStop(1, '#001d12');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#00ff88" : "#00cc66";
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = i === 0 ? 12 : 6;
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 12;
  const padding = (box - foodSize) / 2;
  ctx.drawImage(logo, food.x + padding, food.y + padding, foodSize, foodSize);

  let head = { x: snake[0].x, y: snake[0].y };

  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height
  ) {
    clearInterval(game);
    alert("Game Over! Score: " + score);
    return;
  }

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    clearInterval(game);
    alert("Game Over! Score: " + score);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").innerText = score;
    food = randomFood();
  } else {
    snake.pop();
  }
}

function startGame() {
  if (!document.getElementById("username").value.trim()) {
    alert("Please enter your name before starting!");
    return;
  }
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "RIGHT";
  score = 0;
  food = randomFood();
  document.getElementById("score").innerText = score;
  if (game) clearInterval(game);
  game = setInterval(draw, 150);
  isPaused = false;
}

function pauseGame() {
  isPaused = true;
}

function resumeGame() {
  if (!game) {
    game = setInterval(draw, 150);
  }
  isPaused = false;
}

async function submitScore() {
  const username = document.getElementById("username").value.trim() || "anonymous";
  if(score === 0) {
    alert("Score is zero, play first!");
    return;
  }
  try {
    await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, score }),
    });
    await updateLeaderboard();
    alert("Score submitted!");
  } catch (e) {
    alert("Error submitting score");
    console.error(e);
  }
}

async function updateLeaderboard() {
  try {
    const res = await fetch("/leaderboard");
    const data = await res.json();
    const list = document.getElementById("leaderboard");
    list.innerHTML = "";
    data.forEach(([name, points], index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${name}: ${points}`;
      list.appendChild(li);
    });
  } catch (e) {
    console.error("Error loading leaderboard:", e);
  }
}

updateLeaderboard();



