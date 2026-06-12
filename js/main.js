document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.classList.remove('preload');
    }, 100);

    initScrollAnimations();
    initTypewriter();
    initCardTilt();
    initLightbox();
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
    const longestWord = words.reduce((maxLength, word) => Math.max(maxLength, word.length), 0);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    textEl.style.setProperty('--typewriter-width', `${longestWord}ch`);

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

        let delay = isDeleting ? 40 : 70;

        if (!isDeleting && charIndex === currentWord.length) {
            delay = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            delay = 300;
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }

        window.setTimeout(tick, delay);
    };

    window.setTimeout(tick, 300);
}

function initCardTilt() {
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
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
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
                const rotateY = (relativeX - 0.5) * 8;
                const rotateX = (0.5 - relativeY) * 8;

                card.style.setProperty('--mx', `${relativeX * 100}%`);
                card.style.setProperty('--my', `${relativeY * 100}%`);
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
