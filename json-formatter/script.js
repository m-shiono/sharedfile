class JSONFormatter {
    constructor() {
        this.jsonInput = document.getElementById('jsonInput');
        this.jsonOutput = document.getElementById('jsonOutput');
        this.statusBar = document.getElementById('statusBar');
        this.formatBtn = document.getElementById('formatBtn');
        this.validateBtn = document.getElementById('validateBtn');
        this.minifyBtn = document.getElementById('minifyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.formatBtn.addEventListener('click', () => this.formatJSON());
        this.validateBtn.addEventListener('click', () => this.validateJSON());
        this.minifyBtn.addEventListener('click', () => this.minifyJSON());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyBtn.addEventListener('click', () => this.copyOutput());
        
        this.jsonInput.addEventListener('input', () => this.clearStatus());
        this.jsonInput.addEventListener('paste', () => {
            setTimeout(() => this.autoFormat(), 100);
        });
    }
    
    showStatus(message, type = 'info') {
        showStatus(this.statusBar, message, type);
    }
    
    clearStatus() {
        this.statusBar.textContent = '';
        this.statusBar.className = 'status-bar';
    }
    
    formatJSON() {
        const input = this.jsonInput.value.trim();
        
        if (!input) {
            this.showStatus('JSONデータを入力してください', 'error');
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            this.jsonOutput.value = formatted;
            this.showStatus('JSONフォーマットが完了しました', 'success');
        } catch (error) {
            this.showStatus(`JSONフォーマットエラー: ${error.message}`, 'error');
            this.jsonOutput.value = '';
        }
    }
    
    validateJSON() {
        const input = this.jsonInput.value.trim();
        
        if (!input) {
            this.showStatus('JSONデータを入力してください', 'error');
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            const stats = this.getJSONStats(parsed);
            this.showStatus(`有効なJSONです。${stats}`, 'success');
            this.jsonOutput.value = JSON.stringify(parsed, null, 2);
        } catch (error) {
            this.showStatus(`無効なJSON: ${error.message}`, 'error');
            this.highlightError(error.message);
        }
    }
    
    minifyJSON() {
        const input = this.jsonInput.value.trim();
        
        if (!input) {
            this.showStatus('JSONデータを入力してください', 'error');
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            this.jsonOutput.value = minified;
            const originalSize = input.length;
            const minifiedSize = minified.length;
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
            this.showStatus(`JSON圧縮完了。サイズ: ${originalSize} → ${minifiedSize} (${savings}%削減)`, 'success');
        } catch (error) {
            this.showStatus(`JSON圧縮エラー: ${error.message}`, 'error');
            this.jsonOutput.value = '';
        }
    }
    
    clearAll() {
        this.jsonInput.value = '';
        this.jsonOutput.value = '';
        this.clearStatus();
        this.jsonInput.focus();
    }
    
    copyOutput() {
        copyToClipboard(this.jsonOutput.value, (message, type) => this.showStatus(message, type));
    }
    
    autoFormat() {
        const input = this.jsonInput.value.trim();
        if (input && this.isValidJSON(input)) {
            this.formatJSON();
        }
    }
    
    isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    getJSONStats(obj) {
        const stats = this.analyzeJSON(obj);
        return `オブジェクト: ${stats.objects}, 配列: ${stats.arrays}, プロパティ: ${stats.properties}`;
    }
    
    analyzeJSON(obj, stats = { objects: 0, arrays: 0, properties: 0 }) {
        if (Array.isArray(obj)) {
            stats.arrays++;
            obj.forEach(item => this.analyzeJSON(item, stats));
        } else if (obj !== null && typeof obj === 'object') {
            stats.objects++;
            Object.keys(obj).forEach(key => {
                stats.properties++;
                this.analyzeJSON(obj[key], stats);
            });
        }
        return stats;
    }
    
    highlightError(errorMessage) {
        const positionMatch = errorMessage.match(/position (\d+)/);
        if (positionMatch) {
            const position = parseInt(positionMatch[1]);
            const textarea = this.jsonInput;
            textarea.focus();
            textarea.setSelectionRange(position, position + 1);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new JSONFormatter();
    
    const jsonInput = document.getElementById('jsonInput');
    jsonInput.placeholder = `JSONデータを入力してください...\n\n例:\n{\n  "name": "田中太郎",\n  "age": 30,\n  "skills": ["JavaScript", "Python", "Java"],\n  "address": {\n    "city": "東京",\n    "country": "日本"\n  }\n}`;
});