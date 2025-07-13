document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copySuCommandBtn = document.getElementById('copySuCommandBtn');
    const githubCheck = document.getElementById('githubCheck');

    const hostNameInput = document.getElementById('hostName');
    const ipAddressInput = document.getElementById('ipAddress');
    const userInput = document.getElementById('user');
    const portInput = document.getElementById('port');
    const identityFileInput = document.getElementById('identityFile');
    const suUserInput = document.getElementById('suUser');
    const outputTextarea = document.getElementById('output');
    const suCommandOutputTextarea = document.getElementById('suCommandOutput');

    function initialize() {
        identityFileInput.disabled = true;
        githubCheck.checked = false;
        clearForm();
    }

    function clearForm() {
        hostNameInput.value = '';
        ipAddressInput.value = '';
        userInput.value = '';
        portInput.value = '22';
        identityFileInput.value = '';
        suUserInput.value = '';
        outputTextarea.value = '';
        suCommandOutputTextarea.value = '';
        identityFileInput.disabled = !githubCheck.checked;
    }

    githubCheck.addEventListener('change', () => {
        if (githubCheck.checked) {
            hostNameInput.value = 'github.com';
            ipAddressInput.value = 'github.com';
            userInput.value = 'git';
            identityFileInput.disabled = false;
            identityFileInput.placeholder = '~/.ssh/id_rsa_github';
        } else {
            clearForm();
        }
    });

    generateBtn.addEventListener('click', () => {
        const hostName = hostNameInput.value.trim();
        const ipAddress = ipAddressInput.value.trim();
        const user = userInput.value.trim();
        const port = portInput.value.trim();
        const identityFile = identityFileInput.value.trim();
        const suUser = suUserInput.value.trim();

        if (!hostName || !ipAddress) {
            alert('ホスト名とIPアドレス/ホスト名は必須です。');
            return;
        }

        let config = `Host ${hostName}\n`;
        config += `  HostName ${ipAddress}\n`;

        if (user) {
            config += `  User ${user}\n`;
        }
        if (port && port !== '22') {
            config += `  Port ${port}\n`;
        }
        if (identityFile && !identityFileInput.disabled) {
            config += `  IdentityFile ${identityFile}\n`;
        }

        outputTextarea.value = config;

        if (suUser) {
            const suCommand = `ssh -t ${hostName} "su - ${suUser}"`;
            suCommandOutputTextarea.value = suCommand;
        } else {
            suCommandOutputTextarea.value = '';
        }
    });

    clearBtn.addEventListener('click', () => {
        githubCheck.checked = false;
        clearForm();
    });

    copyBtn.addEventListener('click', () => {
        copyToClipboard(outputTextarea.value, '設定をクリップボードにコピーしました。');
    });

    copySuCommandBtn.addEventListener('click', () => {
        copyToClipboard(suCommandOutputTextarea.value, 'suコマンドをクリップボードにコピーしました。');
    });

    function copyToClipboard(text, successMessage) {
        if (text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    alert(successMessage);
                })
                .catch(err => {
                    alert('コピーに失敗しました。');
                    console.error('Copy failed', err);
                });
        }
    }

    initialize();
});
