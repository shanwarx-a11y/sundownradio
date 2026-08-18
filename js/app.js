// Minimal JS to handle basic hover/click interactions if needed, 
// though the design requested no animation changes from the static reference layout.
document.addEventListener("DOMContentLoaded", () => {
    // Remove loading class
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 100);

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    if (themeToggleBtn) {
        const knob = themeToggleBtn.querySelector('.z-10');
        let isDragging = false;
        let startPos = 0;
        let isDarkMode = false;
        let isHorizontal = true;
        let MAX_DRAG = 26;

        themeToggleBtn.addEventListener('pointerdown', (e) => {
            isDragging = true;
            isDarkMode = document.documentElement.classList.contains('dark');
            isHorizontal = window.innerWidth < 640;
            MAX_DRAG = isHorizontal ? 26 : 34; // Match Tailwind transform values
            startPos = isHorizontal ? e.clientX : e.clientY;
            
            if (knob) knob.style.transition = 'none';
            themeToggleBtn.setPointerCapture(e.pointerId);
        });

        themeToggleBtn.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            let currentClient = isHorizontal ? e.clientX : e.clientY;
            let delta = currentClient - startPos;
            let currentOffset = isDarkMode ? MAX_DRAG : 0;
            let newOffset = Math.max(0, Math.min(currentOffset + delta, MAX_DRAG));
            
            if (knob) {
                knob.style.transform = isHorizontal ? `translateX(${newOffset}px)` : `translateY(${newOffset}px)`;
            }
        });

        const endDrag = (e) => {
            if (!isDragging) return;
            isDragging = false;
            themeToggleBtn.releasePointerCapture(e.pointerId);
            
            if (knob) {
                knob.style.transition = '';
                knob.style.transform = '';
            }
            
            let delta = (isHorizontal ? e.clientX : e.clientY) - startPos;
            
            if (Math.abs(delta) > 5) {
                if (!isDarkMode && delta > MAX_DRAG / 3) document.documentElement.classList.add('dark');
                else if (isDarkMode && delta < -(MAX_DRAG / 3)) document.documentElement.classList.remove('dark');
            } else {
                document.documentElement.classList.toggle('dark');
            }
        };

        themeToggleBtn.addEventListener('pointerup', endDrag);
        themeToggleBtn.addEventListener('pointercancel', endDrag);
        themeToggleBtn.addEventListener('click', (e) => e.preventDefault());
    }

    // Force logo colors when overlapping specific sections that don't adapt to light mode
    const whiteSections = document.querySelectorAll('#releases');
    const blackSections = document.querySelectorAll('#grainient-footer');
    const logoContainer = document.querySelector('.fixed.top-5.left-5');
    
    if (logoContainer) {
        const checkLogoOverlap = () => {
            const logoRect = logoContainer.getBoundingClientRect();
            const logoY = logoRect.top + (logoRect.height / 2); // vertical center of logo
            
            let isOverWhite = false;
            let isOverBlack = false;
            
            if (whiteSections.length > 0) {
                whiteSections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (logoY >= rect.top && logoY <= rect.bottom) isOverWhite = true;
                });
            }
            
            if (blackSections.length > 0) {
                blackSections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (logoY >= rect.top && logoY <= rect.bottom) isOverBlack = true;
                });
            }
            
            if (isOverWhite) {
                document.body.classList.add('force-white-logo');
                document.body.classList.remove('force-black-logo');
            } else if (isOverBlack) {
                document.body.classList.add('force-black-logo');
                document.body.classList.remove('force-white-logo');
            } else {
                document.body.classList.remove('force-white-logo');
                document.body.classList.remove('force-black-logo');
            }
        };

        window.addEventListener('scroll', checkLogoOverlap, { passive: true });
        // Initial check
        checkLogoOverlap();
    }

    // Hero Orbit Track logic removed since it was replaced by the static logo image.

    // Cover Flow Carousel Logic (from original project)
    /*
    const carouselContainer = document.getElementById('releases-carousel');
    if (carouselContainer) {
        const items = document.querySelectorAll('.carousel-item');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        // Player elements
        const playerThumb = document.getElementById('player-thumb');
        const playerTitle = document.getElementById('player-title');
        const playerArtist = document.getElementById('player-artist');
        
        let currentIndex = 2; // Start with the middle item
        
        function updateCarousel() {
            items.forEach((item, index) => {
                // Remove all positioning classes
                item.classList.remove('active', 'prev-1', 'next-1', 'prev-2', 'next-2');
                
                // Calculate distance from center
                const diff = index - currentIndex;
                
                if (diff === 0) {
                    item.classList.add('active');
                    
                    // Update player info based on active item
                    const imgSource = item.querySelector('.carousel-img').src;
                    const title = item.querySelector('h4').innerText;
                    const artist = item.querySelector('p').innerText;
                    
                    playerThumb.src = imgSource;
                    playerTitle.innerText = title;
                    playerArtist.innerText = artist;
                } else if (diff === -1) {
                    item.classList.add('prev-1');
                } else if (diff === 1) {
                    item.classList.add('next-1');
                } else if (diff <= -2) {
                    item.classList.add('prev-2');
                } else if (diff >= 2) {
                    item.classList.add('next-2');
                }
            });
        }
        
        function goNext() {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        }
        
        function goPrev() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }
        
        nextBtn.addEventListener('click', goNext);
        prevBtn.addEventListener('click', goPrev);
        
        // Click on side items to navigate
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                if (currentIndex !== index) {
                    currentIndex = index;
                    updateCarousel();
                }
            });
        });
        
        // Swipe gestures for touch devices
        let touchStartX = 0;
        let touchEndX = 0;
        
        carouselContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carouselContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                goNext();
            }
            if (touchEndX > touchStartX + 50) {
                goPrev();
            }
        }
        
        // Mouse drag gestures for desktop
        let isDragging = false;
        let startX;
        
        carouselContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX;
        });
        
        window.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const endX = e.pageX;
            const diffX = startX - endX;
            
            if (diffX > 50) {
                goNext();
            } else if (diffX < -50) {
                goPrev();
            }
        });

        // Initialize
        updateCarousel();
    }
    */

    // NEW CAROUSEL LOGIC (from music-landing)
    buildCarousel();
    buildWave();
    if (window.lucide) {
        setTimeout(() => lucide.createIcons(), 50); // Ensure DOM is ready
    }
});

