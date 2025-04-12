// Canvas設定
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');

// ゲームの変数
let score = 0;
let highScore = localStorage.getItem('jumpGameHighScore') || 0;
let gameRunning = false;
let animationId = null;
let gameSpeed = 5;
let gravity = 0.5;

// プレイヤー
const player = {
    x: 50,
    y: canvas.height - 60,
    width: 40,
    height: 50,
    velocity: 0,
    jumpPower: -12,
    isJumping: false,
    draw: function() {
        ctx.fillStyle = '#43a047';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 目
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 25, this.y + 10, 8, 8);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 28, this.y + 12, 3, 3);
    },
    update: function() {
        // 重力の適用
        this.velocity += gravity;
        this.y += this.velocity;
        
        // 地面との衝突検出
        if (this.y > canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
            this.isJumping = false;
        }
    },
    jump: function() {
        if (!this.isJumping) {
            this.velocity = this.jumpPower;
            this.isJumping = true;
        }
    }
};

// 障害物
const obstacles = [];
class Obstacle {
    constructor() {
        this.width = 20 + Math.random() * 30;
        this.height = 30 + Math.random() * 70;
        this.x = canvas.width;
        this.y = canvas.height - this.height;
        this.color = '#e53935';
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    update() {
        this.x -= gameSpeed;
    }
}

// 背景雲
const clouds = [];
class Cloud {
    constructor() {
        this.x = canvas.width;
        this.y = Math.random() * 100 + 20;
        this.width = Math.random() * 60 + 40;
        this.height = Math.random() * 30 + 20;
        this.speed = Math.random() * 2 + 1;
    }
    
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
        ctx.arc(this.x + this.width * 0.3, this.y - this.height * 0.2, this.width/2.5, 0, Math.PI * 2);
        ctx.arc(this.x + this.width * 0.4, this.y + this.height * 0.2, this.width/3, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    
    update() {
        this.x -= this.speed;
    }
}

// 地面
function drawGround() {
    ctx.fillStyle = '#795548';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    
    // 草
    ctx.fillStyle = '#81c784';
    ctx.fillRect(0, canvas.height - 12, canvas.width, 2);
}

// 衝突検出
function checkCollision(player, obstacle) {
    return player.x < obstacle.x + obstacle.width &&
           player.x + player.width > obstacle.x &&
           player.y < obstacle.y + obstacle.height &&
           player.y + player.height > obstacle.y;
}

// スコアの表示と更新
function updateScore() {
    score++;
    scoreElement.textContent = `スコア: ${score}`;
    
    // スコアに応じてゲームスピードを上げる
    if (score % 500 === 0) {
        gameSpeed += 0.5;
    }
}

// ゲームオーバー
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    // ハイスコアの更新
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('jumpGameHighScore', highScore);
        highScoreElement.textContent = `ハイスコア: ${highScore}`;
    }
    
    // ゲームオーバーメッセージ
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '24px Arial';
    ctx.fillText(`スコア: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    // スタートボタンの表示
    startButton.textContent = 'もう一度プレイ';
}

// ゲームの初期化
function initGame() {
    score = 0;
    gameSpeed = 5;
    scoreElement.textContent = `スコア: ${score}`;
    highScoreElement.textContent = `ハイスコア: ${highScore}`;
    
    // 障害物と雲のリセット
    obstacles.length = 0;
    clouds.length = 0;
    
    // プレイヤーの位置リセット
    player.y = canvas.height - player.height;
    player.velocity = 0;
    player.isJumping = false;
}

// メインのゲームループ
function gameLoop() {
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景
    ctx.fillStyle = '#b3e5fc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 雲の描画と更新
    clouds.forEach((cloud, index) => {
        cloud.draw();
        cloud.update();
        
        if (cloud.x + cloud.width < 0) {
            clouds.splice(index, 1);
        }
    });
    
    // ランダムに雲を生成
    if (Math.random() < 0.01) {
        clouds.push(new Cloud());
    }
    
    // 地面の描画
    drawGround();
    
    // プレイヤーの描画と更新
    player.draw();
    player.update();
    
    // 障害物の描画と更新
    obstacles.forEach((obstacle, index) => {
        obstacle.draw();
        obstacle.update();
        
        // 画面外に出た障害物を削除
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
        
        // 衝突判定
        if (checkCollision(player, obstacle)) {
            gameOver();
        }
    });
    
    // ランダムに障害物を生成
    if (Math.random() < 0.02) {
        // 障害物間の最小距離を確保
        const lastObstacle = obstacles[obstacles.length - 1];
        if (!lastObstacle || canvas.width - lastObstacle.x > 300) {
            obstacles.push(new Obstacle());
        }
    }
    
    // スコアの更新
    updateScore();
    
    // ゲームが続いている場合は次のフレームを描画
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// ゲームの開始
function startGame() {
    if (!gameRunning) {
        initGame();
        gameRunning = true;
        gameLoop();
        startButton.textContent = 'リスタート';
    } else {
        // 既にゲームが実行中の場合はリセット
        gameRunning = false;
        cancelAnimationFrame(animationId);
        startGame();
    }
}

// イベントリスナー
startButton.addEventListener('click', startGame);
// タッチデバイス用にタッチイベントも追加
startButton.addEventListener('touchstart', function(e) {
    startGame();
    e.preventDefault();
}, { passive: false });

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) {
        player.jump();
        e.preventDefault(); // スクロールを防ぐ
    }
});

// タッチスクリーン対応 - 画面全体とキャンバスの両方にイベントリスナーを追加
function handleTouch(e) {
    if (gameRunning) {
        player.jump();
        e.preventDefault(); // タッチイベントのデフォルト動作を防ぐ
    }
}

// キャンバスへのタッチイベント
canvas.addEventListener('touchstart', handleTouch, { passive: false });

// 画面全体へのタッチイベント
document.addEventListener('touchstart', handleTouch, { passive: false });

// ゲームコンテナへのタッチイベント
document.querySelector('.game-container').addEventListener('touchstart', handleTouch, { passive: false });

// ページロード時にハイスコアを表示
window.onload = () => {
    highScoreElement.textContent = `ハイスコア: ${highScore}`;
};