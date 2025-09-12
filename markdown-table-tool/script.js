class MarkdownTableTool {
    static MAX_ROWS = 20;
    static MAX_COLS = 10;
    static DEFAULT_SEPARATOR = '------';
    
    constructor() {
        this.grid = document.getElementById('data-grid');
        this.gridContainer = document.querySelector('.grid-container');
        this.rowsInput = document.getElementById('rows');
        this.colsInput = document.getElementById('cols');
        this.importDataElement = document.getElementById('import-data');
        this.markdownOutput = document.getElementById('markdown-output');
        this.csvOutput = document.getElementById('csv-output');
        this.messageContainer = document.getElementById('message-container');
        
        this.currentRows = 5;
        this.currentCols = 3;
        
        this.initializeEventListeners();
        this.createGrid();
        // 初期化後に高さを適用
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
        
        // インポート
        document.getElementById('import-btn').addEventListener('click', () => this.importTableData());
        document.getElementById('clear-import-btn').addEventListener('click', () => this.clearImport());
        
        // 出力生成
        document.getElementById('generate-markdown-btn').addEventListener('click', () => this.generateMarkdown());
        document.getElementById('generate-csv-btn').addEventListener('click', () => this.generateCSV());
        
        // コピー機能
        document.getElementById('copy-markdown-btn').addEventListener('click', () => this.copyToClipboard('markdown'));
        document.getElementById('copy-csv-btn').addEventListener('click', () => this.copyToClipboard('csv'));
        
        // ダウンロード機能
        document.getElementById('download-markdown-btn').addEventListener('click', () => this.downloadFile('markdown'));
        document.getElementById('download-csv-btn').addEventListener('click', () => this.downloadFile('csv'));
        
        // Enterキーでセル内改行
        this.grid.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // 入力時に高さ再計算
        this.grid.addEventListener('input', () => this.applyHalfHeight());

        // ウィンドウリサイズ時に高さ再計算
        window.addEventListener('resize', () => this.applyHalfHeight());
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
    
    handleKeyPress(e) {
        // Textareas handle Enter key natively for line breaks
        // This method is kept for potential future enhancements
    }
    
    importTableData() {
        const data = this.importDataElement.value.trim();
        if (!data) {
            this.showMessage('インポートするデータがありません。', 'error');
            return;
        }
        
        try {
            let parsedData;
            if (this.isMarkdownTable(data)) {
                parsedData = this.parseMarkdownTable(data);
                this.showMessage('Markdownテーブルをインポートしました。', 'success');
            } else {
                parsedData = this.parseCSV(data);
                this.showMessage('CSVデータをインポートしました。', 'success');
            }
            
            // グリッドサイズを調整
            this.currentRows = parsedData.length;
            this.currentCols = Math.max(...parsedData.map(row => row.length));
            this.rowsInput.value = this.currentRows;
            this.colsInput.value = this.currentCols;
            
            this.createGrid();
            this.setGridData(parsedData);
            this.applyHalfHeight();
        } catch (error) {
            this.showMessage('データの解析に失敗しました: ' + error.message, 'error');
        }
    }
    
    isMarkdownTable(data) {
        return data.includes('|') && data.includes('---');
    }
    
    parseMarkdownTable(data) {
        const lines = data.split('\n').filter(line => line.trim());
        const result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('---')) continue; // セパレーター行をスキップ
            
            if (line.startsWith('|') && line.endsWith('|')) {
                const cells = line.slice(1, -1).split('|').map(cell => cell.trim());
                result.push(cells);
            }
        }
        
        return result;
    }
    
    parseCSV(data) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let currentRow = [];
        
        for (let i = 0; i < data.length; i++) {
            const char = data[i];
            
            if (inQuotes) {
                if (char === '"') {
                    // Check if it's an escaped quote
                    if (i + 1 < data.length && data[i + 1] === '"') {
                        current += '"';
                        i++; // Skip next quote
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    // Check if quote starts a quoted field
                    let prevNonWs = -1;
                    for (let j = i - 1; j >= 0 && (data[j] === ' ' || data[j] === '\t'); j--) {
                        // Skip whitespace
                    }
                    for (let j = i - 1; j >= 0; j--) {
                        if (data[j] !== ' ' && data[j] !== '\t') {
                            prevNonWs = j;
                            break;
                        }
                    }
                    if (i === 0 || (prevNonWs >= 0 && data[prevNonWs] === ',')) {
                        inQuotes = true;
                    } else {
                        current += char;
                    }
                } else if (char === ',' && !inQuotes) {
                    currentRow.push(current.trim());
                    current = '';
                } else if ((char === '\n' || char === '\r') && !inQuotes) {
                    // End of row
                    if (current.trim() || currentRow.length > 0) {
                        currentRow.push(current.trim());
                        if (currentRow.some(cell => cell !== '')) {
                            result.push(currentRow);
                        }
                        currentRow = [];
                        current = '';
                    }
                    // Skip \r\n combination
                    if (char === '\r' && i + 1 < data.length && data[i + 1] === '\n') {
                        i++;
                    }
                } else {
                    current += char;
                }
            }
        }
        
        // Handle last field/row
        if (current.trim() || currentRow.length > 0) {
            currentRow.push(current.trim());
            if (currentRow.some(cell => cell !== '')) {
                result.push(currentRow);
            }
        }
        
        return result;
    }
    
    clearImport() {
        this.importDataElement.value = '';
        this.showMessage('インポートエリアをクリアしました。', 'success');
    }
    
    generateMarkdown() {
        const data = this.getGridData();
        const lineBreakOption = document.querySelector('input[name="line-break"]:checked').value;
        
        let markdown = '';
        
        for (let row = 0; row < data.length; row++) {
            const rowData = data[row] || [];
            let line = '|';
            
            for (let col = 0; col < this.currentCols; col++) {
                let cellValue = rowData[col] || '';
                cellValue = this.processLineBreaks(cellValue, lineBreakOption);
                line += ' ' + cellValue + ' |';
            }
            
            markdown += line + '\n';
            
            // ヘッダー行の後にセパレーターを追加
            if (row === 0) {
                let separator = '|';
                for (let col = 0; col < this.currentCols; col++) {
                    separator += `${MarkdownTableTool.DEFAULT_SEPARATOR}|`;
                }
                markdown += separator + '\n';
            }
        }
        
        this.markdownOutput.value = markdown;
        this.showMessage('Markdownテーブルを生成しました。', 'success');
    }
    
    generateCSV() {
        const data = this.getGridData();
        const lineBreakOption = document.querySelector('input[name="line-break"]:checked').value;
        
        let csv = '';
        
        for (let row = 0; row < data.length; row++) {
            const rowData = data[row] || [];
            const csvRow = [];
            
            for (let col = 0; col < this.currentCols; col++) {
                let cellValue = rowData[col] || '';
                cellValue = this.processLineBreaks(cellValue, lineBreakOption);
                
                // CSVでは改行やカンマを含む場合にダブルクォートで囲む
                if (cellValue.includes(',') || cellValue.includes('\n') || cellValue.includes('"')) {
                    cellValue = '"' + cellValue.replace(/"/g, '""') + '"';
                }
                
                csvRow.push(cellValue);
            }
            
            csv += csvRow.join(',') + '\n';
        }
        
        this.csvOutput.value = csv;
        this.showMessage('CSVデータを生成しました。', 'success');
    }

    applyHalfHeight() {
        if (!this.gridContainer) return;
        // 一時的に自動高さにして実高を取得
        const previousMaxHeight = this.gridContainer.style.maxHeight;
        this.gridContainer.style.maxHeight = 'none';
        // コンテンツ実高の取得（ヘッダーも含む）
        const contentHeight = this.grid.scrollHeight;
        // 半分の高さ（最低40pxは確保）
        const half = Math.max(40, Math.floor(contentHeight / 2));
        this.gridContainer.style.maxHeight = half + 'px';
        // もし横スクロールのみ必要で高さが小さい場合でも縦スクロール可能
        this.gridContainer.style.overflowY = 'auto';
        // 以前のmaxHeightは不要のため保持しない
    }
    
    processLineBreaks(text, option) {
        if (!text) return '';
        
        switch (option) {
            case 'br':
                return text.replace(/\n/g, '<br />');
            case 'newline':
                return text; // \nをそのまま保持
            case 'none':
                return text.replace(/\n/g, ' ');
            default:
                return text;
        }
    }
    
    async copyToClipboard(type) {
        const text = type === 'markdown' ? this.markdownOutput.value : this.csvOutput.value;
        
        if (!text) {
            this.showMessage(`${type === 'markdown' ? 'Markdown' : 'CSV'}データが生成されていません。`, 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            this.showMessage(`${type === 'markdown' ? 'Markdown' : 'CSV'}データをクリップボードにコピーしました。`, 'success');
        } catch (error) {
            this.showMessage('クリップボードへのコピーに失敗しました。', 'error');
        }
    }
    
    downloadFile(type) {
        const text = type === 'markdown' ? this.markdownOutput.value : this.csvOutput.value;
        const filename = type === 'markdown' ? 'table.md' : 'table.csv';
        const mimeType = type === 'markdown' ? 'text/markdown' : 'text/csv';
        
        if (!text) {
            this.showMessage(`${type === 'markdown' ? 'Markdown' : 'CSV'}データが生成されていません。`, 'error');
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
        
        this.showMessage(`${filename}をダウンロードしました。`, 'success');
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