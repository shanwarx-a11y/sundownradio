// ============================================================
//  Gather — vanilla JS port of the React components
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  buildOrbit();
  buildCarousel();
  buildWave();
  initNavbar();

  // Render lucide icons (must run after dynamic DOM is in place)
  if (window.lucide) lucide.createIcons();
});

// ------------------------------------------------------------
//  HERO — orbiting image arch (was Hero.tsx)
// ------------------------------------------------------------
function buildOrbit() {
  const ITEM_COUNT = 18;
  const BASE_SIZE = 110;
  const SIZE_VARIANCE = 18;
  const track = document.getElementById("orbit-track");
  if (!track) return;

  for (let i = 0; i < ITEM_COUNT; i++) {
    const px = Math.round(
      BASE_SIZE + SIZE_VARIANCE * Math.sin((i / ITEM_COUNT) * Math.PI * 4)
    );
    const desktopSize = `clamp(${Math.round(px * 0.45)}px, ${(px * 0.065).toFixed(
      2
    )}vw, ${px}px)`;
    const mobileSize = `${Math.round(px * 0.45)}px`;
    const angle = i * (360 / ITEM_COUNT);

    const item = document.createElement("div");
    item.className = "arch-item absolute left-0 top-0";
    item.style.setProperty("--desktop-size", desktopSize);
    item.style.setProperty("--mobile-size", mobileSize);
    item.style.transform = `rotate(${angle}deg) translateY(calc(var(--radius) * -1))`;
    item.innerHTML = `
      <div class="h-full w-full overflow-hidden rounded-[22%] shadow-2xl shadow-black/60">
        <img src="https://picsum.photos/seed/gather-${i + 1}/400" alt="" class="h-full w-full object-cover" />
      </div>`;
    track.appendChild(item);
  }
}

// ------------------------------------------------------------
//  TRACKS — 3D carousel + player (was TracksSection.tsx)
// ------------------------------------------------------------
const tracks = [
  { title: "Shawn Mendes", artist: "Senorita", image: "https://picsum.photos/seed/gather-t1/400/500" },
  { title: "Naughty Boy", artist: "La La La", image: "https://picsum.photos/seed/gather-t2/400/500" },
  { title: "The Weeknd", artist: "Blinding Lights", image: "https://picsum.photos/seed/gather-t3/400/500" },
  { title: "Wiz Khalifa", artist: "Black And Yellow", image: "https://picsum.photos/seed/gather-t4/400/500" },
  { title: "Youth", artist: "Troian", image: "https://picsum.photos/seed/gather-t5/400/500" },
];

const CARD_WIDTH = "clamp(190px, 21vw, 320px)";
const CARD_HEIGHT = "clamp(270px, 30vw, 450px)";
const STEP = "clamp(120px, 13vw, 195px)";
const SCALE = [1.1, 0.85, 0.66];
const OPACITY = [1, 0.8, 0.4];
const DEPTH = [30, -70, -150]; // translateZ — center pops forward, sides recede
const WAVE_BARS = [8, 14, 11, 5];

let active = 2;
let playing = true;
const cardEls = [];

function buildCarousel() {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  tracks.forEach((track, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.style.width = CARD_WIDTH;
    btn.style.height = CARD_HEIGHT;
    btn.style.transition =
      "transform 500ms cubic-bezier(0.25,0.8,0.25,1), opacity 500ms ease";
    btn.addEventListener("click", () => {
      active = i;
      update();
    });
    btn.innerHTML = `
      <div class="card-img w-full overflow-hidden rounded-[14px] transition-all">
        <img src="${track.image}" alt="" class="h-full w-full object-cover" />
      </div>
      <div class="mt-auto px-1 pb-1.5 pt-3 text-center">
        <p class="truncate text-base font-medium text-white sm:text-lg">${track.title}</p>
        <p class="truncate text-xs text-white/50 sm:text-sm">${track.artist}</p>
      </div>`;
    carousel.appendChild(btn);
    cardEls.push(btn);
  });

  // swipe
  let touchStartX = 0;
  carousel.addEventListener(
    "touchstart",
    (e) => (touchStartX = e.changedTouches[0].screenX),
    { passive: true }
  );
  carousel.addEventListener("touchend", (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (delta < -50) go(1);
    else if (delta > 50) go(-1);
  });

  // controls
  document.getElementById("prev-btn").addEventListener("click", () => go(-1));
  document.getElementById("next-btn").addEventListener("click", () => go(1));
  document.getElementById("play-btn").addEventListener("click", togglePlay);

  update();
}

