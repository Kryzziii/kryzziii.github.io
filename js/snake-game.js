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

    const HIGH_SCORE_KEY = 'runner_highscore';
    const GRAVITY = 0.85;
    const JUMP_VELOCITY = -15.5;
    const POINTER_SELECTOR = 'a, button, input, textarea, select, label';
    const MS_PER_FRAME = 16.6667;
    const MAX_DELTA_MULTIPLIER = 2.2;
    const MAX_FRAME_GAP = 250;

    let viewportWidth = 0;
    let viewportHeight = 0;
    let groundY = 0;
    let deviceScale = 1;

    let runner = null;
    let obstacles = [];
    let score = 0;
    let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
    let baseSpeed = 8;
    let obstacleTimer = 0;
    let nextObstacleDelay = 90;
    let animationId = null;
    let lastFrameTime = 0;
    let runCycle = 0;
    let started = false;
    let paused = false;

    highScoreEl.textContent = String(highScore);

    resizeCanvas();
    resetGame();

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

    window.addEventListener('resize', () => {
        resizeCanvas();
        if (runner) {
            runner.x = Math.max(64, viewportWidth * 0.16);
            runner.y = Math.min(runner.y, groundY - runner.height);
            if (runner.y >= groundY - runner.height) {
                runner.y = groundY - runner.height;
                runner.velocityY = 0;
                runner.grounded = true;
            }
        }
        obstacles = obstacles.filter((obstacle) => obstacle.x < viewportWidth + obstacle.width);
        render();
    });

    document.addEventListener('keydown', (event) => {
        if (event.repeat) {
            return;
        }

        const key = event.key.toLowerCase();
        if (key === 'p') {
            event.preventDefault();
            if (!started) {
                startGame();
            } else if (paused) {
                resumeGame();
            } else {
                pauseGame();
            }
            return;
        }

        if (![' ', 'arrowup', 'w'].includes(key)) {
            return;
        }

        event.preventDefault();
        handleJumpInput();
    });

    document.addEventListener('pointerdown', (event) => {
        if (event.target.closest(POINTER_SELECTOR)) {
            return;
        }
        handleJumpInput();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && started && !paused) {
            pauseGame();
        }
    });

    render();

    function resizeCanvas() {
        deviceScale = window.devicePixelRatio || 1;
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        groundY = viewportHeight * 0.76;

        canvas.width = Math.floor(viewportWidth * deviceScale);
        canvas.height = Math.floor(viewportHeight * deviceScale);
        ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    }

    function createRunner() {
        const width = Math.max(34, Math.min(48, viewportWidth * 0.05));
        const height = width * 1.25;
        return {
            x: Math.max(64, viewportWidth * 0.16),
            y: groundY - height,
            width,
            height,
            velocityY: 0,
            grounded: true
        };
    }

    function startGame() {
        if (animationId) {
            return;
        }

        started = true;
        paused = false;
        lastFrameTime = 0;
        startPauseBtn.textContent = 'Pause';
        hideOverlay();
        animationId = window.requestAnimationFrame(loop);
    }

    function pauseGame() {
        if (!animationId) {
            return;
        }

        window.cancelAnimationFrame(animationId);
        animationId = null;
        paused = true;
        startPauseBtn.textContent = 'Resume';
    }

    function resumeGame() {
        if (animationId) {
            return;
        }

        paused = false;
        lastFrameTime = 0;
        startPauseBtn.textContent = 'Pause';
        animationId = window.requestAnimationFrame(loop);
    }

    function resetGame() {
        window.cancelAnimationFrame(animationId);
        animationId = null;
        lastFrameTime = 0;
        started = false;
        paused = false;
        score = 0;
        baseSpeed = 8;
        obstacleTimer = 0;
        nextObstacleDelay = randomObstacleDelay();
        runCycle = 0;
        obstacles = [];
        runner = createRunner();
        scoreEl.textContent = '0';
        startPauseBtn.textContent = 'Start';
        hideOverlay();
        render();
    }

    function loop(timestamp) {
        if (!started || paused) {
            animationId = null;
            return;
        }

        if (!lastFrameTime || timestamp - lastFrameTime > MAX_FRAME_GAP) {
            lastFrameTime = timestamp;
        }

        const delta = Math.min((timestamp - lastFrameTime) / MS_PER_FRAME, MAX_DELTA_MULTIPLIER);
        lastFrameTime = timestamp;

        update(delta);
        render();

        if (started && !paused) {
            animationId = window.requestAnimationFrame(loop);
        } else {
            animationId = null;
        }
    }

    function update(delta) {
        baseSpeed = Math.min(baseSpeed + delta * 0.01, 18);
        score += delta * 0.8;
        runCycle += delta * (runner.grounded ? baseSpeed * 0.16 : 0.08);
        scoreEl.textContent = String(Math.floor(score));

        runner.velocityY += GRAVITY * delta;
        runner.y += runner.velocityY * delta;

        if (runner.y >= groundY - runner.height) {
            runner.y = groundY - runner.height;
            runner.velocityY = 0;
            runner.grounded = true;
        } else {
            runner.grounded = false;
        }

        obstacleTimer += delta;
        if (obstacleTimer >= nextObstacleDelay) {
            spawnObstacle();
            obstacleTimer = 0;
            nextObstacleDelay = randomObstacleDelay();
        }

        obstacles.forEach((obstacle) => {
            obstacle.x -= obstacle.speed * delta;
        });
        obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > -40);

        const hitObstacle = obstacles.some((obstacle) => intersects(runner, obstacle));
        if (hitObstacle) {
            gameOver();
            return;
        }

        if (score > highScore) {
            highScore = Math.floor(score);
            highScoreEl.textContent = String(highScore);
            localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
        }
    }

    function handleJumpInput() {
        if (!started) {
            startGame();
        } else if (paused) {
            resumeGame();
        }

        if (runner.grounded) {
            runner.velocityY = JUMP_VELOCITY;
            runner.grounded = false;
        }
    }

    function spawnObstacle() {
        const isTall = Math.random() > 0.58;
        const width = isTall ? randomBetween(24, 34) : randomBetween(34, 56);
        const height = isTall ? randomBetween(64, 94) : randomBetween(34, 54);

        obstacles.push({
            x: viewportWidth + randomBetween(40, 180),
            y: groundY - height,
            width,
            height,
            speed: baseSpeed + randomBetween(0.6, 2.4)
        });
    }

    function randomObstacleDelay() {
        return randomBetween(55, 105);
    }

    function intersects(player, obstacle) {
        const paddingX = 8;
        const paddingY = 6;
        return (
            player.x + paddingX < obstacle.x + obstacle.width &&
            player.x + player.width - paddingX > obstacle.x &&
            player.y + paddingY < obstacle.y + obstacle.height &&
            player.y + player.height - paddingY > obstacle.y
        );
    }

    function gameOver() {
        window.cancelAnimationFrame(animationId);
        animationId = null;
        paused = false;
        started = false;
        startPauseBtn.textContent = 'Start';
        showOverlay(`Game Over — Distance: ${Math.floor(score)}`);
    }

    function render() {
        const accent = getThemeColor('--accent', '#0071E3');
        const grid = getThemeColor('--glass-border', 'rgba(128, 128, 128, 0.22)');
        const textMain = getThemeColor('--text-main', '#1D1D1F');

        ctx.clearRect(0, 0, viewportWidth, viewportHeight);

        drawBackdrop(accent, grid);
        drawGround(accent, grid);
        drawObstacles(accent, textMain);
        drawRunner(accent, textMain);
    }

    function drawBackdrop(accent, grid) {
        const laneHeight = Math.max(58, viewportHeight * 0.09);
        const laneOffset = (score * baseSpeed * 3.5) % laneHeight;

        ctx.fillStyle = colorWithAlpha(accent, 0.04);
        ctx.fillRect(0, groundY, viewportWidth, viewportHeight - groundY);

        ctx.strokeStyle = colorWithAlpha(grid, 0.18);
        ctx.lineWidth = 1;
        for (let y = groundY - laneHeight * 2; y <= viewportHeight; y += laneHeight) {
            ctx.beginPath();
            ctx.moveTo(0, y + laneOffset);
            ctx.lineTo(viewportWidth, y + laneOffset);
            ctx.stroke();
        }
    }

    function drawGround(accent, grid) {
        const dashOffset = (score * baseSpeed * 6) % 54;

        ctx.strokeStyle = colorWithAlpha(accent, 0.48);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(viewportWidth, groundY);
        ctx.stroke();

        ctx.strokeStyle = colorWithAlpha(grid, 0.34);
        ctx.lineWidth = 3;
        for (let x = -60; x <= viewportWidth + 60; x += 54) {
            ctx.beginPath();
            ctx.moveTo(x - dashOffset, groundY + 18);
            ctx.lineTo(x + 28 - dashOffset, groundY + 18);
            ctx.stroke();
        }
    }

    function drawObstacles(accent, textMain) {
        obstacles.forEach((obstacle) => {
            const radius = Math.min(10, obstacle.width * 0.28);
            const spikeInset = obstacle.width * 0.35;

            ctx.save();
            ctx.fillStyle = colorWithAlpha(textMain, 0.82);
            roundedRect(ctx, obstacle.x, obstacle.y + obstacle.height * 0.2, obstacle.width, obstacle.height * 0.8, radius);
            ctx.fill();

            ctx.fillStyle = colorWithAlpha(accent, 0.78);
            ctx.beginPath();
            ctx.moveTo(obstacle.x + spikeInset, obstacle.y + obstacle.height * 0.28);
            ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
            ctx.lineTo(obstacle.x + obstacle.width - spikeInset, obstacle.y + obstacle.height * 0.28);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }

    function drawRunner(accent, textMain) {
        const lean = runner.grounded
            ? Math.sin(runCycle) * 0.06 + Math.min(baseSpeed * 0.01, 0.16)
            : Math.max(-0.22, runner.velocityY * 0.025);
        const bodyX = runner.x + runner.width / 2;
        const bodyY = runner.y + runner.height / 2;
        const legSwing = runner.grounded ? Math.sin(runCycle * 1.35) * 8 : 0;

        ctx.save();
        ctx.translate(bodyX, bodyY);
        ctx.rotate(lean);

        ctx.fillStyle = colorWithAlpha(textMain, 0.92);
        roundedRect(
            ctx,
            -runner.width * 0.28,
            -runner.height * 0.18,
            runner.width * 0.56,
            runner.height * 0.54,
            12
        );
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, -runner.height * 0.24, runner.width * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = colorWithAlpha(accent, 0.92);
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-runner.width * 0.1, runner.height * 0.08);
        ctx.lineTo(-runner.width * 0.2, runner.height * 0.34 + legSwing);
        ctx.moveTo(runner.width * 0.1, runner.height * 0.08);
        ctx.lineTo(runner.width * 0.18, runner.height * 0.34 - legSwing);
        ctx.stroke();

        ctx.strokeStyle = colorWithAlpha(accent, 0.72);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-runner.width * 0.1, -runner.height * 0.02);
        ctx.lineTo(-runner.width * 0.3, runner.height * 0.1);
        ctx.moveTo(runner.width * 0.1, -runner.height * 0.02);
        ctx.lineTo(runner.width * 0.28, runner.height * 0.08);
        ctx.stroke();

        ctx.restore();
    }

    function roundedRect(context, x, y, width, height, radius) {
        const safeRadius = Math.min(radius, width / 2, height / 2);
        context.beginPath();
        context.moveTo(x + safeRadius, y);
        context.lineTo(x + width - safeRadius, y);
        context.arcTo(x + width, y, x + width, y + safeRadius, safeRadius);
        context.lineTo(x + width, y + height - safeRadius);
        context.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius);
        context.lineTo(x + safeRadius, y + height);
        context.arcTo(x, y + height, x, y + height - safeRadius, safeRadius);
        context.lineTo(x, y + safeRadius);
        context.arcTo(x, y, x + safeRadius, y, safeRadius);
        context.closePath();
    }

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function getThemeColor(variable, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
        return value || fallback;
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
            if (hex.length === 3 || hex.length === 6) {
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
