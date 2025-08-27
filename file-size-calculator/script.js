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
        const lineCount = text.split('\n').length;
        
        // サイズ単位の変換
        const kb = byteSize / 1024;
        const mb = kb / 1024;
        
        // 結果をHTMLで表示（XSS対策済み）
        let resultHTML = '<div class="calculation-result">';
        resultHTML += '<h4>計算結果</h4>';
        resultHTML += '<div class="result-item">';
        resultHTML += `<strong>ファイルサイズ:</strong><br>`;
        resultHTML += `${escapeHtml(byteSize.toLocaleString())} バイト<br>`;
        
        if (kb >= 1) {
            resultHTML += `${escapeHtml(kb.toFixed(2))} KB<br>`;
        }
        
        if (mb >= 1) {
            resultHTML += `${escapeHtml(mb.toFixed(2))} MB<br>`;
        }
        
        resultHTML += '</div>';
        
        resultHTML += '<div class="result-item">';
        resultHTML += `<strong>テキスト情報:</strong><br>`;
        resultHTML += `文字数: ${escapeHtml(charCount.toLocaleString())} 文字<br>`;
        resultHTML += `行数: ${escapeHtml(lineCount.toLocaleString())} 行`;
        resultHTML += '</div>';
        
        // エンコーディング情報
        resultHTML += '<div class="result-item">';
        resultHTML += '<strong>エンコーディング:</strong> UTF-8<br>';
        resultHTML += '<small>※ 実際のファイルサイズは保存形式やBOM（Byte Order Mark）の有無により若干異なる場合があります。</small>';
        resultHTML += '</div>';
        
        resultHTML += '</div>';
        
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
    textInput.focus();
    
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