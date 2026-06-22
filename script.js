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
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 350);
});

if (year) {
  year.textContent = new Date().getFullYear();
}

function updateProgress() {
  if (!progress) return;

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${value}%`;
}

function updateScrollScenes() {
  const scenes = document.querySelectorAll(".scroll-scene");

  scenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = (center - window.innerHeight / 2) / window.innerHeight;
    const move = Math.max(-28, Math.min(28, distance * -26));
    scene.style.setProperty("--scene-y", `${move}px`);
  });
}

window.addEventListener("scroll", () => {
  updateProgress();
  updateScrollScenes();
}, { passive: true });

updateProgress();
updateScrollScenes();

function openMenu() {
  document.body.classList.add("menu-open");
  menuButton?.setAttribute("aria-expanded", "true");
  menuOverlay?.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuOverlay?.setAttribute("aria-hidden", "true");
}

menuButton?.addEventListener("click", openMenu);
menuClose?.addEventListener("click", closeMenu);

document.querySelectorAll(".menu-nav a, .menu-socials a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -60px 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

window.addEventListener("pointermove", (event) => {
  if (cursorRing) {
    cursorRing.style.opacity = "1";
    cursorRing.style.left = `${event.clientX}px`;
    cursorRing.style.top = `${event.clientY}px`;
  }

  moveEyes(event.clientX, event.clientY);
});

window.addEventListener("pointerleave", () => {
  if (cursorRing) {
    cursorRing.style.opacity = "0";
  }

  pupils.forEach((pupil) => {
    pupil.setAttribute("cx", pupil.dataset.originX);
    pupil.setAttribute("cy", pupil.dataset.originY);
  });
});

document.querySelectorAll("a, button, .magnetic-card").forEach((el) => {
  el.addEventListener("pointerenter", () => {
    if (!cursorRing) return;
    cursorRing.style.width = "52px";
    cursorRing.style.height = "52px";
  });

  el.addEventListener("pointerleave", () => {
    if (!cursorRing) return;
    cursorRing.style.width = "26px";
    cursorRing.style.height = "26px";
  });
});

document.querySelectorAll(".magnetic-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    card.style.transform = `perspective(900px) rotateX(${y * -0.012}deg) rotateY(${x * 0.012}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

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
    const maxMove = 6;

    const moveX = (dx / distance) * Math.min(maxMove, distance);
    const moveY = (dy / distance) * Math.min(maxMove, distance);

    pupil.setAttribute("cx", (originX + moveX).toFixed(2));
    pupil.setAttribute("cy", (originY + moveY).toFixed(2));
  });
}
