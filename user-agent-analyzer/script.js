// DOM要素
const currentUserAgentElement = document.getElementById('current-user-agent');
const userAgentInput = document.getElementById('user-agent-input');
const analyzeBtn = document.getElementById('analyze-btn');
const analyzeCurrentBtn = document.getElementById('analyze-current-btn');
const clearBtn = document.getElementById('clear-btn');
const sampleBtn = document.getElementById('sample-btn');
const resultsSection = document.getElementById('results-section');
const browserInfo = document.getElementById('browser-info');
const osInfo = document.getElementById('os-info');
const deviceInfo = document.getElementById('device-info');
const engineInfo = document.getElementById('engine-info');
const detailedInfo = document.getElementById('detailed-info');
const uaComponents = document.getElementById('ua-components');

// User-Agent分析クラス
class UserAgentAnalyzer {
    constructor(userAgent) {
        this.ua = userAgent;
        this.analysis = this.analyze();
    }

    analyze() {
        return {
            browser: this.detectBrowser(),
            os: this.detectOS(),
            device: this.detectDevice(),
            engine: this.detectEngine(),
            components: this.parseComponents()
        };
    }

    detectBrowser() {
        const ua = this.ua;

        // Chrome系の判定
        if (/Edg\//.test(ua)) {
            const version = this.extractVersion(ua, /Edg\/([\d.]+)/);
            return {
                name: 'Microsoft Edge',
                version: version,
                type: 'Chromium系'
            };
        }

        if (/OPR\//.test(ua)) {
            const version = this.extractVersion(ua, /OPR\/([\d.]+)/);
            return {
                name: 'Opera',
                version: version,
                type: 'Chromium系'
            };
        }

        if (/Chrome\//.test(ua) && !/Chromium\//.test(ua)) {
            const version = this.extractVersion(ua, /Chrome\/([\d.]+)/);
            return {
                name: 'Google Chrome',
                version: version,
                type: 'Chromium系'
            };
        }

        if (/Chromium\//.test(ua)) {
            const version = this.extractVersion(ua, /Chromium\/([\d.]+)/);
            return {
                name: 'Chromium',
                version: version,
                type: 'Chromium系'
            };
        }

        // Safari
        if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
            const version = this.extractVersion(ua, /Version\/([\d.]+)/) ||
                this.extractVersion(ua, /Safari\/([\d.]+)/);
            return {
                name: 'Safari',
                version: version,
                type: 'WebKit系'
            };
        }

        // Firefox
        if (/Firefox\//.test(ua)) {
            const version = this.extractVersion(ua, /Firefox\/([\d.]+)/);
            return {
                name: 'Firefox',
                version: version,
                type: 'Gecko系'
            };
        }

        // Internet Explorer
        if (/MSIE|Trident/.test(ua)) {
            let version = this.extractVersion(ua, /MSIE ([\d.]+)/) ||
                this.extractVersion(ua, /rv:([\d.]+)/);
            return {
                name: 'Internet Explorer',
                version: version,
                type: 'Trident系'
            };
        }

