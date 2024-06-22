const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const grid = 20;
const tetrominoSequence = [];

// テトロミノの形
const tetrominos = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O': [
        [1,1],
        [1,1],
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
};

// ゲームの状態
let board = Array(20).fill().map(() => Array(10).fill(0));
let piece = getRandomPiece();
let dropCounter = 0;
let dropInterval = 1000; // 1秒ごとに落下
let lastTime = 0;
let gameRunning = false;
let isGameOver = false;
let score = 0; // 得点を管理する変数を追加

// 得点を加算する関数
function addScore(points) {
    score += points; // points分得点を加算
    updateScoreDisplay(); // 得点表示を更新
}

// 得点表示を更新する関数
function updateScoreDisplay() {
    document.getElementById('score').textContent = '得点: ' + score;
}

// ラインが消去された時に得点を加算するイベントリスナー
function lineClear(points) {
    addScore(points); // ライン消去に応じた得点を加算
}

// ゲームの初期化時や適切な場所でイベントリスナーを設定
function setupGame() {
    // 他の初期化コード...
    document.addEventListener('lineClearEvent', function(event) {
        lineClear(event.detail.points);
    });
}

// ランダムなテトロミノを取得
function getRandomPiece() {
    if (tetrominoSequence.length === 0) {
        tetrominoSequence.push(...'IJLOSTZ');
    }
    const name = tetrominoSequence.splice(Math.floor(Math.random() * tetrominoSequence.length), 1)[0];
    return { name: name, shape: tetrominos[name], x: 3, y: 0 };
}

// テトロミノを描画
function drawPiece() {
    ctx.fillStyle = 'red';
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillRect((piece.x + x) * grid, (piece.y + y) * grid, grid-1, grid-1);
            }
        });
    });
}

// ボードを描画
function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * grid, y * grid, grid-1, grid-1);
            }
        });
    });
}

// ゲームオーバー表示
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2);
}

// 衝突チェック
function collision(x, y, shape) {
    return shape.some((row, dy) => {
        return row.some((value, dx) => {
            let newX = x + dx;
            let newY = y + dy;
            return (
                value !== 0 &&
                (newX < 0 || newX >= 10 || newY >= 20 || (board[newY] && board[newY][newX]))
            );
        });
    });
}

// 行が完全に埋まっているかチェックし、得点を更新する関数
function checkCompleteRows() {
    let linesCleared = 0;
    board.forEach((row, y) => {
        if (row.every(value => value !== 0)) {
            linesCleared++;
            board.splice(y, 1); // 完全に埋まった行を削除
            board.unshift(Array(10).fill(0)); // 新しい空の行を追加
        }
    });

    // 得点計算
    switch (linesCleared) {
        case 1:
            addScore(100); // シングル
            break;
        case 2:
            addScore(300); // ダブル
            break;
        case 3:
            addScore(500); // トリプル
            break;
        case 4:
            addScore(800); // テトリス
            break;
    }
}

// テトロミノを固定
function solidifyPiece() {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[y + piece.y][x + piece.x] = 1;
            }
        });
    });
}

// 行が揃ったら消す
function removeFullRows() {
    board = board.filter(row => row.some(cell => !cell));
    while (board.length < 20) {
        board.unshift(Array(10).fill(0));
    }
}

// ハードドロップ
function hardDrop() {
    while (!collision(piece.x, piece.y + 1, piece.shape)) {
        piece.y++;
    }
    solidifyPiece();
    removeFullRows();
    piece = getRandomPiece();
    if (collision(piece.x, piece.y, piece.shape)) {
        gameOver();
    }
}

// ゲームオーバー
function gameOver() {
    gameRunning = false;
    isGameOver = true;
    drawGameOver();
}

// ゲーム開始
function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    isGameOver = false;
    board = Array(20).fill().map(() => Array(10).fill(0));
    piece = getRandomPiece();
    requestAnimationFrame(gameLoop);
}

// ゲーム停止
function stopGame() {
    gameRunning = false;
}

// 操作
document.getElementById('left').onclick = () => {
    if (!gameRunning) return;
    piece.x--;
    if (collision(piece.x, piece.y, piece.shape)) piece.x++;
};
document.getElementById('right').onclick = () => {
    if (!gameRunning) return;
    piece.x++;
    if (collision(piece.x, piece.y, piece.shape)) piece.x--;
};
document.getElementById('down').onclick = () => {
    if (!gameRunning) return;
    hardDrop();
};
document.getElementById('rotate').onclick = () => {
    if (!gameRunning) return;
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    if (!collision(piece.x, piece.y, rotated)) {
        piece.shape = rotated;
    }
};
document.getElementById('start').onclick = startGame;
document.getElementById('stop').onclick = stopGame;

// ゲームループ
function gameLoop(time = 0) {
    if (!gameRunning) return;

    dropCounter += time - lastTime;
    lastTime = time;

    if (dropCounter > dropInterval) {
        piece.y++;
        if (collision(piece.x, piece.y, piece.shape)) {
            piece.y--;
            solidifyPiece();
            removeFullRows();
            piece = getRandomPiece();
            if (collision(piece.x, piece.y, piece.shape)) {
                gameOver();
                return;
            }
        }
        dropCounter = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece();
    checkCompleteRows(); // 行が完全に埋まっているかチェック
    if (isGameOver) {
        drawGameOver();
    } else {
        requestAnimationFrame(gameLoop);
    }
}

// 初期描画
drawBoard();