const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const pvpBtn = document.getElementById('pvp');
const aiBtn = document.getElementById('ai');
const aiLevelSelect = document.getElementById('aiLevel');
const firstPlayerSelect = document.getElementById('firstPlayer');

let moveSound, winSound;
let audioUnlocked = false;

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let mode = 'pvp'; // 'pvp' or 'ai'
let aiLevel = 'easy'; // easy, medium, hard
let firstPlayer = 'player'; // player or ai

function renderBoard() {
    boardEl.innerHTML = '';
    board.forEach((cell, idx) => {
        const cellEl = document.createElement('div');
        cellEl.className = 'cell' + (cell ? ' ' + cell.toLowerCase() : '');
        cellEl.textContent = cell ? cell : '';
        cellEl.addEventListener('click', () => {
            unlockAudio();
            handleCellClick(idx);
        });
        boardEl.appendChild(cellEl);
    });
}

function handleCellClick(idx) {
    if (!gameActive || board[idx]) return;
    board[idx] = currentPlayer;
    playMoveSound();
    renderBoard();
    const winner = checkWinner();
    if (winner) {
        statusEl.textContent = winner === 'draw' ? '平局！' : `${winner} 获胜！`;
        playWinSound();
        gameActive = false;
        return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusEl.textContent = `当前回合：${currentPlayer}`;
    if (mode === 'ai' && currentPlayer === 'O' && gameActive) {
        setTimeout(() => aiMove(aiLevel), 500);
    }
}

function checkWinner() {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6] // diags
    ];
    for (let line of lines) {
        const [a,b,c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (board.every(cell => cell)) return 'draw';
    return null;
}

function resetGame() {
    board = Array(9).fill(null);
        if (mode === 'ai') {
            currentPlayer = firstPlayer === 'player' ? 'X' : 'O';
        } else {
            currentPlayer = 'X';
        }
    gameActive = true;
    statusEl.textContent = `当前回合：${currentPlayer}`;
    renderBoard();
        // 如果AI先手，自动落子
        if (mode === 'ai' && firstPlayer === 'ai' && gameActive && currentPlayer === 'O') {
            setTimeout(() => aiMove(aiLevel), 500);
        }
}

function aiMove(level) {
    let move;
    if (level === 'easy') {
        move = findWinningMove('O') || findWinningMove('X') || randomMove();
    } else if (level === 'medium') {
        move = findWinningMove('O') || blockFork('X') || findWinningMove('X') || randomMove();
    } else if (level === 'hard') {
        move = minimaxMove();
    }
    if (move !== null) {
        board[move] = 'O';
        playMoveSound();
        renderBoard();
        const winner = checkWinner();
        if (winner) {
            statusEl.textContent = winner === 'draw' ? '平局！' : `${winner} 获胜！`;
            playWinSound();
            gameActive = false;
            return;
        }
        currentPlayer = 'X';
        statusEl.textContent = `当前回合：${currentPlayer}`;
    }
}

function blockFork(player) {
    // 简单防止对方形成双赢点
    // 只实现部分常见情况
    const forks = [
        [0,2,4],[2,8,4],[6,8,4],[0,6,4]
    ];
    for (let fork of forks) {
        const [a,b,c] = fork;
        if (board[a] === player && board[b] === player && board[c] === null) {
            return c;
        }
    }
    return null;
}

function minimaxMove() {
    // 完整极大极小算法
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
        if (!board[i]) {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(bd, depth, isMax) {
    const winner = checkWinnerForMinimax(bd);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'draw') return 0;
    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!bd[i]) {
                bd[i] = 'O';
                best = Math.max(best, minimax(bd, depth + 1, false));
                bd[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!bd[i]) {
                bd[i] = 'X';
                best = Math.min(best, minimax(bd, depth + 1, true));
                bd[i] = null;
            }
        }
        return best;
    }
}

function checkWinnerForMinimax(bd) {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let line of lines) {
        const [a,b,c] = line;
        if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
            return bd[a];
        }
    }
    if (bd.every(cell => cell)) return 'draw';
    return null;
}

function findWinningMove(player) {
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let line of lines) {
        const [a,b,c] = line;
        const cells = [board[a], board[b], board[c]];
        if (cells.filter(cell => cell === player).length === 2 && cells.includes(null)) {
            return line[cells.indexOf(null)];
        }
    }
    return null;
}

function randomMove() {
    const empty = board.map((cell, idx) => cell ? null : idx).filter(idx => idx !== null);
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
}


function playMoveSound() {
    if (audioUnlocked && moveSound) {
        moveSound.currentTime = 0;
        moveSound.play();
    }
}
function playWinSound() {
    if (audioUnlocked && winSound) {
        winSound.currentTime = 0;
        winSound.play();
    }
}

function unlockAudio() {
    if (!audioUnlocked) {
        moveSound = document.getElementById('moveSound');
        winSound = document.getElementById('winSound');
        // 通过一次静音播放解锁音频
        try {
            moveSound.volume = 0;
            winSound.volume = 0;
            moveSound.play().catch(()=>{});
            winSound.play().catch(()=>{});
            setTimeout(() => {
                moveSound.pause();
                winSound.pause();
                moveSound.currentTime = 0;
                winSound.currentTime = 0;
                moveSound.volume = 1;
                winSound.volume = 1;
                audioUnlocked = true;
            }, 100);
        } catch(e) {
            audioUnlocked = true;
        }
    }
}

resetBtn.addEventListener('click', resetGame);
pvpBtn.addEventListener('click', () => {
    mode = 'pvp';
    pvpBtn.classList.add('active');
    aiBtn.classList.remove('active');
    aiLevelSelect.style.display = 'none';
        firstPlayerSelect.style.display = 'none';
    resetGame();
});
aiBtn.addEventListener('click', () => {
    mode = 'ai';
    aiBtn.classList.add('active');
    pvpBtn.classList.remove('active');
    aiLevelSelect.style.display = '';
        firstPlayerSelect.style.display = '';
    resetGame();
});
aiLevelSelect.addEventListener('change', (e) => {
    aiLevel = e.target.value;
    if (mode === 'ai') resetGame();
});
    firstPlayerSelect.addEventListener('change', (e) => {
        firstPlayer = e.target.value;
        if (mode === 'ai') resetGame();
    });

// 默认玩家对战
pvpBtn.classList.add('active');
aiLevelSelect.style.display = 'none';
    firstPlayerSelect.style.display = 'none';
resetGame();
