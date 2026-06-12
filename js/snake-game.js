document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('#snake-canvas');
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    const scoreEl = document.querySelector('#snake-score');
    const highScoreEl = document.querySelector('#snake-highscore');
    const startPauseBtn = document.querySelector('#snake-start-pause');
    const restartBtn = document.querySelector('#snake-restart');
    const overlay = document.querySelector('#snake-overlay');
    const overlayText = document.querySelector('#snake-overlay-text');
    const overlayBtn = document.querySelector('#snake-overlay-btn');

    const size = 20;
    const cells = 20;
    const speed = 120;

    let snake = [{ x: 10, y: 10 }];
    let direction = { x: 1, y: 0 };
    let queuedDirection = { x: 1, y: 0 };
    let food = spawnFood();
    let score = 0;
    let highScore = Number(localStorage.getItem('snake_highscore') || 0);
    let timer = null;
    let started = false;
    let paused = false;

    highScoreEl.textContent = String(highScore);

    startPauseBtn.addEventListener('click', () => {
        if (!started) {
            startGame();
            return;
        }

        if (paused) {
            resumeGame();
        } else {
            pauseGame();
        }
    });

    restartBtn.addEventListener('click', () => {
        resetGame();
        startGame();
    });

    overlayBtn.addEventListener('click', () => {
        resetGame();
        startGame();
    });

    document.addEventListener('keydown', (event) => {
        const next = getDirectionFromKey(event.key);
        if (!next) {
            return;
        }

        event.preventDefault();
        queuedDirection = next;

        if (!started) {
            startGame();
        }

        if (paused) {
            resumeGame();
        }
    });

    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (event) => {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15) {
            return;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            queuedDirection = deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
            queuedDirection = deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }

        if (!started) {
            startGame();
        }

        if (paused) {
            resumeGame();
        }
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && started && !paused) {
            pauseGame();
        }
    });

    render();

    function startGame() {
        if (timer) {
            return;
        }

        started = true;
        paused = false;
        startPauseBtn.textContent = 'Pause';
        hideOverlay();
        timer = setInterval(step, speed);
    }

    function pauseGame() {
        if (!timer) {
            return;
        }

        clearInterval(timer);
        timer = null;
        paused = true;
        startPauseBtn.textContent = 'Start';
    }

    function resumeGame() {
        if (timer) {
            return;
        }

        paused = false;
        startPauseBtn.textContent = 'Pause';
        timer = setInterval(step, speed);
    }

    function resetGame() {
        clearInterval(timer);
        timer = null;
        started = false;
        paused = false;
        score = 0;
        snake = [{ x: 10, y: 10 }];
        direction = { x: 1, y: 0 };
        queuedDirection = { x: 1, y: 0 };
        food = spawnFood();
        scoreEl.textContent = '0';
        startPauseBtn.textContent = 'Start';
        hideOverlay();
        render();
    }

    function step() {
        if (queuedDirection.x !== -direction.x || queuedDirection.y !== -direction.y) {
            direction = queuedDirection;
        }

        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        if (isCollision(head)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 1;
            scoreEl.textContent = String(score);
            if (score > highScore) {
                highScore = score;
                highScoreEl.textContent = String(highScore);
                localStorage.setItem('snake_highscore', String(highScore));
            }
            food = spawnFood();
        } else {
            snake.pop();
        }

        render();
    }

    function gameOver() {
        clearInterval(timer);
        timer = null;
        paused = false;
        started = false;
        startPauseBtn.textContent = 'Start';
        showOverlay(`Game Over — Score: ${score}`);
    }

    function isCollision(point) {
        if (point.x < 0 || point.y < 0 || point.x >= cells || point.y >= cells) {
            return true;
        }

        return snake.some((segment) => segment.x === point.x && segment.y === point.y);
    }

    function spawnFood() {
        let candidate = { x: 0, y: 0 };
        do {
            candidate = {
                x: Math.floor(Math.random() * cells),
                y: Math.floor(Math.random() * cells)
            };
        } while (snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y));

        return candidate;
    }

    function getDirectionFromKey(key) {
        switch (key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                return { x: 0, y: -1 };
            case 'arrowdown':
            case 's':
                return { x: 0, y: 1 };
            case 'arrowleft':
            case 'a':
                return { x: -1, y: 0 };
            case 'arrowright':
            case 'd':
                return { x: 1, y: 0 };
            default:
                return null;
        }
    }

    function getThemeColor(variable, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
        return value || fallback;
    }

    function render() {
        const accent = getThemeColor('--accent', '#0071E3');
        const grid = getThemeColor('--glass-border', 'rgba(128, 128, 128, 0.2)');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = colorWithAlpha(grid, 0.28);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = colorWithAlpha(grid, 0.4);
        for (let i = 0; i <= cells; i += 1) {
            ctx.beginPath();
            ctx.moveTo(i * size, 0);
            ctx.lineTo(i * size, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * size);
            ctx.lineTo(canvas.width, i * size);
            ctx.stroke();
        }

        ctx.fillStyle = accent;
        snake.forEach((segment) => {
            ctx.fillRect(segment.x * size + 2, segment.y * size + 2, size - 4, size - 4);
        });

        ctx.fillStyle = '#FF9500';
        ctx.fillRect(food.x * size + 4, food.y * size + 4, size - 8, size - 8);
    }

    function colorWithAlpha(color, alpha) {
        if (color.startsWith('rgba')) {
            return color;
        }
        if (color.startsWith('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }
        return `rgba(128, 128, 128, ${alpha})`;
    }

    function showOverlay(message) {
        overlayText.textContent = message;
        overlay.hidden = false;
    }

    function hideOverlay() {
        overlay.hidden = true;
    }
});
