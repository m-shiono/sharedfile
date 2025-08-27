// ファイルサイズ計算ツール

// テキストをクリアする関数
function clearText() {
    const textInput = document.getElementById('textInput');
    const resultDiv = document.getElementById('result');
    
    textInput.value = '';
    resultDiv.innerHTML = '<p>テキストを入力して「サイズを計算」ボタンをクリックしてください。</p>';
    textInput.focus();
}

// ファイルサイズを計算する関数
function calculateSize() {
    const textInput = document.getElementById('textInput');
    const resultDiv = document.getElementById('result');
    const text = textInput.value;
    
    try {
        // UTF-8でエンコードした場合のバイト数を計算
        const encoder = new TextEncoder();
        const utf8Bytes = encoder.encode(text);
        const byteSize = utf8Bytes.length;
        
        // 文字数と行数を計算
        const charCount = text.length;
        const lineCount = text ? text.split('\n').length : 0;
        
        // サイズ単位の変換
        const kb = byteSize / 1024;
        const mb = kb / 1024;
        
        // 結果をHTMLで表示（XSS対策済み）
        const resultHTML = `
            <div class="calculation-result">
                <h4>計算結果</h4>
                <div class="result-item">
                    <strong>ファイルサイズ:</strong><br>
                    ${escapeHtml(byteSize.toLocaleString())} バイト<br>
                    ${kb >= 1 ? `${escapeHtml(kb.toFixed(2))} KB<br>` : ''}
                    ${mb >= 1 ? `${escapeHtml(mb.toFixed(2))} MB<br>` : ''}
                </div>
                <div class="result-item">
                    <strong>テキスト情報:</strong><br>
                    文字数: ${escapeHtml(charCount.toLocaleString())} 文字<br>
                    行数: ${escapeHtml(lineCount.toLocaleString())} 行
                </div>
                <div class="result-item">
                    <strong>エンコーディング:</strong> UTF-8<br>
                    <small>※ 実際のファイルサイズは保存形式やBOM（Byte Order Mark）の有無により若干異なる場合があります。</small>
                </div>
            </div>
        `;
        
        resultDiv.innerHTML = resultHTML;
        
    } catch (error) {
        console.error('計算エラー:', error);
        resultDiv.innerHTML = '<p class="error">計算中にエラーが発生しました。</p>';
    }
}

// リアルタイム計算（オプション）
function enableRealTimeCalculation() {
    const textInput = document.getElementById('textInput');
    let timeoutId;
    
    textInput.addEventListener('input', function() {
        // デバウンス処理（500ms後に計算実行）
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            if (textInput.value.trim() !== '') {
                calculateSize();
            }
        }, 500);
    });
}

// HTMLエスケープ関数（セキュリティ対策）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const calculateButton = document.getElementById('calculateButton');
    const clearButton = document.getElementById('clearButton');
    
    textInput.focus();
    
    // イベントリスナーを登録
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateSize);
    }
    if (clearButton) {
        clearButton.addEventListener('click', clearText);
    }
    
    // Enterキーでの計算実行（Shift+Enterは改行）
    textInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            calculateSize();
        }
    });
    
    // リアルタイム計算を有効にする場合は以下のコメントを外してください
    // enableRealTimeCalculation();
});