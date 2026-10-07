class MarkdownTableTool {
    static MAX_ROWS = 20;
    static MAX_COLS = 10;
    static DEFAULT_SEPARATOR = '------';

    constructor() {
        this.grid = document.getElementById('data-grid');
        this.gridContainer = document.querySelector('.grid-container');
        this.rowsInput = document.getElementById('rows');
        this.colsInput = document.getElementById('cols');
        this.fullHeightToggle = document.getElementById('full-height-toggle');
        this.importDataElement = document.getElementById('import-data');
        this.convertOutput = document.getElementById('convert-output');
        this.markdownOutput = document.getElementById('markdown-output');
        this.backlogOutput = document.getElementById('backlog-output');
        this.csvOutput = document.getElementById('csv-output');
        this.messageContainer = document.getElementById('message-container');
        this.formatNames = { markdown: 'Markdown', backlog: 'Backlog', csv: 'CSV', tsv: 'TSV' };

        this.currentRows = 5;
        this.currentCols = 3;

        this.initializeEventListeners();
        this.createGrid();
        this.applyHalfHeight();
    }

    initializeEventListeners() {
        // グリッドサイズ変更
        document.getElementById('resize-btn').addEventListener('click', () => this.resizeGrid());

        // グリッド操作
        document.getElementById('clear-grid-btn').addEventListener('click', () => this.clearGrid());
        document.getElementById('add-row-btn').addEventListener('click', () => this.addRow());
        document.getElementById('add-col-btn').addEventListener('click', () => this.addColumn());
        document.getElementById('remove-row-btn').addEventListener('click', () => this.removeRow());
        document.getElementById('remove-col-btn').addEventListener('click', () => this.removeColumn());

        // 変換 / インポート
        document.getElementById('convert-btn').addEventListener('click', () => this.convertTableData());
        document.getElementById('import-btn').addEventListener('click', () => this.importTableData());
        document.getElementById('clear-import-btn').addEventListener('click', () => this.clearImport());
        document.getElementById('copy-convert-btn').addEventListener('click', () => this.copyConvertResult());

        // 出力生成
        document.getElementById('generate-all-btn').addEventListener('click', () => this.generateAll());

        // コピー機能
        document.getElementById('copy-markdown-btn').addEventListener('click', () => this.copyToClipboard('markdown'));
        document.getElementById('copy-backlog-btn').addEventListener('click', () => this.copyToClipboard('backlog'));
        document.getElementById('copy-csv-btn').addEventListener('click', () => this.copyToClipboard('csv'));

        // ダウンロード機能
        document.getElementById('download-markdown-btn').addEventListener('click', () => this.downloadFile('markdown'));
        document.getElementById('download-backlog-btn').addEventListener('click', () => this.downloadFile('backlog'));
        document.getElementById('download-csv-btn').addEventListener('click', () => this.downloadFile('csv'));

        // キーボードナビゲーション
        this.grid.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.grid.addEventListener('focusin', (e) => this.handleFocusIn(e));
        this.grid.addEventListener('focusout', (e) => this.handleFocusOut(e));

        // 入力時に高さ再計算
        this.grid.addEventListener('input', () => this.applyHalfHeight());

        // ウィンドウリサイズ時に高さ再計算
        window.addEventListener('resize', () => this.applyHalfHeight());

        // 全体表示トグル変更で高さ再計算
        if (this.fullHeightToggle) {
            this.fullHeightToggle.addEventListener('change', () => this.applyHalfHeight());
        }
    }

    createGrid() {
        this.grid.innerHTML = '';

        // ヘッダー行を作成
        const headerRow = document.createElement('tr');

        // 角のセル
        const cornerCell = document.createElement('th');
        cornerCell.className = 'corner-cell';
        headerRow.appendChild(cornerCell);

        // 列ヘッダー
        for (let col = 0; col < this.currentCols; col++) {
            const th = document.createElement('th');
            th.className = 'col-header';
            th.textContent = this.getColumnLetter(col);
            headerRow.appendChild(th);
        }
        this.grid.appendChild(headerRow);

        // データ行を作成
        for (let row = 0; row < this.currentRows; row++) {
            const tr = document.createElement('tr');

            // 行ヘッダー
            const rowHeader = document.createElement('th');
            rowHeader.className = 'row-header';
            rowHeader.textContent = row + 1;
            tr.appendChild(rowHeader);

            // データセル
            for (let col = 0; col < this.currentCols; col++) {
                const td = document.createElement('td');
                const textarea = document.createElement('textarea');
                textarea.dataset.row = row;
                textarea.dataset.col = col;
                textarea.rows = 1;
                td.appendChild(textarea);
                tr.appendChild(td);
            }
            this.grid.appendChild(tr);
        }
    }

    getColumnLetter(index) {
        let result = '';
        let num = index + 1;
        while (num > 0) {
            let rem = (num - 1) % 26;
            result = String.fromCharCode(65 + rem) + result;
            num = Math.floor((num - 1) / 26);
        }
        return result;
    }

    resizeGrid() {
        const newRows = parseInt(this.rowsInput.value);
        const newCols = parseInt(this.colsInput.value);

        if (newRows < 1 || newRows > MarkdownTableTool.MAX_ROWS || newCols < 1 || newCols > MarkdownTableTool.MAX_COLS) {
            this.showMessage(`行数は1-${MarkdownTableTool.MAX_ROWS}、列数は1-${MarkdownTableTool.MAX_COLS}の範囲で設定してください。`, 'error');
            return;
        }

        // 現在のデータを保存
        const currentData = this.getGridData();

        this.currentRows = newRows;
        this.currentCols = newCols;
        this.createGrid();

        // データを復元
        this.setGridData(currentData);
        this.showMessage('表サイズを変更しました。', 'success');
        this.applyHalfHeight();
    }

    getGridData() {
        const data = [];
        const textareas = this.grid.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const row = parseInt(textarea.dataset.row);
            const col = parseInt(textarea.dataset.col);
            if (!data[row]) data[row] = [];
            data[row][col] = textarea.value;
        });
        return data;
    }

    setGridData(data) {
        const textareas = this.grid.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const row = parseInt(textarea.dataset.row);
            const col = parseInt(textarea.dataset.col);
            if (data[row] && data[row][col] !== undefined) {
                textarea.value = data[row][col];
            }
        });
    }

    clearGrid() {
        const textareas = this.grid.querySelectorAll('textarea');
        textareas.forEach(textarea => textarea.value = '');
        this.showMessage('グリッドをクリアしました。', 'success');
    }

    addRow() {
        if (this.currentRows >= MarkdownTableTool.MAX_ROWS) {
            this.showMessage(`最大行数は${MarkdownTableTool.MAX_ROWS}です。`, 'error');
            return;
        }
        this.currentRows++;
        this.rowsInput.value = this.currentRows;
        this.resizeGrid();
    }

    addColumn() {
        if (this.currentCols >= MarkdownTableTool.MAX_COLS) {
            this.showMessage(`最大列数は${MarkdownTableTool.MAX_COLS}です。`, 'error');
            return;
        }
        this.currentCols++;
        this.colsInput.value = this.currentCols;
        this.resizeGrid();
    }

    removeRow() {
        if (this.currentRows <= 1) {
            this.showMessage('最少行数は1です。', 'error');
            return;
        }
        this.currentRows--;
        this.rowsInput.value = this.currentRows;
        this.resizeGrid();
    }

    removeColumn() {
        if (this.currentCols <= 1) {
            this.showMessage('最少列数は1です。', 'error');
            return;
        }
        this.currentCols--;
        this.colsInput.value = this.currentCols;
        this.resizeGrid();
    }

    getSelectedFormat(name) {
        const el = document.querySelector(`input[name="${name}"]:checked`);
        return el ? el.value : null;
    }

    parseByFormat(text, format) {
        switch (format) {
            case 'markdown': return this.parseMarkdownTable(text);
            case 'backlog': return this.parseBacklogTable(text);
            case 'csv': return this.parseDelimited(text, ',');
            case 'tsv': return this.parseDelimited(text, '\t');
            default: throw new Error('不明な形式です: ' + format);
        }
    }

    formatByFormat(data, format) {
        const lineBreakOption = document.querySelector('input[name="line-break"]:checked').value;
        switch (format) {
            case 'markdown': return this.buildMarkdown(data, lineBreakOption);
            case 'backlog': return this.buildBacklog(data, lineBreakOption);
            case 'csv': return this.buildDelimited(data, ',', lineBreakOption);
            case 'tsv': return this.buildDelimited(data, '\t', lineBreakOption);
            default: throw new Error('不明な形式です: ' + format);
        }
    }

    convertTableData() {
        const text = this.importDataElement.value.trim();
        if (!text) {
            this.showMessage('変換するデータがありません。', 'error');
            return;
        }

        const fromFormat = this.getSelectedFormat('from-format');
        const toFormat = this.getSelectedFormat('to-format');

        try {
            const parsedData = this.parseByFormat(text, fromFormat);
            if (!parsedData.length) {
                throw new Error('表データとして解析できませんでした。');
            }
            this.convertOutput.value = this.formatByFormat(parsedData, toFormat);
            this.showMessage(`${this.formatNames[fromFormat]} → ${this.formatNames[toFormat]} に変換しました。`, 'success');
        } catch (error) {
            this.showMessage('変換に失敗しました: ' + error.message, 'error');
        }
    }

    importTableData() {
        const text = this.importDataElement.value.trim();
        if (!text) {
            this.showMessage('インポートするデータがありません。', 'error');
            return;
        }

        const fromFormat = this.getSelectedFormat('from-format');

        try {
            const parsedData = this.parseByFormat(text, fromFormat);
            if (!parsedData.length) {
                throw new Error('表データとして解析できませんでした。');
            }

            const rows = parsedData.length;
            const cols = Math.max(...parsedData.map(row => row.length));
            if (rows > MarkdownTableTool.MAX_ROWS || cols > MarkdownTableTool.MAX_COLS) {
                throw new Error(`グリッド上限は行${MarkdownTableTool.MAX_ROWS}・列${MarkdownTableTool.MAX_COLS}です。`);
            }

            this.currentRows = rows;
            this.currentCols = cols;
            this.rowsInput.value = this.currentRows;
            this.colsInput.value = this.currentCols;

            this.createGrid();
            this.setGridData(parsedData);
            this.applyHalfHeight();
            this.showMessage(`${this.formatNames[fromFormat]}をグリッドに反映しました。`, 'success');
        } catch (error) {
            this.showMessage('データの解析に失敗しました: ' + error.message, 'error');
        }
    }

    decodeCellValue(cellValue) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = DOMPurify.sanitize(cellValue);
        return tempDiv.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    }

    parseMarkdownTable(data) {
        const lines = data.split('\n').filter(line => line.trim());
        const result = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line) || line.includes('---')) {
                continue;
            }

            if (line.includes('|')) {
                let body = line;
                if (body.startsWith('|')) body = body.slice(1);
                if (body.endsWith('|')) body = body.slice(0, -1);
                const cells = body.split('|').map(cell => this.decodeCellValue(cell.trim()));
                if (cells.some(c => c !== '')) result.push(cells);
            }
        }

        if (!result.length) throw new Error('Markdown表を検出できませんでした。');
        return result;
    }

    parseBacklogTable(data) {
        const lines = data.split('\n').filter(line => line.trim());
        const result = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line.includes('|')) continue;

            let body = line.replace(/\|h\s*$/, '');
            if (body.startsWith('|')) body = body.slice(1);
            if (body.endsWith('|')) body = body.slice(0, -1);
            const cells = body.split('|').map(cell => this.decodeCellValue(cell.trim()));
            if (cells.some(c => c !== '')) result.push(cells);
        }

        if (!result.length) throw new Error('Backlog表を検出できませんでした。');
        return result;
    }

    parseDelimited(data, delimiter) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let currentRow = [];

        for (let i = 0; i < data.length; i++) {
            const char = data[i];

            if (inQuotes) {
                if (char === '"') {
                    if (i + 1 < data.length && data[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    let prevNonWs = -1;
                    for (let j = i - 1; j >= 0; j--) {
                        if (data[j] !== ' ' && data[j] !== '\t') {
                            prevNonWs = j;
                            break;
                        }
                    }
                    if (i === 0 || (prevNonWs >= 0 && (data[prevNonWs] === delimiter || data[prevNonWs] === '\n' || data[prevNonWs] === '\r'))) {
                        inQuotes = true;
                    } else {
                        current += char;
                    }
                } else if (char === delimiter && !inQuotes) {
                    currentRow.push(current.trim());
                    current = '';
                } else if ((char === '\n' || char === '\r') && !inQuotes) {
                    if (current.trim() || currentRow.length > 0) {
                        currentRow.push(current.trim());
                        if (currentRow.some(cell => cell !== '')) {
                            result.push(currentRow);
                        }
                        currentRow = [];
                        current = '';
                    }
                    if (char === '\r' && i + 1 < data.length && data[i + 1] === '\n') {
                        i++;
                    }
                } else {
                    current += char;
                }
            }
        }

        if (current.trim() || currentRow.length > 0) {
            currentRow.push(current.trim());
            if (currentRow.some(cell => cell !== '')) {
                result.push(currentRow);
            }
        }

        if (!result.length) throw new Error('区切り形式のデータを検出できませんでした。');
        return result;
    }

    buildMarkdown(data, lineBreakOption) {
        if (!data.length) return '';
        const numCols = Math.max(...data.map(row => row.length));
        let markdown = '';

        for (let row = 0; row < data.length; row++) {
            let line = '|';
            for (let col = 0; col < numCols; col++) {
                let cellValue = data[row][col] || '';
                cellValue = this.processLineBreaks(cellValue, lineBreakOption);
                line += ' ' + cellValue + ' |';
            }
            markdown += line + '\n';

            if (row === 0) {
                let separator = '|';
                for (let col = 0; col < numCols; col++) {
                    separator += ' ------ |';
                }
                markdown += separator + '\n';
            }
        }
        return markdown;
    }

    buildBacklog(data, lineBreakOption) {
        if (!data.length) return '';
        const numCols = Math.max(...data.map(row => row.length));
        let backlog = '';

        for (let row = 0; row < data.length; row++) {
            let line = '|';
            for (let col = 0; col < numCols; col++) {
                let cellValue = data[row][col] || '';
                cellValue = this.processLineBreaks(cellValue, lineBreakOption);
                line += cellValue + '|';
            }
            if (row === 0) line += 'h';
            backlog += line + '\n';
        }
        return backlog;
    }

    buildDelimited(data, delimiter, lineBreakOption) {
        if (!data.length) return '';
        const numCols = Math.max(...data.map(row => row.length));
        let output = '';

        for (let row = 0; row < data.length; row++) {
            const cells = [];
            for (let col = 0; col < numCols; col++) {
                let cellValue = data[row][col] || '';
                cellValue = this.processLineBreaks(cellValue, lineBreakOption);
                if (cellValue.includes(delimiter) || cellValue.includes('\n') || cellValue.includes('"')) {
                    cellValue = '"' + cellValue.replace(/"/g, '""') + '"';
                }
                cells.push(cellValue);
            }
            output += cells.join(delimiter) + '\n';
        }
        return output;
    }

    clearImport() {
        this.importDataElement.value = '';
        this.convertOutput.value = '';
        this.showMessage('変換エリアをクリアしました。', 'success');
    }

    async copyConvertResult() {
        const text = this.convertOutput.value;
        if (!text) {
            this.showMessage('コピーする変換結果がありません。', 'error');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('変換結果をクリップボードにコピーしました。', 'success');
        } catch (error) {
            this.showMessage('コピーに失敗しました。', 'error');
        }
    }

    handleKeyDown(e) {
        const target = e.target;
        if (target.tagName !== 'TEXTAREA') return;

        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);

        switch (e.key) {
            case 'ArrowUp':
                if (row > 0) {
                    this.focusCell(row - 1, col);
                    e.preventDefault();
                }
                break;
            case 'ArrowDown':
                if (row < this.currentRows - 1) {
                    this.focusCell(row + 1, col);
                    e.preventDefault();
                } else if (e.altKey) {
                    this.addRow();
                    setTimeout(() => this.focusCell(row + 1, col), 0);
                }
                break;
            case 'ArrowLeft':
                if (col > 0 && target.selectionStart === 0) {
                    this.focusCell(row, col - 1);
                    e.preventDefault();
                }
                break;
            case 'ArrowRight':
                if (col < this.currentCols - 1 && target.selectionStart === target.value.length) {
                    this.focusCell(row, col + 1);
                    e.preventDefault();
                } else if (col === this.currentCols - 1 && target.selectionStart === target.value.length && e.altKey) {
                    this.addColumn();
                    setTimeout(() => this.focusCell(row, col + 1), 0);
                }
                break;
            case 'Enter':
                if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
                    if (row < this.currentRows - 1) {
                        this.focusCell(row + 1, col);
                    } else {
                        this.addRow();
                        setTimeout(() => this.focusCell(row + 1, col), 0);
                    }
                    e.preventDefault();
                }
                break;
            case 'Tab':
                if (e.shiftKey) {
                    if (col > 0) {
                        this.focusCell(row, col - 1);
                        e.preventDefault();
                    } else if (row > 0) {
                        this.focusCell(row - 1, this.currentCols - 1);
                        e.preventDefault();
                    }
                } else {
                    if (col < this.currentCols - 1) {
                        this.focusCell(row, col + 1);
                        e.preventDefault();
                    } else if (row < this.currentRows - 1) {
                        this.focusCell(row + 1, 0);
                        e.preventDefault();
                    } else {
                        this.addRow();
                        setTimeout(() => this.focusCell(row + 1, 0), 0);
                        e.preventDefault();
                    }
                }
                break;
        }
    }

    focusCell(row, col) {
        const textarea = this.grid.querySelector(`textarea[data-row="${row}"][data-col="${col}"]`);
        if (textarea) {
            textarea.focus();
            // カーソルを末尾に移動
            textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        }
    }

    handleFocusIn(e) {
        if (e.target.tagName === 'TEXTAREA') {
            const col = parseInt(e.target.dataset.col);
            const headers = this.grid.querySelectorAll('.col-header');
            if (headers[col]) headers[col].classList.add('active-header');
        }
    }

    handleFocusOut(e) {
        if (e.target.tagName === 'TEXTAREA') {
            const col = parseInt(e.target.dataset.col);
            const headers = this.grid.querySelectorAll('.col-header');
            if (headers[col]) headers[col].classList.remove('active-header');
        }
    }

    generateAll() {
        this.generateMarkdown();
        this.generateBacklog();
        this.generateCSV();
        this.showMessage('全形式のテーブルを生成しました。', 'success');
    }

    getTrimmedData() {
        const rawData = this.getGridData();
        // 行のトリミング（末尾の空行を削除）
        let lastRow = -1;
        for (let r = 0; r < rawData.length; r++) {
            if (rawData[r] && rawData[r].some(cell => cell && cell.trim())) {
                lastRow = r;
            }
        }

        if (lastRow === -1) return [];

        const trimmedData = rawData.slice(0, lastRow + 1);

        // 列のトリミング（末尾の空列を削除）
        let maxCols = 0;
        trimmedData.forEach(row => {
            for (let c = row.length - 1; c >= 0; c--) {
                if (row[c] && row[c].trim()) {
                    maxCols = Math.max(maxCols, c + 1);
                    break;
                }
            }
        });

        return trimmedData.map(row => row.slice(0, maxCols));
    }

    generateMarkdown() {
        const data = this.getTrimmedData();
        const lineBreakOption = document.querySelector('input[name="line-break"]:checked').value;
        this.markdownOutput.value = this.buildMarkdown(data, lineBreakOption);
    }

    generateBacklog() {
        const data = this.getTrimmedData();
        const lineBreakOption = document.querySelector('input[name="line-break"]:checked').value;
        this.backlogOutput.value = this.buildBacklog(data, lineBreakOption);
    }

    generateCSV() {
        const data = this.getTrimmedData();
        const lineBreakOption = document.querySelector('input[name="line-break"]:checked').value;
        this.csvOutput.value = this.buildDelimited(data, ',', lineBreakOption);
    }

    async copyToClipboard(type) {
        let text = '';
        switch (type) {
            case 'markdown': text = this.markdownOutput.value; break;
            case 'backlog': text = this.backlogOutput.value; break;
            case 'csv': text = this.csvOutput.value; break;
        }

        if (!text) {
            this.showMessage('コピーするデータがありません。まず生成ボタンを押してください。', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('クリップボードにコピーしました。', 'success');
        } catch (error) {
            this.showMessage('コピーに失敗しました。', 'error');
        }
    }

    downloadFile(type) {
        let text = '', filename = '', mimeType = '';
        switch (type) {
            case 'markdown':
                text = this.markdownOutput.value;
                filename = 'table.md';
                mimeType = 'text/markdown';
                break;
            case 'backlog':
                text = this.backlogOutput.value;
                filename = 'table_backlog.txt';
                mimeType = 'text/plain';
                break;
            case 'csv':
                text = this.csvOutput.value;
                filename = 'table.csv';
                mimeType = 'text/csv';
                break;
        }

        if (!text) {
            this.showMessage('保存するデータがありません。', 'error');
            return;
        }

        const blob = new Blob([text], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showMessage(`${filename}を保存しました。`, 'success');
    }

    applyHalfHeight() {
        if (!this.gridContainer) return;
        const isFull = this.fullHeightToggle && this.fullHeightToggle.checked;
        if (isFull) {
            this.gridContainer.style.maxHeight = 'none';
            this.gridContainer.style.overflowY = 'visible';
            return;
        }
        this.gridContainer.style.maxHeight = 'none';
        const contentHeight = this.grid.scrollHeight;
        const sixtyPercent = Math.max(40, Math.floor(contentHeight * 0.6));
        this.gridContainer.style.maxHeight = sixtyPercent + 'px';
        this.gridContainer.style.overflowY = 'auto';
    }

    processLineBreaks(text, option) {
        if (!text) return '';

        switch (option) {
            case 'br':
                return text.replace(/\n/g, '<br />');
            case 'newline':
                return text.replace(/\r\n/g, '\n').replace(/\n/g, '\\n');
            case 'none':
                return text.replace(/\n/g, ' ');
            default:
                return text;
        }
    }

    showMessage(text, type = 'info') {
        // 既存のメッセージを削除
        this.messageContainer.innerHTML = '';

        const message = document.createElement('div');
        message.className = type + '-message';
        message.textContent = text;

        this.messageContainer.appendChild(message);

        // 3秒後にメッセージを削除
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownTableTool();
});