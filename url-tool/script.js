class URLTool {
    constructor() {
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.statusBar = document.getElementById('statusBar');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.swapBtn = document.getElementById('swapBtn');
        this.modeRadios = document.querySelectorAll('input[name="mode"]');
        this.encodeSpacesCheckbox = document.getElementById('encodeSpaces');
        this.encodeReservedCheckbox = document.getElementById('encodeReserved');
        
        this.initializeEventListeners();
        this.updatePlaceholder();
    }
    
    initializeEventListeners() {
        this.convertBtn.addEventListener('click', () => this.convert());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyBtn.addEventListener('click', () => this.copyOutput());
        this.swapBtn.addEventListener('click', () => this.swapInputOutput());
        
        this.modeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.onModeChange());
        });
        
        this.encodeSpacesCheckbox.addEventListener('change', () => this.onOptionsChange());
        this.encodeReservedCheckbox.addEventListener('change', () => this.onOptionsChange());
        
        this.inputText.addEventListener('input', () => this.clearStatus());
        this.inputText.addEventListener('paste', () => {
            setTimeout(() => this.autoConvert(), 100);
        });
        
        this.inputText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.convert();
            }
        });
    }
    
    showStatus(message, type = 'info') {
        showStatus(this.statusBar, message, type);
    }
    
    clearStatus() {
        this.statusBar.textContent = '';
        this.statusBar.className = 'status-bar';
    }
    
    getCurrentMode() {
        return document.querySelector('input[name="mode"]:checked').value;
    }
    
    onModeChange() {
        this.updatePlaceholder();
        this.updateOptionsVisibility();
        this.clearStatus();
        if (this.inputText.value.trim()) {
            this.autoConvert();
        }
    }
    
    onOptionsChange() {
        this.clearStatus();
        if (this.inputText.value.trim() && this.getCurrentMode() === 'encode') {
            this.autoConvert();
        }
    }
    
    updatePlaceholder() {
        const mode = this.getCurrentMode();
        if (mode === 'encode') {
            this.inputText.placeholder = `URLエンコードしたいテキストを入力してください...

例:
https://example.com/search?q=日本語検索
Hello World! #特殊文字@含む
ファイル名 (スペース入り).txt`;
        } else {
            this.inputText.placeholder = `URLデコードしたいテキストを入力してください...

例:
https%3A//example.com/search%3Fq%3D%E6%97%A5%E6%9C%AC%E8%AA%9E%E6%A4%9C%E7%B4%A2
Hello+World%21+%23%E7%89%B9%E6%AE%8A%E6%96%87%E5%AD%97%40%E5%90%AB%E3%82%80
%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E5%90%8D+%28%E3%82%B9%E3%83%9A%E3%83%BC%E3%82%B9%E5%85%A5%E3%82%8A%29.txt`;
        }
    }
    
    updateOptionsVisibility() {
        const mode = this.getCurrentMode();
        const options = document.querySelector('.encoding-options');
        if (mode === 'encode') {
            options.style.display = 'flex';
        } else {
            options.style.display = 'none';
        }
    }
    
    convert() {
        const input = this.inputText.value.trim();
        const mode = this.getCurrentMode();
        
        if (!input) {
            this.showStatus('入力データを入力してください', 'error');
            return;
        }
        
        try {
            let result;
            let statusMessage;
            
            if (mode === 'encode') {
                result = this.encodeURL(input);
                const originalSize = new Blob([input]).size;
                const encodedSize = new Blob([result]).size;
                const ratio = (encodedSize / originalSize * 100).toFixed(1);
                statusMessage = `URLエンコード完了。サイズ: ${originalSize} → ${encodedSize} bytes (${ratio}%)`;
            } else {
                result = this.decodeURL(input);
                const decodedSize = new Blob([result]).size;
                const originalSize = new Blob([input]).size;
                const ratio = (decodedSize / originalSize * 100).toFixed(1);
                statusMessage = `URLデコード完了。サイズ: ${originalSize} → ${decodedSize} bytes (${ratio}%)`;
            }
            
            this.outputText.value = result;
            this.showStatus(statusMessage, 'success');
            
        } catch (error) {
            this.showStatus(`${mode === 'encode' ? 'エンコード' : 'デコード'}エラー: ${error.message}`, 'error');
            this.outputText.value = '';
        }
    }
    
    encodeURL(text) {
        try {
            const encodeSpaces = this.encodeSpacesCheckbox.checked;
            const encodeReserved = this.encodeReservedCheckbox.checked;
            
            let result;
            
            if (encodeReserved) {
                result = encodeURIComponent(text);
            } else {
                result = encodeURI(text);
            }
            
            if (encodeSpaces) {
                result = result.replace(/%20/g, '+');
            }
            
            return result;
        } catch (error) {
            throw new Error('URLエンコードに失敗しました');
        }
    }
    
    decodeURL(url) {
        try {
            let decoded = url.replace(/\+/g, ' ');
            
            try {
                decoded = decodeURIComponent(decoded);
            } catch (e) {
                decoded = decodeURI(decoded);
            }
            
            return decoded;
        } catch (error) {
            throw new Error('URLデコードに失敗しました。正しいURL形式か確認してください');
        }
    }
    
    clearAll() {
        this.inputText.value = '';
        this.outputText.value = '';
        this.clearStatus();
        this.inputText.focus();
    }
    
    copyOutput() {
        copyToClipboard(this.outputText.value, (message, type) => this.showStatus(message, type));
    }
    
    swapInputOutput() {
        const inputValue = this.inputText.value;
        const outputValue = this.outputText.value;
        
        if (!outputValue) {
            this.showStatus('出力データがありません', 'error');
            return;
        }
        
        this.inputText.value = outputValue;
        this.outputText.value = inputValue;
        
        const currentMode = this.getCurrentMode();
        const newMode = currentMode === 'encode' ? 'decode' : 'encode';
        document.querySelector(`input[name="mode"][value="${newMode}"]`).checked = true;
        
        this.updatePlaceholder();
        this.updateOptionsVisibility();
        this.clearStatus();
        this.showStatus('入力と出力を入れ替えました', 'info');
    }
    
    autoConvert() {
        const input = this.inputText.value.trim();
        if (input) {
            this.convert();
        }
    }
    
    analyzeURL(url) {
        const analysis = {
            length: url.length,
            encodedChars: 0,
            plusSigns: 0,
            percentSigns: 0
        };
        
        analysis.encodedChars = (url.match(/%[0-9A-Fa-f]{2}/g) || []).length;
        analysis.plusSigns = (url.match(/\+/g) || []).length;
        analysis.percentSigns = (url.match(/%/g) || []).length;
        
        return analysis;
    }
    
    getCharacterInfo(char) {
        const code = char.charCodeAt(0);
        const encoded = encodeURIComponent(char);
        
        return {
            char: char,
            code: code,
            encoded: encoded,
            isReserved: this.isReservedChar(char),
            isUnsafe: this.isUnsafeChar(char)
        };
    }
    
    isReservedChar(char) {
        const reserved = "!*'();:@&=+$,/?#[]";
        return reserved.includes(char);
    }
    
    isUnsafeChar(char) {
        const unsafe = ' "<>#%{}|\\^~`[]';
        return unsafe.includes(char);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new URLTool();
});