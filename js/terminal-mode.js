/* Terminal Mode Toggle — js/terminal-mode.js
   Aktiviert/Deaktiviert den Terminal-Look per Cmd/Ctrl+Shift+T
   State wird in localStorage gespeichert und beim Laden wiederhergestellt */

(function () {
    'use strict';

    const STORAGE_KEY = 'terminal_mode';
    const CLASS_NAME = 'terminal-mode';

    // --- State wiederherstellen (wird auch inline im <head> ausgeführt,
    //     aber sicherheitshalber hier nochmal) ---
    function restoreState() {
        if (localStorage.getItem(STORAGE_KEY) === 'on') {
            document.documentElement.classList.add(CLASS_NAME);
        }
    }

    // --- Toggle ---
    function toggleTerminalMode() {
        const isOn = document.documentElement.classList.contains(CLASS_NAME);

        // 400ms Fade-Transition
        document.documentElement.style.transition = 'opacity 0.4s ease';
        document.documentElement.style.opacity = '0';

        setTimeout(() => {
            if (isOn) {
                document.documentElement.classList.remove(CLASS_NAME);
                localStorage.setItem(STORAGE_KEY, 'off');
                showToast('Terminal mode off');
            } else {
                document.documentElement.classList.add(CLASS_NAME);
                localStorage.setItem(STORAGE_KEY, 'on');
                showToast('Terminal mode on 💻');
            }

            document.documentElement.style.opacity = '1';
            setTimeout(() => {
                document.documentElement.style.transition = '';
                document.documentElement.style.opacity = '';
            }, 420);

            // Palette-Command-Label aktualisieren (falls sichtbar)
            updatePaletteLabel();
        }, 200);
    }

    // --- Label im Command Palette aktualisieren ---
    function updatePaletteLabel() {
        const isOn = document.documentElement.classList.contains(CLASS_NAME);
        // Das Palette-Objekt wird in command-palette.js registriert;
        // wir suchen den DOM-Knoten direkt
        const options = document.querySelectorAll('.cmdk-option');
        options.forEach((opt) => {
            const span = opt.querySelector('span');
            if (!span) return;
            if (span.textContent === 'Toggle Terminal Mode' || span.textContent === 'Exit Terminal Mode') {
                span.textContent = isOn ? 'Exit Terminal Mode' : 'Toggle Terminal Mode';
            }
        });
    }

    // --- Toast (Re-use aus command-palette.js showToast-Muster) ---
    function showToast(message) {
        // Falls showToast aus command-palette.js verfügbar (gleicher scope), nicht duplizieren.
        // Wir erzeugen einfach den DOM direkt — gleiche Klasse .cmdk-toast
        const existing = document.querySelector('.cmdk-toast');
        if (existing) existing.remove();

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

    // --- Keyboard shortcut: Cmd/Ctrl + Shift + T ---
    document.addEventListener('keydown', (event) => {
        const wantsTerminal =
            (event.metaKey || event.ctrlKey) &&
            event.shiftKey &&
            event.key.toLowerCase() === 't';

        if (wantsTerminal) {
            event.preventDefault();
            toggleTerminalMode();
        }
    });

    // --- Public API für andere Scripts (z.B. command-palette.js) ---
    window.terminalMode = {
        toggle: toggleTerminalMode,
        isOn: () => document.documentElement.classList.contains(CLASS_NAME)
    };

    // --- State beim Laden wiederherstellen ---
    restoreState();
}());
