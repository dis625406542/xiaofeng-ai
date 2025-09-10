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

// Special color for garbage blocks
const GARBAGE_COLOR = 'DEMON_LOGO'; // 使用恶魔头像
const GARBAGE_EMPTY_COLOR = '#000000'; // 垃圾行中的空位显示为背景色（黑色）

// Load demon logo image
let demonLogo = null;
const logoImage = new Image();
logoImage.onload = function() {
    demonLogo = logoImage;
    console.log("Demon logo loaded successfully");
};
logoImage.onerror = function() {
    console.log("Failed to load demon logo, using fallback color");
};
logoImage.src = 'logo1.png';

// Game state
let gameBoard = [];
let currentPiece = null;
let nextPieces = []; // 存储3个未来方块
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let gamePaused = false;
let dropTime = 0;
let dropInterval = 1000;
let lastTime = 0;

// Garbage line system
let garbageTimer = 0;
let garbageInterval = 3000; // 3 seconds (恢复3秒间隔)
let garbageLinesCleared = 0;
let gameStartTime = 0;

// Canvas elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas1 = document.getElementById('nextCanvas1');
const nextCtx1 = nextCanvas1.getContext('2d');
const nextCanvas2 = document.getElementById('nextCanvas2');
const nextCtx2 = nextCanvas2.getContext('2d');
const nextCanvas3 = document.getElementById('nextCanvas3');
const nextCtx3 = nextCanvas3.getContext('2d');

// DOM elements
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const garbageClearedElement = document.getElementById('garbageCleared');
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

// Initialize next pieces queue
function initNextPieces() {
    nextPieces = [];
    for (let i = 0; i < 3; i++) {
        nextPieces.push(createPiece(getRandomPiece()));
    }
}

// Get next piece from queue and add new one
function getNextPiece() {
    const piece = nextPieces.shift(); // 移除第一个方块
    nextPieces.push(createPiece(getRandomPiece())); // 添加新的方块到队列末尾
    return piece;
}

// Generate a garbage line
function generateGarbageLine() {
    const garbageLine = new Array(BOARD_WIDTH).fill(GARBAGE_COLOR);
    const emptyPosition = Math.floor(Math.random() * BOARD_WIDTH);
    garbageLine[emptyPosition] = GARBAGE_EMPTY_COLOR; // 留一个空位，用特殊颜色标记
    
    console.log("Generated garbage line with empty position:", emptyPosition);
    return garbageLine;
}

// Insert garbage line at bottom and shift everything up
function insertGarbageLine() {
    console.log("Generating garbage line...");
    
    // 检查游戏板是否完全为空（没有任何方块）
    let isCompletelyEmpty = true;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (gameBoard[y][x] !== 0) {
                isCompletelyEmpty = false;
                break;
            }
        }
        if (!isCompletelyEmpty) break;
    }
    
    if (isCompletelyEmpty) {
        console.log("Game board is completely empty, inserting at bottom...");
        // 如果游戏板完全为空，直接在底部插入垃圾行
        gameBoard[BOARD_HEIGHT - 1] = generateGarbageLine();
    } else {
        console.log("Game board has content, shifting up...");
        // 移除顶部一行
        gameBoard.shift(); // 使用shift()移除顶部
        // 在底部插入新的垃圾行
        gameBoard.push(generateGarbageLine()); // 使用push()在底部插入
    }
    
    console.log("Garbage line inserted. Game board length:", gameBoard.length);
    console.log("Bottom row:", gameBoard[BOARD_HEIGHT - 1]);
    console.log("Top row:", gameBoard[0]);
    
    // 检查游戏是否结束（垃圾行到达顶部）
    checkGameOverFromGarbage();
}

// Check if game should end due to garbage lines
function checkGameOverFromGarbage() {
    // 检查顶部是否有垃圾方块
    let garbageCount = 0;
    for (let x = 0; x < BOARD_WIDTH; x++) {
        if (gameBoard[0][x] === GARBAGE_COLOR || gameBoard[0][x] === GARBAGE_EMPTY_COLOR) {
            garbageCount++;
        }
    }
    
    console.log("Top row garbage count:", garbageCount, "out of", BOARD_WIDTH);
    
    // 只有当顶部大部分位置都是垃圾方块时才结束游戏（给玩家一些生存空间）
    if (garbageCount >= BOARD_WIDTH - 2) {
        console.log("Game over due to garbage lines!");
        gameOver();
        return;
    }
}

