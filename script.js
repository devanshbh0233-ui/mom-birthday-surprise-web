const pages = document.querySelectorAll(".page");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const dotsBox = document.getElementById("dots");
const music = document.getElementById("music");
let current = 0;

// build dots
pages.forEach(() => dotsBox.appendChild(document.createElement("i")));
const dots = dotsBox.querySelectorAll("i");

function show(n) {
  current = Math.max(0, Math.min(pages.length - 1, n));
  pages.forEach((p, i) => p.classList.toggle("active", i === current));
  dots.forEach((d, i) => d.classList.toggle("on", i === current));
  prev.disabled = current === 0;
  next.disabled = current === pages.length - 1;

  // pause videos when leaving the video page
  document.querySelectorAll("video").forEach(v => { if (current !== 2) v.pause(); });

  if (current === pages.length - 1) launchConfetti();
}

next.addEventListener("click", () => {
  show(current + 1);
  // browsers only allow music after a click; the file is optional
  if (music.paused && music.getAttribute("src")) music.play().catch(() => {});
});
prev.addEventListener("click", () => show(current - 1));
document.getElementById("replay").addEventListener("click", launchConfetti);

document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") show(current + 1);
  if (e.key === "ArrowLeft") show(current - 1);
});

// swipe on phones
let startX = 0;
document.addEventListener("touchstart", e => { startX = e.touches[0].clientX; });
document.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 60) show(current + (dx < 0 ? 1 : -1));
});

// confetti
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let pieces = [], running = false;
const colors = ["#ff6f9c", "#ffb84d", "#ffd3e0", "#c77dff", "#7ed6c4"];

function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize);
resize();

function launchConfetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    r: 4 + Math.random() * 6,
    vy: 2 + Math.random() * 3,
    vx: -1 + Math.random() * 2,
    c: colors[Math.floor(Math.random() * colors.length)]
  }));
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x, p.y, p.r, p.r * 1.6);
  });
  pieces = pieces.filter(p => p.y < canvas.height + 20);
  if (pieces.length) requestAnimationFrame(tick);
  else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

// floating hearts in the background
const heartsBox = document.getElementById("hearts");
const emojis = ["💖", "💕", "🌸", "✨", "💗", "🌷"];
function spawnHeart(x, burst) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const h = document.createElement("span");
  h.className = "float-heart";
  h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  h.style.left = (x ?? Math.random() * 100) + (burst ? "px" : "%");
  h.style.fontSize = 16 + Math.random() * 22 + "px";
  h.style.animationDuration = 6 + Math.random() * 6 + "s";
  if (burst) h.style.bottom = burst + "px";
  heartsBox.appendChild(h);
  setTimeout(() => h.remove(), 12000);
}
setInterval(() => spawnHeart(), 900);

// tap anywhere = little hearts
document.addEventListener("click", e => {
  if (e.target.closest("#nav, video, button")) return;
  for (let i = 0; i < 5; i++) spawnHeart(e.clientX + (Math.random() * 60 - 30), innerHeight - e.clientY);
});

show(0);