document.documentElement.classList.add("js");

const loader = document.getElementById("loader");
const year = document.getElementById("year");
const progress = document.getElementById("scrollProgress");
const cursorRing = document.getElementById("cursorRing");
const menuButton = document.getElementById("menuButton");
const menuClose = document.getElementById("menuClose");
const menuOverlay = document.getElementById("menuOverlay");
const pupils = document.querySelectorAll(".pupil");
const portraitSvg = document.querySelector(".line-portrait");

window.addEventListener("load", () => {
  setTimeout(() => document.body.classList.add("loaded"), 350);
});

if (year) year.textContent = new Date().getFullYear();

function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${value}%`;
}

function updatePowerScenes() {
  document.querySelectorAll(".power-scene").forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = (center - window.innerHeight / 2) / window.innerHeight;
    const move = Math.max(-28, Math.min(28, distance * -26));
    scene.style.setProperty("--scene-y", `${move}px`);
  });
}

window.addEventListener("scroll", () => {
  updateProgress();
  updatePowerScenes();
}, { passive: true });

updateProgress();
updatePowerScenes();

function openMenu() {
  document.body.classList.add("menu-open");
  menuButton?.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
}

menuButton?.addEventListener("click", openMenu);
menuClose?.addEventListener("click", closeMenu);

document.querySelectorAll(".menu-list a, .menu-nav a, .menu-footer a, .menu-socials a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

window.addEventListener("pointermove", (event) => {
  if (cursorRing) {
    cursorRing.style.opacity = "1";
    cursorRing.style.left = `${event.clientX}px`;
    cursorRing.style.top = `${event.clientY}px`;
  }
  moveEyes(event.clientX, event.clientY);
});

window.addEventListener("pointerleave", () => {
  if (cursorRing) cursorRing.style.opacity = "0";
  pupils.forEach((pupil) => {
    pupil.setAttribute("cx", pupil.dataset.originX);
    pupil.setAttribute("cy", pupil.dataset.originY);
  });
});

document.querySelectorAll("a, button, .magnetic-card").forEach((el) => {
  el.addEventListener("pointerenter", () => {
    if (!cursorRing) return;
    cursorRing.style.width = "54px";
    cursorRing.style.height = "54px";
  });

  el.addEventListener("pointerleave", () => {
    if (!cursorRing) return;
    cursorRing.style.width = "26px";
    cursorRing.style.height = "26px";
  });
});

if (document.body.dataset.page !== "play") {
  document.querySelectorAll(".magnetic-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      card.style.transform = `perspective(900px) rotateX(${y * -0.01}deg) rotateY(${x * 0.01}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function moveEyes(clientX, clientY) {
  if (!portraitSvg || !pupils.length) return;

  const rect = portraitSvg.getBoundingClientRect();
  const svgX = ((clientX - rect.left) / rect.width) * 420;
  const svgY = ((clientY - rect.top) / rect.height) * 520;

  pupils.forEach((pupil) => {
    const originX = Number(pupil.dataset.originX);
    const originY = Number(pupil.dataset.originY);
    const dx = svgX - originX;
    const dy = svgY - originY;
    const distance = Math.hypot(dx, dy) || 1;
    const maxMove = 7;

    const moveX = (dx / distance) * Math.min(maxMove, distance);
    const moveY = (dy / distance) * Math.min(maxMove, distance);

    pupil.setAttribute("cx", (originX + moveX).toFixed(2));
    pupil.setAttribute("cy", (originY + moveY).toFixed(2));
  });
}


const boardElement = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const gameStatus = document.getElementById("gameStatus");
const gameMessage = document.getElementById("gameMessage");
const resetGame = document.getElementById("resetGame");
const playerScoreElement = document.getElementById("playerScore");
const botScoreElement = document.getElementById("botScore");
const drawScoreElement = document.getElementById("drawScore");
const confettiCanvas = document.getElementById("confettiCanvas");

let board = Array(9).fill("");
let gameOver = false;
let scores = { player: 0, bot: 0, draw: 0 };

const wins = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

if (boardElement) {
  cells.forEach((cell) => {
    cell.addEventListener("click", () => handlePlayerMove(Number(cell.dataset.cell)));
  });

  resetGame?.addEventListener("click", resetBoard);
}

function handlePlayerMove(index) {
  if (gameOver || board[index]) return;

  placeMove(index, "X");
  const result = checkGame();

  if (result) {
    endGame(result);
    return;
  }

  gameStatus.textContent = "DanBot is thinking...";
  setTimeout(botMove, 420);
}

function botMove() {
  if (gameOver) return;

  const index = chooseBotMove();
  placeMove(index, "O");

  const result = checkGame();
  if (result) {
    endGame(result);
    return;
  }

  gameStatus.textContent = "Your move. Make it count.";
  gameMessage.innerHTML = "<span>Tip:</span> try blocking the next threat.";
}

function placeMove(index, mark) {
  board[index] = mark;
  const cell = cells[index];
  cell.textContent = mark;
  cell.classList.add(mark.toLowerCase());
  cell.disabled = true;
}

function chooseBotMove() {
  const empty = board.map((value, index) => value ? null : index).filter((v) => v !== null);

  const winMove = findBestMove("O");
  if (winMove !== null) return winMove;

  const blockMove = findBestMove("X");
  if (blockMove !== null) return blockMove;

  if (board[4] === "") return 4;

  const corners = [0, 2, 6, 8].filter((i) => board[i] === "");
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  return empty[Math.floor(Math.random() * empty.length)];
}

function findBestMove(mark) {
  for (const combo of wins) {
    const values = combo.map((index) => board[index]);
    const markCount = values.filter((value) => value === mark).length;
    const emptyIndex = combo.find((index) => board[index] === "");

    if (markCount === 2 && emptyIndex !== undefined) {
      return emptyIndex;
    }
  }

  return null;
}

function checkGame() {
  for (const combo of wins) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }

  if (board.every(Boolean)) {
    return { winner: "draw", combo: [] };
  }

  return null;
}

