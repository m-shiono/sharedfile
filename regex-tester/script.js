class RegexTester {
    constructor() {
        this.regexInput = document.getElementById('regexInput');
        this.testText = document.getElementById('testText');
        this.regexStatus = document.getElementById('regexStatus');
        this.resultsSummary = document.getElementById('resultsSummary');
        this.highlightedText = document.getElementById('highlightedText');
        this.matchesList = document.getElementById('matchesList');
        this.replaceInput = document.getElementById('replaceInput');
        this.replaceResult = document.getElementById('replaceResult');
        
        this.flagGlobal = document.getElementById('flagGlobal');
        this.flagIgnoreCase = document.getElementById('flagIgnoreCase');
        this.flagMultiline = document.getElementById('flagMultiline');
        this.flagDotAll = document.getElementById('flagDotAll');
        this.flagUnicode = document.getElementById('flagUnicode');
        
        this.currentRegex = null;
        this.currentMatches = [];
        
        this.initializeEventListeners();
        this.updateTestText();
    }
    
    initializeEventListeners() {
        this.regexInput.addEventListener('input', () => this.validateRegex());
        this.testText.addEventListener('input', () => this.runTest());
        
        [this.flagGlobal, this.flagIgnoreCase, this.flagMultiline, this.flagDotAll, this.flagUnicode]
            .forEach(flag => flag.addEventListener('change', () => this.validateRegex()));
        
        document.getElementById('testBtn').addEventListener('click', () => this.runTest());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('replaceBtn').addEventListener('click', () => this.runReplace());
        
        document.querySelectorAll('.pattern-buttons button').forEach(button => {
            button.addEventListener('click', (e) => {
                const pattern = e.target.getAttribute('data-pattern');
                this.regexInput.value = pattern;
                this.validateRegex();
            });
        });
        
        this.regexInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.runTest();
            }
        });
        
        this.testText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.runTest();
            }
        });
    }
    
    updateTestText() {
        this.testText.placeholder = `テストしたいテキストを入力してください...

例:
メールアドレス: test@example.com, admin@company.co.jp
電話番号: 090-1234-5678, 03-1234-5678
URL: https://www.example.com, http://test.com/path
日付: 2024-01-15, 2023-12-31
数字: 123, 456, 789
日本語: こんにちは、カタカナ、ひらがな`;
    }
    
    getFlags() {
        let flags = '';
        if (this.flagGlobal.checked) flags += 'g';
        if (this.flagIgnoreCase.checked) flags += 'i';
        if (this.flagMultiline.checked) flags += 'm';
        if (this.flagDotAll.checked) flags += 's';
        if (this.flagUnicode.checked) flags += 'u';
        return flags;
    }
    
    validateRegex() {
        const pattern = this.regexInput.value;
        const flags = this.getFlags();
        
        if (!pattern) {
            this.regexStatus.textContent = '正規表現パターンを入力してください';
            this.regexStatus.className = 'regex-status';
            this.currentRegex = null;
            this.clearResults();
            return;
        }
        
        try {
            this.currentRegex = new RegExp(pattern, flags);
            this.regexStatus.textContent = `有効な正規表現: /${pattern}/${flags}`;
            this.regexStatus.className = 'regex-status valid';
            this.runTest();
        } catch (error) {
            this.regexStatus.textContent = `エラー: ${error.message}`;
            this.regexStatus.className = 'regex-status invalid';
            this.currentRegex = null;
            this.clearResults();
        }
    }
    
    runTest() {
        if (!this.currentRegex || !this.testText.value) {
            this.clearResults();
            return;
        }
        
        const text = this.testText.value;
        const matches = Array.from(text.matchAll(this.currentRegex));
        this.currentMatches = matches;
        
        this.displayResults(text, matches);
    }
    
    displayResults(text, matches) {
        const matchCount = matches.length;
        
        if (matchCount === 0) {
            this.resultsSummary.textContent = 'マッチする文字列が見つかりませんでした';
            this.highlightedText.textContent = text;
            this.matchesList.innerHTML = '<h4>マッチ一覧</h4><p>マッチなし</p>';
            return;
        }
        
        this.resultsSummary.innerHTML = `
            <strong>${matchCount}個のマッチが見つかりました</strong>
            ${this.getMatchStatistics(matches)}
        `;
        
        this.highlightMatches(text, matches);
        this.displayMatchesList(matches);
    }
    
    getMatchStatistics(matches) {
        const uniqueMatches = [...new Set(matches.map(m => m[0]))];
        const avgLength = matches.reduce((sum, m) => sum + m[0].length, 0) / matches.length;
        
        return `
            <br>
            <small>
                ユニークなマッチ: ${uniqueMatches.length}個 |
                平均長: ${avgLength.toFixed(1)}文字 |
                総文字数: ${matches.reduce((sum, m) => sum + m[0].length, 0)}文字
            </small>
        `;
    }
    
    highlightMatches(text, matches) {
        if (matches.length === 0) {
            this.highlightedText.textContent = text;
            return;
        }
        
        let highlightedText = '';
        let lastIndex = 0;
        
        matches.forEach((match, index) => {
            const startIndex = match.index;
            const endIndex = startIndex + match[0].length;
            
            highlightedText += this.escapeHtml(text.substring(lastIndex, startIndex));
            highlightedText += `<span class="match-highlight" title="マッチ ${index + 1}">${this.escapeHtml(match[0])}</span>`;
            lastIndex = endIndex;
        });
        
        highlightedText += this.escapeHtml(text.substring(lastIndex));
        this.highlightedText.innerHTML = highlightedText;
    }
    
    displayMatchesList(matches) {
        let listHtml = '<h4>マッチ一覧</h4>';
        
        matches.forEach((match, index) => {
            const groups = match.slice(1);
            const hasGroups = groups.some(group => group !== undefined);
            
            listHtml += `
                <div class="match-item">
                    <div class="match-text">"${this.escapeHtml(match[0])}"</div>
                    <div class="match-info">
                        位置: ${match.index}-${match.index + match[0].length - 1} (${match[0].length}文字)
                        ${hasGroups ? `<br>グループ: [${groups.map(g => g ? `"${this.escapeHtml(g)}"` : 'null').join(', ')}]` : ''}
                    </div>
                </div>
            `;
        });
        
        this.matchesList.innerHTML = listHtml;
    }
    
    runReplace() {
        if (!this.currentRegex || !this.testText.value) {
            this.replaceResult.textContent = '正規表現とテストテキストを入力してください';
            return;
        }
        
        const text = this.testText.value;
        const replacement = this.replaceInput.value;
        
        try {
            const result = text.replace(this.currentRegex, replacement);
            const replacementCount = this.currentMatches.length;
            
            this.replaceResult.innerHTML = `
                <div style="margin-bottom: 1rem; font-weight: bold; color: #2e7d32;">
                    ${replacementCount}箇所を置換しました
                </div>
                ${this.escapeHtml(result)}
            `;
        } catch (error) {
            this.replaceResult.innerHTML = `
                <div style="color: #c62828; font-weight: bold;">
                    置換エラー: ${error.message}
                </div>
            `;
        }
    }
    
    clearAll() {
        this.regexInput.value = '';
        this.testText.value = '';
        this.replaceInput.value = '';
        this.replaceResult.textContent = '';
        
        [this.flagGlobal, this.flagIgnoreCase, this.flagMultiline, this.flagDotAll, this.flagUnicode]
            .forEach(flag => flag.checked = false);
        
        this.currentRegex = null;
        this.currentMatches = [];
        this.regexStatus.textContent = '';
        this.regexStatus.className = 'regex-status';
        this.clearResults();
        this.regexInput.focus();
    }
    
    clearResults() {
        this.resultsSummary.textContent = '';
        this.highlightedText.textContent = '';
        this.matchesList.innerHTML = '<h4>マッチ一覧</h4><p>結果はここに表示されます</p>';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    exportResults() {
        if (!this.currentMatches.length) {
            alert('エクスポートするマッチ結果がありません');
            return;
        }
        
        const results = {
            regex: this.currentRegex.toString(),
            text: this.testText.value,
            matches: this.currentMatches.map(match => ({
                match: match[0],
                index: match.index,
                groups: match.slice(1)
            })),
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'regex-test-results.json';
        link.click();
    }
    
    getCommonPatterns() {
        return {
            email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
            url: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
            phone: '\\d{3}-\\d{4}-\\d{4}',
            date: '\\d{4}-\\d{2}-\\d{2}',
            number: '^\\d+$',
            alpha: '^[a-zA-Z]+$',
            hiragana: '^[ひらがな]+$',
            katakana: '^[カタカナ]+$',
            ipv4: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b',
            hex: '^#?[a-fA-F0-9]{6}$',
            creditCard: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b'
        };
    }
    
    showHelp() {
        const helpText = `
正規表現テスターの使い方:

1. 正規表現パターンを入力
2. 必要に応じてフラグを選択
3. テストテキストを入力
4. 結果を確認

キーボードショートカット:
- Enter: テスト実行 (正規表現フィールド)
- Ctrl+Enter: テスト実行 (テストテキストエリア)

フラグの説明:
- g: グローバル検索 (全てのマッチを検索)
- i: 大文字小文字を区別しない
- m: 複数行モード (^と$が各行に適用)
- s: . が改行文字にもマッチ
- u: Unicode対応
        `;
        alert(helpText);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegexTester();
});