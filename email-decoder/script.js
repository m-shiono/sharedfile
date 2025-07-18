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
            decoded = this.decodeQuotedPrintableBody(body);
        } else if (transferEncoding.toLowerCase() === 'base64') {
            encoding = 'base64';
            decoded = this.decodeBase64Body(body);
        }
        
        // 文字エンコーディングの変換
        if (charset.toLowerCase() !== 'utf-8') {
            decoded = this.convertFromCharset(decoded, charset);
        }
        
        return {
            decoded,
            encoding,
            detectedEncodings
        };
    }

    decodeQuotedPrintableBody(body) {
        // ソフトライン区切りを除去
        let cleanBody = body.replace(/=\r?\n/g, '');
        
        // 全ての =XX パターンを抽出してバイト配列を作成
        const bytes = [];
        let currentPos = 0;
        let result = '';
        
        cleanBody.replace(/=([0-9A-Fa-f]{2})/g, (match, hex, offset) => {
            // マッチより前の通常のテキストを追加
            result += cleanBody.substring(currentPos, offset);
            
            // バイト値を配列に追加
            bytes.push(parseInt(hex, 16));
            currentPos = offset + match.length;
            
            return '';
        });
        
        // 最後の通常のテキストを追加
        result += cleanBody.substring(currentPos);
        
        // バイト配列をUTF-8として一括デコード
        if (bytes.length > 0) {
            try {
                const utf8Bytes = new Uint8Array(bytes);
                const decoder = new TextDecoder('utf-8');
                const decodedBytes = decoder.decode(utf8Bytes);
                
                // 元のテキストの =XX 部分を削除
                const textWithoutHex = cleanBody.replace(/=([0-9A-Fa-f]{2})/g, '');
                
                // エンコードされたテキストが全体の場合はデコード結果を返す
                if (textWithoutHex.length === 0) {
                    return decodedBytes;
                }
                
                // 混在している場合は、元の位置にデコード結果を挿入
                let byteIndex = 0;
                return cleanBody.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
                    return decodedBytes[byteIndex++] || '';
                });
            } catch (error) {
                // UTF-8デコードが失敗した場合は従来の方法を使用
                return cleanBody.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
                    return String.fromCharCode(parseInt(hex, 16));
                });
            }
        }
        
        return cleanBody;
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
        
        // ソフトライン区切りを除去
        text = text.replace(/=\r?\n/g, '');
        
        // 全ての =XX パターンを抽出してバイト配列を作成
        const bytes = [];
        for (const match of text.match(/=([0-9A-Fa-f]{2})/g) || []) {
            const hex = match.substring(1); // = を除去
            bytes.push(parseInt(hex, 16));
        }
        
        // バイト配列をUTF-8として一括デコード
        if (bytes.length > 0) {
            try {
                const utf8Bytes = new Uint8Array(bytes);
                const decoder = new TextDecoder('utf-8');
                const decodedBytes = decoder.decode(utf8Bytes);
                
                // 元のテキストの =XX 部分を削除
                const textWithoutHex = text.replace(/=([0-9A-Fa-f]{2})/g, '');
                
                // エンコードされたテキストが全体の場合はデコード結果を返す
                if (textWithoutHex.length === 0) {
                    return decodedBytes;
                }
                
                // 混在している場合は、元の位置にデコード結果を挿入
                let byteIndex = 0;
                return text.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
                    return decodedBytes[byteIndex++] || '';
                });
            } catch (error) {
                // UTF-8デコードが失敗した場合は従来の方法を使用
                return text.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
                    return String.fromCharCode(parseInt(hex, 16));
                });
            }
        }
        
        return text;
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
            // 既に文字列の場合、そのまま返す
            if (typeof text === 'string') {
                return text;
            }
            
            // UTF-8 バイト列をデコード
            const bytes = new Uint8Array(text.length);
            for (let i = 0; i < text.length; i++) {
                bytes[i] = text.charCodeAt(i) & 0xFF;
            }
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(bytes);
        } catch (error) {
            // UTF-8デコードが失敗した場合、そのまま返す
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