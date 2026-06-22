document.documentElement.classList.add("js");

const year = document.getElementById("year");
const progress = document.getElementById("scrollProgress");
const menuButton = document.getElementById("menuButton");
const menuClose = document.getElementById("menuClose");
const menuOverlay = document.getElementById("menuOverlay");
const pupils = document.querySelectorAll(".pupil");
const portraitSvg = document.querySelector(".portrait-svg");

if (year) {
  year.textContent = new Date().getFullYear();
}

function updateProgress() {
  if (!progress) return;

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${value}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

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

document.querySelectorAll(".menu-nav a, .menu-social a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -55px 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

function moveEyes(clientX, clientY) {
  if (!portraitSvg || !pupils.length) return;

  const rect = portraitSvg.getBoundingClientRect();
  const svgX = ((clientX - rect.left) / rect.width) * 300;
  const svgY = ((clientY - rect.top) / rect.height) * 300;

  pupils.forEach((pupil) => {
    const originX = Number(pupil.dataset.originX);
    const originY = Number(pupil.dataset.originY);
    const dx = svgX - originX;
    const dy = svgY - originY;
    const distance = Math.hypot(dx, dy) || 1;
    const maxMove = 5;

    const moveX = (dx / distance) * Math.min(maxMove, distance);
    const moveY = (dy / distance) * Math.min(maxMove, distance);

    pupil.setAttribute("cx", (originX + moveX).toFixed(2));
    pupil.setAttribute("cy", (originY + moveY).toFixed(2));
  });
}

window.addEventListener("pointermove", (event) => {
  moveEyes(event.clientX, event.clientY);
});

window.addEventListener("pointerleave", () => {
  pupils.forEach((pupil) => {
    pupil.setAttribute("cx", pupil.dataset.originX);
    pupil.setAttribute("cy", pupil.dataset.originY);
  });
});
