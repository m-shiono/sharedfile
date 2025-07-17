class LogParser {
    constructor() {
        this.logData = [];
        this.parsedLogs = [];
        this.filteredLogs = [];
        this.currentFormat = 'apache-access';
        this.currentRegex = null;
        
        this.logInput = document.getElementById('logInput');
        this.logFile = document.getElementById('logFile');
        this.loadFileBtn = document.getElementById('loadFileBtn');
        this.fieldSelect = document.getElementById('fieldSelect');
        this.filterRegex = document.getElementById('filterRegex');
        this.resultsSummary = document.getElementById('resultsSummary');
        this.parsedLogs = document.getElementById('parsedLogs');
        this.statsContainer = document.getElementById('statsContainer');
        this.filteredLogs = document.getElementById('filteredLogs');
        this.exportFormat = document.getElementById('exportFormat');
        
        this.logFormats = {
            'apache-access': {
                name: 'Apache アクセスログ',
                pattern: /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) ([^"]*)" (\d+) (\d+|-) "([^"]*)" "([^"]*)"$/,
                fields: ['ip', 'timestamp', 'method', 'url', 'status', 'size', 'referer', 'user_agent']
            },
            'nginx-access': {
                name: 'Nginx アクセスログ',
                pattern: /^(\S+) - - \[([^\]]+)\] "(\S+) ([^"]*)" (\d+) (\d+|-) "([^"]*)" "([^"]*)"$/,
                fields: ['ip', 'timestamp', 'method', 'url', 'status', 'size', 'referer', 'user_agent']
            },
            'apache-error': {
                name: 'Apache エラーログ',
                pattern: /^\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] (.+)$/,
                fields: ['timestamp', 'level', 'client', 'message']
            },
            'nginx-error': {
                name: 'Nginx エラーログ',
                pattern: /^(\S+) \[([^\]]+)\] (\d+)#\d+: (.+)$/,
                fields: ['timestamp', 'level', 'pid', 'message']
            },
            'custom': {
                name: 'カスタムフォーマット',
                pattern: null,
                fields: ['raw']
            }
        };
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Input method selection
        document.querySelectorAll('input[name="inputMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.toggleInputMethod(e.target.value));
        });
        
        // Log format selection
        document.querySelectorAll('.format-buttons button').forEach(button => {
            button.addEventListener('click', (e) => this.selectFormat(e.target.dataset.format));
        });
        
        // File input
        this.loadFileBtn.addEventListener('click', () => this.logFile.click());
        this.logFile.addEventListener('change', (e) => this.loadFile(e.target.files[0]));
        
        // Parse and filter buttons
        document.getElementById('parseBtn').addEventListener('click', () => this.parseLog());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('applyFilterBtn').addEventListener('click', () => this.applyFilter());
        
        // Quick filters
        document.querySelectorAll('.quick-filter-buttons button').forEach(button => {
            button.addEventListener('click', (e) => this.applyQuickFilter(e.target.dataset.filter));
        });
        
        // Tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResults());
        
        // Regex tester integration
        document.getElementById('sendToRegexTester').addEventListener('click', () => this.sendToRegexTester());
        document.getElementById('importFromRegexTester').addEventListener('click', () => this.importFromRegexTester());
        
        // Real-time regex validation
        this.filterRegex.addEventListener('input', () => this.validateRegex());
        
        // Flag checkboxes
        document.querySelectorAll('.flag-label input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validateRegex());
        });
        
        // Initialize format selection
        this.selectFormat('apache-access');
    }
    
    toggleInputMethod(method) {
        if (method === 'file') {
            this.logInput.style.display = 'none';
            this.loadFileBtn.style.display = 'block';
        } else {
            this.logInput.style.display = 'block';
            this.loadFileBtn.style.display = 'none';
        }
    }
    
    selectFormat(format) {
        this.currentFormat = format;
        
        // Update button states
        document.querySelectorAll('.format-buttons button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-format="${format}"]`).classList.add('active');
        
        // Update field select options
        this.updateFieldSelect();
        
        // Update placeholder text
        this.updatePlaceholderText();
    }
    
    updateFieldSelect() {
        const fields = this.logFormats[this.currentFormat].fields;
        this.fieldSelect.innerHTML = '<option value="all">全体</option>';
        
        fields.forEach(field => {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = this.getFieldDisplayName(field);
            this.fieldSelect.appendChild(option);
        });
    }
    
    getFieldDisplayName(field) {
        const displayNames = {
            'ip': 'IPアドレス',
            'timestamp': 'タイムスタンプ',
            'method': 'HTTPメソッド',
            'url': 'URL',
            'status': 'ステータスコード',
            'size': 'サイズ',
            'referer': 'リファラー',
            'user_agent': 'ユーザーエージェント',
            'level': 'レベル',
            'client': 'クライアント',
            'message': 'メッセージ',
            'pid': 'プロセスID',
            'raw': '生データ'
        };
        return displayNames[field] || field;
    }
    
    updatePlaceholderText() {
        const examples = {
            'apache-access': `ログデータを入力してください...

例（Apache アクセスログ）:
192.168.1.1 - - [25/Dec/2023:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 2326 "https://example.com/" "Mozilla/5.0"
192.168.1.2 - - [25/Dec/2023:10:00:01 +0000] "POST /api/login HTTP/1.1" 403 1234 "-" "curl/7.68.0"
192.168.1.3 - - [25/Dec/2023:10:00:02 +0000] "GET /admin/ HTTP/1.1" 404 567 "-" "Mozilla/5.0"`,
            
            'nginx-access': `ログデータを入力してください...

例（Nginx アクセスログ）:
192.168.1.1 - - [25/Dec/2023:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 2326 "https://example.com/" "Mozilla/5.0"
192.168.1.2 - - [25/Dec/2023:10:00:01 +0000] "POST /api/login HTTP/1.1" 403 1234 "-" "curl/7.68.0"
192.168.1.3 - - [25/Dec/2023:10:00:02 +0000] "GET /admin/ HTTP/1.1" 404 567 "-" "Mozilla/5.0"`,
            
            'apache-error': `ログデータを入力してください...

例（Apache エラーログ）:
[Mon Dec 25 10:00:00 2023] [error] [client 192.168.1.1] File does not exist: /var/www/html/test.php
[Mon Dec 25 10:00:01 2023] [warn] [client 192.168.1.2] Invalid request method
[Mon Dec 25 10:00:02 2023] [crit] [client 192.168.1.3] SSL handshake failed`,
            
            'nginx-error': `ログデータを入力してください...

例（Nginx エラーログ）:
2023/12/25 10:00:00 [error] 1234#0: *1 open() "/var/www/html/test.php" failed (2: No such file or directory)
2023/12/25 10:00:01 [warn] 1234#0: *2 client sent invalid request
2023/12/25 10:00:02 [crit] 1234#0: *3 SSL_do_handshake() failed`,
            
            'custom': `ログデータを入力してください...

カスタムフォーマットモードでは、各行がそのまま処理されます。`
        };
        
        this.logInput.placeholder = examples[this.currentFormat] || examples['custom'];
    }
    
    loadFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.logInput.value = e.target.result;
            this.parseLog();
        };
        reader.readAsText(file);
    }
    
    parseLog() {
        const logText = this.logInput.value.trim();
        if (!logText) {
            this.showError('ログデータを入力してください');
            return;
        }
        
        const lines = logText.split('\n').filter(line => line.trim());
        this.logData = lines;
        this.parsedLogs = [];
        
        const format = this.logFormats[this.currentFormat];
        
        if (this.currentFormat === 'custom') {
            this.parsedLogs = lines.map((line, index) => ({
                lineNumber: index + 1,
                raw: line,
                fields: { raw: line }
            }));
        } else {
            lines.forEach((line, index) => {
                const match = line.match(format.pattern);
                if (match) {
                    const fields = {};
                    format.fields.forEach((field, i) => {
                        fields[field] = match[i + 1] || '';
                    });
                    
                    this.parsedLogs.push({
                        lineNumber: index + 1,
                        raw: line,
                        fields: fields
                    });
                } else {
                    this.parsedLogs.push({
                        lineNumber: index + 1,
                        raw: line,
                        fields: { raw: line },
                        parseError: true
                    });
                }
            });
        }
        
        this.displayResults();
        this.generateStats();
        this.switchTab('parsed');
    }
    
    displayResults() {
        const totalLines = this.logData.length;
        const parsedLines = this.parsedLogs.filter(log => !log.parseError).length;
        const errorLines = totalLines - parsedLines;
        
        this.resultsSummary.innerHTML = `
            <strong>解析結果</strong><br>
            総行数: ${totalLines}行 | 
            解析成功: ${parsedLines}行 | 
            解析エラー: ${errorLines}行
        `;
        
        this.displayParsedLogs();
    }
    
    displayParsedLogs() {
        let html = '';
        
        this.parsedLogs.forEach(log => {
            const cssClass = this.getLogCssClass(log);
            html += `<div class="log-entry ${cssClass}">`;
            html += `<div style="font-weight: bold; margin-bottom: 0.5rem;">行 ${log.lineNumber}</div>`;
            
            if (log.parseError) {
                html += `<div style="color: #d32f2f; margin-bottom: 0.5rem;">解析エラー</div>`;
                html += `<div>${this.escapeHtml(log.raw)}</div>`;
            } else {
                Object.entries(log.fields).forEach(([field, value]) => {
                    if (value && value !== '-') {
                        html += `<span class="log-field">${this.getFieldDisplayName(field)}: ${this.escapeHtml(value)}</span>`;
                    }
                });
            }
            
            html += '</div>';
        });
        
        this.parsedLogs.innerHTML = html || '<p>解析されたログがありません</p>';
    }
    
    getLogCssClass(log) {
        if (log.parseError) return 'error';
        
        const status = log.fields.status;
        const level = log.fields.level;
        
        if (status) {
            if (status.startsWith('2')) return 'success';
            if (status.startsWith('4') || status.startsWith('5')) return 'error';
        }
        
        if (level) {
            if (level.includes('error') || level.includes('crit')) return 'error';
            if (level.includes('warn')) return 'warning';
        }
        
        return '';
    }
    
    generateStats() {
        const stats = {
            総行数: this.logData.length,
            解析成功: this.parsedLogs.filter(log => !log.parseError).length,
            解析エラー: this.parsedLogs.filter(log => log.parseError).length
        };
        
        // IP統計
        const ipCounts = {};
        // ステータスコード統計
        const statusCounts = {};
        // メソッド統計
        const methodCounts = {};
        // エラーレベル統計
        const levelCounts = {};
        
        this.parsedLogs.forEach(log => {
            if (log.parseError) return;
            
            const fields = log.fields;
            
            if (fields.ip) {
                ipCounts[fields.ip] = (ipCounts[fields.ip] || 0) + 1;
            }
            
            if (fields.status) {
                statusCounts[fields.status] = (statusCounts[fields.status] || 0) + 1;
            }
            
            if (fields.method) {
                methodCounts[fields.method] = (methodCounts[fields.method] || 0) + 1;
            }
            
            if (fields.level) {
                levelCounts[fields.level] = (levelCounts[fields.level] || 0) + 1;
            }
        });
        
        let html = '';
        
        // 基本統計
        html += '<div class="stat-card"><h3>基本統計</h3>';
        Object.entries(stats).forEach(([key, value]) => {
            html += `<div class="stat-item"><span>${key}</span><span class="stat-value">${value}</span></div>`;
        });
        html += '</div>';
        
        // IP統計
        if (Object.keys(ipCounts).length > 0) {
            html += '<div class="stat-card"><h3>IPアドレス統計</h3>';
            Object.entries(ipCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .forEach(([ip, count]) => {
                    html += `<div class="stat-item"><span>${ip}</span><span class="stat-value">${count}</span></div>`;
                });
            html += '</div>';
        }
        
        // ステータスコード統計
        if (Object.keys(statusCounts).length > 0) {
            html += '<div class="stat-card"><h3>ステータスコード統計</h3>';
            Object.entries(statusCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([status, count]) => {
                    html += `<div class="stat-item"><span>${status}</span><span class="stat-value">${count}</span></div>`;
                });
            html += '</div>';
        }
        
        // メソッド統計
        if (Object.keys(methodCounts).length > 0) {
            html += '<div class="stat-card"><h3>HTTPメソッド統計</h3>';
            Object.entries(methodCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([method, count]) => {
                    html += `<div class="stat-item"><span>${method}</span><span class="stat-value">${count}</span></div>`;
                });
            html += '</div>';
        }
        
        // エラーレベル統計
        if (Object.keys(levelCounts).length > 0) {
            html += '<div class="stat-card"><h3>エラーレベル統計</h3>';
            Object.entries(levelCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([level, count]) => {
                    html += `<div class="stat-item"><span>${level}</span><span class="stat-value">${count}</span></div>`;
                });
            html += '</div>';
        }
        
        this.statsContainer.innerHTML = html;
    }
    
    validateRegex() {
        const pattern = this.filterRegex.value;
        
        if (!pattern) {
            this.currentRegex = null;
            return;
        }
        
        const flags = this.getFlags();
        
        try {
            this.currentRegex = new RegExp(pattern, flags);
            this.filterRegex.style.borderColor = '#4caf50';
        } catch (error) {
            this.currentRegex = null;
            this.filterRegex.style.borderColor = '#f44336';
        }
    }
    
    getFlags() {
        let flags = '';
        if (document.getElementById('flagGlobal').checked) flags += 'g';
        if (document.getElementById('flagIgnoreCase').checked) flags += 'i';
        if (document.getElementById('flagMultiline').checked) flags += 'm';
        return flags;
    }
    
    applyFilter() {
        if (!this.parsedLogs.length) {
            this.showError('まずログを解析してください');
            return;
        }
        
        const selectedField = this.fieldSelect.value;
        const regex = this.currentRegex;
        
        this.filteredLogs = this.parsedLogs.filter(log => {
            if (log.parseError) return false;
            
            let textToTest = '';
            
            if (selectedField === 'all') {
                textToTest = log.raw;
            } else {
                textToTest = log.fields[selectedField] || '';
            }
            
            if (!regex) {
                return true; // フィルタなしの場合は全て表示
            }
            
            return regex.test(textToTest);
        });
        
        this.displayFilteredLogs();
        this.switchTab('filtered');
    }
    
    applyQuickFilter(filterType) {
        if (!this.parsedLogs.length) {
            this.showError('まずログを解析してください');
            return;
        }
        
        const filters = {
            'error': (log) => {
                const status = log.fields.status;
                const level = log.fields.level;
                return (status && (status.startsWith('4') || status.startsWith('5'))) ||
                       (level && (level.includes('error') || level.includes('crit')));
            },
            'success': (log) => {
                const status = log.fields.status;
                return status && status.startsWith('2');
            },
            'ip': (log) => {
                return log.fields.ip && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(log.fields.ip);
            },
            'suspicious': (log) => {
                const url = log.fields.url || '';
                const userAgent = log.fields.user_agent || '';
                return url.includes('admin') || url.includes('login') || url.includes('wp-') ||
                       userAgent.includes('bot') || userAgent.includes('crawler');
            },
            'today': (log) => {
                const today = new Date().toISOString().split('T')[0];
                return log.fields.timestamp && log.fields.timestamp.includes(today);
            }
        };
        
        const filterFunc = filters[filterType];
        if (filterFunc) {
            this.filteredLogs = this.parsedLogs.filter(log => !log.parseError && filterFunc(log));
            this.displayFilteredLogs();
            this.switchTab('filtered');
        }
    }
    
    displayFilteredLogs() {
        let html = '';
        
        this.filteredLogs.forEach(log => {
            const cssClass = this.getLogCssClass(log);
            html += `<div class="log-entry ${cssClass}">`;
            html += `<div style="font-weight: bold; margin-bottom: 0.5rem;">行 ${log.lineNumber}</div>`;
            
            Object.entries(log.fields).forEach(([field, value]) => {
                if (value && value !== '-') {
                    html += `<span class="log-field">${this.getFieldDisplayName(field)}: ${this.escapeHtml(value)}</span>`;
                }
            });
            
            html += '</div>';
        });
        
        this.filteredLogs.innerHTML = html || '<p>フィルタ条件に一致するログがありません</p>';
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    exportResults() {
        const format = this.exportFormat.value;
        const logs = this.filteredLogs.length > 0 ? this.filteredLogs : this.parsedLogs;
        
        if (!logs.length) {
            this.showError('エクスポートするデータがありません');
            return;
        }
        
        let content = '';
        let filename = `log-analysis.${format}`;
        let mimeType = 'text/plain';
        
        switch (format) {
            case 'json':
                content = JSON.stringify(logs, null, 2);
                mimeType = 'application/json';
                break;
            case 'csv':
                content = this.convertToCSV(logs);
                mimeType = 'text/csv';
                break;
            case 'txt':
                content = logs.map(log => log.raw).join('\n');
                mimeType = 'text/plain';
                break;
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    convertToCSV(logs) {
        if (!logs.length) return '';
        
        const fields = Object.keys(logs[0].fields);
        const header = ['lineNumber', ...fields].join(',');
        const rows = logs.map(log => {
            const values = [log.lineNumber, ...fields.map(field => log.fields[field] || '')];
            return values.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
        });
        
        return [header, ...rows].join('\n');
    }
    
    sendToRegexTester() {
        const regex = this.filterRegex.value;
        const testText = this.parsedLogs.map(log => log.raw).join('\n');
        
        if (!regex && !testText) {
            this.showError('正規表現またはテストデータが必要です');
            return;
        }
        
        const params = new URLSearchParams();
        if (regex) params.append('pattern', regex);
        if (testText) params.append('text', testText);
        
        const url = `../regex-tester/index.html${params.toString() ? '?' + params.toString() : ''}`;
        window.open(url, '_blank');
    }
    
    importFromRegexTester() {
        const urlParams = new URLSearchParams(window.location.search);
        const pattern = urlParams.get('pattern');
        const text = urlParams.get('text');
        
        if (pattern) {
            this.filterRegex.value = pattern;
            this.validateRegex();
        }
        
        if (text) {
            this.logInput.value = text;
        }
        
        if (pattern || text) {
            this.showSuccess('正規表現テスターからデータを取り込みました');
        } else {
            this.showError('取り込むデータが見つかりません');
        }
    }
    
    clearAll() {
        this.logInput.value = '';
        this.filterRegex.value = '';
        this.logData = [];
        this.parsedLogs = [];
        this.filteredLogs = [];
        this.currentRegex = null;
        
        this.resultsSummary.innerHTML = '';
        this.parsedLogs.innerHTML = '';
        this.statsContainer.innerHTML = '';
        this.filteredLogs.innerHTML = '';
        
        document.querySelectorAll('.flag-label input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.fieldSelect.value = 'all';
        this.filterRegex.style.borderColor = '#ddd';
        
        this.switchTab('parsed');
    }
    
    showError(message) {
        this.resultsSummary.innerHTML = `<div style="color: #d32f2f; font-weight: bold;">${message}</div>`;
    }
    
    showSuccess(message) {
        this.resultsSummary.innerHTML = `<div style="color: #4caf50; font-weight: bold;">${message}</div>`;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LogParser();
});