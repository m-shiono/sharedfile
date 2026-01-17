// ゲームの状態を管理するための変数
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 8;
let moveCount = 0;
let gameStarted = false;
let gameTimer = 0;
let timerInterval = null;
let isProcessing = false;

// 絵文字の配列（カードの模様として使用）
const emojis = [
    '🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🍉',
    '🍍', '🥭', '🍌', '🥝', '🍈', '🍐', '🥥', '🥑',
    '🌮', '🍕', '🍔', '🍟', '🥪', '🍦', '🍩', '🍰'
];

// ページが読み込まれたときに実行
document.addEventListener('DOMContentLoaded', () => {
    // ゲームボードの初期化
    initializeGame();
    
    // リスタートボタンのイベントリスナー
    document.getElementById('restart').addEventListener('click', restartGame);
    
    // 難易度変更時のイベントリスナー
    document.getElementById('difficulty').addEventListener('change', (e) => {
        restartGame();
    });
});

// ゲームの初期化
function initializeGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    // 選択された難易度に基づいてグリッドとカードの数を設定
    const difficulty = document.getElementById('difficulty').value;
    let rows, cols;
    
    switch(difficulty) {
        case 'easy':
            rows = 3;
            cols = 4;
            totalPairs = 6;
            break;
        case 'hard':
            rows = 4;
            cols = 6;
            totalPairs = 12;
            break;
        case 'medium':
        default:
            rows = 4;
            cols = 4;
            totalPairs = 8;
            break;
    }
    
    // グリッドのスタイルを設定
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    // 使用する絵文字を選択
    const selectedEmojis = [];
    const shuffledEmojis = [...emojis].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < totalPairs; i++) {
        selectedEmojis.push(shuffledEmojis[i]);
        selectedEmojis.push(shuffledEmojis[i]);
    }
    
    // 絵文字をシャッフル
    cards = selectedEmojis.sort(() => 0.5 - Math.random());
    
    // カードをゲームボードに追加
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        
        // カードの表面（裏向き状態）
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = '?';
        
        // カードの裏面（表向き状態）- 絵文字が表示される
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = emoji;
        
        // カードにクリックイベントを追加
        card.addEventListener('click', () => flipCard(card, index));
        
        // カードにパーツを追加
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        // ゲームボードにカードを追加
        gameBoard.appendChild(card);
    });
    
    // ゲーム情報をリセット
    resetGameInfo();
}

// カードを裏返す処理
function flipCard(card, index) {
    // 処理中、すでに裏返したカード、マッチ済みカードはクリックできないようにする
    if (isProcessing || flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }
    
    // ゲームが開始されていない場合はタイマーを開始
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // カードを裏返すアニメーション
    card.classList.add('flipped');
    flippedCards.push({ card, index });
    
    // 2枚のカードが裏返されたらマッチングをチェック
    if (flippedCards.length === 2) {
        moveCount++;
        document.getElementById('moves').textContent = `手数: ${moveCount}`;
        
        isProcessing = true;
        
        // カードが一致するかチェック
        if (cards[flippedCards[0].index] === cards[flippedCards[1].index]) {
            // マッチした場合
            setTimeout(() => {
                flippedCards.forEach(flipped => {
                    flipped.card.classList.add('matched');
                });
                
                matchedPairs++;
                document.getElementById('pairs').textContent = `見つけたペア: ${matchedPairs}/${totalPairs}`;
                
                // すべてのペアが見つかったら勝利
                if (matchedPairs === totalPairs) {
                    endGame();
                }
                
                flippedCards = [];
                isProcessing = false;
            }, 500);
        } else {
            // マッチしなかった場合
            setTimeout(() => {
                flippedCards.forEach(flipped => {
                    flipped.card.classList.remove('flipped');
                });
                flippedCards = [];
                isProcessing = false;
            }, 1000);
        }
    }
}

// タイマーを開始
function startTimer() {
    timerInterval = setInterval(() => {
        gameTimer++;
        document.getElementById('time').textContent = `経過時間: ${gameTimer}秒`;
    }, 1000);
}

// ゲーム情報をリセット
function resetGameInfo() {
    moveCount = 0;
    matchedPairs = 0;
    gameTimer = 0;
    gameStarted = false;
    flippedCards = [];
    
    // タイマーを停止
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 表示を更新
    document.getElementById('moves').textContent = `手数: ${moveCount}`;
    document.getElementById('time').textContent = `経過時間: ${gameTimer}秒`;
    document.getElementById('pairs').textContent = `見つけたペア: ${matchedPairs}/${totalPairs}`;
}

// ゲームをリスタート
function restartGame() {
    resetGameInfo();
    initializeGame();
}

// ゲーム終了時の処理
function endGame() {
    clearInterval(timerInterval);
    
    // 勝利メッセージを表示
    setTimeout(() => {
        // 勝利メッセージのHTML
        const overlay = document.createElement('div');
        overlay.className = 'winner-message show';

        const content = document.createElement('div');
        content.className = 'winner-content';

        const title = document.createElement('h2');
        title.textContent = '🎉 クリアおめでとう！ 🎉';

        const message = document.createElement('p');
        message.textContent = 'すべてのペアを見つけました！';

        const moves = document.createElement('p');
        moves.textContent = `手数: ${moveCount}`;

        const time = document.createElement('p');
        time.textContent = `タイム: ${gameTimer}秒`;

        const replayBtn = document.createElement('button');
        replayBtn.id = 'play-again';
        replayBtn.textContent = 'もう一度プレイする';

        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(moves);
        content.appendChild(time);
        content.appendChild(replayBtn);
        overlay.appendChild(content);
        
        // 勝利メッセージを追加
        document.body.appendChild(overlay);
        
        // もう一度プレイするボタンにイベントリスナーを追加
        document.getElementById('play-again').addEventListener('click', () => {
            document.querySelector('.winner-message').remove();
            restartGame();
        });
    }, 500);
}