document.documentElement.classList.add("js");

const yearElement = document.getElementById("year");
const progress = document.getElementById("scrollProgress");
const cursorGlow = document.getElementById("cursorGlow");
const menuButton = document.getElementById("menuButton");
const menuClose = document.getElementById("menuClose");
const menuOverlay = document.getElementById("menuOverlay");
const navLinks = document.querySelectorAll(".desktop-links a");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

function updateScrollProgress() {
  if (!progress) return;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progress.style.width = `${percent}%`;
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

if (cursorGlow) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.opacity = "1";
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });

  window.addEventListener("pointerleave", () => {
    cursorGlow.style.opacity = "0";
  });
}

function openMenu() {
  document.body.classList.add("menu-open");
  if (menuButton) menuButton.setAttribute("aria-expanded", "true");
  if (menuOverlay) menuOverlay.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  if (menuButton) menuButton.setAttribute("aria-expanded", "false");
  if (menuOverlay) menuOverlay.setAttribute("aria-hidden", "true");
}

if (menuButton) menuButton.addEventListener("click", openMenu);
if (menuClose) menuClose.addEventListener("click", closeMenu);

document.querySelectorAll(".menu-links a, .menu-socials a").forEach((link) => {
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
    threshold: 0.12,
    rootMargin: "0px 0px -50px 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sections = document.querySelectorAll("section[id], header[id]");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  {
    threshold: 0.35,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

document.querySelectorAll(".tilt-card, .work-card, .case-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--x", `${x}%`);
    card.style.setProperty("--y", `${y}%`);

    const rotateX = (y - 50) * -0.035;
    const rotateY = (x - 50) * 0.035;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});