// Draw a single block
function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Different styling for garbage blocks
    if (color === GARBAGE_COLOR) {
        // 垃圾方块：使用恶魔头像
        const blockX = x * BLOCK_SIZE;
        const blockY = y * BLOCK_SIZE;
        
        // 背景填充（深灰色）
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        
        // 绘制恶魔头像
        if (demonLogo) {
            // 计算头像位置和大小，留出边框空间
            const logoSize = BLOCK_SIZE - 4;
            const logoX = blockX + 2;
            const logoY = blockY + 2;
            
            // 绘制恶魔头像
            ctx.drawImage(demonLogo, logoX, logoY, logoSize, logoSize);
        } else {
            // 如果头像未加载，使用备用颜色
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(blockX + 2, blockY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
            
            // 添加备用纹理
            ctx.fillStyle = '#666666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('👹', blockX + BLOCK_SIZE/2, blockY + BLOCK_SIZE/2 + 5);
        }
        
        // 立体效果：顶部和左侧高光
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(blockX, blockY, BLOCK_SIZE, 2); // 顶部高光
        ctx.fillRect(blockX, blockY, 2, BLOCK_SIZE); // 左侧高光
        
        // 立体效果：底部和右侧阴影
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(blockX, blockY + BLOCK_SIZE - 2, BLOCK_SIZE, 2); // 底部阴影
        ctx.fillRect(blockX + BLOCK_SIZE - 2, blockY, 2, BLOCK_SIZE); // 右侧阴影
        
        // 外边框
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        
    } else if (color === GARBAGE_EMPTY_COLOR) {
        // 垃圾行空位：显示为普通黑色背景，无特殊效果
        const blockX = x * BLOCK_SIZE;
        const blockY = y * BLOCK_SIZE;
        
        // 背景色填充
        ctx.fillStyle = '#000000';
        ctx.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        
    } else {
        // 普通方块
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        
        // Add highlight effect for normal blocks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, 4);
        ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, 4, BLOCK_SIZE - 4);
    }
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

