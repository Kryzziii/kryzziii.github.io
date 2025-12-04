document.addEventListener('DOMContentLoaded', () => {

    // 1. Preload entfernen
    setTimeout(() => {
        document.body.classList.remove('preload');
    }, 100);

    // 2. Scroll Animationen (Bento Grid & Co)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
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

    // --- 5. Lightbox Logic (Bilder groß anzeigen) ---

    // Wir erzeugen das Modal dynamisch im Code, damit wir es nicht in jede HTML-Datei schreiben müssen
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = '<img src="" alt="Enlarged View" class="lightbox-img">';
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-img');

    // Klick auf ein Galerie-Bild
    document.querySelectorAll('.gallery-item img').forEach(img => {
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
});

function updateMobileStatusBar() {
    // 1. Hole den Meta-Tag
    const metaTag = document.querySelector('meta[name="theme-color"]');

    // 2. Prüfen: Sind wir auf dem Handy? (< 768px)
    const isMobile = window.innerWidth <= 768;

    // 3. Prüfen: Ist Dark Mode aktiv?
    // Entweder über System-Check oder über deine HTML-Klasse (z.B. <html data-theme="dark">)
    // Hier prüfen wir beides zur Sicherheit:
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.getAttribute('data-theme') === 'dark';

    if (isMobile) {
        // --- MOBILE FARBEN (Hier deine HEX-Codes eintragen!) ---
        if (isDarkMode) {
            metaTag.setAttribute('content', '#070C25'); // Dein dunkler Hintergrund
        } else {
            metaTag.setAttribute('content', '#DDE7F9'); // Dein heller Hintergrund
        }
    } else {
        // --- DESKTOP STANDARD ---
        if (isDarkMode) {
            metaTag.setAttribute('content', '#000000');
        } else {
            metaTag.setAttribute('content', '#F5F5F7');
        }
    }
}

// Initial beim Laden ausführen
updateMobileStatusBar();

// Beim Ändern der Fenstergröße ausführen
window.addEventListener('resize', updateMobileStatusBar);