// ------------------------------------------------------------
//  TRACKS — 3D carousel + player
// ------------------------------------------------------------
const tracks = [
  { title: "Zindagi", artist: "Shanwar", image: "images/IMG_20260621_113301_432.jpg" },
  { title: "Rasool", artist: "Shanwar", image: "images/IMG_20260621_113413_791.jpg" },
  { title: "Neerumithen Ullalakal", artist: "Shanwar", image: "images/Neerumithen Ullalakal - From _Kadakan_.jpg" },
  { title: "Zindagi", artist: "Shanwar", image: "images/IMG_20260621_113301_432.jpg" },
  { title: "Rasool", artist: "Shanwar", image: "images/IMG_20260621_113413_791.jpg" },
];

const CARD_WIDTH = "clamp(190px, 21vw, 320px)";
const CARD_HEIGHT = "clamp(270px, 28vw, 400px)";
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
    btn.innerHTML = `<div class="card-img aspect-square w-full overflow-hidden rounded-[14px] transition-all"><img src="` + track.image + `" alt="" class="h-full w-full object-cover" /></div><div class="mt-auto px-1 pb-1.5 pt-3 text-center"><p class="truncate text-base font-medium text-white sm:text-lg">` + track.title + `</p><p class="truncate text-xs text-white/50 sm:text-sm">` + track.artist + `</p></div>`;
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

    el.style.transform = "translate(calc(-50% + " + offset + " * " + STEP + "), -50%) translateZ(" + DEPTH[dist] + "px) scale(" + SCALE[dist] + ") rotateY(" + (offset * -28) + "deg)";
    el.style.opacity = OPACITY[dist];
    el.style.zIndex = 20 - dist;
    el.setAttribute("aria-current", isActive);

    const img = el.querySelector(".card-img");
  });

  // now-playing mini panel
  const nowImage = document.getElementById("now-image");
  const nowTitle = document.getElementById("now-title");
  const nowArtist = document.getElementById("now-artist");

  if (nowImage) nowImage.src = tracks[active].image;
  if (nowTitle) nowTitle.textContent = tracks[active].title;
  if (nowArtist) nowArtist.textContent = tracks[active].artist;
  
  // Smooth ambient background crossfade
  const bgContainer = document.getElementById("bg-image-container");
  if (bgContainer) {
    // Get existing images to fade out
    const oldImages = bgContainer.querySelectorAll('img');
    oldImages.forEach(img => {
      img.style.opacity = '0';
    });
    
    // Create new image to fade in
    const newImage = document.createElement('img');
    newImage.src = tracks[active].image;
    newImage.className = "absolute inset-0 w-full h-full object-cover scale-150 transition-opacity duration-1000 ease-in-out opacity-0";
    bgContainer.appendChild(newImage);
    
    // Trigger reflow to ensure the fade-in animation plays
    void newImage.offsetWidth;
    newImage.style.opacity = '1';
    
    // Clean up old images after transition completes (1000ms)
    setTimeout(() => {
      oldImages.forEach(img => img.remove());
    }, 1000);
  }
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
    bar.style.height = h + "px";
    bar.dataset.delay = (i * 0.1 + 0.1) + "s";
    wave.appendChild(bar);
  });
  applyWave();
}

