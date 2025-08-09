// DOM要素
const inputData = document.getElementById('input-data');
const outputData = document.getElementById('output-data');
const convertBtn = document.getElementById('convert-btn');
const clearInputBtn = document.getElementById('clear-input-btn');
const clearOutputBtn = document.getElementById('clear-output-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const sampleDataBtn = document.getElementById('sample-data-btn');
const hasHeaderCheckbox = document.getElementById('has-header');
const delimiterSelect = document.getElementById('delimiter');
const previewSection = document.getElementById('preview-section');
const previewTable = document.getElementById('preview-table');

// サンプルデータ
const sampleData = {
    csv: `名前,年齢,職業,都市
田中太郎,30,エンジニア,東京
佐藤花子,25,デザイナー,大阪
鈴木一郎,35,営業,名古屋
山田美咲,28,教師,福岡`,
    
    tsv: `名前	年齢	職業	都市
田中太郎	30	エンジニア	東京
佐藤花子	25	デザイナー	大阪
鈴木一郎	35	営業	名古屋
山田美咲	28	教師	福岡`,
    
    json: `[
  {"名前": "田中太郎", "年齢": 30, "職業": "エンジニア", "都市": "東京"},
  {"名前": "佐藤花子", "年齢": 25, "職業": "デザイナー", "都市": "大阪"},
  {"名前": "鈴木一郎", "年齢": 35, "職業": "営業", "都市": "名古屋"},
  {"名前": "山田美咲", "年齢": 28, "職業": "教師", "都市": "福岡"}
]`
};

// 現在の入力・出力形式を取得
function getInputFormat() {
    return document.querySelector('input[name="input-format"]:checked').value;
}

function getOutputFormat() {
    return document.querySelector('input[name="output-format"]:checked').value;
}

// 区切り文字を自動判定
function detectDelimiter(text) {
    const delimiters = [',', '\t', ';', '|'];
    const counts = {};
    
    delimiters.forEach(delimiter => {
        const lines = text.trim().split('\n').slice(0, 5); // 最初の5行で判定
        let count = 0;
        lines.forEach(line => {
            count += (line.split(delimiter).length - 1);
        });
        counts[delimiter] = count;
    });
    
    // 最も多く使われている区切り文字を返す
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// CSVパース
function parseCSV(text, delimiter = ',', hasHeader = true) {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const actualDelimiter = delimiter === 'auto' ? detectDelimiter(text) : delimiter;
    const parsedLines = lines.map(line => parseCSVLine(line, actualDelimiter));
    
    if (hasHeader && parsedLines.length > 0) {
        return {
            headers: parsedLines[0],
            rows: parsedLines.slice(1)
        };
    } else {
        // ヘッダーがない場合、Column1, Column2... を生成
        const maxColumns = Math.max(...parsedLines.map(row => row.length));
        const headers = Array.from({ length: maxColumns }, (_, i) => `Column${i + 1}`);
        return {
            headers,
            rows: parsedLines
        };
    }
}

// CSV行をパース（簡易版、ダブルクォート対応）
function parseCSVLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // エスケープされたダブルクォート
                current += '"';
                i++; // 次の文字をスキップ
            } else {
                // クォートの開始/終了
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// データをCSV形式に変換
function toCSV(data, delimiter = ',') {
    if (!data.headers || !data.rows) return '';
    
    const escapeValue = (value) => {
        const strValue = String(value);
        if (strValue.includes(delimiter) || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
    };
    
    const headerLine = data.headers.map(escapeValue).join(delimiter);
    const dataLines = data.rows.map(row => 
        row.map(escapeValue).join(delimiter)
    );
    
    return [headerLine, ...dataLines].join('\n');
}

// データをJSON形式に変換
function toJSON(data) {
    if (!data.headers || !data.rows) return '[]';
    
    const objects = data.rows.map(row => {
        const obj = {};
        data.headers.forEach((header, index) => {
            const value = row[index] || '';
            // 数値として解析を試行
            const numValue = Number(value);
            obj[header] = !isNaN(numValue) && value !== '' ? numValue : value;
        });
        return obj;
    });
    
    return JSON.stringify(objects, null, 2);
}

// JSONをパース
function parseJSON(text) {
    try {
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
            throw new Error('JSONは配列形式である必要があります');
        }
        
        if (data.length === 0) {
            return { headers: [], rows: [] };
        }
        
        // ヘッダーを抽出（最初のオブジェクトのキーから）
        const headers = Object.keys(data[0]);
        
        // 行データを抽出
        const rows = data.map(item => 
            headers.map(header => item[header] !== undefined ? item[header] : '')
        );
        
        return { headers, rows };
    } catch (error) {
        throw new Error(`JSON解析エラー: ${error.message}`);
    }
}

// データ変換メイン処理
function convertData() {
    const inputText = inputData.value.trim();
    if (!inputText) {
        alert('変換するデータを入力してください。');
        return;
    }
    
    try {
        const inputFormat = getInputFormat();
        const outputFormat = getOutputFormat();
        const hasHeader = hasHeaderCheckbox.checked;
        const delimiter = delimiterSelect.value;
        
        let parsedData;
        
        // 入力データをパース
        switch (inputFormat) {
            case 'csv':
                parsedData = parseCSV(inputText, delimiter, hasHeader);
                break;
            case 'tsv':
                parsedData = parseCSV(inputText, '\t', hasHeader);
                break;
            case 'json':
                parsedData = parseJSON(inputText);
                break;
            default:
                throw new Error('不明な入力形式です');
        }
        
        // 出力形式に変換
        let output;
        switch (outputFormat) {
            case 'csv':
                output = toCSV(parsedData, ',');
                break;
            case 'tsv':
                output = toCSV(parsedData, '\t');
                break;
            case 'json':
                output = toJSON(parsedData);
                break;
            default:
                throw new Error('不明な出力形式です');
        }
        
        outputData.value = output;
        showPreview(parsedData);
        
    } catch (error) {
        alert(`変換エラー: ${error.message}`);
        outputData.value = '';
        hidePreview();
    }
}

// プレビュー表示
function showPreview(data) {
    if (!data.headers || data.headers.length === 0) {
        hidePreview();
        return;
    }
    
    const table = document.createElement('table');
    
    // ヘッダー行
    const headerRow = document.createElement('tr');
    data.headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    
    // データ行（最大10行まで表示）
    const maxRows = Math.min(data.rows.length, 10);
    for (let i = 0; i < maxRows; i++) {
        const row = document.createElement('tr');
        data.headers.forEach((_, colIndex) => {
            const td = document.createElement('td');
            td.textContent = data.rows[i][colIndex] || '';
            row.appendChild(td);
        });
        table.appendChild(row);
    }
    
    // 省略表示
    if (data.rows.length > 10) {
        const moreRow = document.createElement('tr');
        const moreCell = document.createElement('td');
        moreCell.colSpan = data.headers.length;
        moreCell.textContent = `... 他${data.rows.length - 10}行`;
        moreCell.style.textAlign = 'center';
        moreCell.style.fontStyle = 'italic';
        moreRow.appendChild(moreCell);
        table.appendChild(moreRow);
    }
    
    previewTable.innerHTML = '';
    previewTable.appendChild(table);
    previewSection.style.display = 'block';
}

// プレビュー非表示
function hidePreview() {
    previewSection.style.display = 'none';
}

// クリップボードにコピー
async function copyToClipboard() {
    if (!outputData.value) {
        alert('コピーする内容がありません。');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(outputData.value);
        alert('クリップボードにコピーしました。');
    } catch (error) {
        // フォールバック
        outputData.select();
        document.execCommand('copy');
        alert('クリップボードにコピーしました。');
    }
}

// ファイルダウンロード
function downloadFile() {
    if (!outputData.value) {
        alert('ダウンロードする内容がありません。');
        return;
    }
    
    const outputFormat = getOutputFormat();
    const extensions = { csv: 'csv', tsv: 'tsv', json: 'json' };
    const mimeTypes = {
        csv: 'text/csv',
        tsv: 'text/tab-separated-values',
        json: 'application/json'
    };
    
    const blob = new Blob([outputData.value], { 
        type: mimeTypes[outputFormat] + ';charset=utf-8' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_data.${extensions[outputFormat]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// サンプルデータを設定
function setSampleData() {
    const inputFormat = getInputFormat();
    inputData.value = sampleData[inputFormat];
}

// イベントリスナー
convertBtn.addEventListener('click', convertData);
clearInputBtn.addEventListener('click', () => {
    inputData.value = '';
    hidePreview();
});
clearOutputBtn.addEventListener('click', () => {
    outputData.value = '';
    hidePreview();
});
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadFile);
sampleDataBtn.addEventListener('click', setSampleData);

// 入力形式変更時の処理
document.querySelectorAll('input[name="input-format"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const format = getInputFormat();
        if (format === 'json') {
            // JSONの場合は区切り文字オプションを無効化
            delimiterSelect.disabled = true;
        } else {
            delimiterSelect.disabled = false;
        }
    });
});

// Enterキーでの変換実行
inputData.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        convertData();
    }
});