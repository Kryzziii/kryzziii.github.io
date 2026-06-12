document.addEventListener('DOMContentLoaded', () => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    const email = 'contact@chrisjemming.lu';
    let previousFocus = null;
    let selectedIndex = 0;

    const commands = [
        { section: 'Navigation', label: 'Home', icon: 'fa-solid fa-house', keywords: 'start landing', run: () => { window.location.href = 'index.html'; } },
        { section: 'Navigation', label: 'Experience', icon: 'fa-solid fa-briefcase', keywords: 'work timeline', run: () => { window.location.href = 'experience.html'; } },
        { section: 'Navigation', label: 'Projects', icon: 'fa-solid fa-laptop-code', keywords: 'portfolio code', run: () => { window.location.href = 'projects.html'; } },
        { section: 'Navigation', label: 'Certifications', icon: 'fa-solid fa-award', keywords: 'certificates certs', run: () => { window.location.href = 'certifications.html'; } },
        { section: 'Navigation', label: 'Social Engagement', icon: 'fa-solid fa-hand-holding-heart', keywords: 'community volunteering', run: () => { window.location.href = 'social-engagement.html'; } },

        { section: 'Actions', label: 'Copy Email', icon: 'fa-solid fa-copy', keywords: 'mail clipboard contact', run: () => copyEmail(email) },
        { section: 'Actions', label: 'Send Email', icon: 'fa-solid fa-envelope', keywords: 'mailto contact', run: () => { window.location.href = `mailto:${email}`; } },

        { section: 'Social', label: 'Open GitHub', icon: 'fa-brands fa-github', keywords: 'repo code profile', run: () => { window.open('https://github.com/Kryzziii', '_blank', 'noopener,noreferrer'); } },
        { section: 'Social', label: 'Open LinkedIn', icon: 'fa-brands fa-linkedin', keywords: 'career network', run: () => { window.open('https://linkedin.com/in/chris-jemming', '_blank', 'noopener,noreferrer'); } },

        { section: 'Theme', label: 'Toggle Theme', icon: 'fa-solid fa-circle-half-stroke', keywords: 'dark light mode', run: () => toggleTheme() },
        { section: 'Theme', label: 'Switch to Dark', icon: 'fa-solid fa-moon', keywords: 'dark theme', run: () => setTheme('dark') },
        { section: 'Theme', label: 'Switch to Light', icon: 'fa-solid fa-sun', keywords: 'light theme', run: () => setTheme('light') },

        { section: 'Fun', label: 'Show Easter Egg', icon: 'fa-solid fa-wand-magic-sparkles', keywords: 'matrix konami fun', run: () => showMatrixFlash() }
    ];

    const backdrop = document.createElement('div');
    backdrop.className = 'cmdk-backdrop';
    backdrop.hidden = true;
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Command palette');

    backdrop.innerHTML = `
        <div class="cmdk-panel" role="document">
            <div class="cmdk-search">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <input type="text" class="cmdk-input" placeholder="Type a command or search..." aria-label="Search commands">
            </div>
            <ul class="cmdk-list" role="listbox"></ul>
            <div class="cmdk-footer" aria-hidden="true">
                <span>↑ ↓ navigate</span>
                <span>↵ select</span>
                <span>esc close</span>
            </div>
        </div>
    `;

    const hint = document.createElement('button');
    hint.type = 'button';
    hint.className = 'cmdk-hint';
    hint.textContent = isMac ? '⌘ K' : 'Ctrl K';
    hint.setAttribute('aria-label', 'Open command palette');

    document.body.append(backdrop, hint);
    if (window.matchMedia('(hover: none)').matches) {
        hint.hidden = true;
    }

    const panel = backdrop.querySelector('.cmdk-panel');
    const input = backdrop.querySelector('.cmdk-input');
    const list = backdrop.querySelector('.cmdk-list');

    let filtered = [...commands];

    const closePalette = () => {
        backdrop.classList.remove('active');
        input.value = '';
        filtered = [...commands];
        renderResults();
        setTimeout(() => {
            if (!backdrop.classList.contains('active')) {
                backdrop.hidden = true;
            }
        }, 200);
        if (previousFocus && typeof previousFocus.focus === 'function') {
            previousFocus.focus();
        }
    };

    const openPalette = () => {
        previousFocus = document.activeElement;
        backdrop.hidden = false;
        backdrop.classList.add('active');
        filtered = [...commands];
        renderResults();
        input.focus();
    };

    const activateSelected = () => {
        const selected = filtered[selectedIndex];
        if (!selected) {
            return;
        }

        closePalette();
        selected.run();
    };

    const setSelection = (nextIndex) => {
        if (!filtered.length) {
            return;
        }

        selectedIndex = (nextIndex + filtered.length) % filtered.length;
        const options = [...list.querySelectorAll('.cmdk-option')];

        options.forEach((option, index) => {
            const active = index === selectedIndex;
            option.classList.toggle('active', active);
            option.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        const activeEl = options[selectedIndex];
        if (activeEl) {
            activeEl.scrollIntoView({ block: 'nearest' });
        }
    };

    const renderResults = () => {
        const grouped = filtered.reduce((acc, command) => {
            if (!acc[command.section]) {
                acc[command.section] = [];
            }
            acc[command.section].push(command);
            return acc;
        }, {});

        const sections = Object.keys(grouped);

        list.innerHTML = sections.length ? '' : '<li class="cmdk-empty">No commands found</li>';

        sections.forEach((section) => {
            const sectionHeader = document.createElement('li');
            sectionHeader.className = 'cmdk-group';
            sectionHeader.textContent = section;
            sectionHeader.setAttribute('role', 'presentation');
            list.appendChild(sectionHeader);

            grouped[section].forEach((command) => {
                const index = filtered.indexOf(command);
                const item = document.createElement('li');
                item.className = 'cmdk-option';
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', 'false');
                item.innerHTML = `<i class="${command.icon}" aria-hidden="true"></i><span>${command.label}</span>`;

                item.addEventListener('mouseenter', () => setSelection(index));
                item.addEventListener('click', () => {
                    selectedIndex = index;
                    activateSelected();
                });

                list.appendChild(item);
            });
        });

        selectedIndex = 0;
        setSelection(0);
    };

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        filtered = commands.filter((command) => {
            const haystack = `${command.label} ${command.keywords || ''}`.toLowerCase();
            return haystack.includes(query);
        });
        renderResults();
    });

    panel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelection(selectedIndex + 1);
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelection(selectedIndex - 1);
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            activateSelected();
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closePalette();
        }

        if (event.key === 'Tab' && backdrop.classList.contains('active')) {
            const focusables = panel.querySelectorAll('input, button, [href], [tabindex]:not([tabindex="-1"])');
            if (!focusables.length) {
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) {
            closePalette();
        }
    });

    document.addEventListener('keydown', (event) => {
        const wantsPalette = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
        if (wantsPalette) {
            event.preventDefault();
            if (backdrop.classList.contains('active')) {
                closePalette();
            } else {
                openPalette();
            }
            return;
        }

        if (event.key === 'Escape' && backdrop.classList.contains('active')) {
            closePalette();
        }
    });

    hint.addEventListener('click', openPalette);

    renderResults();

    function copyEmail(value) {
        if (!navigator.clipboard) {
            showToast('Clipboard unavailable');
            return;
        }

        navigator.clipboard.writeText(value)
            .then(() => showToast('Email copied!'))
            .catch(() => showToast('Copy failed'));
    }

    function toggleTheme() {
        const toggleBtn = document.querySelector('#theme-toggle');
        if (toggleBtn) {
            toggleBtn.click();
            return;
        }

        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);

        if (typeof updateMobileStatusBar === 'function') {
            setTimeout(updateMobileStatusBar, 100);
        }
    }

    function setTheme(theme) {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        if (currentTheme === theme) {
            return;
        }

        const toggleBtn = document.querySelector('#theme-toggle');
        if (toggleBtn) {
            toggleBtn.click();
            return;
        }

        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (typeof updateMobileStatusBar === 'function') {
            setTimeout(updateMobileStatusBar, 100);
        }
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'cmdk-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('active'));
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 200);
        }, 2000);
    }

    function showMatrixFlash() {
        const chars = '01';
        const overlay = document.createElement('div');
        overlay.className = 'cmdk-matrix';

        for (let i = 0; i < 36; i += 1) {
            const col = document.createElement('span');
            col.className = 'cmdk-matrix-col';
            col.style.left = `${(i / 36) * 100}%`;
            col.style.animationDelay = `${Math.random() * 0.8}s`;
            col.textContent = Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            overlay.appendChild(col);
        }

        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 1100);
    }
});
