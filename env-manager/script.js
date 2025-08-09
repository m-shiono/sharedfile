class EnvManager {
    constructor() {
        this.currentTab = 'env';
        this.envData = {};
        this.templates = this.getTemplates();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSampleContent();
    }

    bindEvents() {
        this.envInput = document.getElementById('envInput');
        this.outputText = document.getElementById('outputText');
        this.statusBar = document.getElementById('statusBar');
        this.inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
        this.editorMode = document.getElementById('editorMode');
        this.formMode = document.getElementById('formMode');
        this.envForm = document.getElementById('envForm');
        this.validationResults = document.getElementById('validationResults');
        
        this.validateBtn = document.getElementById('validateBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.addRowBtn = document.getElementById('addRowBtn');
        this.clearFormBtn = document.getElementById('clearFormBtn');
        
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.templateBtns = document.querySelectorAll('.template-btn');

        this.validateBtn.addEventListener('click', () => this.validate());
        this.generateBtn.addEventListener('click', () => this.generate());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.addRowBtn.addEventListener('click', () => this.addEnvRow());
        this.clearFormBtn.addEventListener('click', () => this.clearForm());

        this.inputModeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.switchInputMode());
        });

        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        this.templateBtns.forEach(btn => {
            btn.addEventListener('click', () => this.loadTemplate(btn.dataset.template));
        });

        this.envInput.addEventListener('input', () => this.autoGenerate());
        this.bindFormEvents();
    }

    bindFormEvents() {
        this.envForm.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                this.removeEnvRow(e.target.closest('.env-row'));
            }
        });

        this.envForm.addEventListener('input', () => this.updateFromForm());
    }

    showStatus(message, type = 'info') {
        showStatus(this.statusBar, message, type);
    }

    switchInputMode() {
        const mode = document.querySelector('input[name="inputMode"]:checked').value;
        if (mode === 'editor') {
            this.editorMode.style.display = 'block';
            this.formMode.style.display = 'none';
            this.syncFormToEditor();
        } else {
            this.editorMode.style.display = 'none';
            this.formMode.style.display = 'block';
            this.syncEditorToForm();
        }
    }

    switchTab(tab) {
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        this.currentTab = tab;
        this.updateOutput();
    }

    parseEnvString(envString) {
        const lines = envString.split('\n');
        const envData = {};
        const issues = [];

        lines.forEach((line, index) => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;

            const equalIndex = line.indexOf('=');
            if (equalIndex === -1) {
                issues.push({
                    type: 'error',
                    line: index + 1,
                    message: `等号(=)がありません: ${line}`
                });
                return;
            }

            const key = line.substring(0, equalIndex).trim();
            const value = line.substring(equalIndex + 1).trim();

            if (!key) {
                issues.push({
                    type: 'error',
                    line: index + 1,
                    message: '変数名が空です'
                });
                return;
            }

            if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
                issues.push({
                    type: 'warning',
                    line: index + 1,
                    message: `変数名が推奨形式ではありません: ${key}`
                });
            }

            if (envData[key]) {
                issues.push({
                    type: 'warning',
                    line: index + 1,
                    message: `重複する変数名: ${key}`
                });
            }

            envData[key] = value;
        });

        return { envData, issues };
    }

    validate() {
        const input = this.envInput.value.trim();
        if (!input) {
            this.showStatus('入力してください', 'error');
            return;
        }

        const { envData, issues } = this.parseEnvString(input);
        this.envData = envData;

        this.displayValidationResults(issues);

        if (issues.length === 0) {
            this.showStatus('検証完了 - 問題なし', 'success');
        } else {
            const errorCount = issues.filter(i => i.type === 'error').length;
            const warningCount = issues.filter(i => i.type === 'warning').length;
            this.showStatus(`検証完了 - エラー: ${errorCount}, 警告: ${warningCount}`, errorCount > 0 ? 'error' : 'warning');
        }
    }

    displayValidationResults(issues) {
        if (issues.length === 0) {
            this.validationResults.innerHTML = '<div class="validation-item">✓ 検証に合格しました</div>';
            return;
        }

        let html = '';
        issues.forEach(issue => {
            html += `<div class="validation-item ${issue.type}">
                <strong>行 ${issue.line}:</strong> ${issue.message}
            </div>`;
        });

        this.validationResults.innerHTML = html;
    }

    generate() {
        this.validate();
        this.updateOutput();
    }

    autoGenerate() {
        if (this.envInput.value.trim()) {
            this.validate();
            this.updateOutput();
        }
    }

    updateOutput() {
        const format = this.getOutputFormat();
        this.outputText.value = format;
    }

    getOutputFormat() {
        switch (this.currentTab) {
            case 'env':
                return this.generateEnvFormat();
            case 'json':
                return this.generateJsonFormat();
            case 'yaml':
                return this.generateYamlFormat();
            case 'docker':
                return this.generateDockerFormat();
            case 'shell':
                return this.generateShellFormat();
            default:
                return '';
        }
    }

    generateEnvFormat() {
        return Object.entries(this.envData)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
    }

    generateJsonFormat() {
        return JSON.stringify(this.envData, null, 2);
    }

    generateYamlFormat() {
        let yaml = '';
        for (const [key, value] of Object.entries(this.envData)) {
            yaml += `${key}: ${this.formatYamlValue(value)}\n`;
        }
        return yaml;
    }

    formatYamlValue(value) {
        if (value === 'true' || value === 'false') return value;
        if (!isNaN(value)) return value;
        if (value.includes(' ') || value.includes(':')) return `"${value}"`;
        return value;
    }

    generateDockerFormat() {
        let docker = '# Docker Compose environment section\nenvironment:\n';
        for (const [key, value] of Object.entries(this.envData)) {
            docker += `  - ${key}=${value}\n`;
        }
        
        docker += '\n# または\n\nenvironment:\n';
        for (const [key, value] of Object.entries(this.envData)) {
            docker += `  ${key}: ${value}\n`;
        }
        
        return docker;
    }

    generateShellFormat() {
        let shell = '#!/bin/bash\n# Environment variables\n\n';
        for (const [key, value] of Object.entries(this.envData)) {
            shell += `export ${key}="${value}"\n`;
        }
        return shell;
    }

    clear() {
        this.envInput.value = '';
        this.outputText.value = '';
        this.envData = {};
        this.validationResults.innerHTML = '';
        this.clearForm();
        this.showStatus('クリア完了', 'success');
    }

    copyToClipboard() {
        copyToClipboard(this.outputText.value, (message, type) => this.showStatus(message, type));
    }

    download() {
        const content = this.outputText.value;
        if (!content) {
            this.showStatus('ダウンロードするコンテンツがありません', 'error');
            return;
        }

        const extensions = {
            env: '.env',
            json: '.json',
            yaml: '.yml',
            docker: '.docker-compose.yml',
            shell: '.sh'
        };

        const extension = extensions[this.currentTab] || '.txt';
        const filename = `environment${extension}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        this.showStatus(`${filename} をダウンロードしました`, 'success');
    }

    addEnvRow() {
        const row = document.createElement('div');
        row.className = 'env-row';
        row.innerHTML = `
            <input type="text" placeholder="変数名" class="env-key">
            <input type="text" placeholder="値" class="env-value">
            <button class="remove-btn">削除</button>
        `;
        this.envForm.appendChild(row);
    }

    removeEnvRow(row) {
        row.remove();
        this.updateFromForm();
    }

    clearForm() {
        this.envForm.innerHTML = `
            <div class="env-row">
                <input type="text" placeholder="変数名" class="env-key">
                <input type="text" placeholder="値" class="env-value">
                <button class="remove-btn">削除</button>
            </div>
        `;
    }

    updateFromForm() {
        const rows = this.envForm.querySelectorAll('.env-row');
        let envString = '';
        
        rows.forEach(row => {
            const key = row.querySelector('.env-key').value.trim();
            const value = row.querySelector('.env-value').value.trim();
            if (key && value) {
                envString += `${key}=${value}\n`;
            }
        });

        this.envInput.value = envString;
        this.autoGenerate();
    }

    syncEditorToForm() {
        const lines = this.envInput.value.split('\n');
        this.envForm.innerHTML = '';

        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;

            const equalIndex = line.indexOf('=');
            if (equalIndex === -1) return;

            const key = line.substring(0, equalIndex).trim();
            const value = line.substring(equalIndex + 1).trim();

            if (key) {
                const row = document.createElement('div');
                row.className = 'env-row';
                row.innerHTML = `
                    <input type="text" placeholder="変数名" class="env-key" value="${key}">
                    <input type="text" placeholder="値" class="env-value" value="${value}">
                    <button class="remove-btn">削除</button>
                `;
                this.envForm.appendChild(row);
            }
        });

        if (this.envForm.children.length === 0) {
            this.addEnvRow();
        }
    }

    syncFormToEditor() {
        this.updateFromForm();
    }

    loadSampleContent() {
        const sample = `NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
REDIS_URL=redis://localhost:6379
PORT=3000
JWT_SECRET=your-jwt-secret-here
DEBUG=false
LOG_LEVEL=info
MAX_CONNECTIONS=100`;

        this.envInput.value = sample;
        this.autoGenerate();
    }

    loadTemplate(templateName) {
        const template = this.templates[templateName];
        if (template) {
            this.envInput.value = template;
            this.autoGenerate();
            this.syncEditorToForm();
        }
    }

    getTemplates() {
        return {
            nodejs: `NODE_ENV=production
PORT=3000
HOST=localhost
DEBUG=false
LOG_LEVEL=info
SESSION_SECRET=your-session-secret
CORS_ORIGIN=http://localhost:3000`,

            database: `DATABASE_URL=postgresql://user:password@localhost:5432/myapp
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=user
DB_PASSWORD=password
DB_SSL=false
DB_POOL_SIZE=10
DB_TIMEOUT=30000`,

            redis: `REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
REDIS_RETRY_ATTEMPTS=3`,

            aws: `AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_CLOUDFRONT_DISTRIBUTION=your-distribution-id
AWS_SES_REGION=us-east-1
AWS_LAMBDA_TIMEOUT=30`,

            security: `JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CSRF_SECRET=your-csrf-secret
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
SECURE_COOKIES=true`,

            email: `SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
EMAIL_REPLY_TO=support@yourapp.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...`
        };
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new EnvManager();
});