        return {
            name: '不明',
            version: '不明',
            type: '不明'
        };
    }

    detectOS() {
        const ua = this.ua;

        // Windows
        if (/Windows NT/.test(ua)) {
            const version = this.extractVersion(ua, /Windows NT ([\d.]+)/);
            const windowsVersions = {
                '10.0': 'Windows 10/11',
                '6.3': 'Windows 8.1',
                '6.2': 'Windows 8',
                '6.1': 'Windows 7',
                '6.0': 'Windows Vista',
                '5.1': 'Windows XP'
            };

            const arch = /WOW64|Win64|x64/.test(ua) ? '64-bit' : '32-bit';

            return {
                name: windowsVersions[version] || `Windows NT ${version}`,
                version: version,
                architecture: arch,
                platform: 'Windows'
            };
        }

        // macOS
        if (/Mac OS X/.test(ua)) {
            const version = this.extractVersion(ua, /Mac OS X ([\d_]+)/)?.replace(/_/g, '.');
            return {
                name: 'macOS',
                version: version,
                architecture: /Intel/.test(ua) ? 'Intel' : 'Unknown',
                platform: 'macOS'
            };
        }

        // iOS
        if (/iPhone|iPad|iPod/.test(ua)) {
            const version = this.extractVersion(ua, /OS ([\d_]+)/)?.replace(/_/g, '.');
            const device = /iPhone/.test(ua) ? 'iPhone' :
                /iPad/.test(ua) ? 'iPad' : 'iPod';

            return {
                name: 'iOS',
                version: version,
                device: device,
                platform: 'iOS'
            };
        }

        // Android
        if (/Android/.test(ua)) {
            const version = this.extractVersion(ua, /Android ([\d.]+)/);
            return {
                name: 'Android',
                version: version,
                platform: 'Android'
            };
        }

        // Linux
        if (/Linux/.test(ua)) {
            const arch = /x86_64|amd64/.test(ua) ? '64-bit' :
                /i686|i386/.test(ua) ? '32-bit' : 'Unknown';

            return {
                name: 'Linux',
                architecture: arch,
                platform: 'Linux'
            };
        }

        return {
            name: '不明',
            platform: '不明'
        };
    }

    detectDevice() {
        const ua = this.ua;

        if (/Mobile|Android/.test(ua) && !/Tablet/.test(ua)) {
            if (/iPhone/.test(ua)) {
                return { type: 'スマートフォン', brand: 'Apple', model: 'iPhone' };
            }
            if (/Android/.test(ua)) {
                const model = this.extractModel(ua);
                return { type: 'スマートフォン', brand: 'Android', model: model };
            }
            return { type: 'スマートフォン', brand: '不明', model: '不明' };
        }

        if (/iPad/.test(ua)) {
            return { type: 'タブレット', brand: 'Apple', model: 'iPad' };
        }

        if (/Tablet|Tab/.test(ua)) {
            return { type: 'タブレット', brand: '不明', model: '不明' };
        }

        return { type: 'デスクトップ/ノートPC', brand: '不明', model: '不明' };
    }

    detectEngine() {
        const ua = this.ua;

        if (/AppleWebKit/.test(ua)) {
            const version = this.extractVersion(ua, /AppleWebKit\/([\d.]+)/);
            const engine = /Blink/.test(ua) ? 'Blink' : 'WebKit';
            return {
                name: engine,
                version: version,
                family: 'WebKit系'
            };
        }

        if (/Gecko/.test(ua) && !/like Gecko/.test(ua)) {
            const version = this.extractVersion(ua, /rv:([\d.]+)/);
            return {
                name: 'Gecko',
                version: version,
                family: 'Gecko系'
            };
        }

        if (/Trident/.test(ua)) {
            const version = this.extractVersion(ua, /Trident\/([\d.]+)/);
            return {
                name: 'Trident',
                version: version,
                family: 'Trident系'
            };
        }

        return {
            name: '不明',
            version: '不明',
            family: '不明'
        };
    }

    parseComponents() {
        const ua = this.ua;
        const components = [];

        // 主要コンポーネントを抽出
        const patterns = [
            { name: 'Mozilla', pattern: /Mozilla\/([\d.]+)/ },
            { name: 'AppleWebKit', pattern: /AppleWebKit\/([\d.]+)/ },
            { name: 'Chrome', pattern: /Chrome\/([\d.]+)/ },
            { name: 'Safari', pattern: /Safari\/([\d.]+)/ },
            { name: 'Firefox', pattern: /Firefox\/([\d.]+)/ },
            { name: 'Edge', pattern: /Edg\/([\d.]+)/ },
            { name: 'Opera', pattern: /OPR\/([\d.]+)/ }
        ];

        patterns.forEach(pattern => {
            const match = ua.match(pattern.pattern);
            if (match) {
                components.push({
                    name: pattern.name,
                    version: match[1],
                    raw: match[0]
                });
            }
        });

        return components;
    }

    extractVersion(ua, pattern) {
        const match = ua.match(pattern);
        return match ? match[1] : '不明';
    }

    extractModel(ua) {
        // Android端末のモデル名を抽出（簡易版）
        const modelMatch = ua.match(/\(([^)]*)\)/);
        if (modelMatch) {
            const info = modelMatch[1];
            const parts = info.split(';');
            for (let part of parts) {
                part = part.trim();
                if (part && !part.includes('Android') && !part.includes('Mobile') &&
                    !part.includes('wv') && !part.includes('Linux')) {
                    return part;
                }
            }
        }
        return '不明';
    }
}

