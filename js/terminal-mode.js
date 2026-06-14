const terminalModeKey = 'terminal_mode';
const consoleEasterEggKey = 'console_easter_egg_seen';

function isTerminalModeEnabled() {
    return document.documentElement.classList.contains('terminal-mode');
}

function updateTerminalToggleButton() {
    const button = document.querySelector('#terminal-toggle');

    if (!button) {
        return;
    }

    const icon = button.querySelector('i');
    const isEnabled = isTerminalModeEnabled();

    button.setAttribute('aria-pressed', isEnabled ? 'true' : 'false');

    if (!icon) {
        return;
    }

    icon.classList.remove('fa-terminal', 'fa-circle-xmark');
    icon.classList.add(isEnabled ? 'fa-circle-xmark' : 'fa-terminal');
}

function showTerminalToast(isEnabled) {
    let toast = document.querySelector('.terminal-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'terminal-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = `Terminal mode: ${isEnabled ? 'ON' : 'OFF'}`;
    toast.classList.add('visible');

    window.clearTimeout(showTerminalToast.hideTimeout);
    showTerminalToast.hideTimeout = window.setTimeout(() => {
        toast.classList.remove('visible');
    }, 1600);
}

function logConsoleEasterEgg() {
    try {
        if (sessionStorage.getItem(consoleEasterEggKey) === 'seen') {
            return;
        }
    } catch (_) {}

    console.log(
        '%c> curious human detected',
        'color:#00ff9c;background:#0d1117;padding:6px 10px;border:1px solid #00ff9c;border-radius:4px;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;font-weight:700;'
    );
    console.log(
        '%cWelcome behind the curtain.%c Try Terminal Mode with Ctrl/⌘ + Shift + T, then peek at /humans.txt and /credits.txt for a few extra breadcrumbs.',
        'color:#58a6ff;font-weight:700;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;',
        'color:#9ecbff;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;'
    );

    try {
        sessionStorage.setItem(consoleEasterEggKey, 'seen');
    } catch (_) {}
}

function setTerminalMode(isEnabled, showToast = true) {
    document.documentElement.classList.toggle('terminal-mode', isEnabled);
    localStorage.setItem(terminalModeKey, isEnabled ? 'on' : 'off');

    updateTerminalToggleButton();
    updateMobileStatusBar();
    document.dispatchEvent(new CustomEvent('terminalmodechange', {
        detail: { isEnabled }
    }));

    if (showToast) {
        showTerminalToast(isEnabled);
    }
}

function toggleTerminalMode() {
    setTerminalMode(!isTerminalModeEnabled());
}

function initTerminalMode() {
    logConsoleEasterEgg();
    updateTerminalToggleButton();
    updateMobileStatusBar();

    const toggleButton = document.querySelector('#terminal-toggle');

    if (toggleButton) {
        toggleButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleTerminalMode();
        });
    }

    document.addEventListener('keydown', (event) => {
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 't') {
            event.preventDefault();
            toggleTerminalMode();
        }
    });
}

window.setTerminalMode = setTerminalMode;
document.addEventListener('DOMContentLoaded', initTerminalMode);
