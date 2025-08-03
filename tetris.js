// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Tetromino shapes
const SHAPES = {
    I: [
        [1, 1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ]
};

// Colors for each shape
const COLORS = {
    I: '#00f5ff',
    O: '#ffff00',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#ffa500'
};

// Game state
let gameBoard = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let gamePaused = false;
let dropTime = 0;
let dropInterval = 1000;
let lastTime = 0;

// Canvas elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

// DOM elements
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const gameOverlay = document.getElementById('gameOverlay');
const finalScoreElement = document.getElementById('finalScore');

// Initialize game board
function initBoard() {
    gameBoard = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        gameBoard[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            gameBoard[y][x] = 0;
        }
    }
}

// Create a new piece
function createPiece(type) {
    const shape = SHAPES[type];
    return {
        type: type,
        shape: shape,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
        y: 0,
        color: COLORS[type]
    };
}

// Get random piece type
function getRandomPiece() {
    const types = Object.keys(SHAPES);
    return types[Math.floor(Math.random() * types.length)];
}

// Draw a single block
function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Add highlight effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, 4);
    ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, 4, BLOCK_SIZE - 4);
}

// Draw the game board
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
    
    // Draw placed pieces
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (gameBoard[y][x]) {
                drawBlock(ctx, x, y, gameBoard[y][x]);
            }
        }
    }
    
    // Draw current piece
    if (currentPiece) {
        drawPiece(ctx, currentPiece);
    }
}

// Draw a piece
function drawPiece(ctx, piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                drawBlock(ctx, piece.x + x, piece.y + y, piece.color);
            }
        }
    }
}

// Draw next piece
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const offsetX = (nextCanvas.width / BLOCK_SIZE - nextPiece.shape[0].length) / 2;
        const offsetY = (nextCanvas.height / BLOCK_SIZE - nextPiece.shape.length) / 2;
        
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    drawBlock(nextCtx, offsetX + x, offsetY + y, nextPiece.color);
                }
            }
        }
    }
}

// Check collision
function isCollision(piece, dx = 0, dy = 0) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + dx;
                const newY = piece.y + y + dy;
                
                if (newX < 0 || newX >= BOARD_WIDTH || 
                    newY >= BOARD_HEIGHT || 
                    (newY >= 0 && gameBoard[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Place piece on board
function placePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    gameBoard[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        let isComplete = true;
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (!gameBoard[y][x]) {
                isComplete = false;
                break;
            }
        }
        
        if (isComplete) {
            gameBoard.splice(y, 1);
            gameBoard.unshift(new Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        updateDisplay();
        
        // Add animation effect
        scoreElement.classList.add('score-update');
        setTimeout(() => {
            scoreElement.classList.remove('score-update');
        }, 300);
    }
}

// Rotate piece
function rotatePiece() {
    const rotated = [];
    const shape = currentPiece.shape;
    
    for (let x = 0; x < shape[0].length; x++) {
        rotated[x] = [];
        for (let y = shape.length - 1; y >= 0; y--) {
            rotated[x][shape.length - 1 - y] = shape[y][x];
        }
    }
    
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (isCollision(currentPiece)) {
        currentPiece.shape = originalShape;
    }
}

// Move piece
function movePiece(dx, dy) {
    if (!isCollision(currentPiece, dx, dy)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

// Drop piece to bottom
function hardDrop() {
    while (movePiece(0, 1)) {
        score += 2;
    }
    placePiece();
    clearLines();
    spawnPiece();
}

// Spawn new piece
function spawnPiece() {
    currentPiece = nextPiece || createPiece(getRandomPiece());
    nextPiece = createPiece(getRandomPiece());
    
    if (isCollision(currentPiece)) {
        gameOver();
    }
    
    drawNextPiece();
}

// Game over
function gameOver() {
    gameRunning = false;
    gamePaused = false;
    finalScoreElement.textContent = score;
    gameOverlay.style.display = 'flex';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Update display
function updateDisplay() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// Game loop
function gameLoop(currentTime) {
    if (!gameRunning || gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const deltaTime = currentTime - lastTime;
    dropTime += deltaTime;
    
    if (dropTime >= dropInterval) {
        if (!movePiece(0, 1)) {
            placePiece();
            clearLines();
            spawnPiece();
        }
        dropTime = 0;
    }
    
    drawBoard();
    lastTime = currentTime;
    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    if (!gameRunning) {
        initBoard();
        score = 0;
        level = 1;
        lines = 0;
        dropTime = 0;
        dropInterval = 1000;
        gameRunning = true;
        gamePaused = false;
        
        spawnPiece();
        updateDisplay();
        
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        gameOverlay.style.display = 'none';
        
        requestAnimationFrame(gameLoop);
    }
}

// Pause game
function pauseGame() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
    }
}

// Reset game
function resetGame() {
    gameRunning = false;
    gamePaused = false;
    initBoard();
    score = 0;
    level = 1;
    lines = 0;
    currentPiece = null;
    nextPiece = null;
    
    updateDisplay();
    drawBoard();
    drawNextPiece();
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    gameOverlay.style.display = 'none';
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;
    
    switch (e.code) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (movePiece(0, 1)) {
                score += 1;
                updateDisplay();
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotatePiece();
            break;
        case 'Space':
            e.preventDefault();
            hardDrop();
            break;
    }
});

// Initialize game
function init() {
    initBoard();
    drawBoard();
    drawNextPiece();
    updateDisplay();
}

// Start the game when page loads
window.addEventListener('load', init); 
