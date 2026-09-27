document.addEventListener('DOMContentLoaded', () => {
    const Editor = window.toastui && window.toastui.Editor;
    const converter = window.BacklogMarkdownConverter;

    if (!Editor) {
        showStatus('エディタの読み込みに失敗しました。', 'error');
        return;
    }
    if (!converter) {
        showStatus('変換モジュールの読み込みに失敗しました。', 'error');
        return;
    }

    const editor = new Editor({
        el: document.getElementById('editor'),
        height: '420px',
        initialEditType: 'wysiwyg',
        previewStyle: 'vertical',
        usageStatistics: false,
        placeholder: 'ここに文章を入力・編集してください...',
        toolbarItems: [
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'task', 'indent', 'outdent'],
            ['table', 'image', 'link'],
            ['code', 'codeblock'],
            ['scrollSync']
        ]
    });

    const outputText = document.getElementById('output-text');
    const importText = document.getElementById('import-text');
    const applyBtn = document.getElementById('apply-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const loadBtn = document.getElementById('load-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panelOutput = document.getElementById('panel-output');
    const panelImport = document.getElementById('panel-import');

    function getSelectedFormat() {
        const checked = document.querySelector('input[name="output-format"]:checked');
        return checked ? checked.value : 'markdown';
    }

    function showStatus(message, type) {
        const bar = document.getElementById('statusBar');
        if (!bar) return;
        bar.textContent = message || '';
        bar.className = 'status-bar' + (type ? ' ' + type : '');
        if (message && type === 'success') {
            window.clearTimeout(showStatus._timer);
            showStatus._timer = window.setTimeout(() => {
                bar.textContent = '';
                bar.className = 'status-bar';
            }, 3000);
        }
    }

    function switchTab(tabName) {
        tabButtons.forEach((btn) => {
            const active = btn.dataset.tab === tabName;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        const showOutput = tabName === 'output';
        panelOutput.hidden = !showOutput;
        panelImport.hidden = showOutput;
        panelOutput.classList.toggle('active', showOutput);
        panelImport.classList.toggle('active', !showOutput);
    }

    function applyToOutput() {
        const markdown = editor.getMarkdown();
        const format = getSelectedFormat();
        const text = format === 'backlog'
            ? converter.markdownToBacklog(markdown)
            : markdown;

        outputText.value = text;
        switchTab('output');
        showStatus(
            format === 'backlog'
                ? 'Backlog形式で出力しました。'
                : 'Markdown形式で出力しました。',
            'success'
        );
    }

    function loadIntoEditor() {
        const raw = importText.value;
        if (!raw.trim()) {
            showStatus('インポートするテキストを入力してください。', 'error');
            return;
        }

        const format = getSelectedFormat();
        const markdown = format === 'backlog'
            ? converter.backlogToMarkdown(raw)
            : raw;

        editor.setMarkdown(markdown);
        showStatus(
            format === 'backlog'
                ? 'Backlog形式を読み込み、編集画面に反映しました。'
                : 'Markdown形式を読み込み、編集画面に反映しました。',
            'success'
        );
    }

    async function copyOutput() {
        const text = outputText.value;
        if (!text) {
            showStatus('コピーする出力がありません。先に「反映」してください。', 'error');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            showStatus('クリップボードにコピーしました。', 'success');
        } catch (err) {
            outputText.focus();
            outputText.select();
            showStatus('コピーに失敗しました。手動で選択してコピーしてください。', 'error');
        }
    }

    function clearAll() {
        editor.setMarkdown('');
        outputText.value = '';
        importText.value = '';
        showStatus('クリアしました。', 'success');
    }

    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    applyBtn.addEventListener('click', applyToOutput);
    loadBtn.addEventListener('click', loadIntoEditor);
    copyBtn.addEventListener('click', copyOutput);
    clearBtn.addEventListener('click', clearAll);
});
