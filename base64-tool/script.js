class Base64Tool {
    constructor() {
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.statusBar = document.getElementById('statusBar');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.swapBtn = document.getElementById('swapBtn');
        this.modeRadios = document.querySelectorAll('input[name="mode"]');
        
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
        this.clearStatus();
        if (this.inputText.value.trim()) {
            this.autoConvert();
        }
    }
    
    updatePlaceholder() {
        const mode = this.getCurrentMode();
        if (mode === 'encode') {
            this.inputText.placeholder = `変換したいテキストを入力してください...

例:
Hello World!
こんにちは世界！
JavaScript is awesome!`;
        } else {
            this.inputText.placeholder = `Base64エンコードされたテキストを入力してください...

例:
SGVsbG8gV29ybGQh
44GT44KT44Gr44Gh44Gv5LiW55WM77yB
SmF2YVNjcmlwdCBpcyBhd2Vzb21lIQ==`;
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
                result = this.encodeBase64(input);
                const originalSize = new Blob([input]).size;
                const encodedSize = new Blob([result]).size;
                const ratio = (encodedSize / originalSize * 100).toFixed(1);
                statusMessage = `エンコード完了。サイズ: ${originalSize} → ${encodedSize} bytes (${ratio}%)`;
            } else {
                result = this.decodeBase64(input);
                const decodedSize = new Blob([result]).size;
                const originalSize = new Blob([input]).size;
                const ratio = (decodedSize / originalSize * 100).toFixed(1);
                statusMessage = `デコード完了。サイズ: ${originalSize} → ${decodedSize} bytes (${ratio}%)`;
            }
            
            this.outputText.value = result;
            this.showStatus(statusMessage, 'success');
            
        } catch (error) {
            this.showStatus(`${mode === 'encode' ? 'エンコード' : 'デコード'}エラー: ${error.message}`, 'error');
            this.outputText.value = '';
        }
    }
    
    encodeBase64(text) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            let binary = '';
            for (let i = 0; i < data.length; i++) {
                binary += String.fromCharCode(data[i]);
            }
            return btoa(binary);
        } catch (error) {
            throw new Error('テキストのエンコードに失敗しました');
        }
    }
    
    decodeBase64(base64) {
        try {
            if (!this.isValidBase64(base64)) {
                throw new Error('無効なBase64形式です');
            }
            
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const decoder = new TextDecoder();
            return decoder.decode(bytes);
        } catch (error) {
            if (error.message.includes('無効なBase64形式')) {
                throw error;
            }
            throw new Error('Base64のデコードに失敗しました。正しいBase64形式か確認してください');
        }
    }
    
    isValidBase64(str) {
        if (!str) return false;
        
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(str)) {
            return false;
        }
        
        if (str.length % 4 !== 0) {
            return false;
        }
        
        try {
            atob(str);
            return true;
        } catch (error) {
            return false;
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
        this.clearStatus();
        this.showStatus('入力と出力を入れ替えました', 'info');
    }
    
    autoConvert() {
        const input = this.inputText.value.trim();
        if (input) {
            this.convert();
        }
    }
    
    getBase64Info(base64) {
        const paddingCount = (base64.match(/=/g) || []).length;
        const dataLength = base64.length - paddingCount;
        const byteLength = Math.floor(dataLength * 3 / 4);
        
        return {
            length: base64.length,
            padding: paddingCount,
            dataBytes: byteLength
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Base64Tool();
});