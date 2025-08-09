// DOM要素
const quantityInput = document.getElementById('quantity');
const typeLabel = document.getElementById('type-label');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const outputText = document.getElementById('output-text');
const outputFormat = document.getElementById('output-format');
const startWithLoremCheckbox = document.getElementById('start-with-lorem');

// Lorem Ipsum テキストデータ
const loremTexts = {
    latin: {
        words: [
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
            'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
            'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
            'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
            'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
            'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
            'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
            'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
            'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis',
            'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos',
            'dolores', 'quas', 'molestias', 'excepturi', 'occaecati', 'cupiditate',
            'provident', 'similique', 'mollitia', 'nobis', 'ratione', 'neque', 'porro',
            'quisquam', 'dolorem', 'eum', 'iure', 'reprehenderit', 'qui', 'voluptatem',
            'accusantium', 'doloremque', 'laudantium', 'totam', 'rem', 'aperiam'
        ],
        classic: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    
    japanese: {
        words: [
            'これは', 'サンプル', 'テキスト', 'です', 'の', 'を', 'に', 'が', 'で',
            '日本語', 'ダミー', 'コンテンツ', '作成', '表示', '確認', 'デザイン',
            'レイアウト', 'フォント', 'サイズ', '文字', '配置', '段落', '文章',
            '見出し', 'タイトル', '本文', '記事', 'ページ', 'ウェブサイト',
            'アプリケーション', 'システム', '開発', 'プログラム', 'コード',
            'データ', '情報', '内容', '詳細', '説明', '概要', '機能', '特徴',
            'メリット', '利点', '効果', '結果', '成果', '実績', '経験', '知識',
            '技術', 'スキル', '能力', '品質', '価値', 'サービス', '提供',
            '利用', '活用', '適用', '導入', '実装', '運用', '管理', '保守',
            'サポート', '支援', '協力', '連携', '統合', '改善', '最適化',
            '効率', '生産性', 'パフォーマンス', '動作', '処理', '実行'
        ]
    },
    
    english: {
        words: [
            'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'this',
            'is', 'sample', 'text', 'for', 'demonstration', 'purposes', 'and',
            'testing', 'layout', 'design', 'content', 'creation', 'web',
            'development', 'application', 'system', 'software', 'program',
            'code', 'data', 'information', 'details', 'description', 'overview',
            'feature', 'function', 'benefit', 'advantage', 'result', 'outcome',
            'experience', 'knowledge', 'skill', 'ability', 'quality', 'value',
            'service', 'solution', 'technology', 'innovation', 'modern',
            'advanced', 'efficient', 'effective', 'reliable', 'secure',
            'fast', 'simple', 'easy', 'powerful', 'flexible', 'scalable',
            'comprehensive', 'professional', 'business', 'enterprise',
            'industry', 'market', 'customer', 'user', 'client', 'support',
            'management', 'performance', 'optimization', 'integration'
        ]
    }
};

// 現在の設定を取得
function getCurrentSettings() {
    const language = document.querySelector('input[name="language"]:checked').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const quantity = parseInt(quantityInput.value);
    const startWithLorem = startWithLoremCheckbox.checked;
    
    return { language, type, quantity, startWithLorem };
}

// ランダムな単語を取得
function getRandomWord(language) {
    const words = loremTexts[language].words;
    return words[Math.floor(Math.random() * words.length)];
}

// 文を生成
function generateSentence(language, wordCount = null) {
    if (!wordCount) {
        wordCount = Math.floor(Math.random() * 15) + 5; // 5-20語
    }
    
    let sentence = '';
    for (let i = 0; i < wordCount; i++) {
        if (i > 0) sentence += ' ';
        sentence += getRandomWord(language);
    }
    
    // 最初の文字を大文字に
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    sentence += '.';
    
    return sentence;
}

// 段落を生成
function generateParagraph(language, sentenceCount = null) {
    if (!sentenceCount) {
        sentenceCount = Math.floor(Math.random() * 6) + 3; // 3-8文
    }
    
    let paragraph = '';
    for (let i = 0; i < sentenceCount; i++) {
        if (i > 0) paragraph += ' ';
        paragraph += generateSentence(language);
    }
    
    return paragraph;
}

// メインの生成関数
function generateText() {
    const settings = getCurrentSettings();
    let result = [];
    
    // 最初の段落をLorem ipsumで開始する場合
    if (settings.startWithLorem && settings.language === 'latin' && settings.type === 'paragraphs') {
        result.push(loremTexts.latin.classic);
        
        // 残りの段落を生成
        for (let i = 1; i < settings.quantity; i++) {
            result.push(generateParagraph(settings.language));
        }
    } else {
        // 通常の生成
        switch (settings.type) {
            case 'paragraphs':
                for (let i = 0; i < settings.quantity; i++) {
                    result.push(generateParagraph(settings.language));
                }
                break;
                
            case 'sentences':
                for (let i = 0; i < settings.quantity; i++) {
                    result.push(generateSentence(settings.language));
                }
                break;
                
            case 'words':
                const words = [];
                for (let i = 0; i < settings.quantity; i++) {
                    words.push(getRandomWord(settings.language));
                }
                result.push(words.join(' '));
                break;
        }
    }
    
    return result;
}

// 出力形式を適用
function formatOutput(textArray, format) {
    switch (format) {
        case 'html':
            return textArray.map(text => `<p>${text}</p>`).join('\n');
            
        case 'markdown':
            return textArray.join('\n\n');
            
        case 'plain':
        default:
            return textArray.join('\n\n');
    }
}

// テキスト生成を実行
function executeGeneration() {
    const textArray = generateText();
    const format = outputFormat.value;
    const formattedText = formatOutput(textArray, format);
    
    outputText.value = formattedText;
}

// クリップボードにコピー
async function copyToClipboard() {
    if (!outputText.value) {
        alert('コピーする内容がありません。');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(outputText.value);
        
        // ボタンの表示を一時的に変更
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'コピー済み!';
        copyBtn.style.background = 'linear-gradient(to right, #66bb6a, #81c784)';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'linear-gradient(to right, #4caf50, #45a049)';
        }, 2000);
        
    } catch (error) {
        // フォールバック
        outputText.select();
        document.execCommand('copy');
        alert('クリップボードにコピーしました。');
    }
}