function go(dir) {
  active = (active + dir + tracks.length) % tracks.length;
  update();
}

function update() {
  const half = Math.floor(tracks.length / 2);

  cardEls.forEach((el, i) => {
    let offset = i - active;
    offset = ((offset % tracks.length) + tracks.length) % tracks.length;
    if (offset > half) offset -= tracks.length;
    const dist = Math.abs(offset);
    const isActive = offset === 0;

    if (dist > 2) {
      el.style.display = "none";
      return;
    }
    el.style.display = "flex";

    el.className =
      "absolute left-1/2 top-1/2 flex flex-col rounded-[20px] border p-3 backdrop-blur-xl transition-colors " +
      (isActive
        ? "border-white/25 bg-white/[0.12] shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
        : "cursor-pointer border-white/15 bg-white/[0.08] shadow-[0_15px_35px_rgba(0,0,0,0.3)]");

    el.style.transform = `translate(calc(-50% + ${offset} * ${STEP}), -50%) translateZ(${DEPTH[dist]}px) scale(${SCALE[dist]}) rotateY(${offset * -8}deg)`;
    el.style.opacity = OPACITY[dist];
    el.style.zIndex = 20 - dist;
    el.setAttribute("aria-current", isActive);

    const img = el.querySelector(".card-img");
    img.classList.toggle("h-[64%]", isActive);
    img.classList.toggle("h-[60%]", !isActive);
  });

  // now-playing mini panel
  document.getElementById("now-image").src = tracks[active].image;
  document.getElementById("now-title").textContent = tracks[active].title;
  document.getElementById("now-artist").textContent = tracks[active].artist;
}

// ------------------------------------------------------------
//  Player wave bars + play/pause
// ------------------------------------------------------------
function buildWave() {
  const wave = document.getElementById("wave");
  if (!wave) return;
  WAVE_BARS.forEach((h, i) => {
    const bar = document.createElement("span");
    bar.className = "w-[2px] rounded-full bg-white/60";
    bar.style.height = `${h}px`;
    bar.dataset.delay = `${i * 0.1 + 0.1}s`;
    wave.appendChild(bar);
  });
  applyWave();
}

function applyWave() {
  document.querySelectorAll("#wave span").forEach((bar) => {
    if (playing) {
      bar.style.animation = `wave 1s ease-in-out ${bar.dataset.delay} infinite alternate`;
      bar.style.transform = "";
      bar.style.opacity = "";
    } else {
      bar.style.animation = "none";
      bar.style.transform = "scaleY(0.5)";
      bar.style.opacity = "0.5";
    }
  });
}

function togglePlay() {
  playing = !playing;
  const btn = document.getElementById("play-btn");
  btn.setAttribute("aria-label", playing ? "Pause" : "Play");
  btn.innerHTML = `<i data-lucide="${
    playing ? "pause" : "play"
  }" class="h-6 w-6 fill-current sm:h-7 sm:w-7"></i>`;
  if (window.lucide) lucide.createIcons();
  applyWave();
}

// ------------------------------------------------------------
//  NAVBAR — translucent bg after scrolling past half viewport
// ------------------------------------------------------------
function initNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  const onScroll = () => {
    const scrolled = window.scrollY > window.innerHeight * 0.5;
    nav.classList.toggle("bg-white/5", scrolled);
    nav.classList.toggle("backdrop-blur-md", scrolled);
    nav.classList.toggle("bg-transparent", !scrolled);
  };
  onScroll();
  window.addEventListener("scroll", onScroll);
}
