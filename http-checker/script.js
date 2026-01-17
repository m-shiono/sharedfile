class HTTPChecker {
    constructor() {
        this.urlInput = document.getElementById('urlInput');
        this.checkBtn = document.getElementById('checkBtn');
        this.followRedirects = document.getElementById('followRedirects');
        this.includeHeaders = document.getElementById('includeHeaders');
        this.statusBar = document.getElementById('statusBar');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.results = document.getElementById('results');
        this.basicInfo = document.getElementById('basicInfo');
        this.statusDetails = document.getElementById('statusDetails');
        this.securityHeaders = document.getElementById('securityHeaders');
        this.responseHeaders = document.getElementById('responseHeaders');

        this.initializeEventListeners();
        this.initializeStatusCodeDescriptions();
        this.initializeSecurityHeadersInfo();
    }

    initializeEventListeners() {
        this.checkBtn.addEventListener('click', () => this.performCheck());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performCheck();
            }
        });
    }

    initializeStatusCodeDescriptions() {
        this.statusCodes = {
            200: { name: 'OK', description: 'リクエストが成功しました。レスポンスの内容は要求されたリソースに依存します。', category: 'success' },
            201: { name: 'Created', description: 'リクエストが成功し、新しいリソースが作成されました。', category: 'success' },
            204: { name: 'No Content', description: 'リクエストは成功しましたが、返すべきコンテンツがありません。', category: 'success' },
            301: { name: 'Moved Permanently', description: 'リクエストされたリソースは永続的に別のURLに移動しました。', category: 'redirect' },
            302: { name: 'Found', description: 'リクエストされたリソースは一時的に別のURLに存在します。', category: 'redirect' },
            304: { name: 'Not Modified', description: 'リソースが変更されていません。キャッシュされたバージョンを使用してください。', category: 'redirect' },
            400: { name: 'Bad Request', description: 'リクエストの構文が正しくありません。', category: 'error' },
            401: { name: 'Unauthorized', description: '認証が必要です。', category: 'error' },
            403: { name: 'Forbidden', description: 'アクセス権限がありません。', category: 'error' },
            404: { name: 'Not Found', description: 'リクエストされたリソースが見つかりません。', category: 'error' },
            405: { name: 'Method Not Allowed', description: 'このリソースではこのHTTPメソッドは許可されていません。', category: 'error' },
            429: { name: 'Too Many Requests', description: 'レート制限に達しました。しばらく待ってから再試行してください。', category: 'error' },
            500: { name: 'Internal Server Error', description: 'サーバー内部エラーが発生しました。', category: 'error' },
            502: { name: 'Bad Gateway', description: 'ゲートウェイまたはプロキシサーバーが無効なレスポンスを受信しました。', category: 'error' },
            503: { name: 'Service Unavailable', description: 'サーバーは現在利用できません。', category: 'error' },
            504: { name: 'Gateway Timeout', description: 'ゲートウェイタイムアウトが発生しました。', category: 'error' }
        };
    }

    initializeSecurityHeadersInfo() {
        this.securityHeaders = {
            'strict-transport-security': {
                name: 'HTTP Strict Transport Security (HSTS)',
                description: 'HTTPSを強制し、プロトコルダウングレード攻撃を防ぎます。',
                required: true
            },
            'content-security-policy': {
                name: 'Content Security Policy (CSP)',
                description: 'XSS攻撃を防ぐためのコンテンツセキュリティポリシーを設定します。',
                required: true
            },
            'x-frame-options': {
                name: 'X-Frame-Options',
                description: 'クリックジャッキング攻撃を防ぎます。',
                required: true
            },
            'x-content-type-options': {
                name: 'X-Content-Type-Options',
                description: 'MIMEタイプスニッフィング攻撃を防ぎます。',
                required: true
            },
            'referrer-policy': {
                name: 'Referrer Policy',
                description: 'リファラー情報の送信を制御します。',
                required: false
            },
            'permissions-policy': {
                name: 'Permissions Policy',
                description: 'ブラウザAPI の使用を制限します。',
                required: false
            }
        };
    }

    showStatus(message, type = 'info') {
        showStatus(this.statusBar, message, type);
    }

    clearStatus() {
        this.statusBar.textContent = '';
        this.statusBar.className = 'status-bar';
    }

    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
        this.results.classList.add('hidden');
        this.checkBtn.disabled = true;
    }

    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
        this.results.classList.remove('hidden');
        this.checkBtn.disabled = false;
    }

    validateURL(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (error) {
            return false;
        }
    }

    async performCheck() {
        const url = this.urlInput.value.trim();

        if (!url) {
            this.showStatus('URLを入力してください。', 'error');
            return;
        }

        if (!this.validateURL(url)) {
            this.showStatus('有効なURLを入力してください。(http://またはhttps://)', 'error');
            return;
        }

        this.showLoading();
        this.clearStatus();

        try {
            const response = await this.fetchWithTimeout(url);
            this.displayResults(response, url);
            this.showStatus('チェック完了', 'success');
        } catch (error) {
            this.hideLoading();
            this.showStatus(`エラー: ${error.message}`, 'error');
        }
    }

    async fetchWithTimeout(url, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                mode: 'cors',
                method: 'GET',
                redirect: this.followRedirects.checked ? 'follow' : 'manual'
            });

            clearTimeout(timeoutId);

            // レスポンスヘッダーを収集
            const headers = {};
            for (const [key, value] of response.headers.entries()) {
                headers[key.toLowerCase()] = value;
            }

            return {
                url: response.url,
                status: response.status,
                statusText: response.statusText,
                headers: headers,
                redirected: response.redirected,
                type: response.type,
                ok: response.ok
            };
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('リクエストがタイムアウトしました。');
            }
            throw error;
        }
    }

    displayResults(response, originalUrl) {
        this.hideLoading();

        // 基本情報を表示
        this.displayBasicInfo(response, originalUrl);

        // ステータスコード詳細を表示
        this.displayStatusDetails(response);

        // セキュリティヘッダーを検証
        this.displaySecurityHeaders(response.headers);

        // レスポンスヘッダーを表示
        if (this.includeHeaders.checked) {
            this.displayResponseHeaders(response.headers);
        }
    }

    displayBasicInfo(response, originalUrl) {
        const info = [
            `リクエストURL: ${this.escapeHtml(originalUrl)}`,
            `最終URL: ${this.escapeHtml(response.url)}`,
            `ステータスコード: ${response.status}`,
            `ステータステキスト: ${this.escapeHtml(response.statusText)}`,
            `レスポンスタイプ: ${this.escapeHtml(response.type)}`,
            `リダイレクト: ${response.redirected ? 'はい' : 'いいえ'}`
        ];

        this.basicInfo.innerHTML = info.map(item => `<div>${item}</div>`).join('');
    }

    displayStatusDetails(response) {
        const statusInfo = this.statusCodes[response.status] || {
            name: 'Unknown',
            description: 'このステータスコードの詳細情報は利用できません。',
            category: 'error'
        };

        const statusCodeClass = `status-${statusInfo.category}-code`;

        this.statusDetails.innerHTML = `
            <div class="status-code ${statusCodeClass}">
                ${response.status} ${statusInfo.name}
            </div>
            <div class="status-description">
                ${statusInfo.description}
            </div>
            <div class="status-category">
                カテゴリ: ${this.getCategoryName(statusInfo.category)}
            </div>
        `;
    }

    getCategoryName(category) {
        const categories = {
            success: '成功',
            redirect: 'リダイレクト',
            error: 'エラー'
        };
        return categories[category] || 'その他';
    }

    displaySecurityHeaders(headers) {
        const checks = [];

        Object.entries(this.securityHeaders).forEach(([headerName, headerInfo]) => {
            const isPresent = headers.hasOwnProperty(headerName);
            const status = isPresent ? 'pass' : (headerInfo.required ? 'fail' : 'warning');
            const icon = isPresent ? '✓' : (headerInfo.required ? '✗' : '⚠');
            const message = isPresent ?
                `${headerInfo.name}: 設定済み` :
                `${headerInfo.name}: ${headerInfo.required ? '必須ヘッダーが不足' : '推奨ヘッダーが不足'}`;

            checks.push(`
                <div class="security-check ${status}">
                    <span class="security-check-icon">${icon}</span>
                    <span>${message}</span>
                </div>
            `);
        });

        // CORS ヘッダーもチェック
        if (headers['access-control-allow-origin']) {
            checks.push(`
                <div class="security-check pass">
                    <span class="security-check-icon">✓</span>
                    <span>CORS: Access-Control-Allow-Origin が設定済み</span>
                </div>
            `);
        }

        this.securityHeaders.innerHTML = checks.join('');
    }

    displayResponseHeaders(headers) {
        if (Object.keys(headers).length === 0) {
            this.responseHeaders.innerHTML = '<div>レスポンスヘッダーが取得できませんでした。</div>';
            return;
        }

        const headerItems = Object.entries(headers).map(([name, value]) => `
            <div class="header-item">
                <div class="header-name">${this.escapeHtml(name)}</div>
                <div class="header-value">${this.escapeHtml(value)}</div>
            </div>
        `).join('');

        this.responseHeaders.innerHTML = headerItems;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HTTPChecker();

    // URLの例を設定
    const urlInput = document.getElementById('urlInput');
    urlInput.placeholder = 'チェックするURLを入力してください... (例: https://example.com)';
});