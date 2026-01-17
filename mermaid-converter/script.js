// Mermaid初期化
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true
    }
});

// DOM要素の取得
const mermaidInput = document.getElementById('mermaidInput');
const diagramOutput = document.getElementById('diagramOutput');
const statusBar = document.getElementById('statusBar');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const templateButtons = document.querySelectorAll('.template-btn');

// テンプレートデータ
const templates = {
    flowchart: `graph TD
    A[開始] --> B{条件分岐}
    B -->|Yes| C[処理A]
    B -->|No| D[処理B] 
    C --> E[終了]
    D --> E`,
    
    sequence: `sequenceDiagram
    participant A as ユーザー
    participant B as システム
    participant C as データベース
    
    A->>B: リクエスト送信
    B->>C: データ問い合わせ
    C-->>B: データ返却
    B-->>A: レスポンス返却`,
    
    class: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Order {
        +int orderId
        +Date orderDate
        +calculateTotal()
    }
    
    User --> Order : has`,
    
    er: `erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER-ITEM : contains
    PRODUCT ||--o{ ORDER-ITEM : "ordered in"
    
    USER {
        int id PK
        string name
        string email
    }
    
    ORDER {
        int id PK
        int user_id FK
        date order_date
    }`,
    
    gantt: `gantt
    title プロジェクトスケジュール
    dateFormat  YYYY-MM-DD
    section 設計
    要件定義         :a1, 2024-01-01, 30d
    基本設計         :a2, after a1, 20d
    section 開発
    実装             :b1, after a2, 45d
    テスト           :b2, after b1, 15d`
};

// ユーティリティ関数
function updateStatus(message, type = 'info') {
    // ステータスバーを表示状態に戻す
    if (statusBar) {
        statusBar.style.display = 'block';
    }
    // 共通の showStatus があれば利用し、なければフォールバック
    if (typeof window.showStatus === 'function') {
        window.showStatus(statusBar, message, type);
    } else {
        if (!statusBar) return;
        statusBar.textContent = message;
        statusBar.className = `status-bar status-${type}`;
    }
}

function hideStatus() {
    statusBar.style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mermaid図の生成
async function generateDiagram() {
    const inputText = mermaidInput.value.trim();
    
    if (!inputText) {
        updateStatus('Mermaidテキストを入力してください', 'error');
        return;
    }
    
    try {
        updateStatus('図を生成中...', 'info');
        
        // 前の図をクリア
        diagramOutput.textContent = '';
        
        // 一意のIDを生成
        const diagramId = `mermaid-${Date.now()}`;
        
        // Mermaid構文の検証と図の生成
        mermaid.parse(inputText);
        
        // 図を生成
        const { svg } = await mermaid.render(diagramId, inputText);
        
        // SVGを表示（DOMPurifyでサニタイズ）
        if (typeof DOMPurify === 'undefined') {
            throw new Error('サニタイズライブラリが読み込まれていません');
        }
        const safeSvg = DOMPurify.sanitize(svg, {
            USE_PROFILES: { svg: true, svgFilters: true },
            ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-]|$))/i
        });
        diagramOutput.innerHTML = safeSvg;
        
        // ダウンロードボタンを有効化
        downloadSvgBtn.disabled = false;
        downloadPngBtn.disabled = false;
        
        updateStatus('図の生成が完了しました', 'success');
        
    } catch (error) {
        console.error('Mermaid generation error:', error);
        updateStatus(`エラー: ${error.message}`, 'error');
        diagramOutput.textContent = '';
        const errorMessage = document.createElement('p');
        errorMessage.style.color = '#721c24';
        errorMessage.textContent = '図の生成に失敗しました。Mermaidの記法を確認してください。';
        diagramOutput.appendChild(errorMessage);
        
        // ダウンロードボタンを無効化
        downloadSvgBtn.disabled = true;
        downloadPngBtn.disabled = true;
    }
}

// SVGダウンロード
function downloadSvg() {
    const svgElement = diagramOutput.querySelector('svg');
    if (!svgElement) {
        updateStatus('ダウンロードする図がありません', 'error');
        return;
    }
    
    try {
        // SVGデータを取得
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        
        // ダウンロードリンクを作成
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(svgBlob);
        downloadLink.download = `mermaid-diagram-${new Date().getTime()}.svg`;
        
        // ダウンロードを実行
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // URLオブジェクトを解放
        URL.revokeObjectURL(downloadLink.href);
        
        updateStatus('SVGファイルをダウンロードしました', 'success');
        
    } catch (error) {
        console.error('SVG download error:', error);
        updateStatus('SVGダウンロードに失敗しました', 'error');
    }
}

// PNGダウンロード
function downloadPng() {
    const svgElement = diagramOutput.querySelector('svg');
    if (!svgElement) {
        updateStatus('ダウンロードする図がありません', 'error');
        return;
    }
    
    try {
        // SVGのサイズを取得
        const svgRect = svgElement.getBoundingClientRect();
        const svgWidth = svgElement.width.baseVal.value || svgRect.width;
        const svgHeight = svgElement.height.baseVal.value || svgRect.height;
        
        // Canvasを作成
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 高解像度対応
        const scale = 2;
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;
        ctx.scale(scale, scale);
        
        // SVGデータを取得
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // 画像を作成してCanvasに描画
        const img = new Image();
        img.onload = function() {
            // 白い背景を描画
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, svgWidth, svgHeight);
            
            // SVG画像を描画
            ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
            
            // PNGとしてダウンロード
            canvas.toBlob(function(blob) {
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = `mermaid-diagram-${new Date().getTime()}.png`;
                
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                URL.revokeObjectURL(downloadLink.href);
                updateStatus('PNGファイルをダウンロードしました', 'success');
            }, 'image/png');
            
            URL.revokeObjectURL(url);
        };
        
        img.onerror = function() {
            URL.revokeObjectURL(url);
            updateStatus('PNG変換に失敗しました', 'error');
        };
        
        img.src = url;
        
    } catch (error) {
        console.error('PNG download error:', error);
        showStatus(statusBar, 'PNGダウンロードに失敗しました', 'error');
    }
}

// テキストクリア
function clearInput() {
    mermaidInput.value = '';
    diagramOutput.textContent = '';
    hideStatus();
    downloadSvgBtn.disabled = true;
    downloadPngBtn.disabled = true;
}

// テンプレート挿入
function insertTemplate(templateKey) {
    if (templates[templateKey]) {
        mermaidInput.value = templates[templateKey];
        updateStatus(`${templateKey}テンプレートを挿入しました`, 'info');
    }
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', function() {
    // ボタンイベント
    generateBtn.addEventListener('click', generateDiagram);
    clearBtn.addEventListener('click', clearInput);
    downloadSvgBtn.addEventListener('click', downloadSvg);
    downloadPngBtn.addEventListener('click', downloadPng);
    
    // テンプレートボタンイベント
    templateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const templateKey = this.dataset.template;
            insertTemplate(templateKey);
        });
    });
    
    // キーボードショートカット
    mermaidInput.addEventListener('keydown', function(e) {
        // Ctrl+Enter で図生成
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            generateDiagram();
        }
    });
    
    // 初期状態でダウンロードボタンを無効化
    downloadSvgBtn.disabled = true;
    downloadPngBtn.disabled = true;
    
    // 初期メッセージ
    updateStatus('Mermaidテキストを入力して「図を生成」ボタンを押してください', 'info');
});