// Draw next pieces
function drawNextPieces() {
    const canvases = [nextCanvas1, nextCanvas2, nextCanvas3];
    const contexts = [nextCtx1, nextCtx2, nextCtx3];
    
    for (let i = 0; i < 3; i++) {
        contexts[i].clearRect(0, 0, canvases[i].width, canvases[i].height);
        
        if (nextPieces[i]) {
            const piece = nextPieces[i];
            const offsetX = (canvases[i].width / BLOCK_SIZE - piece.shape[0].length) / 2;
            const offsetY = (canvases[i].height / BLOCK_SIZE - piece.shape.length) / 2;
            
            for (let y = 0; y < piece.shape.length; y++) {
                for (let x = 0; x < piece.shape[y].length; x++) {
                    if (piece.shape[y][x]) {
                        drawBlock(contexts[i], offsetX + x, offsetY + y, piece.color);
                    }
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
                    (newY >= 0 && gameBoard[newY][newX] && 
                     gameBoard[newY][newX] !== GARBAGE_EMPTY_COLOR)) {
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
    let garbageLinesInCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        let isComplete = true;
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (!gameBoard[y][x] || gameBoard[y][x] === 0 || gameBoard[y][x] === GARBAGE_EMPTY_COLOR) {
                isComplete = false;
                break;
            }
        }
        
        if (isComplete) {
            // Check if this line contains garbage blocks
            let hasGarbage = false;
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (gameBoard[y][x] === GARBAGE_COLOR) {
                    hasGarbage = true;
                    break;
                }
            }
            
            if (hasGarbage) {
                garbageLinesInCleared++;
            }
            
            gameBoard.splice(y, 1);
            gameBoard.unshift(new Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        garbageLinesCleared += garbageLinesInCleared;
        
        // 新的分值计算规则
        let totalScore = 0;
        
        // 计算普通行和垃圾行的分数
        let normalLinesCleared = linesCleared - garbageLinesInCleared;
        
        // 普通行：每行1分
        totalScore += normalLinesCleared * 1;
        
        // 垃圾行：每行5分
        totalScore += garbageLinesInCleared * 5;
        
        // 一次性消灭3行的额外奖励：+2分
        if (linesCleared >= 3) {
            totalScore += 2;
            console.log(`Triple line clear bonus! +2 points`);
        }
        
        score += totalScore;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        updateDisplay();
        
        // Add animation effect
        scoreElement.classList.add('score-update');
        setTimeout(() => {
            scoreElement.classList.remove('score-update');
        }, 300);
        
        // Show detailed scoring info
        console.log(`Cleared ${linesCleared} line(s): ${normalLinesCleared} normal (+${normalLinesCleared} points), ${garbageLinesInCleared} garbage (+${garbageLinesInCleared * 5} points), Total: +${totalScore} points`);
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
    currentPiece = getNextPiece();
    
    if (isCollision(currentPiece)) {
        gameOver();
    }
    
    drawNextPieces();
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
    garbageClearedElement.textContent = garbageLinesCleared;
}

// Game loop
function gameLoop(currentTime) {
    if (!gameRunning || gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const deltaTime = currentTime - lastTime;
    dropTime += deltaTime;
    garbageTimer += deltaTime;
    
    // Handle piece dropping
    if (dropTime >= dropInterval) {
        if (!movePiece(0, 1)) {
            placePiece();
            clearLines();
            spawnPiece();
        }
        dropTime = 0;
    }
    
    // Handle garbage line generation (test: generate after 5 seconds)
    if (garbageTimer >= garbageInterval && (currentTime - gameStartTime) > 5000) {
        console.log("Garbage timer triggered! Current time:", currentTime, "Game start time:", gameStartTime, "Elapsed:", currentTime - gameStartTime);
        insertGarbageLine();
        garbageTimer = 0;
    } else if (garbageTimer >= garbageInterval) {
        console.log("Garbage timer ready but waiting for 5 seconds. Elapsed:", currentTime - gameStartTime);
    }
    
    drawBoard();
    lastTime = currentTime;
    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    if (!gameRunning) {
        initBoard();
        initNextPieces();
        score = 0;
        level = 1;
        lines = 0;
        dropTime = 0;
        dropInterval = 1000;
        garbageTimer = 0;
        garbageLinesCleared = 0;
        gameStartTime = performance.now();
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
    initNextPieces();
    score = 0;
    level = 1;
    lines = 0;
    garbageTimer = 0;
    garbageLinesCleared = 0;
    currentPiece = null;
    
    updateDisplay();
    drawBoard();
    drawNextPieces();
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    gameOverlay.style.display = 'none';
}

// Play again - reset and start immediately
function playAgain() {
    // Reset the game
    resetGame();
    
    // Start the game immediately
    startGame();
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
    initNextPieces();
    garbageTimer = 0;
    garbageLinesCleared = 0;
    drawBoard();
    drawNextPieces();
    updateDisplay();
}

// 合并背景图片
function mergeBackgroundImages() {
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
    
    // 设置canvas样式
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '400vh';
    canvas.style.zIndex = '-1';
    
    const images = [];
    const imageUrls = ['public/01.jpeg', 'public/02.jpeg', 'public/03.jpeg', 'public/04.jpeg'];
    let loadedCount = 0;
    
    // 加载所有图片
    imageUrls.forEach((url, index) => {
        const img = new Image();
        img.onload = function() {
            images[index] = img;
            loadedCount++;
            
            // 当所有图片都加载完成后，开始合并
            if (loadedCount === imageUrls.length) {
                drawMergedBackground(ctx, images);
            }
        };
        img.onerror = function() {
            console.log('Failed to load image:', url);
            loadedCount++;
            if (loadedCount === imageUrls.length) {
                drawMergedBackground(ctx, images);
            }
        };
        img.src = url;
    });
}

// 绘制合并后的背景
function drawMergedBackground(ctx, images) {
    const canvasWidth = 1920;
    const canvasHeight = 7680; // 4倍高度
    const imageHeight = canvasHeight / 4; // 每张图片的高度
    
    // 清除canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制每张图片
    images.forEach((img, index) => {
        if (img) {
            const y = index * imageHeight;
            ctx.drawImage(img, 0, y, canvasWidth, imageHeight);
        }
    });
    
    // 隐藏原来的背景strip
    const backgroundStrip = document.getElementById('backgroundStrip');
    if (backgroundStrip) {
        backgroundStrip.style.display = 'none';
    }
}

// Start the game when page loads
window.addEventListener('load', function() {
    init();
    mergeBackgroundImages();
}); 