// ファイルダウンロード
function downloadFile() {
    if (!outputText.value) {
        alert('ダウンロードする内容がありません。');
        return;
    }
    
    const settings = getCurrentSettings();
    const format = outputFormat.value;
    
    const extensions = {
        'plain': 'txt',
        'html': 'html',
        'markdown': 'md'
    };
    
    const mimeTypes = {
        'plain': 'text/plain',
        'html': 'text/html',
        'markdown': 'text/markdown'
    };
    
    let content = outputText.value;
    
    // HTML形式の場合、完全なHTMLドキュメントを作成
    if (format === 'html') {
        content = `<!DOCTYPE html>
<html lang="${settings.language === 'japanese' ? 'ja' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lorem Ipsum Text</title>
    <style>
        body { font-family: Georgia, serif; line-height: 1.6; margin: 2rem; }
        p { margin-bottom: 1rem; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    }
    
    const blob = new Blob([content], { 
        type: mimeTypes[format] + ';charset=utf-8' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lorem_ipsum_${settings.language}_${settings.quantity}${settings.type}.${extensions[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// タイプラベルを更新
function updateTypeLabel() {
    const type = document.querySelector('input[name="type"]:checked').value;
    const labels = {
        'paragraphs': '段落',
        'sentences': '文',
        'words': '単語'
    };
    typeLabel.textContent = labels[type];
    
    // Lorem ipsum開始オプションの表示制御
    const language = document.querySelector('input[name="language"]:checked').value;
    if (language === 'latin' && type === 'paragraphs') {
        startWithLoremCheckbox.parentElement.style.display = 'flex';
    } else {
        startWithLoremCheckbox.parentElement.style.display = 'none';
        startWithLoremCheckbox.checked = false;
    }
}

// イベントリスナー
generateBtn.addEventListener('click', executeGeneration);
clearBtn.addEventListener('click', () => {
    outputText.value = '';
});
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadFile);

// タイプ変更時の処理
document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', updateTypeLabel);
});

// 言語変更時の処理
document.querySelectorAll('input[name="language"]').forEach(radio => {
    radio.addEventListener('change', updateTypeLabel);
});

// 数量の範囲チェック
quantityInput.addEventListener('input', () => {
    const value = parseInt(quantityInput.value);
    if (value < 1) quantityInput.value = 1;
    if (value > 50) quantityInput.value = 50;
});

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    updateTypeLabel();
    
    // デフォルトで3段落を生成
    executeGeneration();
});