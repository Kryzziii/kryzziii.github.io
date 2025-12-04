class AppNavbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <a href="index.html" class="nav-logo">Chris Jemming</a>
                    
                    <ul class="nav-links">
                        <li>
                            <a href="index.html" title="Home">
                                <i class="fa-solid fa-house nav-icon"></i>
                                <span class="nav-text">Home</span>
                            </a>
                        </li>
                        <li>
                            <a href="experience.html" title="Experience">
                                <i class="fa-solid fa-briefcase nav-icon"></i>
                                <span class="nav-text">Experience</span>
                            </a>
                        </li>
                        <li>
                            <a href="projects.html" title="Projects">
                                <i class="fa-solid fa-laptop-code nav-icon"></i>
                                <span class="nav-text">Projects</span>
                            </a>
                        </li>
                        <li>
                            <a href="certifications.html" title="Certifications">
                                <i class="fa-solid fa-award nav-icon"></i>
                                <span class="nav-text">Certs</span>
                            </a>
                        </li>
                    </ul>

                    <button id="theme-toggle" class="theme-toggle" aria-label="Toggle Theme">
                        <i class="fa-solid fa-moon"></i>
                    </button>
                </div>
            </nav>
        `;

        this.highlightActiveLink();
        this.initThemeToggle();
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname;
        const navLinks = this.querySelectorAll('.nav-links a');

        navLinks.forEach(link => {
            const cleanHref = link.getAttribute('href').replace('./', '');
            const cleanPath = currentPath.split('/').pop();

            if (cleanHref === cleanPath || (cleanPath === '' && cleanHref === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    initThemeToggle() {
        const btn = this.querySelector('#theme-toggle');
        const icon = btn.querySelector('i');
        const html = document.documentElement;

        // Holen des Meta-Tags für Safari
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        // Falls es vergessen wurde, erstellen wir es schnell
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = "theme-color";
            document.head.appendChild(metaThemeColor);
        }

        // Funktion: Alles updaten (Icon + Safari Bar)
        const updateThemeVisuals = () => {
            const currentTheme = html.getAttribute('data-theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = currentTheme === 'dark' || (!currentTheme && systemDark);

            icon.classList.remove('fa-sun', 'fa-moon');

            if (isDark) {
                icon.classList.add('fa-sun');
                // Safari Bar auf Schwarz setzen
                metaThemeColor.setAttribute('content', '#000000');
            } else {
                icon.classList.add('fa-moon');
                // Safari Bar auf dein Hellgrau (#F5F5F7) setzen
                metaThemeColor.setAttribute('content', '#F5F5F7');
            }
        };

        // 1. Beim Laden ausführen
        updateThemeVisuals();

        // 2. Beim Klicken ausführen
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            let currentTheme = html.getAttribute('data-theme');
            if (!currentTheme) {
                currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            updateThemeVisuals();
            setTimeout(updateMobileStatusBar, 100);
        });
    }
}

class AppFooter extends HTMLElement {
    connectedCallback() {
        const year = new Date().getFullYear();
        this.innerHTML = `
            <footer>
                &copy; ${year} Chris Jemming.
            </footer>
        `;
    }
}

customElements.define('app-navbar', AppNavbar);
customElements.define('app-footer', AppFooter);