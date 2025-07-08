class HashGenerator {
    constructor() {
        this.inputText = document.getElementById('inputText');
        this.fileInput = document.getElementById('fileInput');
        this.fileDropZone = document.getElementById('fileDropZone');
        this.fileInfo = document.getElementById('fileInfo');
        this.textInputArea = document.getElementById('textInputArea');
        this.fileInputArea = document.getElementById('fileInputArea');
        
        this.hashOutputs = {
            md5: document.getElementById('md5Hash'),
            sha1: document.getElementById('sha1Hash'),
            sha256: document.getElementById('sha256Hash'),
            sha384: document.getElementById('sha384Hash'),
            sha512: document.getElementById('sha512Hash')
        };
        
        this.hashSummary = document.getElementById('hashSummary');
        this.inputSize = document.getElementById('inputSize');
        this.processingTime = document.getElementById('processingTime');
        
        this.hashSelector = document.getElementById('hashSelector');
        this.compareHash = document.getElementById('compareHash');
        this.compareResult = document.getElementById('compareResult');
        
        this.randomLength = document.getElementById('randomLength');
        this.randomType = document.getElementById('randomType');
        this.randomResult = document.getElementById('randomResult');
        
        this.copyButtons = document.querySelectorAll('.copy-btn');
        this.inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
        
        this.currentFile = null;
        this.currentHashes = {};
        
        this.initializeEventListeners();
        this.updatePlaceholder();
    }
    
    initializeEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateHashes());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('compareBtn').addEventListener('click', () => this.compareHashes());
        document.getElementById('generateRandomBtn').addEventListener('click', () => this.generateRandom());
        
        this.inputModeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.onInputModeChange());
        });
        
        this.inputText.addEventListener('input', () => this.onInputChange());
        this.inputText.addEventListener('paste', () => {
            setTimeout(() => this.onInputChange(), 10);
        });
        
        this.fileDropZone.addEventListener('click', () => this.fileInput.click());
        this.fileDropZone.addEventListener('dragover', (e) => this.onDragOver(e));
        this.fileDropZone.addEventListener('dragleave', (e) => this.onDragLeave(e));
        this.fileDropZone.addEventListener('drop', (e) => this.onDrop(e));
        
        this.fileInput.addEventListener('change', (e) => this.onFileSelect(e));
        
        this.copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-target');
                this.copyToClipboard(targetId, button);
            });
        });
        
        this.hashSelector.addEventListener('change', () => this.onHashSelectorChange());
        
        this.inputText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateHashes();
            }
        });
    }
    
    updatePlaceholder() {
        this.inputText.placeholder = `ハッシュ化したいテキストを入力してください...

例:
Hello World!
パスワード文字列
重要なドキュメント
設定ファイルの内容
APIキー

複数行のテキストにも対応しています。`;
    }
    
    onInputModeChange() {
        const mode = document.querySelector('input[name="inputMode"]:checked').value;
        if (mode === 'text') {
            this.textInputArea.style.display = 'block';
            this.fileInputArea.style.display = 'none';
            this.currentFile = null;
        } else {
            this.textInputArea.style.display = 'none';
            this.fileInputArea.style.display = 'block';
        }
        this.clearOutputs();
    }
    
    onInputChange() {
        if (this.inputText.value.trim()) {
            this.updateInputSize(new Blob([this.inputText.value]).size);
        } else {
            this.updateInputSize(0);
        }
    }
    
    onDragOver(e) {
        e.preventDefault();
        this.fileDropZone.classList.add('drag-over');
    }
    
    onDragLeave(e) {
        e.preventDefault();
        this.fileDropZone.classList.remove('drag-over');
    }
    
    onDrop(e) {
        e.preventDefault();
        this.fileDropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }
    
    onFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }
    
    handleFile(file) {
        this.currentFile = file;
        this.updateInputSize(file.size);
        
        this.fileInfo.innerHTML = `
            <strong>選択されたファイル:</strong><br>
            ファイル名: ${file.name}<br>
            サイズ: ${this.formatFileSize(file.size)}<br>
            タイプ: ${file.type || '不明'}
        `;
        this.fileInfo.style.display = 'block';
        
        this.clearOutputs();
    }
    
    async generateHashes() {
        const mode = document.querySelector('input[name="inputMode"]:checked').value;
        let data;
        
        if (mode === 'text') {
            const text = this.inputText.value.trim();
            if (!text) {
                alert('テキストを入力してください');
                return;
            }
            data = new TextEncoder().encode(text);
        } else {
            if (!this.currentFile) {
                alert('ファイルを選択してください');
                return;
            }
            data = await this.currentFile.arrayBuffer();
        }
        
        const startTime = performance.now();
        
        try {
            await this.calculateAllHashes(data);
            
            const endTime = performance.now();
            const processingTime = Math.round(endTime - startTime);
            this.processingTime.textContent = `${processingTime} ms`;
            
            this.updateHashSummary();
            this.populateHashSelector();
        } catch (error) {
            alert(`ハッシュ生成エラー: ${error.message}`);
        }
    }
    
    async calculateAllHashes(data) {
        const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
        const promises = algorithms.map(algo => this.calculateHash(data, algo));
        
        const results = await Promise.all(promises);
        
        this.currentHashes = {
            md5: results[0],
            sha1: results[1],
            sha256: results[2],
            sha384: results[3],
            sha512: results[4]
        };
        
        Object.keys(this.currentHashes).forEach(key => {
            this.hashOutputs[key].value = this.currentHashes[key];
        });
    }
    
    async calculateHash(data, algorithm) {
        if (algorithm === 'MD5') {
            return await this.calculateMD5(data);
        }
        
        const buffer = await crypto.subtle.digest(algorithm, data);
        return this.bufferToHex(buffer);
    }
    
    async calculateMD5(data) {
        return new Promise((resolve) => {
            const md5Hash = this.md5(data);
            resolve(md5Hash);
        });
    }
    
    md5(data) {
        const dataArray = new Uint8Array(data);
        
        function md5cycle(x, k) {
            let a = x[0], b = x[1], c = x[2], d = x[3];
            
            a = ff(a, b, c, d, k[0], 7, -680876936);
            d = ff(d, a, b, c, k[1], 12, -389564586);
            c = ff(c, d, a, b, k[2], 17, 606105819);
            b = ff(b, c, d, a, k[3], 22, -1044525330);
            a = ff(a, b, c, d, k[4], 7, -176418897);
            d = ff(d, a, b, c, k[5], 12, 1200080426);
            c = ff(c, d, a, b, k[6], 17, -1473231341);
            b = ff(b, c, d, a, k[7], 22, -45705983);
            a = ff(a, b, c, d, k[8], 7, 1770035416);
            d = ff(d, a, b, c, k[9], 12, -1958414417);
            c = ff(c, d, a, b, k[10], 17, -42063);
            b = ff(b, c, d, a, k[11], 22, -1990404162);
            a = ff(a, b, c, d, k[12], 7, 1804603682);
            d = ff(d, a, b, c, k[13], 12, -40341101);
            c = ff(c, d, a, b, k[14], 17, -1502002290);
            b = ff(b, c, d, a, k[15], 22, 1236535329);
            
            a = gg(a, b, c, d, k[1], 5, -165796510);
            d = gg(d, a, b, c, k[6], 9, -1069501632);
            c = gg(c, d, a, b, k[11], 14, 643717713);
            b = gg(b, c, d, a, k[0], 20, -373897302);
            a = gg(a, b, c, d, k[5], 5, -701558691);
            d = gg(d, a, b, c, k[10], 9, 38016083);
            c = gg(c, d, a, b, k[15], 14, -660478335);
            b = gg(b, c, d, a, k[4], 20, -405537848);
            a = gg(a, b, c, d, k[9], 5, 568446438);
            d = gg(d, a, b, c, k[14], 9, -1019803690);
            c = gg(c, d, a, b, k[3], 14, -187363961);
            b = gg(b, c, d, a, k[8], 20, 1163531501);
            a = gg(a, b, c, d, k[13], 5, -1444681467);
            d = gg(d, a, b, c, k[2], 9, -51403784);
            c = gg(c, d, a, b, k[7], 14, 1735328473);
            b = gg(b, c, d, a, k[12], 20, -1926607734);
            
            a = hh(a, b, c, d, k[5], 4, -378558);
            d = hh(d, a, b, c, k[8], 11, -2022574463);
            c = hh(c, d, a, b, k[11], 16, 1839030562);
            b = hh(b, c, d, a, k[14], 23, -35309556);
            a = hh(a, b, c, d, k[1], 4, -1530992060);
            d = hh(d, a, b, c, k[4], 11, 1272893353);
            c = hh(c, d, a, b, k[7], 16, -155497632);
            b = hh(b, c, d, a, k[10], 23, -1094730640);
            a = hh(a, b, c, d, k[13], 4, 681279174);
            d = hh(d, a, b, c, k[0], 11, -358537222);
            c = hh(c, d, a, b, k[3], 16, -722521979);
            b = hh(b, c, d, a, k[6], 23, 76029189);
            a = hh(a, b, c, d, k[9], 4, -640364487);
            d = hh(d, a, b, c, k[12], 11, -421815835);
            c = hh(c, d, a, b, k[15], 16, 530742520);
            b = hh(b, c, d, a, k[2], 23, -995338651);
            
            a = ii(a, b, c, d, k[0], 6, -198630844);
            d = ii(d, a, b, c, k[7], 10, 1126891415);
            c = ii(c, d, a, b, k[14], 15, -1416354905);
            b = ii(b, c, d, a, k[5], 21, -57434055);
            a = ii(a, b, c, d, k[12], 6, 1700485571);
            d = ii(d, a, b, c, k[3], 10, -1894986606);
            c = ii(c, d, a, b, k[10], 15, -1051523);
            b = ii(b, c, d, a, k[1], 21, -2054922799);
            a = ii(a, b, c, d, k[8], 6, 1873313359);
            d = ii(d, a, b, c, k[15], 10, -30611744);
            c = ii(c, d, a, b, k[6], 15, -1560198380);
            b = ii(b, c, d, a, k[13], 21, 1309151649);
            a = ii(a, b, c, d, k[4], 6, -145523070);
            d = ii(d, a, b, c, k[11], 10, -1120210379);
            c = ii(c, d, a, b, k[2], 15, 718787259);
            b = ii(b, c, d, a, k[9], 21, -343485551);
            
            x[0] = add32(a, x[0]);
            x[1] = add32(b, x[1]);
            x[2] = add32(c, x[2]);
            x[3] = add32(d, x[3]);
        }
        
        function cmn(q, a, b, x, s, t) {
            a = add32(add32(a, q), add32(x, t));
            return add32((a << s) | (a >>> (32 - s)), b);
        }
        
        function ff(a, b, c, d, x, s, t) {
            return cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }
        
        function gg(a, b, c, d, x, s, t) {
            return cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }
        
        function hh(a, b, c, d, x, s, t) {
            return cmn(b ^ c ^ d, a, b, x, s, t);
        }
        
        function ii(a, b, c, d, x, s, t) {
            return cmn(c ^ (b | (~d)), a, b, x, s, t);
        }
        
        function add32(a, b) {
            return (a + b) & 0xFFFFFFFF;
        }
        
        function bytesToWords(bytes) {
            const words = [];
            for (let i = 0, b = 0; i < bytes.length; i++, b += 8) {
                words[b >>> 5] |= bytes[i] << (b % 32);
            }
            return words;
        }
        
        function wordsToBytes(words) {
            const bytes = [];
            for (let b = 0; b < words.length * 32; b += 8) {
                bytes.push((words[b >>> 5] >>> (b % 32)) & 0xFF);
            }
            return bytes;
        }
        
        const message = Array.from(dataArray);
        const messageLenBits = message.length * 8;
        
        message.push(0x80);
        
        while (message.length % 64 !== 56) {
            message.push(0);
        }
        
        for (let i = 0; i < 8; i++) {
            message.push((messageLenBits >>> (i * 8)) & 0xFF);
        }
        
        const words = bytesToWords(message);
        const h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];
        
        for (let i = 0; i < words.length; i += 16) {
            const chunk = words.slice(i, i + 16);
            md5cycle(h, chunk);
        }
        
        const result = wordsToBytes(h).slice(0, 16);
        return result.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    updateInputSize(size) {
        this.inputSize.textContent = this.formatFileSize(size);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 bytes';
        
        const sizes = ['bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2);
        
        return `${size} ${sizes[i]}`;
    }
    
    updateHashSummary() {
        const mode = document.querySelector('input[name="inputMode"]:checked').value;
        const source = mode === 'text' ? 'テキスト' : `ファイル: ${this.currentFile.name}`;
        
        this.hashSummary.innerHTML = `
            <strong>ハッシュ生成完了</strong><br>
            ソース: ${source}<br>
            サイズ: ${this.inputSize.textContent}
        `;
    }
    
    populateHashSelector() {
        this.hashSelector.innerHTML = '<option value="">ハッシュを選択...</option>';
        
        Object.keys(this.currentHashes).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key.toUpperCase().replace('SHA', 'SHA-');
            this.hashSelector.appendChild(option);
        });
    }
    
    onHashSelectorChange() {
        const selectedHash = this.hashSelector.value;
        if (selectedHash && this.currentHashes[selectedHash]) {
            this.compareHash.placeholder = `比較したい${selectedHash.toUpperCase()}ハッシュを入力...`;
        }
    }
    
    compareHashes() {
        const selectedHashType = this.hashSelector.value;
        const compareHashValue = this.compareHash.value.trim();
        
        if (!selectedHashType) {
            this.showCompareResult('ハッシュの種類を選択してください', 'error');
            return;
        }
        
        if (!compareHashValue) {
            this.showCompareResult('比較するハッシュ値を入力してください', 'error');
            return;
        }
        
        const generatedHash = this.currentHashes[selectedHashType];
        if (!generatedHash) {
            this.showCompareResult('まずハッシュを生成してください', 'error');
            return;
        }
        
        const normalizedGenerated = generatedHash.toLowerCase();
        const normalizedCompare = compareHashValue.toLowerCase();
        
        if (normalizedGenerated === normalizedCompare) {
            this.showCompareResult('✓ ハッシュが一致しました', 'match');
        } else {
            this.showCompareResult('✗ ハッシュが一致しません', 'no-match');
        }
    }
    
    showCompareResult(message, type) {
        this.compareResult.textContent = message;
        this.compareResult.className = `compare-result ${type}`;
    }
    
    generateRandom() {
        const length = parseInt(this.randomLength.value) || 32;
        const type = this.randomType.value;
        
        let result = '';
        
        switch (type) {
            case 'hex':
                result = this.generateRandomHex(length);
                break;
            case 'base64':
                result = this.generateRandomBase64(length);
                break;
            case 'alphanumeric':
                result = this.generateRandomAlphanumeric(length);
                break;
        }
        
        this.randomResult.value = result;
    }
    
    generateRandomHex(length) {
        const chars = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    generateRandomBase64(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    generateRandomAlphanumeric(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    async copyToClipboard(targetId, button) {
        const element = document.getElementById(targetId);
        const text = element.value;
        
        if (!text) {
            this.showCopyFeedback(button, 'コピーするデータがありません', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            this.showCopyFeedback(button, 'コピー完了', 'success');
        } catch (error) {
            this.fallbackCopyTextToClipboard(text, button);
        }
    }
    
    fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopyFeedback(button, 'コピー完了', 'success');
        } catch (error) {
            this.showCopyFeedback(button, 'コピー失敗', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    showCopyFeedback(button, message, type) {
        const originalText = button.textContent;
        button.textContent = message;
        
        if (type === 'success') {
            button.classList.add('copied');
        }
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 1500);
    }
    
    clearAll() {
        this.inputText.value = '';
        this.fileInput.value = '';
        this.currentFile = null;
        this.fileInfo.style.display = 'none';
        this.compareHash.value = '';
        this.randomResult.value = '';
        
        this.clearOutputs();
        this.compareResult.textContent = '';
        this.compareResult.className = 'compare-result';
        this.updateInputSize(0);
        this.processingTime.textContent = '0 ms';
        
        this.inputText.focus();
    }
    
    clearOutputs() {
        Object.values(this.hashOutputs).forEach(output => {
            output.value = '';
        });
        
        this.currentHashes = {};
        this.hashSummary.textContent = '';
        this.hashSelector.innerHTML = '<option value="">ハッシュを選択...</option>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HashGenerator();
});