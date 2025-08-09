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
    // すべてのページでテーマスイッチャーを初期化
    initializeThemeSwitcher();
});
