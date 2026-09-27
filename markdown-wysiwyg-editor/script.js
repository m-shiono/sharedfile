document.addEventListener('DOMContentLoaded', () => {
    const Editor = window.toastui && window.toastui.Editor;
    const converter = window.BacklogMarkdownConverter;
<<<<<<< HEAD
=======
    const colorSyntax = window.toastui
        && window.toastui.Editor
        && window.toastui.Editor.plugin
        && window.toastui.Editor.plugin.colorSyntax;
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)

    if (!Editor) {
        showStatus('エディタの読み込みに失敗しました。', 'error');
        return;
    }
    if (!converter) {
        showStatus('変換モジュールの読み込みに失敗しました。', 'error');
        return;
    }

<<<<<<< HEAD
=======
    const plugins = [];
    if (typeof colorSyntax === 'function') {
        plugins.push([colorSyntax, {
            preset: ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#546e7a']
        }]);
    }

>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
    const editor = new Editor({
        el: document.getElementById('editor'),
        height: '420px',
        initialEditType: 'wysiwyg',
        previewStyle: 'vertical',
<<<<<<< HEAD
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

=======
        hideModeSwitch: false,
        usageStatistics: false,
        placeholder: 'ここに文章を入力・編集してください...',
        toolbarItems: [],
        plugins: plugins
    });

    const nativeToolbar = document.querySelector('#editor .toastui-editor-toolbar');
    if (nativeToolbar) {
        nativeToolbar.style.display = 'none';
    }

>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
    const outputText = document.getElementById('output-text');
    const importText = document.getElementById('import-text');
    const applyBtn = document.getElementById('apply-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const loadBtn = document.getElementById('load-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panelOutput = document.getElementById('panel-output');
    const panelImport = document.getElementById('panel-import');
<<<<<<< HEAD
=======
    const customColorInput = document.getElementById('custom-color');
    const removeColorBtn = document.getElementById('remove-color-btn');

    let lastAppliedColor = null;
    let lastAppliedSize = null;
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)

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

<<<<<<< HEAD
    function applyToOutput() {
        const markdown = editor.getMarkdown();
        const format = getSelectedFormat();
        const text = format === 'backlog'
            ? converter.markdownToBacklog(markdown)
            : markdown;
=======
    function getEditorRoot() {
        return document.querySelector('#editor .toastui-editor-contents')
            || document.querySelector('#editor .ProseMirror');
    }

    function findAncestor(tags) {
        const root = getEditorRoot();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return null;
        let node = sel.anchorNode;
        if (!node) return null;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        const tagSet = tags.map((t) => t.toLowerCase());
        while (node && node !== root) {
            if (node.tagName && tagSet.includes(node.tagName.toLowerCase())) {
                return node;
            }
            node = node.parentElement;
        }
        return null;
    }

    function isInTag(tags) {
        return !!findAncestor(tags);
    }

    function normalizeHex(color) {
        if (!color) return '';
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return String(color).toLowerCase();
        ctx.fillStyle = color;
        const computed = ctx.fillStyle;
        const m = String(computed).match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (m) {
            return '#' + [m[1], m[2], m[3]]
                .map((n) => Number(n).toString(16).padStart(2, '0'))
                .join('');
        }
        return String(computed).toLowerCase();
    }

    function getSelectionColor() {
        const span = findAncestor(['span', 'font']);
        if (!span) return null;
        const styleColor = span.style && span.style.color;
        const attrColor = span.getAttribute && span.getAttribute('color');
        const color = styleColor || attrColor;
        return color ? normalizeHex(color) : null;
    }

    function getSelectionFontSize() {
        const el = findAncestor(['span', 'font']);
        if (!el) return null;
        const size = (el.style && el.style.fontSize) || '';
        const m = String(size).match(/(\d+)/);
        return m ? m[1] : null;
    }

    function focusEditor() {
        const root = getEditorRoot();
        if (root) root.focus();
    }

    function execSafe(command, payload) {
        focusEditor();
        try {
            if (payload === undefined) {
                editor.exec(command);
            } else {
                editor.exec(command, payload);
            }
            return true;
        } catch (err) {
            console.warn('exec failed:', command, err);
            return false;
        }
    }

    function insertPlain(text) {
        focusEditor();
        try {
            editor.insertText(text);
        } catch (err) {
            document.execCommand('insertText', false, text);
        }
    }

    function runFormatCommand(cmd, level) {
        focusEditor();

        switch (cmd) {
            case 'undo':
                if (!execSafe('undo')) document.execCommand('undo');
                break;
            case 'redo':
                if (!execSafe('redo')) document.execCommand('redo');
                break;
            case 'clearFormat':
                clearFormatting();
                break;
            case 'heading': {
                const current = findAncestor(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
                const currentLevel = current ? Number(current.tagName.slice(1)) : null;
                if (currentLevel === Number(level)) {
                    execSafe('heading', { level: Number(level) });
                    if (isInTag(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])) {
                        execSafe('paragraph');
                    }
                } else {
                    execSafe('heading', { level: Number(level) });
                }
                break;
            }
            case 'bold':
            case 'italic':
            case 'strike':
            case 'code':
                execSafe(cmd);
                break;
            case 'quote':
                execSafe('blockQuote');
                break;
            case 'ul':
                execSafe('bulletList');
                break;
            case 'ol':
                execSafe('orderedList');
                break;
            case 'task':
                execSafe('taskList');
                break;
            case 'indent':
                execSafe('indent');
                break;
            case 'outdent':
                execSafe('outdent');
                break;
            case 'hr':
                execSafe('hr');
                break;
            case 'br':
                // Markdown: 行末2スペース+改行 / HTML br。表示は br
                try {
                    editor.replaceSelection('<br>');
                } catch (e) {
                    document.execCommand('insertHTML', false, '<br>');
                }
                break;
            case 'codeblock':
                execSafe('codeBlock');
                break;
            case 'table':
                execSafe('addTable', { rows: 3, columns: 3, dataWithHeaders: false });
                break;
            case 'link': {
                const url = window.prompt('リンクURLを入力してください', 'https://');
                if (!url) return;
                const text = editor.getSelectedText() || url;
                execSafe('addLink', { linkUrl: url, linkText: text });
                break;
            }
            default:
                break;
        }
    }

    function clearFormatting() {
        focusEditor();
        document.execCommand('removeFormat');
        // 色・サイズ・下線の span/u を可能な範囲で剥がす
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || sel.isCollapsed) {
            showStatus('書式をクリアする文字を選択してください。', 'error');
            return;
        }
        const text = editor.getSelectedText();
        if (text) {
            try {
                editor.replaceSelection(text);
            } catch (e) {
                document.execCommand('insertText', false, text);
            }
        }
        lastAppliedColor = null;
        lastAppliedSize = null;
        showStatus('書式をクリアしました。', 'success');
    }

    function toggleUnderline() {
        focusEditor();
        const selected = editor.getSelectedText();
        if (!selected) {
            showStatus('下線を付ける文字を選択してください。', 'error');
            return;
        }
        if (isInTag(['u'])) {
            try {
                editor.replaceSelection(selected);
            } catch (e) {
                document.execCommand('underline'); // toggle off
            }
            showStatus('下線を解除しました。', 'success');
            return;
        }
        // トグル: execCommand が使えればそちら
        const ok = document.execCommand('underline');
        if (!ok) {
            try {
                editor.replaceSelection('<u>' + selected + '</u>');
            } catch (e) {
                document.execCommand('insertHTML', false, '<u>' + selected + '</u>');
            }
        }
        showStatus('下線を適用しました（Backlog専用）。', 'success');
    }

    function applyFontSize(sizePx) {
        focusEditor();
        const selected = editor.getSelectedText();
        if (!selected) {
            showStatus('サイズを変える文字を選択してください。', 'error');
            return;
        }
        const current = getSelectionFontSize();
        if (current && String(current) === String(sizePx)) {
            removeFontSize();
            return;
        }
        const html = `<span style="font-size: ${sizePx}px" data-backlog-size="${sizePx}">${selected}</span>`;
        try {
            editor.replaceSelection(html);
        } catch (e) {
            document.execCommand('insertHTML', false, html);
        }
        lastAppliedSize = String(sizePx);
        showStatus(`文字サイズ ${sizePx}px を適用しました（Backlog専用）。`, 'success');
    }

    function removeFontSize() {
        focusEditor();
        const selected = editor.getSelectedText();
        if (!selected) {
            showStatus('サイズを解除する文字を選択してください。', 'error');
            return;
        }
        const span = findAncestor(['span']);
        if (span && span.style && span.style.fontSize) {
            const parent = span.parentNode;
            while (span.firstChild) parent.insertBefore(span.firstChild, span);
            parent.removeChild(span);
        } else {
            try {
                editor.replaceSelection(selected);
            } catch (e) {
                document.execCommand('insertText', false, selected);
            }
        }
        lastAppliedSize = null;
        showStatus('文字サイズを解除しました。', 'success');
    }

    function applyColor(color) {
        focusEditor();
        const hex = normalizeHex(color);
        const current = getSelectionColor();

        if ((current && hex && current === hex) || (lastAppliedColor && hex === lastAppliedColor && current === hex)) {
            removeColor();
            return;
        }

        if (!editor.getSelectedText()) {
            showStatus('色を付ける文字を選択してください。', 'error');
            return;
        }

        try {
            editor.exec('color', { selectedColor: hex });
            lastAppliedColor = hex;
            showStatus('文字色を適用しました（Backlog専用）。', 'success');
        } catch (err) {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('foreColor', false, hex);
            lastAppliedColor = hex;
            showStatus('文字色を適用しました（Backlog専用）。', 'success');
        }
    }

    function removeColor() {
        focusEditor();
        try {
            editor.exec('color', { selectedColor: '' });
        } catch (err) {
            // ignore
        }

        const sel = window.getSelection();
        if (sel && sel.rangeCount && !sel.isCollapsed) {
            const span = findAncestor(['span', 'font']);
            if (span && (span.style.color || span.getAttribute('color'))) {
                const parent = span.parentNode;
                while (span.firstChild) parent.insertBefore(span.firstChild, span);
                parent.removeChild(span);
            }
        }

        lastAppliedColor = null;
        showStatus('文字色を解除しました。', 'success');
    }

    function runBacklogCommand(cmd, size) {
        switch (cmd) {
            case 'underline':
                toggleUnderline();
                break;
            case 'size':
                applyFontSize(size);
                break;
            case 'removeSize':
                removeFontSize();
                break;
            case 'contents':
                insertPlain('#contents\n');
                showStatus('目次（#contents）を挿入しました。', 'success');
                break;
            case 'wikiLink': {
                const name = window.prompt('Wikiページ名を入力してください', '');
                if (!name) return;
                const selected = editor.getSelectedText();
                const label = selected || name;
                // ページ名のみの Wiki リンク（URL付きは汎用リンクを使う）
                if (selected && selected !== name) {
                    insertPlain('[[' + name + ']]');
                } else {
                    insertPlain('[[' + label + ']]');
                }
                showStatus('Wikiリンクを挿入しました。', 'success');
                break;
            }
            case 'include': {
                const name = window.prompt('読み込むWikiページ名を入力してください', '');
                if (!name) return;
                insertPlain('#include(' + name + ')\n');
                showStatus('include を挿入しました。', 'success');
                break;
            }
            case 'rev': {
                const num = window.prompt('改訂番号を入力してください', '1');
                if (num === null || num === '') return;
                insertPlain('#rev(' + num + ')\n');
                showStatus('rev を挿入しました。', 'success');
                break;
            }
            default:
                break;
        }
    }

    function applyToOutput() {
        let markdown = editor.getMarkdown();
        markdown = converter.enrichMarkdownFromHtml(markdown, editor.getHTML());

        const format = getSelectedFormat();
        let text;
        if (format === 'backlog') {
            text = converter.markdownToBacklog(markdown);
        } else {
            text = converter.normalizeMarkdownExtras(markdown);
        }
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)

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
<<<<<<< HEAD
        showStatus('クリアしました。', 'success');
    }

=======
        lastAppliedColor = null;
        lastAppliedSize = null;
        showStatus('クリアしました。', 'success');
    }

    document.getElementById('general-toolbar').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cmd]');
        if (!btn) return;
        runFormatCommand(btn.dataset.cmd, btn.dataset.level);
    });

    document.getElementById('backlog-toolbar').addEventListener('click', (e) => {
        const colorBtn = e.target.closest('.tb-color');
        if (colorBtn) {
            applyColor(colorBtn.dataset.color);
            return;
        }
        const blBtn = e.target.closest('[data-bl-cmd]');
        if (blBtn) {
            runBacklogCommand(blBtn.dataset.blCmd, blBtn.dataset.size);
        }
    });

    customColorInput.addEventListener('change', () => {
        applyColor(customColorInput.value);
    });

    removeColorBtn.addEventListener('click', () => removeColor());

>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    applyBtn.addEventListener('click', applyToOutput);
    loadBtn.addEventListener('click', loadIntoEditor);
    copyBtn.addEventListener('click', copyOutput);
    clearBtn.addEventListener('click', clearAll);
});