// User-Agent分析を実行
function analyzeUserAgent(ua) {
    if (!ua.trim()) {
        alert('User-Agent文字列を入力してください。');
        return;
    }

    const analyzer = new UserAgentAnalyzer(ua);
    const analysis = analyzer.analysis;

    // ブラウザ情報を表示
    renderInfoItems(browserInfo, [
        { label: 'ブラウザ', value: analysis.browser.name },
        { label: 'バージョン', value: analysis.browser.version },
        { label: 'タイプ', value: analysis.browser.type }
    ]);

    // OS情報を表示
    const osItems = [
        { label: 'OS', value: analysis.os.name },
        { label: 'バージョン', value: analysis.os.version || '不明' },
        { label: 'プラットフォーム', value: analysis.os.platform }
    ];
    if (analysis.os.architecture) {
        osItems.push({ label: 'アーキテクチャ', value: analysis.os.architecture });
    }
    if (analysis.os.device) {
        osItems.push({ label: 'デバイス', value: analysis.os.device });
    }
    renderInfoItems(osInfo, osItems);

    // デバイス情報を表示
    renderInfoItems(deviceInfo, [
        { label: 'タイプ', value: analysis.device.type },
        { label: 'ブランド', value: analysis.device.brand },
        { label: 'モデル', value: analysis.device.model }
    ]);

    // エンジン情報を表示
    renderInfoItems(engineInfo, [
        { label: 'エンジン', value: analysis.engine.name },
        { label: 'バージョン', value: analysis.engine.version },
        { label: 'ファミリー', value: analysis.engine.family }
    ]);

    // 詳細解析情報
    detailedInfo.textContent = '';
    const summaryTitle = document.createElement('strong');
    summaryTitle.textContent = '判定されたユーザー環境:';
    detailedInfo.appendChild(summaryTitle);
    detailedInfo.appendChild(document.createElement('br'));
    detailedInfo.appendChild(document.createTextNode(`${analysis.browser.name} ${analysis.browser.version} on ${analysis.os.name} (${analysis.device.type})`));
    detailedInfo.appendChild(document.createElement('br'));
    detailedInfo.appendChild(document.createElement('br'));

    const detailsTitle = document.createElement('strong');
    detailsTitle.textContent = '技術的詳細:';
    detailedInfo.appendChild(detailsTitle);
    detailedInfo.appendChild(document.createElement('br'));
    detailedInfo.appendChild(document.createTextNode(`エンジン: ${analysis.engine.name} ${analysis.engine.version}`));
    detailedInfo.appendChild(document.createElement('br'));
    detailedInfo.appendChild(document.createTextNode(`プラットフォーム: ${analysis.os.platform}`));
    detailedInfo.appendChild(document.createElement('br'));
    if (analysis.os.architecture) {
        detailedInfo.appendChild(document.createTextNode(`アーキテクチャ: ${analysis.os.architecture}`));
        detailedInfo.appendChild(document.createElement('br'));
    }

    // User-Agent構成要素
    const fragment = document.createDocumentFragment();

    const originalWrapper = document.createElement('div');
    originalWrapper.className = 'component-part';

    const originalLabel = document.createElement('strong');
    originalLabel.textContent = '原文:';
    originalWrapper.appendChild(originalLabel);
    originalWrapper.appendChild(document.createElement('br'));

    const originalText = document.createElement('span');
    originalText.textContent = ua;
    originalWrapper.appendChild(originalText);

    fragment.appendChild(originalWrapper);
    fragment.appendChild(document.createElement('br'));

    if (analysis.components.length > 0) {
        const componentsTitle = document.createElement('strong');
        componentsTitle.textContent = '検出されたコンポーネント:';
        fragment.appendChild(componentsTitle);
        fragment.appendChild(document.createElement('br'));

        analysis.components.forEach(component => {
            const compDiv = document.createElement('div');
            compDiv.className = 'component-part';

            const nameStrong = document.createElement('strong');
            nameStrong.textContent = component.name;
            compDiv.appendChild(nameStrong);

            const versionText = document.createTextNode(' ' + component.version);
            compDiv.appendChild(versionText);
            compDiv.appendChild(document.createElement('br'));

            const rawSmall = document.createElement('small');
            rawSmall.textContent = component.raw;
            compDiv.appendChild(rawSmall);

            fragment.appendChild(compDiv);
        });
    }

    uaComponents.textContent = '';
    uaComponents.appendChild(fragment);

    // 結果セクションを表示
    resultsSection.style.display = 'block';
}

// 情報アイテムの描画
function renderInfoItems(container, items) {
    container.textContent = '';
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'info-item';

        const label = document.createElement('span');
        label.className = 'info-label';
        label.textContent = `${item.label}:`;
        wrapper.appendChild(label);

        const value = document.createElement('span');
        value.className = 'info-value';
        value.textContent = item.value;
        wrapper.appendChild(value);

        fragment.appendChild(wrapper);
    });
    container.appendChild(fragment);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// サンプルUser-Agentを設定
function setSampleUA() {
    const samples = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
    ];

    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    userAgentInput.value = randomSample;
}

// イベントリスナー
analyzeBtn.addEventListener('click', () => {
    analyzeUserAgent(userAgentInput.value);
});

analyzeCurrentBtn.addEventListener('click', () => {
    analyzeUserAgent(navigator.userAgent);
    userAgentInput.value = navigator.userAgent;
});

clearBtn.addEventListener('click', () => {
    userAgentInput.value = '';
    resultsSection.style.display = 'none';
});

sampleBtn.addEventListener('click', setSampleUA);

// サンプルUA項目のクリック
document.querySelectorAll('.sample-item').forEach(item => {
    item.addEventListener('click', () => {
        const ua = item.getAttribute('data-ua');
        userAgentInput.value = ua;
        analyzeUserAgent(ua);
    });
});

// Enter キーでの分析実行
userAgentInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        analyzeUserAgent(userAgentInput.value);
    }
});

// ページ読み込み時に現在のUser-Agentを表示
document.addEventListener('DOMContentLoaded', () => {
    currentUserAgentElement.textContent = navigator.userAgent;
});