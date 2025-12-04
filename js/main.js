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

    // ... (dein bisheriger Code) ...

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