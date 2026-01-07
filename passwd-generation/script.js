document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const resultDiv = document.getElementById('result');
    const errorMessage = document.getElementById('error-message');
    const useSymbolsCheckbox = document.getElementById('use-symbols');
    const symbolsContainer = document.getElementById('symbols-container');
    
    // 記号チェックボックスの状態に応じて記号入力欄の表示/非表示を切り替え
    useSymbolsCheckbox.addEventListener('change', () => {
        symbolsContainer.style.display = useSymbolsCheckbox.checked ? 'block' : 'none';
    });
    
    generateBtn.addEventListener('click', generatePasswords);
    
    function generatePasswords() {
        errorMessage.textContent = '';
        
        // 各オプションの取得
        const useNumbers = document.getElementById('use-numbers').checked;
        const useUppercase = document.getElementById('use-uppercase').checked;
        const useLowercase = document.getElementById('use-lowercase').checked;
        const useSymbols = document.getElementById('use-symbols').checked;
        const customSymbols = document.getElementById('custom-symbols').value;
        const avoidSimilar = document.getElementById('avoid-similar').checked;
        
        // 文字数の取得
        const passwordLengthInput = document.getElementById('password-length');
        let passwordLength = parseInt(passwordLengthInput.value);
        
        // 文字数の妥当性チェック
        if (isNaN(passwordLength) || passwordLength < 1 || passwordLength > 100) {
            errorMessage.textContent = 'パスワードの長さは1文字以上100文字以下で入力してください。';
            return;
        }
        
        // 生成個数の取得
        const countRadios = document.getElementsByName('count');
        let passwordCount = 10;
        for (const radio of countRadios) {
            if (radio.checked) {
                passwordCount = parseInt(radio.value);
                break;
            }
        }
        
        // 文字セットの作成
        let charset = '';
        if (useNumbers) charset += '0123456789';
        if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (useSymbols && customSymbols) charset += customSymbols;
        
        // 似ている文字を除外
        if (avoidSimilar) {
            charset = charset.replace(/[Il1O0]/g, '');
        }
        
        // 文字セットが空の場合はエラー
        if (!charset) {
            errorMessage.textContent = '少なくとも1つの文字タイプを選択してください。';
            return;
        }
        
        // パスワード生成
        const passwords = [];
        try {
            for (let i = 0; i < passwordCount; i++) {
                passwords.push(generatePassword(charset, passwordLength));
            }
            
            // 結果の表示
            displayPasswords(passwords);
        } catch (error) {
            errorMessage.textContent = error.message;
            return;
        }
    }
    
    function generatePassword(charset, length) {
        // Validate inputs more defensively
        const charsetLength = charset ? charset.length : 0;
        if (charsetLength <= 0) {
            throw new Error('文字セットが空です。少なくとも1つの文字タイプを選択してください。');
        }
        if (length <= 0) {
            return '';
        }

        let password = '';

        // Use cryptographically secure randomness via window.crypto.getRandomValues
        const cryptoObj = window.crypto;
        if (!cryptoObj || !cryptoObj.getRandomValues) {
            // Security fix: Don't fallback to insecure Math.random()
            // Instead throw an error to inform the user
            throw new Error('暗号学的に安全な乱数生成器が利用できません。モダンなブラウザでアクセスしてください。');
        }

        // Handle large charset edge case to prevent infinite loop
        if (charsetLength > 255) {
            // For very large charsets, accept slight modulo bias rather than infinite loop
            // This is an edge case that's unlikely with typical usage but needs handling
            const buffer = new Uint8Array(length);
            cryptoObj.getRandomValues(buffer);
            for (let i = 0; i < length; i++) {
                const randomIndex = buffer[i] % charsetLength;
                password += charset[randomIndex];
            }
            return password;
        }

        // Rejection-sampling to avoid modulo bias when mapping bytes to charset indices
        const maxUnbiased = Math.floor(256 / charsetLength) * charsetLength;
        const buffer = new Uint8Array(length * 2); // extra space in case of rejections
        let bufferIndex = buffer.length; // force initial refill

        for (let i = 0; i < length; i++) {
            let byte;
            while (true) {
                if (bufferIndex >= buffer.length) {
                    cryptoObj.getRandomValues(buffer);
                    bufferIndex = 0;
                }
                byte = buffer[bufferIndex++];
                if (byte < maxUnbiased) {
                    break;
                }
                // otherwise, reject and draw again
            }
            const randomIndex = byte % charsetLength;
            password += charset[randomIndex];
        }

        return password;
    }
    
    function displayPasswords(passwords) {
        resultDiv.innerHTML = '';
        
        // パスワードグリッドコンテナの作成
        const passwordGrid = document.createElement('div');
        passwordGrid.className = 'password-grid';
        resultDiv.appendChild(passwordGrid);
        
        for (let i = 0; i < passwords.length; i++) {
            const passwordItem = document.createElement('div');
            passwordItem.className = 'password-item';
            
            const passwordText = document.createElement('div');
            passwordText.className = 'password-text';
            passwordText.textContent = passwords[i];
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'コピー';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(passwords[i])
                    .then(() => {
                        copyBtn.textContent = 'コピー済み';
                        setTimeout(() => {
                            copyBtn.textContent = 'コピー';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('クリップボードへのコピーに失敗しました:', err);
                    });
            });
            
            passwordItem.appendChild(passwordText);
            passwordItem.appendChild(copyBtn);
            passwordGrid.appendChild(passwordItem);
        }
    }
    
    // 初期状態での表示設定
    if (!useSymbolsCheckbox.checked) {
        symbolsContainer.style.display = 'none';
    }
});