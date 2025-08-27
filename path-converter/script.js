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
        
        if (trimmedPath.match(/^file:\/\/\//)) {
            return 'url';
        } else if (trimmedPath.match(/\\\\\\\\/)) {
            return 'escaped';
        } else if (trimmedPath.match(/^\\\\[^\\]/)) {
            return 'unc';
        } else if (trimmedPath.match(/^[A-Za-z]:\\/)) {
            return 'windows';
        } else if (trimmedPath.startsWith('/')) {
            return 'unix';
        } else if (trimmedPath.includes('\\')) {
            return 'windows';
        } else if (trimmedPath.includes('/')) {
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
                case 'url':
                    result = result.replace(/^file:\/\/\//, '');
                    result = result.replace(/\//g, '\\');
                    break;
                case 'escaped':
                    result = result.replace(/\\\\\\\\/g, '\\\\').replace(/\\\\/g, '\\');
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
                    result = result.replace(/\\\\\\\\/g, '/');
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
                        } else {
                            // Malformed UNC path, return as-is
                            result = result;
                        }
                    } else {
                        // Not a UNC path, return as-is
                        result = result;
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
                        // It's a path with a drive letter like /C/Users...
                        const pathAfterRoot = result.substring(1);
                        const drive = pathAfterRoot.substring(0, 1);
                        const rest = pathAfterRoot.substring(1);
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
                    result = 'file://' + result.replace(/\\/g, '/');
                    break;
            }
            
            return result;
        }
    };

    // 全形式に変換
    function convertToAllFormats(inputPath) {
        const detectedFormat = detectPathFormat(inputPath);
        const results = {
            detected: detectedFormat,
            conversions: {}
        };

        // 各形式に変換
        try {
            results.conversions.windows = pathConverters.toWindows(inputPath, detectedFormat);
            results.conversions.unix = pathConverters.toUnix(inputPath, detectedFormat);
            results.conversions.escaped = pathConverters.toEscaped(inputPath, detectedFormat);
            results.conversions.url = pathConverters.toUrl(inputPath, detectedFormat);
        } catch (error) {
            console.error('変換エラー:', error);
            results.error = error.message;
        }

        return results;
    }

    // 手動変換
    function convertManual(inputPath, fromFormat, toFormat) {
        const converterMap = {
            'windows': pathConverters.toWindows,
            'unix': pathConverters.toUnix,
            'escaped': pathConverters.toEscaped,
            'url': pathConverters.toUrl
        };

        const converter = converterMap[toFormat];
        if (!converter) {
            throw new Error('不明な変換形式です');
        }

        return converter(inputPath, fromFormat);
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
                <div class="result-text" data-path="${manualResult}">${escapeHtml(manualResult)}</div>
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
                    <div class="result-text ${isOriginal ? 'original' : ''}" data-path="${path}">${escapeHtml(path)}</div>
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