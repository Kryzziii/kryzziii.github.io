document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.classList.remove('preload');
    }, 100);

    initScrollAnimations();
    initTypewriter();
    initCardTilt();
    initLightbox();
    initRouteMap();
});

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

function initTypewriter() {
    const typingDelay = 70;
    const deletingDelay = 40;
    const wordPauseDelay = 1500;
    const nextWordDelay = 300;

    const textEl = document.querySelector('.typewriter-text');

    if (!textEl) {
        return;
    }

    let words = [];

    try {
        words = JSON.parse(textEl.dataset.words || '[]');
    } catch (error) {
        return;
    }

    if (!Array.isArray(words) || words.length === 0) {
        return;
    }

    const cursorEl = textEl.parentElement.querySelector('.typewriter-cursor');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
        textEl.textContent = words[0];

        if (cursorEl) {
            cursorEl.hidden = true;
        }

        return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            charIndex -= 1;
        } else {
            charIndex += 1;
        }

        textEl.textContent = currentWord.slice(0, charIndex);

        let delay = isDeleting ? deletingDelay : typingDelay;

        if (!isDeleting && charIndex === currentWord.length) {
            delay = wordPauseDelay;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            delay = nextWordDelay;
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }

        window.setTimeout(tick, delay);
    };

    window.setTimeout(tick, 300);
}

function initCardTilt() {
    const maxTilt = 4;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;

    if (reducedMotion || noHover) {
        return;
    }

    const cards = Array.from(document.querySelectorAll('.card, .glass-card, .cert-card'))
        .filter(card => !card.classList.contains('timeline-item'));

    if (cards.length === 0) {
        return;
    }

    const resetCard = (card) => {
        if (card._tiltFrame) {
            window.cancelAnimationFrame(card._tiltFrame);
            card._tiltFrame = null;
        }

        card.style.transition = 'var(--transition)';
        card.style.transform = '';
        card.classList.remove('tilt-active');
        card._tiltEvent = null;
    };

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (document.documentElement.classList.contains('terminal-mode')) {
                return;
            }

            card.style.transition = 'transform 0.1s ease-out';
            card.classList.add('tilt-active');
        });

        card.addEventListener('mousemove', (event) => {
            if (document.documentElement.classList.contains('terminal-mode')) {
                resetCard(card);
                return;
            }

            card._tiltEvent = event;

            if (card._tiltFrame) {
                return;
            }

            card._tiltFrame = window.requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const { clientX, clientY } = card._tiltEvent;
                const relativeX = (clientX - rect.left) / rect.width;
                const relativeY = (clientY - rect.top) / rect.height;
                const rotateY = (relativeX - 0.5) * (maxTilt * 2);
                const rotateX = (0.5 - relativeY) * (maxTilt * 2);

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.01) translateY(-5px)`;
                card._tiltFrame = null;
            });
        });

        card.addEventListener('mouseleave', () => {
            resetCard(card);
        });
    });

    document.addEventListener('terminalmodechange', () => {
        cards.forEach(card => {
            resetCard(card);
        });
    });
}

function initLightbox() {
    const galleryImages = document.querySelectorAll('.gallery-item img');

    if (galleryImages.length === 0) {
        return;
    }

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = '<img src="" alt="Enlarged View" class="lightbox-img">';
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-img');

    galleryImages.forEach(img => {
        img.addEventListener('click', (event) => {
            event.stopPropagation();
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
        });
    });

    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });
}

function updateMobileStatusBar() {
    const metaTag = document.querySelector('meta[name="theme-color"]');

    if (!metaTag) {
        return;
    }

    const isMobile = window.innerWidth <= 768;
    const isTerminalMode = document.documentElement.classList.contains('terminal-mode');
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.getAttribute('data-theme') === 'dark';

    if (isTerminalMode) {
        metaTag.setAttribute('content', '#0d1117');
        return;
    }

    if (isMobile) {
        if (isDarkMode) {
            metaTag.setAttribute('content', '#070C25');
        } else {
            metaTag.setAttribute('content', '#DDE7F9');
        }
    } else if (isDarkMode) {
        metaTag.setAttribute('content', '#000000');
    } else {
        metaTag.setAttribute('content', '#F5F5F7');
    }
}

updateMobileStatusBar();
window.addEventListener('resize', updateMobileStatusBar);

function initRouteMap() {
    const mapEl = document.getElementById('route-leaflet-map');
    if (!mapEl || typeof L === 'undefined') {
        return;
    }

    const LIGHT_TILE = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const DARK_TILE  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const TILE_ATTR  = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    const isDark = () =>
        document.documentElement.classList.contains('terminal-mode') ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        (!document.documentElement.getAttribute('data-theme') &&
         window.matchMedia('(prefers-color-scheme: dark)').matches);

    const map = L.map('route-leaflet-map', {
        center: [50.5, 7.5],
        zoom: 5,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
    });

    let tileLayer = L.tileLayer(isDark() ? DARK_TILE : LIGHT_TILE, {
        attribution: TILE_ATTR,
        subdomains: 'abcd',
        maxZoom: 19,
    }).addTo(map);

    // Marker icon factory using flag emoji
    const makeIcon = (emoji) => L.divIcon({
        className: '',
        html: `<div class="route-map-marker">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });

    const luxLatLng  = [49.6116, 6.1319];
    const kaLatLng   = [49.0069, 8.4037];

    L.marker(luxLatLng, { icon: makeIcon('🇱🇺') })
        .addTo(map)
        .bindPopup('<strong>Luxembourg City</strong><br>Home Country 🏠');

    L.marker(kaLatLng, { icon: makeIcon('🇩🇪') })
        .addTo(map)
        .bindPopup('<strong>Karlsruhe</strong><br>University &amp; Work 🎓');

    // Dashed route line between the two cities
    L.polyline([luxLatLng, kaLatLng], {
        color: '#0071E3',
        weight: 3,
        dashArray: '10, 8',
        opacity: 0.9,
    }).addTo(map);

    // Swap tile layer on theme change
    const swapTiles = () => {
        map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(isDark() ? DARK_TILE : LIGHT_TILE, {
            attribution: TILE_ATTR,
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);
    };

    // Listen for manual theme toggle – attach directly to the button when available
    const attachThemeToggleListener = () => {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => setTimeout(swapTiles, 50));
        }
    };
    attachThemeToggleListener();
    // Fallback: re-try once after a tick in case the custom element renders late
    setTimeout(attachThemeToggleListener, 200);

    // Listen for terminal mode toggle
    document.addEventListener('terminalmodechange', () => {
        setTimeout(swapTiles, 50);
    });

    // System colour-scheme change
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', swapTiles);
}
