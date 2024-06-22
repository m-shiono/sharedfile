let initialBoard = [];
let currentBoard = [];
let gridSize = 9;
let selectedCell = null;

function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.textContent = currentBoard[row][col] !== 0 ? currentBoard[row][col] : '';
            // 初期値が設定されているセルを編集不可にする
            if (initialBoard[row][col] !== 0) {
                cell.classList.add('locked');
            }
            cell.addEventListener('click', () => selectNumber(cell));
            board.appendChild(cell);
        }
    }
}

function selectNumber(cell) {
    if (!cell.classList.contains('locked')) {
        selectedCell = cell;
        const numberPad = document.getElementById('number-pad');
        numberPad.style.display = 'grid';
        numberPad.style.top = `${cell.getBoundingClientRect().top + window.scrollY + cell.offsetHeight}px`;
        numberPad.style.left = `${cell.getBoundingClientRect().left + window.scrollX}px`;
    }
}

function chooseNumber(num) {
    if (selectedCell) {
        selectedCell.textContent = num;
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        currentBoard[row][col] = parseInt(num);
        selectedCell = null;
        document.getElementById('number-pad').style.display = 'none';
    }
}

function checkSolution() {
    for (let i = 0; i < gridSize; i++) {
        if (!checkRow(i) || !checkColumn(i) || !checkBox(i)) {
            return false;
        }
    }
    return true;
}

function checkRow(row) {
    const nums = new Set();
    for (let i = 0; i < gridSize; i++) {
        if (currentBoard[row][i] !== 0) {
            if (nums.has(currentBoard[row][i])) return false;
            nums.add(currentBoard[row][i]);
        }
    }
    return true;
}

function checkColumn(col) {
    const nums = new Set();
    for (let i = 0; i < gridSize; i++) {
        if (currentBoard[i][col] !== 0) {
            if (nums.has(currentBoard[i][col])) return false;
            nums.add(currentBoard[i][col]);
        }
    }
    return true;
}

function checkBox(index) {
    const nums = new Set();
    const boxSize = Math.sqrt(gridSize);
    const rowStart = Math.floor(index / boxSize) * boxSize;
    const colStart = (index % boxSize) * boxSize;
    for (let i = 0; i < boxSize; i++) {
        for (let j = 0; j < boxSize; j++) {
            const num = currentBoard[rowStart + i][colStart + j];
            if (num !== 0) {
                if (nums.has(num)) return false;
                nums.add(num);
            }
        }
    }
    return true;
}

function generateSudoku() {
    const board = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    solveSudoku(board);
    const numToRemove = Math.floor(Math.random() * (gridSize * gridSize / 2)) + (gridSize * gridSize / 4);
    for (let i = 0; i < numToRemove; i++) {
        let row, col;
        do {
            row = Math.floor(Math.random() * gridSize);
            col = Math.floor(Math.random() * gridSize);
        } while (board[row][col] === 0);
        board[row][col] = 0;
    }
    return board;
}

function isSafe(grid, row, col, num) {
    for (let x = 0; x < gridSize; x++) {
        if (grid[row][x] === num || grid[x][col] === num) {
            return false;
        }
    }
    const boxSize = Math.sqrt(gridSize);
    const boxRowStart = row - row % boxSize;
    const boxColStart = col - col % boxSize;
    for (let i = 0; i < boxSize; i++) {
        for (let j = 0; j < boxSize; j++) {
            if (grid[i + boxRowStart][j + boxColStart] === num) {
                return false;
            }
        }
    }
    return true;
}

function solveSudoku(grid, row = 0, col = 0) {
    if (col === gridSize) {
        col = 0;
        row++;
    }
    if (row === gridSize) {
        return true;
    }
    if (grid[row][col] > 0) {
        return solveSudoku(grid, row, col + 1);
    }
    for (let num = 1; num <= gridSize; num++) {
        if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid, row, col + 1)) {
                return true;
            }
            grid[row][col] = 0;
        }
    }
    return false;
}

function newGame() {
    const difficulty = document.getElementById('difficulty').value;
    gridSize = parseInt(difficulty);
    initialBoard = generateSudoku(gridSize); // 確実にgridSizeを渡す
    currentBoard = JSON.parse(JSON.stringify(initialBoard));
    createBoard();
    setupNumberPad(); // 数字パッドの設定を別関数に分ける
}

function setupNumberPad() {
    const numberPad = document.getElementById('number-pad');
    numberPad.innerHTML = ''; // 既存のボタンをクリア
    for (let i = 1; i <= gridSize; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'number-button';
        button.addEventListener('click', () => chooseNumber(i));
        numberPad.appendChild(button);
    }
    // クリアボタンの追加
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clr';
    clearButton.className = 'number-button';
    clearButton.addEventListener('click', () => {
        if (selectedCell) {
            selectedCell.textContent = '';
            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);
            currentBoard[row][col] = 0;
            selectedCell = null;
            numberPad.style.display = 'none';
        }
    });
    numberPad.appendChild(clearButton);

    // キャンセルボタンの追加
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'C';
    cancelButton.className = 'number-button';
    cancelButton.addEventListener('click', () => {
        selectedCell = null;
        numberPad.style.display = 'none';
    });
    numberPad.appendChild(cancelButton);
}

function solveCurrentBoard() {
    if (solveSudoku(currentBoard)) {
        updateBoard();
        alert('数独が解けました！');
    } else {
        alert('解答を見つけることができませんでした。');
    }
}

function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.textContent = currentBoard[row][col] !== 0 ? currentBoard[row][col] : '';
    });
}

document.getElementById('check').addEventListener('click', () => {
    if (checkSolution()) {
        alert('正解です！おめでとうございます！');
    } else {
        alert('まだ正解ではありません。もう少し頑張りましょう！');
    }
});

document.getElementById('solve').addEventListener('click', solveCurrentBoard);

document.getElementById('new').addEventListener('click', newGame);

document.getElementById('difficulty').addEventListener('change', newGame);

window.onload = () => {
    newGame();
    document.getElementById('number-pad').style.display = 'none';
};
