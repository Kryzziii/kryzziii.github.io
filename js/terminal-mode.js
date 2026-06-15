const terminalModeKey = 'terminal_mode';
const consoleEasterEggKey = 'console_easter_egg_seen';
const terminalAchievementCookie = 'ee_terminal_discovered';

function setTerminalAchievementCookie() {
    try {
        document.cookie = `${terminalAchievementCookie}=1;path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    } catch (_) {}
}

function isTerminalModeEnabled() {
    return document.documentElement.classList.contains('terminal-mode');
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

    const bannerStyle = 'color:#00ff9c;background:#0d1117;padding:4px 12px;border-left:1px solid #00ff9c;border-right:1px solid #00ff9c;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;font-weight:700;line-height:1.45;';

    console.log('%c+---------------------------------------------+', `${bannerStyle}border-top:1px solid #00ff9c;border-radius:6px 6px 0 0;`);
    console.log('%c|   PORTFOLIO // CONSOLE ACCESS GRANTED      |', bannerStyle);
    console.log('%c+---------------------------------------------+', `${bannerStyle}border-bottom:1px solid #00ff9c;border-radius:0 0 6px 6px;`);

    console.log(
        '%c>> welcome behind the curtain%c\nType %csetTerminalMode(true)%c to force terminal mode.\nShortcut: %cCtrl/⌘ + Shift + T%c\nClues: %c/humans.txt%c and %c/credits.txt',
        'color:#58a6ff;font-weight:700;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;',
        'color:#9ecbff;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;',
        'color:#00ff9c;font-weight:700;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;',
        'color:#9ecbff;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;',
        'color:#ffa657;font-weight:700;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;',
        'color:#9ecbff;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;',
        'color:#7ee787;font-weight:700;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;',
        'color:#9ecbff;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;',
        'color:#7ee787;font-weight:700;font-family:"JetBrains Mono","Fira Code","SF Mono",monospace;'
    );

    try {
        sessionStorage.setItem(consoleEasterEggKey, 'seen');
    } catch (_) {}
}

function setTerminalMode(isEnabled, showToast = true) {
    document.documentElement.classList.toggle('terminal-mode', isEnabled);
    localStorage.setItem(terminalModeKey, isEnabled ? 'on' : 'off');
    setTerminalAchievementCookie();

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
    updateMobileStatusBar();

    document.addEventListener('keydown', (event) => {
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 't') {
            event.preventDefault();
            toggleTerminalMode();
        }
    });
}

window.setTerminalMode = setTerminalMode;
document.addEventListener('DOMContentLoaded', initTerminalMode);
