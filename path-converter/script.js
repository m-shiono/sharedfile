// Path変換ツール - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素の取得
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const manualOptions = document.getElementById('manual-options');
    const fromFormat = document.getElementById('from-format');
    const toFormat = document.getElementById('to-format');
    const inputPath = document.getElementById('inputPath');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const statusBar = document.getElementById('statusBar');
    const resultsContainer = document.getElementById('results');

    // サンプルパス
    const samplePaths = [
        'C:\\Users\\username\\Documents\\file.txt',
        '/home/user/documents/file.txt',
        'C:\\\\Program Files\\\\Application\\\\config.json',
        '\\\\server\\share\\folder\\document.pdf',
        'file:///C:/temp/data.csv',
        './relative/path/file.js',
        '../parent/folder/image.png'
    ];

    // パス形式の判定
    function detectPathFormat(path) {
        const trimmedPath = path.trim();
        
        // 空のパスチェック
        if (!trimmedPath) {
            return 'unknown';
        }
        
        // URL形式のチェック (file:///で始まる)
        if (trimmedPath.match(/^file:\/\/\//)) {
            return 'url';
        }
        
        // UNC形式のチェック (\\server\shareの形式)
        if (trimmedPath.match(/^\\\\[^\\]+\\[^\\]/)) {
            return 'unc';
        }
        
        // Windows形式のチェック (C:\pathの形式)
        if (trimmedPath.match(/^[A-Za-z]:\\/)) {
            return 'windows';
        }
        
        // エスケープ済み形式のチェック (\\が含まれる)
        if (trimmedPath.includes('\\\\')) {
            return 'escaped';
        }
        
        // Unix形式のチェック (/で始まる)
        if (trimmedPath.startsWith('/')) {
            return 'unix';
        }
        
        // その他のバックスラッシュを含むパス (Windowsの可能性)
        if (trimmedPath.includes('\\')) {
            return 'windows';
        }
        
        // その他のスラッシュを含むパス
        if (trimmedPath.includes('/')) {
            return 'unix';
        }
        
        return 'unknown';
    }

    // パス変換関数
    const pathConverters = {
        toWindows: function(path, fromFormat) {
            let result = path;
            
            switch (fromFormat) {
                case 'unix':
                    result = result.replace(/\//g, '\\');
                    // ドライブレターの処理 (/C/ -> C:\)
                    result = result.replace(/^\\([A-Za-z])/, '$1:');
                    break;
                case 'url':
                    result = result.replace(/^file:\/\/\//, '');
                    result = result.replace(/\//g, '\\');
                    break;
                case 'escaped':
                    result = result.replace(/\\\\/g, '\\');
                    break;
                case 'unc':
                    // UNC形式はそのまま
                    break;
            }
            
            return result;
        },

        toUnix: function(path, fromFormat) {
            let result = path;
            
            switch (fromFormat) {
                case 'windows':
                    result = result.replace(/\\/g, '/');
                    // ドライブレターの処理
                    result = result.replace(/^([A-Za-z]):/, '/$1');
                    break;
                case 'escaped':
                    result = result.replace(/\\\\/g, '/');
                    result = result.replace(/^([A-Za-z]):/, '/$1');
                    break;
                case 'url':
                    result = result.replace(/^file:\/\/\//, '/');
                    result = result.replace(/^([A-Za-z]):/, '/$1');
                    break;
                case 'unc':
                    // Convert UNC path \\server\share\path\to\file to /mnt/server/share/path/to/file
                    if (result.startsWith('\\\\')) {
                        // Remove leading '\\'
                        let uncPath = result.slice(2);
                        // Split into components
                        let parts = uncPath.split('\\');
                        if (parts.length >= 2) {
                            // /mnt/server/share/path/to/file
                            let unixPath = '/mnt/' + parts[0] + '/' + parts[1];
                            if (parts.length > 2) {
                                unixPath += '/' + parts.slice(2).join('/');
                            }
                            result = unixPath;
                        }
                    }
                    break;
            }
            
            return result;
        },

        toEscaped: function(path, fromFormat) {
            let result = path;
            
            switch (fromFormat) {
                case 'unix':
                    result = result.replace(/^\/([A-Za-z])/, '$1:');
                    result = result.replace(/\//g, '\\\\');
                    break;
                case 'windows':
                    result = result.replace(/\\/g, '\\\\');
                    break;
                case 'url':
                    result = result.replace(/^file:\/\/\//, '');
                    result = result.replace(/\//g, '\\\\');
                    break;
                case 'unc':
                    result = result.replace(/\\/g, '\\\\');
                    break;
            }
            
            return result;
        },

        toUrl: function(path, fromFormat) {
            let result = path;
            
            switch (fromFormat) {
                case 'windows':
                    result = 'file:///' + result.replace(/\\/g, '/');
                    break;
                case 'unix':
                    if (result.match(/^\/[A-Za-z](?:\/|$)/)) {
                        // It's a path with a drive letter like /C/Users... or /C
                        const drive = result.charAt(1);
                        const rest = result.substring(2);
                        result = `file:///${drive}:${rest}`;
                    } else {
                        // It's a standard Unix path like /home/user...
                        result = 'file://' + result;
                    }
                    break;
                case 'escaped':
                    result = result.replace(/\\\\/g, '/');
                    result = 'file:///' + result;
                    break;
                case 'unc':
                    // Remove leading \\ and convert to file://server/share format
                    result = result.replace(/^\\\\/g, '');
                    result = 'file://' + result.replace(/\\/g, '/');
                    break;
            }
            
            return result;
        }
    };

    // 入力値の検証
    function validatePathInput(path) {
        if (!path || typeof path !== 'string') {
            return { valid: false, error: 'パスが入力されていません' };
        }
        
        const trimmed = path.trim();
        if (!trimmed) {
            return { valid: false, error: 'パスが空です' };
        }
        
        if (trimmed.length > 32768) {
            return { valid: false, error: 'パスが長すぎます (32KB制限)' };
        }
        
        // 危険な文字のチェック
        const dangerousChars = /[\x00-\x1f\x7f]/;
        if (dangerousChars.test(trimmed)) {
            return { valid: false, error: '無効な制御文字が含まれています' };
        }
        
        return { valid: true, path: trimmed };
    }

    // 全形式に変換
    function convertToAllFormats(inputPath) {
        const validation = validatePathInput(inputPath);
        if (!validation.valid) {
            return { error: validation.error };
        }
        
        const cleanPath = validation.path;
        const detectedFormat = detectPathFormat(cleanPath);
        
        if (detectedFormat === 'unknown') {
            return { error: 'パス形式を判定できませんでした。正しいパス形式で入力してください。' };
        }
        
        const results = {
            detected: detectedFormat,
            conversions: {}
        };

        // 各形式に変換
        try {
            results.conversions.windows = pathConverters.toWindows(cleanPath, detectedFormat);
            results.conversions.unix = pathConverters.toUnix(cleanPath, detectedFormat);
            results.conversions.escaped = pathConverters.toEscaped(cleanPath, detectedFormat);
            results.conversions.url = pathConverters.toUrl(cleanPath, detectedFormat);
        } catch (error) {
            console.error('変換エラー:', error);
            results.error = `変換中にエラーが発生しました: ${error.message}`;
        }

        return results;
    }

    // 手動変換
    function convertManual(inputPath, fromFormat, toFormat) {
        const validation = validatePathInput(inputPath);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        if (!fromFormat || !toFormat) {
            throw new Error('変換元と変換先の形式を選択してください');
        }
        
        const converterMap = {
            'windows': pathConverters.toWindows,
            'unix': pathConverters.toUnix,
            'escaped': pathConverters.toEscaped,
            'url': pathConverters.toUrl
        };

        const converter = converterMap[toFormat];
        if (!converter) {
            throw new Error('不明な変換形式です: ' + toFormat);
        }

        if (!converterMap[fromFormat]) {
            throw new Error('不明な変換元形式です: ' + fromFormat);
        }

        try {
            return converter(validation.path, fromFormat);
        } catch (error) {
            throw new Error(`変換中にエラーが発生しました: ${error.message}`);
        }
    }

    // 結果を表示
    function displayResults(results, isManual = false, manualResult = null) {
        resultsContainer.innerHTML = '';

        if (results.error) {
            statusBar.innerHTML = `<span class="error">エラー: ${results.error}</span>`;
            return;
        }

        if (isManual && manualResult) {
            // 手動変換の結果表示
            statusBar.innerHTML = '<span class="success">変換完了</span>';
            
            const manualFormatNames = {
                'windows': 'Windows形式',
                'unix': 'Unix形式',
                'escaped': 'エスケープ済み',
                'url': 'URL形式'
            };

            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            resultDiv.innerHTML = `
                <h4>${manualFormatNames[toFormat.value] || toFormat.value}</h4>
                <div class="result-text" data-path="${escapeHtmlAttribute(manualResult)}">${escapeHtml(manualResult)}</div>
            `;
            resultsContainer.appendChild(resultDiv);
        } else {
            // 自動変換の結果表示
            const formatNames = {
                'windows': 'Windows形式 (\\)',
                'unix': 'Unix形式 (/)', 
                'escaped': 'エスケープ済み (\\\\)',
                'url': 'URL形式',
                'unknown': '不明な形式'
            };

            statusBar.innerHTML = `<span class="success">検出形式: ${formatNames[results.detected] || results.detected} → 全形式に変換完了</span>`;

            Object.entries(results.conversions).forEach(([format, path]) => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';
                
                const isOriginal = format === results.detected;
                resultDiv.innerHTML = `
                    <h4>${formatNames[format]} ${isOriginal ? '<small>(元の形式)</small>' : ''}</h4>
                    <div class="result-text ${isOriginal ? 'original' : ''}" data-path="${escapeHtmlAttribute(path)}">${escapeHtml(path)}</div>
                `;
                resultsContainer.appendChild(resultDiv);
            });
        }

        // クリックでコピー機能を追加
        document.querySelectorAll('.result-text').forEach(element => {
            element.addEventListener('click', function() {
                const path = this.getAttribute('data-path');
                navigator.clipboard.writeText(path).then(() => {
                    showToast('クリップボードにコピーしました');
                }).catch(err => {
                    console.error('コピーに失敗しました:', err);
                });
            });
        });
    }

    // HTMLエスケープ
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // HTML属性エスケープ
    function escapeHtmlAttribute(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // トースト通知
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }

    // イベントリスナー
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'manual') {
                manualOptions.classList.remove('hidden');
            } else {
                manualOptions.classList.add('hidden');
            }
        });
    });

    convertBtn.addEventListener('click', function() {
        const path = inputPath.value.trim();
        if (!path) {
            statusBar.innerHTML = '<span class="error">パスを入力してください</span>';
            return;
        }

        const isManualMode = document.querySelector('input[name="mode"]:checked').value === 'manual';

        try {
            if (isManualMode) {
                const result = convertManual(path, fromFormat.value, toFormat.value);
                displayResults(null, true, result);
            } else {
                const results = convertToAllFormats(path);
                displayResults(results);
            }
        } catch (error) {
            statusBar.innerHTML = `<span class="error">変換エラー: ${error.message}</span>`;
        }
    });

    clearBtn.addEventListener('click', function() {
        inputPath.value = '';
        resultsContainer.innerHTML = '';
        statusBar.innerHTML = '';
    });

    sampleBtn.addEventListener('click', function() {
        const randomSample = samplePaths[Math.floor(Math.random() * samplePaths.length)];
        inputPath.value = randomSample;
    });

    // Enterキーで変換
    inputPath.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            convertBtn.click();
        }
    });
});