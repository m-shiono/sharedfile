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
    const path = window.location.pathname;
    // '/sharedfile/' が見つからない場合は、ルートとみなす
    const repoRootIndex = path.indexOf('/sharedfile/');
    if (repoRootIndex === -1) {
        return './';
    }
    // '/sharedfile/' より後のパス部分を取得
    const repoRelativePath = path.substring(repoRootIndex + '/sharedfile/'.length);
    // スラッシュの数を数えて階層を判断
    const depth = (repoRelativePath.match(/\//g) || []).length;
    
    if (depth > 0) {
        return '../'.repeat(depth);
    }
    return './';
}