class YamlJsonConverter {
    constructor() {
        this.templates = this.getTemplates();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSampleContent();
    }

    bindEvents() {
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.formatBtn = document.getElementById('formatBtn');
        this.sampleBtn = document.getElementById('sampleBtn');
        this.statusBar = document.getElementById('statusBar');
        this.inputFormatRadios = document.querySelectorAll('input[name="inputFormat"]');
        this.templateBtns = document.querySelectorAll('.template-btn');

        this.convertBtn.addEventListener('click', () => this.convert());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.formatBtn.addEventListener('click', () => this.formatOutput());
        this.sampleBtn.addEventListener('click', () => this.loadSampleContent());

        this.inputFormatRadios.forEach(radio => {
            radio.addEventListener('change', () => this.onFormatChange());
        });

        this.templateBtns.forEach(btn => {
            btn.addEventListener('click', () => this.loadTemplate(btn.dataset.template));
        });

        this.inputText.addEventListener('input', () => this.autoConvert());
    }

    showStatus(message, type = 'info') {
        this.showStatusInternal(this.statusBar, message, type);
    }

    showStatusInternal(statusBarElement, message, type = 'info') {
        if (!statusBarElement) return;
        statusBarElement.textContent = message;
        statusBarElement.className = `status-bar status-${type}`;
    }

    getInputFormat() {
        return document.querySelector('input[name="inputFormat"]:checked').value;
    }

    onFormatChange() {
        this.convert();
    }

    convert() {
        const input = this.inputText.value.trim();
        if (!input) {
            this.outputText.value = '';
            this.showStatus('入力してください', 'error');
            return;
        }

        try {
            const inputFormat = this.getInputFormat();
            let result;

            if (inputFormat === 'yaml') {
                // YAML to JSON
                const parsed = jsyaml.load(input);
                result = JSON.stringify(parsed, null, 2);
                this.showStatus('YAML → JSON 変換完了', 'success');
            } else {
                // JSON to YAML
                const parsed = JSON.parse(input);
                result = jsyaml.dump(parsed, {
                    indent: 2,
                    lineWidth: 80,
                    noRefs: true,
                    sortKeys: false
                });
                this.showStatus('JSON → YAML 変換完了', 'success');
            }

            this.outputText.value = result;
        } catch (error) {
            this.showStatus(`変換エラー: ${error.message}`, 'error');
            this.outputText.value = '';
        }
    }

    autoConvert() {
        if (this.inputText.value.trim()) {
            this.convert();
        }
    }

    clear() {
        this.inputText.value = '';
        this.outputText.value = '';
        this.showStatus('クリア完了', 'success');
    }

    async copyToClipboard() {
        const text = this.outputText.value;
        if (!text) {
            this.showStatus('コピーするデータがありません', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showStatus('クリップボードにコピーしました', 'success');
        } catch (error) {
            this.fallbackCopyTextToClipboard(text);
        }
    }

    fallbackCopyTextToClipboard(text) {
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
            this.showStatus('クリップボードにコピーしました', 'success');
        } catch (error) {
            this.showStatus('コピーに失敗しました', 'error');
        }

        document.body.removeChild(textArea);
    }

    formatOutput() {
        const output = this.outputText.value.trim();
        if (!output) {
            this.showStatus('出力がありません', 'error');
            return;
        }

        try {
            const inputFormat = this.getInputFormat();
            let formatted;

            if (inputFormat === 'yaml') {
                // JSON を再フォーマット
                const parsed = JSON.parse(output);
                formatted = JSON.stringify(parsed, null, 2);
            } else {
                // YAML を再フォーマット
                const parsed = jsyaml.load(output);
                formatted = jsyaml.dump(parsed, {
                    indent: 2,
                    lineWidth: 80,
                    noRefs: true,
                    sortKeys: false
                });
            }

            this.outputText.value = formatted;
            this.showStatus('フォーマット完了', 'success');
        } catch (error) {
            this.showStatus(`フォーマットエラー: ${error.message}`, 'error');
        }
    }

    loadSampleContent() {
        const sampleYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: sample-config
  namespace: default
data:
  database_url: "postgresql://user:pass@localhost/db"
  redis_url: "redis://localhost:6379"
  debug: "true"
  max_connections: "100"`;

        this.inputText.value = sampleYaml;
        this.convert();
    }

    loadTemplate(templateName) {
        const template = this.templates[templateName];
        if (template) {
            this.inputText.value = template;
            this.convert();
        }
    }

    getTemplates() {
        return {
            'docker-compose': `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:`,

            'k8s-pod': `apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
    env:
    - name: ENV
      value: "production"
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"`,

            'k8s-service': `apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer`,

            'k8s-deployment': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"`,

            'github-actions': `name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to production
      run: echo "Deploying to production..."`,

            'ansible': `---
- name: Web Server Setup
  hosts: webservers
  become: yes
  vars:
    nginx_port: 80
    app_user: webapp
    
  tasks:
    - name: Install Nginx
      package:
        name: nginx
        state: present
    
    - name: Create app user
      user:
        name: "{{ app_user }}"
        system: yes
        shell: /bin/bash
    
    - name: Configure Nginx
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        backup: yes
      notify: restart nginx
    
    - name: Start and enable Nginx
      systemd:
        name: nginx
        state: started
        enabled: yes
  
  handlers:
    - name: restart nginx
      systemd:
        name: nginx
        state: restarted`
        };
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new YamlJsonConverter();
});