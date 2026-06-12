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

    const size = 28;
    const speed = 120;

    let cols = 0;
    let rows = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.max(10, Math.floor(canvas.width / size));
        rows = Math.max(10, Math.floor(canvas.height / size));
    }

    resizeCanvas();

    let snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    let direction = { x: 1, y: 0 };
    let queuedDirection = { x: 1, y: 0 };
    let food = spawnFood();
    let score = 0;
    let highScore = Number(localStorage.getItem('snake_highscore') || 0);
    let timer = null;
    let started = false;
    let paused = false;

    highScoreEl.textContent = String(highScore);

    window.addEventListener('resize', () => {
        resizeCanvas();
        // clamp snake positions to new bounds
        snake = snake.map((seg) => ({
            x: Math.min(seg.x, cols - 1),
            y: Math.min(seg.y, rows - 1)
        }));
        food = { x: Math.min(food.x, cols - 1), y: Math.min(food.y, rows - 1) };
        render();
    });

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

    document.addEventListener('touchstart', (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    document.addEventListener('touchend', (event) => {
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
        snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
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
        if (point.x < 0 || point.y < 0 || point.x >= cols || point.y >= rows) {
            return true;
        }

        return snake.some((segment) => segment.x === point.x && segment.y === point.y);
    }

    function spawnFood() {
        let candidate = { x: 0, y: 0 };
        do {
            candidate = {
                x: Math.floor(Math.random() * cols),
                y: Math.floor(Math.random() * rows)
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

    function directionToAngle(dx, dy) {
        if (dx > 0) return 0;
        if (dx < 0) return Math.PI;
        if (dy > 0) return Math.PI / 2;
        return -Math.PI / 2;
    }

    function drawSegment(segX, segY, dx, dy, fillColor, isHead) {
        const angle = directionToAngle(dx, dy);
        const cx = segX * size + size / 2;
        const cy = segY * size + size / 2;

        // Elongated in direction of travel: longer axis forward, shorter axis sideways
        const long = isHead ? size - 2 : size - 4;
        const short = isHead ? size - 6 : size - 8;
        const radius = short / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        // Horizontal pill: from -long/2 to +long/2, -short/2 to +short/2
        const x = -long / 2;
        const y = -short / 2;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + long - radius, y);
        ctx.arcTo(x + long, y, x + long, y + radius, radius);
        ctx.lineTo(x + long, y + short - radius);
        ctx.arcTo(x + long, y + short, x + long - radius, y + short, radius);
        ctx.lineTo(x + radius, y + short);
        ctx.arcTo(x, y + short, x, y + short - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
        ctx.fill();

        // Eyes on the head
        if (isHead) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            const eyeOffset = short * 0.18;
            const eyeForward = long * 0.22;
            const eyeRadius = short * 0.13;
            ctx.beginPath();
            ctx.arc(eyeForward, -eyeOffset, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeForward, eyeOffset, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function render() {
        const accent = getThemeColor('--accent', '#0071E3');
        const grid = getThemeColor('--glass-border', 'rgba(128, 128, 128, 0.2)');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Subtle grid
        ctx.strokeStyle = colorWithAlpha(grid, 0.18);
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= cols; i += 1) {
            ctx.beginPath();
            ctx.moveTo(i * size, 0);
            ctx.lineTo(i * size, canvas.height);
            ctx.stroke();
        }
        for (let j = 0; j <= rows; j += 1) {
            ctx.beginPath();
            ctx.moveTo(0, j * size);
            ctx.lineTo(canvas.width, j * size);
            ctx.stroke();
        }

        // Body segments (drawn back to front so head is on top)
        for (let i = snake.length - 1; i >= 1; i -= 1) {
            const dx = snake[i - 1].x - snake[i].x;
            const dy = snake[i - 1].y - snake[i].y;
            // Fade tail segments slightly
            const alpha = 0.55 + 0.45 * (i / snake.length);
            drawSegment(snake[i].x, snake[i].y, dx, dy, colorWithAlpha(accent, alpha), false);
        }

        // Head
        drawSegment(snake[0].x, snake[0].y, direction.x, direction.y, accent, true);

        // Food as a small pulsing circle
        const foodCx = food.x * size + size / 2;
        const foodCy = food.y * size + size / 2;
        ctx.fillStyle = '#FF9500';
        ctx.beginPath();
        ctx.arc(foodCx, foodCy, size / 2 - 4, 0, Math.PI * 2);
        ctx.fill();
    }

    function colorWithAlpha(color, alpha) {
        if (color.startsWith('rgba')) {
            return color;
        }
        if (color.startsWith('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const validHex = hex.length === 3 || hex.length === 6;
            if (validHex) {
                const fullHex = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
                const intValue = Number.parseInt(fullHex, 16);
                const r = (intValue >> 16) & 255;
                const g = (intValue >> 8) & 255;
                const b = intValue & 255;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
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
