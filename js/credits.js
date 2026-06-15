(function () {
    const ACHIEVEMENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
    const achievementCookies = {
        terminal: 'ee_terminal_discovered',
        humans: 'ee_humans_discovered',
        credits: 'ee_credits_discovered'
    };
    let lastDiscoveredCount = null;

    function setCookie(name, value, maxAgeSeconds) {
        document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAgeSeconds};SameSite=Lax`;
    }

    function getCookie(name) {
        const needle = `${name}=`;
        const parts = document.cookie ? document.cookie.split(';') : [];

        for (let i = 0; i < parts.length; i += 1) {
            const part = parts[i].trim();
            if (part.startsWith(needle)) {
                return decodeURIComponent(part.slice(needle.length));
            }
        }

        return null;
    }

    function markAchievement(key) {
        const cookieName = achievementCookies[key];
        if (!cookieName) {
            return;
        }

        try {
            setCookie(cookieName, '1', ACHIEVEMENT_COOKIE_MAX_AGE);
        } catch (_) {}
    }

    function hasAchievement(key) {
        const cookieName = achievementCookies[key];
        if (!cookieName) {
            return false;
        }

        try {
            return getCookie(cookieName) === '1';
        } catch (_) {
            return false;
        }
    }

    function renderAchievementState() {
        const itemByKey = {
            terminal: document.getElementById('egg-terminal'),
            humans: document.getElementById('egg-humans'),
            credits: document.getElementById('egg-credits')
        };

        const counter = document.getElementById('ee-progress-counter');
        const keys = Object.keys(achievementCookies);
        const discoveredCount = keys.filter((key) => hasAchievement(key)).length;

        Object.keys(itemByKey).forEach((key) => {
            const item = itemByKey[key];
            if (!item) {
                return;
            }

            const discovered = hasAchievement(key);
            item.classList.toggle('is-discovered', discovered);
            item.setAttribute('aria-label', discovered ? 'Discovered easter egg' : 'Undiscovered easter egg');
        });

        if (counter) {
            counter.textContent = `${discoveredCount}/${keys.length} discovered`;

            if (lastDiscoveredCount !== null && discoveredCount > lastDiscoveredCount) {
                counter.classList.remove('is-updating');
                // Force reflow so the animation can replay on every increment.
                void counter.offsetWidth;
                counter.classList.add('is-updating');
            }
        }

        lastDiscoveredCount = discoveredCount;
    }

    function restoreInitialState() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        if (localStorage.getItem('terminal_mode') === 'on') {
            document.documentElement.classList.add('terminal-mode');
        }
    }

    function initPreload() {
        document.body.classList.add('preload');
        window.setTimeout(() => {
            document.body.classList.remove('preload');
        }, 200);
    }

    function initEasterEggButtons() {
        const terminalButton = document.getElementById('ee-terminal-toggle');
        const creditsButton = document.getElementById('ee-credits-open');
        const humansButton = document.getElementById('ee-humans-open');

        if (!terminalButton && !creditsButton && !humansButton) {
            return;
        }

        const showCreditsToast = (message) => {
            let toast = document.querySelector('.terminal-toast');

            if (!toast) {
                toast = document.createElement('div');
                toast.className = 'terminal-toast';
                toast.setAttribute('role', 'status');
                toast.setAttribute('aria-live', 'polite');
                document.body.appendChild(toast);
            }

            toast.textContent = message;
            toast.classList.add('visible');

            window.clearTimeout(showCreditsToast.hideTimeout);
            showCreditsToast.hideTimeout = window.setTimeout(() => {
                toast.classList.remove('visible');
            }, 1600);
        };

        const html = document.documentElement;
        const updateTerminalButton = () => {
            if (!terminalButton) {
                return;
            }

            terminalButton.textContent = html.classList.contains('terminal-mode') ? 'Disable' : 'Enable';
        };

        updateTerminalButton();
        document.addEventListener('terminalmodechange', updateTerminalButton);
        document.addEventListener('terminalmodechange', () => {
            markAchievement('terminal');
            renderAchievementState();
        });

        if (terminalButton) {
            terminalButton.addEventListener('click', () => {
                const nextState = !html.classList.contains('terminal-mode');

                if (typeof window.setTerminalMode === 'function') {
                    window.setTerminalMode(nextState);
                } else {
                    html.classList.toggle('terminal-mode', nextState);
                    localStorage.setItem('terminal_mode', nextState ? 'on' : 'off');
                    document.dispatchEvent(new CustomEvent('terminalmodechange', { detail: { isEnabled: nextState } }));
                }

                updateTerminalButton();
            });
        }

        if (humansButton) {
            humansButton.addEventListener('click', () => {
                markAchievement('humans');
                renderAchievementState();
            });
        }

        if (creditsButton) {
            creditsButton.addEventListener('click', () => {
                showCreditsToast("You're already here 👀");
            });
        }
    }

    function initGithubStats() {
        const stars = document.getElementById('stat-stars');
        const forks = document.getElementById('stat-forks');
        const pushed = document.getElementById('stat-pushed');

        if (!stars || !forks || !pushed) {
            return;
        }

        const CACHE_KEY = 'credits_gh_stats';
        const CACHE_TTL = 5 * 60 * 1000;

        function relativeTime(isoDate) {
            const diff = Date.now() - new Date(isoDate).getTime();
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) {
                return days + 'd ago';
            }

            if (hours > 0) {
                return hours + 'h ago';
            }

            return minutes + 'm ago';
        }

        function render(data) {
            stars.textContent = data.stargazers_count;
            forks.textContent = data.forks_count;
            pushed.textContent = relativeTime(data.pushed_at);
        }

        try {
            const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
            if (cached && (Date.now() - cached.ts < CACHE_TTL)) {
                render(cached.data);
                return;
            }
        } catch (_) {}

        fetch('https://api.github.com/repos/Kryzziii/kryzziii.github.io')
            .then((response) => response.json())
            .then((data) => {
                render(data);
                try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
                } catch (_) {}
            })
            .catch(() => {});
    }

    restoreInitialState();

    document.addEventListener('DOMContentLoaded', function () {
        initPreload();
        markAchievement('credits');
        initEasterEggButtons();
        renderAchievementState();
        initGithubStats();
    });
}());

