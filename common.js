/**
 * クリップボードにテキストをコピーする
 * @param {string} text - コピーするテキスト
 * @param {function(string, string): void} showStatus - ステータスを表示する関数
 */
async function copyToClipboard(text, showStatus) {
    if (!text) {
        showStatus('コピーするデータがありません', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showStatus('クリップボードにコピーしました', 'success');
    } catch (error) {
        fallbackCopyTextToClipboard(text, showStatus);
    }
}

/**
 * navigator.clipboardが使えない場合のフォールバック
 * @param {string} text - コピーするテキスト
 * @param {function(string, string): void} showStatus - ステータスを表示する関数
 */
function fallbackCopyTextToClipboard(text, showStatus) {
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
        showStatus('クリップボードにコピーしました', 'success');
    } catch (error) {
        showStatus('コピーに失敗しました', 'error');
    }

    document.body.removeChild(textArea);
}

/**
 * ステータスメッセージを表示する
 * @param {HTMLElement} statusBarElement - ステータスバーの要素
 * @param {string} message - 表示するメッセージ
 * @param {string} type - メッセージの種類 ('info', 'success', 'error')
 */
function showStatus(statusBarElement, message, type = 'info') {
    if (!statusBarElement) return;
    statusBarElement.textContent = message;
    statusBarElement.className = `status-bar status-${type}`;
}

/**
 * ダークモードの初期化とイベントリスナーの設定
 */
function initializeThemeSwitcher() {
    const themeSwitch = document.getElementById('theme-switch');
    if (!themeSwitch) return;

    // 現在のテーマをlocalStorageから読み込む
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeSwitch.checked = true;
    }

    // テーマ切り替えのイベントリスナー
    themeSwitch.addEventListener('change', function(event) {
        if (event.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 共通のヘッダーとフッターを読み込む
    loadCommonComponents();
});

/**
 * 共通のヘッダーとフッターを読み込んでページに挿入する
 */
async function loadCommonComponents() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    const basePath = getBasePath();

    if (headerPlaceholder) {
        try {
            const response = await fetch(`${basePath}common_header.html`);
            if (response.ok) {
                const text = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = text;

                // 読み込んだHTML内の相対パスを現在のページの階層に合わせて修正
                tempDiv.querySelectorAll('a[href], link[href]').forEach(el => {
                    const href = el.getAttribute('href');
                    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('/')) {
                        el.setAttribute('href', `${basePath}${href}`);
                    }
                });
                tempDiv.querySelectorAll('img[src], script[src]').forEach(el => {
                    const src = el.getAttribute('src');
                    if (src && !src.startsWith('http') && !src.startsWith('/')) {
                        el.setAttribute('src', `${basePath}${src}`);
                    }
                });

                // プレースホルダーを読み込んだコンテンツで置き換える
                headerPlaceholder.replaceWith(...tempDiv.childNodes);
                
                // ヘッダーがDOMに追加された後にテーマスイッチャーを初期化
                initializeThemeSwitcher();
            } else {
                console.error('Failed to load header:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching header:', error);
        }
    }

    if (footerPlaceholder) {
        try {
            const response = await fetch(`${basePath}common_footer.html`);
            if (response.ok) {
                const text = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = text;
                // フッター内のパスも同様に修正（必要であれば）
                footerPlaceholder.replaceWith(...tempDiv.childNodes);
            } else {
                console.error('Failed to load footer:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching footer:', error);
        }
    }
}

/**
 * 現在のページの階層に応じて、共通ファイルへの相対パスを計算する
 * @returns {string} - ベースパス (e.g., './' or '../')
 */
function getBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const segments = path.split('/').filter(Boolean);
    // 末尾がファイル名なら除外
    if (segments.length > 0 && segments[segments.length - 1].includes('.')) {
        segments.pop();
    }
    // リポジトリ直下からの深さ（tools は1、ネストは2以上）
    // file:// や preview では pathname が環境依存のため、相対的に ../ を推定
    const scriptEl = document.querySelector('script[src*="common.js"]');
    if (scriptEl) {
        const src = scriptEl.getAttribute('src') || '';
        if (src.startsWith('../')) {
            const ups = (src.match(/\.\.\//g) || []).length;
            return '../'.repeat(ups);
        }
        if (src === 'common.js' || src.startsWith('./')) {
            return './';
        }
    }
    return segments.length <= 1 ? './' : '../'.repeat(Math.max(segments.length - 1, 1));
}