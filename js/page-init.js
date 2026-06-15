(function initPageShell() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedTerminalMode = localStorage.getItem('terminal_mode');
    if (savedTerminalMode === 'on') {
        document.documentElement.classList.add('terminal-mode');
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', '#0d1117');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('preload');
        window.setTimeout(() => {
            document.body.classList.remove('preload');
        }, 200);
    });
})();
