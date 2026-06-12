const isTouchHoverNone = window.matchMedia('(hover: none)');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!window.portfolioMainInitialized) {
    window.portfolioMainInitialized = true;

    document.addEventListener('DOMContentLoaded', () => {

        // 1. Preload entfernen
        setTimeout(() => {
            document.body.classList.remove('preload');
        }, 100);

        // 2. Scroll Animationen (Bento Grid & Co)
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach((el) => {
            observer.observe(el);
        });

        // --- 5. Lightbox Logic (Bilder groß anzeigen) ---

        // Wir erzeugen das Modal dynamisch im Code, damit wir es nicht in jede HTML-Datei schreiben müssen
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-modal';
        lightbox.innerHTML = '<img src="" alt="Enlarged View" class="lightbox-img">';
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('.lightbox-img');

        // Klick auf ein Galerie-Bild
        document.querySelectorAll('.gallery-item img').forEach((img) => {
            img.addEventListener('click', (e) => {
                e.stopPropagation(); // Verhindert Bubbling
                lightboxImg.src = img.src; // Übernimmt das Bild
                lightbox.classList.add('active'); // Zeigt Modal
            });
        });

        // Klick irgendwohin um zu schließen
        lightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        initHeroTypewriter();
        initCardTilt();
    });

    // Initial beim Laden ausführen
    updateMobileStatusBar();

    // Beim Ändern der Fenstergröße ausführen
    window.addEventListener('resize', updateMobileStatusBar);
}

function updateMobileStatusBar() {
    // 1. Hole den Meta-Tag
    const metaTag = document.querySelector('meta[name="theme-color"]');

    if (!metaTag) {
        return;
    }

    // 2. Prüfen: Sind wir auf dem Handy? (< 768px)
    const isMobile = window.innerWidth <= 768;

    // 3. Prüfen: Ist Dark Mode aktiv?
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.getAttribute('data-theme') === 'dark';

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

function initHeroTypewriter() {
    const typewriter = document.querySelector('.typewriter-text');
    if (!typewriter) {
        return;
    }

    let words = [];
    try {
        words = JSON.parse(typewriter.dataset.words || '[]');
    } catch (_error) {
        words = [];
    }

    if (!Array.isArray(words) || !words.length) {
        return;
    }

    if (prefersReducedMotion.matches) {
        typewriter.textContent = words[0];
        return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const currentWord = words[wordIndex];

        if (!deleting) {
            charIndex += 1;
            typewriter.textContent = currentWord.slice(0, charIndex);

            if (charIndex === currentWord.length) {
                deleting = true;
                setTimeout(tick, 1500);
                return;
            }

            setTimeout(tick, 70);
            return;
        }

        charIndex -= 1;
        typewriter.textContent = currentWord.slice(0, charIndex);

        if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(tick, 300);
            return;
        }

        setTimeout(tick, 40);
    };

    tick();
}

function initCardTilt() {
    if (isTouchHoverNone.matches || prefersReducedMotion.matches) {
        return;
    }

    const cards = [...document.querySelectorAll('.card, .glass-card, .cert-card')]
        .filter((card) => !card.classList.contains('timeline-item') && !card.classList.contains('error-showcase'));

    cards.forEach((card) => {
        let pointerX = 50;
        let pointerY = 50;
        let rafId = null;

        const render = () => {
            const translateX = ((pointerX - 50) / 50) * 4;
            const translateY = ((pointerY - 50) / 50) * 2 - 3;

            card.style.transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0)`;
            rafId = null;
        };

        const scheduleRender = () => {
            if (!rafId) {
                rafId = requestAnimationFrame(render);
            }
        };

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.16s ease-out';
            scheduleRender();
        });

        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            pointerX = ((event.clientX - rect.left) / rect.width) * 100;
            pointerY = ((event.clientY - rect.top) / rect.height) * 100;
            scheduleRender();
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'var(--transition)';
            card.style.transform = '';
        });
    });
}
