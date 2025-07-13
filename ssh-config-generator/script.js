document.addEventListener('DOMContentLoaded', () => {
    const githubIdentityFileInput = document.getElementById('githubIdentityFile');
    const hostsTableBody = document.querySelector('#hostsTable tbody');
    const addRowBtn = document.getElementById('addRowBtn');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const outputTextarea = document.getElementById('output');

    const initialRows = 1;

    function createRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" placeholder="my-server" class="hostName"></td>
            <td><input type="text" placeholder="192.168.1.100" class="ipAddress"></td>
            <td><input type="text" placeholder="ec2-user" class="user"></td>
            <td><input type="number" placeholder="22" value="22" class="port"></td>
            <td><input type="text" placeholder="~/.ssh/id_rsa" class="identityFile"></td>
            <td><input type="text" placeholder="root" class="suUser"></td>
            <td><button class="deleteRowBtn">削除</button></td>
        `;
        hostsTableBody.appendChild(row);
    }

    function initializeTable() {
        hostsTableBody.innerHTML = '';
        for (let i = 0; i < initialRows; i++) {
            createRow();
        }
    }

    addRowBtn.addEventListener('click', createRow);

    hostsTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('deleteRowBtn')) {
            if (hostsTableBody.rows.length > 1) {
                e.target.closest('tr').remove();
            } else {
                alert('最後の行は削除できません。');
            }
        }
    });

    generateBtn.addEventListener('click', () => {
        let fullConfig = '';
        const githubIdentityFile = githubIdentityFileInput.value.trim();

        if (githubIdentityFile) {
            fullConfig += `Host github.com\n`;
            fullConfig += `  HostName github.com\n`;
            fullConfig += `  User git\n`;
            fullConfig += `  IdentityFile ${githubIdentityFile}\n\n`;
        }

        const rows = hostsTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const hostName = row.querySelector('.hostName').value.trim();
            const ipAddress = row.querySelector('.ipAddress').value.trim();
            const user = row.querySelector('.user').value.trim();
            const port = row.querySelector('.port').value.trim();
            const identityFile = row.querySelector('.identityFile').value.trim();
            const suUser = row.querySelector('.suUser').value.trim();

            if (hostName && ipAddress) {
                let hostConfig = `Host ${hostName}\n`;
                hostConfig += `  HostName ${ipAddress}\n`;
                if (user) hostConfig += `  User ${user}\n`;
                if (port && port !== '22') hostConfig += `  Port ${port}\n`;
                if (identityFile) hostConfig += `  IdentityFile ${identityFile}\n`;
                if (suUser) hostConfig += `  # su command: ssh -t ${hostName} "su - ${suUser}"\n`;

                fullConfig += hostConfig + '\n';
            }
        });

        outputTextarea.value = fullConfig;
    });

    clearBtn.addEventListener('click', () => {
        githubIdentityFileInput.value = '';
        initializeTable();
        outputTextarea.value = '';
    });

    copyBtn.addEventListener('click', () => {
        if (outputTextarea.value) {
            navigator.clipboard.writeText(outputTextarea.value)
                .then(() => alert('設定をクリップボードにコピーしました。'))
                .catch(err => {
                    alert('コピーに失敗しました。');
                    console.error('Copy failed', err);
                });
        }
    });

    initializeTable();
});
