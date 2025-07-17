class EmailDecoder {
    constructor() {
        this.init();
    }

    init() {
        this.emailInput = document.getElementById('emailInput');
        this.output = document.getElementById('output');
        this.encodingInfo = document.getElementById('encodingInfo');
        this.decodeBtn = document.getElementById('decodeBtn');
        this.clearBtn = document.getElementById('clearBtn');

        this.decodeBtn.addEventListener('click', () => this.decodeEmail());
        this.clearBtn.addEventListener('click', () => this.clearAll());
    }

    decodeEmail() {
        const input = this.emailInput.value.trim();
        if (!input) {
            this.showError('メールテキストを入力してください。');
            return;
        }

        try {
            const result = this.decodeMimeText(input);
            this.displayResult(result);
        } catch (error) {
            this.showError(`デコードエラー: ${error.message}`);
        }
    }

    decodeMimeText(text) {
        let decodedText = text;
        const encodedWords = [];
        let detectedEncodings = new Set();

        // MIME encoded-word pattern: =?charset?encoding?encoded-text?=
        const mimePattern = /=\?([^?]+)\?([BQbq])\?([^?]+)\?=/g;
        
        decodedText = decodedText.replace(mimePattern, (match, charset, encoding, encodedText) => {
            encodedWords.push({ charset, encoding, encodedText, original: match });
            detectedEncodings.add(charset.toUpperCase());
            
            try {
                let decoded;
                if (encoding.toUpperCase() === 'B') {
                    decoded = this.decodeBase64(encodedText);
                } else if (encoding.toUpperCase() === 'Q') {
                    decoded = this.decodeQuotedPrintable(encodedText);
                } else {
                    throw new Error(`未サポートのエンコーディング: ${encoding}`);
                }
                
                return this.convertFromCharset(decoded, charset);
            } catch (error) {
                return `[デコードエラー: ${error.message}]`;
            }
        });

        return {
            decoded: decodedText,
            encodedWords,
            detectedEncodings: Array.from(detectedEncodings)
        };
    }

    decodeBase64(encodedText) {
        try {
            return atob(encodedText);
        } catch (error) {
            throw new Error('Base64デコードに失敗しました');
        }
    }

    decodeQuotedPrintable(encodedText) {
        return encodedText
            .replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
                return String.fromCharCode(parseInt(hex, 16));
            })
            .replace(/=\r?\n/g, '')
            .replace(/_/g, ' ');
    }

    convertFromCharset(text, charset) {
        const upperCharset = charset.toUpperCase();
        
        // ISO-2022-JP (JIS) の処理
        if (upperCharset === 'ISO-2022-JP') {
            return this.convertFromJIS(text);
        }
        
        // Shift_JIS の処理
        if (upperCharset === 'SHIFT_JIS' || upperCharset === 'SHIFT-JIS') {
            return this.convertFromShiftJIS(text);
        }
        
        // EUC-JP の処理
        if (upperCharset === 'EUC-JP') {
            return this.convertFromEUCJP(text);
        }
        
        // UTF-8 やその他のエンコーディング
        if (upperCharset === 'UTF-8') {
            return this.convertFromUTF8(text);
        }
        
        // その他のエンコーディングはそのまま返す
        return text;
    }

    convertFromJIS(text) {
        // JIS エスケープシーケンスの処理
        let result = text;
        
        // ASCII への切り替え
        result = result.replace(/\x1b\(B/g, '');
        result = result.replace(/\x1b\(J/g, '');
        
        // 漢字モードへの切り替え
        result = result.replace(/\x1b\$B/g, '');
        result = result.replace(/\x1b\$@/g, '');
        
        // 半角カナモードへの切り替え
        result = result.replace(/\x1b\(I/g, '');
        
        // 簡易的な JIS から UTF-8 への変換
        try {
            const decoder = new TextDecoder('iso-2022-jp');
            const encoder = new TextEncoder();
            const bytes = encoder.encode(text);
            return decoder.decode(bytes);
        } catch (error) {
            return text;
        }
    }

    convertFromShiftJIS(text) {
        try {
            const decoder = new TextDecoder('shift-jis');
            const encoder = new TextEncoder();
            const bytes = encoder.encode(text);
            return decoder.decode(bytes);
        } catch (error) {
            return text;
        }
    }

    convertFromEUCJP(text) {
        try {
            const decoder = new TextDecoder('euc-jp');
            const encoder = new TextEncoder();
            const bytes = encoder.encode(text);
            return decoder.decode(bytes);
        } catch (error) {
            return text;
        }
    }

    convertFromUTF8(text) {
        try {
            // UTF-8 バイト列をデコード
            const bytes = new Uint8Array(text.length);
            for (let i = 0; i < text.length; i++) {
                bytes[i] = text.charCodeAt(i);
            }
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(bytes);
        } catch (error) {
            return text;
        }
    }

    displayResult(result) {
        this.output.innerHTML = '';
        
        // デコード結果の表示
        const decodedDiv = document.createElement('div');
        decodedDiv.className = 'decoded-text';
        decodedDiv.innerHTML = `<strong>デコード結果:</strong><br>${this.escapeHtml(result.decoded)}`;
        this.output.appendChild(decodedDiv);
        
        // エンコーディング情報の表示
        this.encodingInfo.innerHTML = '';
        
        if (result.detectedEncodings.length > 0) {
            const encodingDiv = document.createElement('div');
            encodingDiv.innerHTML = `<strong>検出されたエンコーディング:</strong> ${result.detectedEncodings.join(', ')}`;
            this.encodingInfo.appendChild(encodingDiv);
        }
        
        if (result.encodedWords.length > 0) {
            const detailDiv = document.createElement('div');
            detailDiv.innerHTML = '<strong>エンコードされた部分:</strong>';
            const wordsList = document.createElement('ul');
            
            result.encodedWords.forEach(word => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <strong>元のテキスト:</strong> ${this.escapeHtml(word.original)}<br>
                    <strong>文字セット:</strong> ${word.charset}<br>
                    <strong>エンコード:</strong> ${word.encoding === 'B' ? 'Base64' : 'Quoted-Printable'}
                `;
                wordsList.appendChild(listItem);
            });
            
            detailDiv.appendChild(wordsList);
            this.encodingInfo.appendChild(detailDiv);
        }
    }

    showError(message) {
        this.output.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
        this.encodingInfo.innerHTML = '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearAll() {
        this.emailInput.value = '';
        this.output.innerHTML = '';
        this.encodingInfo.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EmailDecoder();
});