function applyWave() {
  document.querySelectorAll("#wave span").forEach((bar) => {
    if (playing) {
      bar.style.animation = "wave 1s ease-in-out " + bar.dataset.delay + " infinite alternate";
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
  
  let iconName = playing ? "pause" : "play";
  btn.innerHTML = "<i data-lucide=\"" + iconName + "\" class=\"h-6 w-6 fill-current sm:h-7 sm:w-7\"></i>";
  if (window.lucide) lucide.createIcons();
  applyWave();
}


// ------------------------------------------------------------
// Animated Editorial Mosaic (Sponsors & Vendors)
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('mosaic-grid');
    const openingPanel = document.getElementById('mosaic-opening');
    const wrapper = document.getElementById('mosaic-wrapper');
    const sponsorsSection = document.getElementById('sponsors');

    if (gridContainer && openingPanel) {
        // Authentic editorial color palette as requested
        const rows = [
            [
                { name: 'NOVA', role: 'OFFICIAL PARTNER', color: 'bg-black text-white', hasImage: true },
                { name: 'SONIC', role: 'MEDIA PARTNER', color: 'bg-cyan-400 text-black', hasImage: false },
                { name: 'VERTEX', role: 'CREATIVE PARTNER', color: 'bg-pink-500 text-white', hasImage: true }
            ],
            [
                { name: 'AURA', role: 'TECH PARTNER', color: 'bg-lime-400 text-black', hasImage: false },
                { name: 'ECHO', role: 'STUDIO PARTNER', color: 'bg-indigo-500 text-white', hasImage: true },
                { name: 'LUMEN', role: 'FASHION PARTNER', color: 'bg-purple-600 text-white', hasImage: true }
            ],
            [
                { name: 'PULSE', role: 'VENUE PARTNER', color: 'bg-orange-500 text-black', hasImage: true },
                { name: 'ORBIT', role: 'DISTRIBUTION', color: 'bg-blue-600 text-white', hasImage: false }
            ],
            [
                { name: 'FLUX', role: 'DIGITAL PARTNER', color: 'bg-rose-500 text-white', hasImage: true },
                { name: 'VIBE', role: 'BEVERAGE PARTNER', color: 'bg-yellow-400 text-black', hasImage: true }
            ]
        ];

        let focalIndex = -1; // start before 0 so first tick is 0
        let flatPanels = [];
        let rowElements = [];
        let isMosaicActive = false;
        let sponsorCounter = 0;

        // Build the flex rows and panels
        rows.forEach((rowData) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'mosaic-row';
            
            rowData.forEach((sponsor) => {
                const panel = document.createElement('div');
                panel.className = `mosaic-panel ${sponsor.color} group`;
                
                // Full-bleed imagery for some panels
                const imageHtml = sponsor.hasImage ? `<img src="https://picsum.photos/seed/mosaic${sponsorCounter}/600/600" class="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 z-0 transition-transform duration-1000 group-hover:scale-110" alt="">` : '';
                
                panel.innerHTML = `
                    ${imageHtml}
                    <div class="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
                        <!-- Subtle Editorial Logo Reveal -->
                        <div class="mosaic-logo flex flex-col items-center">
                            <div class="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 sm:mb-4 shadow-lg">
                                <i data-lucide="zap" class="w-5 h-5 sm:w-8 sm:h-8 current-color"></i>
                            </div>
                            <h4 class="font-bold text-base sm:text-2xl tracking-wider mb-1 text-center">${sponsor.name}</h4>
                            <p class="text-[6px] sm:text-[9px] uppercase tracking-[0.2em] font-bold opacity-70 text-center">${sponsor.role}</p>
                        </div>
                    </div>
                `;
                
                // Keep reference to parent row
                panel.parentRow = rowDiv;
                
                rowDiv.appendChild(panel);
                flatPanels.push(panel);
                sponsorCounter++;
            });
            
            gridContainer.appendChild(rowDiv);
            rowElements.push(rowDiv);
        });

        if (window.lucide) lucide.createIcons();

        // 1. Scroll Interaction (Transform from Single Panel to Mosaic)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isMosaicActive) {
                    isMosaicActive = true;
                    // Trigger the transformation after a short delay
                    setTimeout(() => {
                        openingPanel.classList.add('mosaic-opening-active');
                        gridContainer.classList.remove('opacity-0');
                        
                        // Start the focal loop slightly after reveal
                        setTimeout(triggerFocalShift, 800);
                    }, 400);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(sponsorsSection);

        // 2. Editorial Focal Shift Loop (Panels seamlessly expand/shrink)
        const triggerFocalShift = () => {
            if (!isMosaicActive) return;
            
            // Remove expanded class from all rows and panels
            rowElements.forEach(r => r.classList.remove('row-expanded'));
            flatPanels.forEach(p => p.classList.remove('panel-expanded'));
            
            // Pick a random panel to expand (or sequential)
            // Using sequential to ensure everyone gets a turn
            focalIndex = (focalIndex + 1) % flatPanels.length;
            const targetPanel = flatPanels[focalIndex];
            
            // Expand the target panel and its parent row
            targetPanel.classList.add('panel-expanded');
            targetPanel.parentRow.classList.add('row-expanded');
            
            // Repeat continuously with a relaxed, cinematic pace
            setTimeout(triggerFocalShift, 3000);
        };
    }
});