function endGame(result) {
  gameOver = true;
  cells.forEach((cell) => cell.disabled = true);

  result.combo.forEach((index) => cells[index].classList.add("winning"));

  if (result.winner === "X") {
    scores.player += 1;
    gameStatus.textContent = "You won. Respect.";
    gameMessage.innerHTML = "<span>Victory:</span> glowing confetti unlocked.";
    fireConfetti();
  } else if (result.winner === "O") {
    scores.bot += 1;
    gameStatus.textContent = "DanBot wins this round.";
    gameMessage.innerHTML = "<span>No worries:</span> DanBot won this round. Run it back?";
  } else {
    scores.draw += 1;
    gameStatus.textContent = "Draw. That was close.";
    gameMessage.innerHTML = "<span>Draw:</span> no winner, no excuses.";
  }

  updateScore();
}

function updateScore() {
  if (playerScoreElement) playerScoreElement.textContent = scores.player;
  if (botScoreElement) botScoreElement.textContent = scores.bot;
  if (drawScoreElement) drawScoreElement.textContent = scores.draw;
}

function resetBoard() {
  board = Array(9).fill("");
  gameOver = false;
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("x", "o", "winning");
  });

  if (gameStatus) gameStatus.textContent = "Your move. Make it count.";
  if (gameMessage) gameMessage.innerHTML = "<span>Tip:</span> corners are powerful.";
}

function fireConfetti() {
  if (!confettiCanvas) return;

  const ctx = confettiCanvas.getContext("2d");
  const particles = [];
  const colors = ["#ffffff", "#ff3b4e", "#e11d2e", "#ffd1d6"];

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  for (let i = 0; i < 170; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.8) * 15,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 90 + Math.random() * 40,
      rotation: Math.random() * Math.PI
    });
  }

  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.rotation += 0.18;
      p.life -= 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
      ctx.restore();
    });

    if (particles.some((p) => p.life > 0)) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  draw();
}


const eggTrigger = document.getElementById("eggTrigger");
const eggPanel = document.getElementById("eggPanel");
const eggClose = document.getElementById("eggClose");
let logoTapCount = 0;
let logoTapTimer = null;

function openEgg() {
  if (!eggPanel) return;
  eggPanel.classList.add("is-open");
  eggPanel.setAttribute("aria-hidden", "false");
}

function closeEgg() {
  if (!eggPanel) return;
  eggPanel.classList.remove("is-open");
  eggPanel.setAttribute("aria-hidden", "true");
}

eggTrigger?.addEventListener("click", openEgg);
eggClose?.addEventListener("click", closeEgg);

eggPanel?.addEventListener("click", (event) => {
  if (event.target === eggPanel) closeEgg();
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "p" && document.body.dataset.page !== "play") {
    openEgg();
  }

  if (event.key === "Escape") {
    closeEgg();
  }
});

document.querySelector(".brand")?.addEventListener("click", (event) => {
  if (document.body.dataset.page === "play") return;

  logoTapCount += 1;
  clearTimeout(logoTapTimer);

  logoTapTimer = setTimeout(() => {
    logoTapCount = 0;
  }, 900);

  if (logoTapCount >= 3) {
    event.preventDefault();
    logoTapCount = 0;
    openEgg();
  }
});
