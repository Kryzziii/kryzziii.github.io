const terminalModeKey = 'terminal_mode';

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

document.addEventListener('DOMContentLoaded', initTerminalMode);
