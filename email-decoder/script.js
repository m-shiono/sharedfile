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
        // 1. 改行コードを\nに正規化
        const normalizedEmailText = emailText.replace(/\r\n/g, '\n');

        // 2. ヘッダーと本文に分離
        const emailParts = this.parseEmail(normalizedEmailText);

        // 3. ヘッダー部分のMIME encoded-wordをデコード
        const decodedHeaderResult = this.decodeMimeText(emailParts.rawHeaders);

        // 4. 本文をデコード
        const bodyResult = this.decodeMessageBody(emailParts.body, emailParts.headers);

        // 5. デコード済みのヘッダーと本文を結合
        const finalDecodedText = decodedHeaderResult.decoded + '\n\n' + bodyResult.decoded;
        
        const combinedEncodings = [...new Set([...decodedHeaderResult.detectedEncodings, ...bodyResult.detectedEncodings])];

        return {
            decoded: finalDecodedText,
            encodedWords: decodedHeaderResult.encodedWords,
            detectedEncodings: Array.from(combinedEncodings),
            bodyEncoding: bodyResult.encoding
        };
    }

    parseEmail(emailText) {
        const lines = emailText.split('\n');
        let headerEnd = -1;
        const headers = {};
        
        // ヘッダーの終わり（最初の空行）を見つける
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '') {
                headerEnd = i;
                break;
            }
        }
        
        if (headerEnd === -1) {
            // ヘッダーがない場合
            return { headers: {}, body: emailText, rawHeaders: '' };
        }
        
        const headerLines = lines.slice(0, headerEnd);
        const rawHeaders = headerLines.join('\n');
        let currentHeader = '';
        let currentValue = '';
        
        // ヘッダーを解析してオブジェクトに格納
        for (const line of headerLines) {
            if (line.match(/^[a-zA-Z-]+:/)) {
                if (currentHeader) {
                    headers[currentHeader.toLowerCase()] = currentValue.trim();
                }
                const colonIndex = line.indexOf(':');
                currentHeader = line.substring(0, colonIndex).trim();
                currentValue = line.substring(colonIndex + 1).trim();
            } else if (line.startsWith(' ') || line.startsWith('\t')) {
                // 折り返されたヘッダー
                currentValue += ' ' + line.trim();
            }
        }
        
        if (currentHeader) {
            headers[currentHeader.toLowerCase()] = currentValue.trim();
        }
        
        const body = lines.slice(headerEnd + 1).join('\n');
        
        return { headers, body, rawHeaders };
    }

    decodeMessageBody(body, headers) {
        const contentType = headers['content-type'] || '';
        const transferEncoding = headers['content-transfer-encoding'] || '';
        
        let charset = 'utf-8';
        let encoding = 'none';
        let decodedBytes;
        const detectedEncodings = [];
        
        const charsetMatch = contentType.match(/charset=([^;]+)/i);
        if (charsetMatch) {
            charset = charsetMatch[1].trim().replace(/['"]/g, '');
            detectedEncodings.push(charset.toUpperCase());
        }
        
        if (transferEncoding.toLowerCase() === 'quoted-printable') {
            encoding = 'quoted-printable';
            decodedBytes = this.decodeQuotedPrintable(body, true);
        } else if (transferEncoding.toLowerCase() === 'base64') {
            encoding = 'base64';
            decodedBytes = this.decodeBase64(body);
        } else {
            // エンコーディングなし（プレーンテキスト）
            decodedBytes = new TextEncoder().encode(body);
        }
        
        const decoded = this.convertFromCharset(decodedBytes, charset);
        
        return {
            decoded,
            encoding,
            detectedEncodings
        };
    }

    decodeMimeText(text) {
        const encodedWords = [];
        let detectedEncodings = new Set();

        const mimePattern = /=\?([^?]+)\?([BQbq])\?([^?]+)\?=/g;
        
        const decodedText = text.replace(mimePattern, (match, charset, encoding, encodedText) => {
            encodedWords.push({ charset, encoding, encodedText, original: match });
            detectedEncodings.add(charset.toUpperCase());
            
            try {
                let decodedBytes;
                if (encoding.toUpperCase() === 'B') {
                    decodedBytes = this.decodeBase64(encodedText);
                } else if (encoding.toUpperCase() === 'Q') {
                    decodedBytes = this.decodeQuotedPrintable(encodedText, false);
                } else {
                    throw new Error(`未サポートのエンコーディング: ${encoding}`);
                }
                
                return this.convertFromCharset(decodedBytes, charset);
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
            const binaryString = atob(encodedText.replace(/[\r\n\s]/g, ''));
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        } catch (error) {
            throw new Error('Base64デコードに失敗しました');
        }
    }

    decodeQuotedPrintable(text, isBody) {
        let processedText = text;
        if (isBody) {
            // 本文の場合、ソフトラインブレーク（= + 改行）を除去
            processedText = processedText.replace(/=\r?\n/g, '');
        }

        const bytes = [];
        for (let i = 0; i < processedText.length; i++) {
            const char = processedText[i];
            if (char === '=' && i + 2 < processedText.length) {
                const hex = processedText.substring(i + 1, i + 3);
                if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
                    bytes.push(parseInt(hex, 16));
                    i += 2;
                    continue;
                }
            }
            
            if (!isBody && char === '_') {
                // ヘッダー（encoded-word）の場合、アンダースコアはスペース(0x20)
                bytes.push(0x20);
            } else {
                bytes.push(char.charCodeAt(0) & 0xFF);
            }
        }
        return new Uint8Array(bytes);
    }

    convertFromCharset(bytes, charset) {
        try {
            const decoder = new TextDecoder(charset.toLowerCase() || 'utf-8');
            return decoder.decode(bytes);
        } catch (error) {
            console.error(`Charset conversion failed for ${charset}:`, error);
            // フォールバック: UTF-8としてデコード試行、ダメならそのまま
            try {
                return new TextDecoder('utf-8').decode(bytes);
            } catch (e) {
                return new TextDecoder('ascii').decode(bytes);
            }
        }
    }

    displayResult(result) {
        this.output.textContent = '';
        
        const decodedDiv = document.createElement('div');
        decodedDiv.className = 'decoded-text';
        
        const pre = document.createElement('pre');
        pre.textContent = result.decoded;
        decodedDiv.appendChild(pre);
        this.output.appendChild(decodedDiv);
        
        this.encodingInfo.textContent = '';
        
        if (result.detectedEncodings.length > 0) {
            const encodingDiv = document.createElement('div');
            const encodingLabel = document.createElement('strong');
            encodingLabel.textContent = '検出されたエンコーディング:';
            encodingDiv.appendChild(encodingLabel);
            encodingDiv.appendChild(document.createTextNode(` ${result.detectedEncodings.join(', ')}`));
            this.encodingInfo.appendChild(encodingDiv);
        }
        
        if (result.bodyEncoding && result.bodyEncoding !== 'none') {
            const bodyEncodingDiv = document.createElement('div');
            const bodyEncodingLabel = document.createElement('strong');
            bodyEncodingLabel.textContent = 'メール本文のエンコーディング:';
            bodyEncodingDiv.appendChild(bodyEncodingLabel);
            bodyEncodingDiv.appendChild(document.createTextNode(` ${result.bodyEncoding}`));
            this.encodingInfo.appendChild(bodyEncodingDiv);
        }
        
        if (result.encodedWords.length > 0) {
            const detailDiv = document.createElement('div');
            const detailLabel = document.createElement('strong');
            detailLabel.textContent = 'エンコードされた部分:';
            detailDiv.appendChild(detailLabel);
            const wordsList = document.createElement('ul');
            
            result.encodedWords.forEach(word => {
                const listItem = document.createElement('li');
                const originalLabel = document.createElement('strong');
                originalLabel.textContent = '元のテキスト:';
                listItem.appendChild(originalLabel);
                listItem.appendChild(document.createTextNode(` ${word.original}`));
                listItem.appendChild(document.createElement('br'));

                const charsetLabel = document.createElement('strong');
                charsetLabel.textContent = '文字セット:';
                listItem.appendChild(charsetLabel);
                listItem.appendChild(document.createTextNode(` ${word.charset}`));
                listItem.appendChild(document.createElement('br'));

                const encodingLabel = document.createElement('strong');
                encodingLabel.textContent = 'エンコード:';
                listItem.appendChild(encodingLabel);
                listItem.appendChild(document.createTextNode(` ${word.encoding.toUpperCase() === 'B' ? 'Base64' : 'Quoted-Printable'}`));
                wordsList.appendChild(listItem);
            });
            
            detailDiv.appendChild(wordsList);
            this.encodingInfo.appendChild(detailDiv);
        }
    }

    showError(message) {
        this.output.textContent = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        this.output.appendChild(errorDiv);
        this.encodingInfo.textContent = '';
    }

    clearAll() {
        this.emailInput.value = '';
        this.output.textContent = '';
        this.encodingInfo.textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EmailDecoder();
});
