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
            const result = this.processEmail(input);
            this.displayResult(result);
        } catch (error) {
            this.showError(`デコードエラー: ${error.message}`);
        }
    }

    processEmail(emailText) {
        // メールをヘッダーと本文に分離
        const emailParts = this.parseEmail(emailText);
        
        // MIME encoded-wordのデコード (件名など)
        const mimeResult = this.decodeMimeText(emailText);
        
        // メール本文のデコード処理
        if (emailParts.body) {
            const bodyResult = this.decodeMessageBody(emailParts.body, emailParts.headers);
            mimeResult.decoded = mimeResult.decoded.replace(emailParts.body, bodyResult.decoded);
            mimeResult.detectedEncodings = [...new Set([...mimeResult.detectedEncodings, ...bodyResult.detectedEncodings])];
            mimeResult.bodyEncoding = bodyResult.encoding;
        }
        
        return mimeResult;
    }

    parseEmail(emailText) {
        const lines = emailText.split('\n');
        let headerEnd = -1;
        const headers = {};
        
        // ヘッダーの終わりを見つける（空行まで）
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '') {
                headerEnd = i;
                break;
            }
        }
        
        if (headerEnd === -1) {
            // ヘッダーと本文の境界が見つからない場合、全体をテキストとして処理
            return { headers: {}, body: emailText };
        }
        
        // ヘッダーを解析
        const headerLines = lines.slice(0, headerEnd);
        let currentHeader = '';
        let currentValue = '';
        
        for (const line of headerLines) {
            if (line.match(/^[a-zA-Z-]+:/)) {
                // 新しいヘッダー
                if (currentHeader) {
                    headers[currentHeader.toLowerCase()] = currentValue.trim();
                }
                const colonIndex = line.indexOf(':');
                currentHeader = line.substring(0, colonIndex).trim();
                currentValue = line.substring(colonIndex + 1).trim();
            } else if (line.startsWith(' ') || line.startsWith('\t')) {
                // 継続行
                currentValue += ' ' + line.trim();
            }
        }
        
        // 最後のヘッダーを追加
        if (currentHeader) {
            headers[currentHeader.toLowerCase()] = currentValue.trim();
        }
        
        // 本文を取得
        const body = lines.slice(headerEnd + 1).join('\n');
        
        return { headers, body };
    }

    decodeMessageBody(body, headers) {
        const contentType = headers['content-type'] || '';
        const transferEncoding = headers['content-transfer-encoding'] || '';
        
        let charset = 'utf-8';  // デフォルト
        let encoding = 'none';
        let decoded = body;
        const detectedEncodings = [];
        
        // Content-Typeからcharsetを抽出
        const charsetMatch = contentType.match(/charset=([^;]+)/i);
        if (charsetMatch) {
            charset = charsetMatch[1].trim().replace(/['"]/g, '');
            detectedEncodings.push(charset.toUpperCase());
        }
        
        // Content-Transfer-Encodingに基づいてデコード
        if (transferEncoding.toLowerCase() === 'quoted-printable') {
            encoding = 'quoted-printable';
            decoded = this.decodeQuotedPrintableBody(body, charset);
        } else if (transferEncoding.toLowerCase() === 'base64') {
            encoding = 'base64';
            decoded = this.decodeBase64Body(body);
        }
        
        // 文字エンコーディングの変換
        decoded = this.convertFromCharset(decoded, charset);
        
        return {
            decoded,
            encoding,
            detectedEncodings
        };
    }

    decodeQuotedPrintableBody(body, charset) {
        // ソフトラインブレークを除去
        const noSoftBreaks = body.replace(/=\r?\n/g, '');
    
        // =XX 形式の16進数をバイトに変換
        const bytes = [];
        const regex = /=([0-9A-Fa-f]{2})/g;
        let lastIndex = 0;
        let match;
    
        while ((match = regex.exec(noSoftBreaks)) !== null) {
            // 直前の非エンコード部分を追加
            const textPart = noSoftBreaks.substring(lastIndex, match.index);
            for (let i = 0; i < textPart.length; i++) {
                bytes.push(textPart.charCodeAt(i));
            }
            // エンコードされたバイトを追加
            bytes.push(parseInt(match[1], 16));
            lastIndex = regex.lastIndex;
        }
    
        // 最後の非エンコード部分を追加
        const remainingText = noSoftBreaks.substring(lastIndex);
        for (let i = 0; i < remainingText.length; i++) {
            bytes.push(remainingText.charCodeAt(i));
        }
    
        return new TextDecoder('latin1').decode(new Uint8Array(bytes));
    }

    decodeBase64Body(body) {
        try {
            // 改行とスペースを除去
            const cleanedBody = body.replace(/[\r\n\s]/g, '');
            return atob(cleanedBody);
        } catch (error) {
            throw new Error('Base64デコードに失敗しました');
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
        // アンダースコアを空白に変換（MIME header用）
        let text = encodedText.replace(/_/g, ' ');
        
        // Quoted-Printableデコード
        return text.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
        });
    }

    stringToUint8Array(str) {
        const bytes = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            bytes[i] = str.charCodeAt(i) & 0xFF;
        }
        return bytes;
    }

    convertFromCharset(text, charset) {
        try {
            const bytes = this.stringToUint8Array(text);
            const decoder = new TextDecoder(charset.toLowerCase());
            return decoder.decode(bytes);
        } catch (error) {
            // TextDecoderがサポートしていない、または失敗した場合
            console.error(`Charset conversion failed for ${charset}:`, error);
            return text; // フォールバック
        }
    }

    displayResult(result) {
        this.output.innerHTML = '';
        
        // デコード結果の表示
        const decodedDiv = document.createElement('div');
        decodedDiv.className = 'decoded-text';
        
        // XSS対策としてtextContentを使い、<pre>を直接追加
        const strong = document.createElement('strong');
        strong.textContent = 'デコード結果:';
        decodedDiv.appendChild(strong);
        decodedDiv.appendChild(document.createElement('br'));
        const pre = document.createElement('pre');
        pre.textContent = result.decoded;
        decodedDiv.appendChild(pre);
        this.output.appendChild(decodedDiv);
        
        // エンコーディング情報の表示
        this.encodingInfo.innerHTML = '';
        
        if (result.detectedEncodings.length > 0) {
            const encodingDiv = document.createElement('div');
            encodingDiv.innerHTML = `<strong>検出されたエンコーディング:</strong> ${result.detectedEncodings.join(', ')}`;
            this.encodingInfo.appendChild(encodingDiv);
        }
        
        // メール本文のエンコーディング情報
        if (result.bodyEncoding && result.bodyEncoding !== 'none') {
            const bodyEncodingDiv = document.createElement('div');
            bodyEncodingDiv.innerHTML = `<strong>メール本文のエンコーディング:</strong> ${result.bodyEncoding}`;
            this.encodingInfo.appendChild(bodyEncodingDiv);
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
                    <strong>エンコード:</strong> ${word.encoding.toUpperCase() === 'B' ? 'Base64' : 'Quoted-Printable'}
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