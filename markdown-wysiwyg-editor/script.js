document.addEventListener('DOMContentLoaded', () => {
    const Editor = window.toastui && window.toastui.Editor;
    const converter = window.BacklogMarkdownConverter;
    const colorSyntax = window.toastui
        && window.toastui.Editor
        && window.toastui.Editor.plugin
        && window.toastui.Editor.plugin.colorSyntax;

    if (!Editor) {
        showStatus('エディタの読み込みに失敗しました。', 'error');
        return;
    }
    if (!converter) {
        showStatus('変換モジュールの読み込みに失敗しました。', 'error');
        return;
    }

    const plugins = [];
    if (typeof colorSyntax === 'function') {
        plugins.push([colorSyntax, {
            preset: ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#546e7a']
        }]);
    }

    const editor = new Editor({
        el: document.getElementById('editor'),
        height: '420px',
        initialEditType: 'wysiwyg',
        previewStyle: 'vertical',
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

    setupTableContextMenuGuard();

    const outputText = document.getElementById('output-text');
    const importText = document.getElementById('import-text');
    const applyBtn = document.getElementById('apply-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const loadBtn = document.getElementById('load-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panelOutput = document.getElementById('panel-output');
    const panelImport = document.getElementById('panel-import');
    const customColorInput = document.getElementById('custom-color');
    const removeColorBtn = document.getElementById('remove-color-btn');

    let lastAppliedColor = null;
    let lastAppliedSize = null;

    /**
     * 表コンテキストメニューが画面・エディタ下端で隠れないよう位置補正する
     */
    function setupTableContextMenuGuard() {
        const root = document.getElementById('editor');
        if (!root) return;

        let rafId = 0;
        const schedule = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                rafId = 0;
                repositionContextMenus();
            });
        };

        const observer = new MutationObserver(schedule);
        observer.observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        // エディタ外（body直下）にメニューが出る場合にも対応
        observer.observe(document.body, { childList: true });

        window.addEventListener('resize', schedule);
        root.addEventListener('scroll', schedule, true);
    }

    function repositionContextMenus() {
        if (repositionContextMenus._busy) return;
        repositionContextMenus._busy = true;
        try {
            document.querySelectorAll('.toastui-editor-context-menu').forEach((menu) => {
                if (!(menu instanceof HTMLElement)) return;
                const style = window.getComputedStyle(menu);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    menu.style.transform = '';
                    return;
                }

                // いったん補正を外して実位置を測る
                menu.style.transform = '';
                menu.style.maxHeight = '';

                const pad = 8;
                const rect = menu.getBoundingClientRect();
                if (rect.width < 2 || rect.height < 2) return;

                const viewH = window.innerHeight;
                const viewW = window.innerWidth;
                const menuHeight = rect.height;

                let ty = 0;
                let tx = 0;

                if (rect.bottom > viewH - pad) {
                    ty = (viewH - pad) - rect.bottom;
                }
                if (rect.top + ty < pad) {
                    ty = pad - rect.top;
                }
                if (rect.right > viewW - pad) {
                    tx = (viewW - pad) - rect.right;
                }
                if (rect.left + tx < pad) {
                    tx = pad - rect.left;
                }

                const maxH = Math.max(120, Math.min(menuHeight, viewH - 2 * pad));
                if (menuHeight > maxH) {
                    menu.style.maxHeight = maxH + 'px';
                    menu.style.overflowY = 'auto';
                    const rect2 = menu.getBoundingClientRect();
                    if (rect2.bottom > viewH - pad) {
                        ty = (viewH - pad) - rect2.bottom;
                    }
                    if (rect2.top + ty < pad) {
                        ty = pad - rect2.top;
                    }
                }

                if (tx || ty) {
                    menu.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
                }
                menu.style.zIndex = '2000';
            });
        } finally {
            repositionContextMenus._busy = false;
        }
    }

    function getSelectedFormat() {
        const checked = document.querySelector('input[name="output-format"]:checked');
        return checked ? checked.value : 'markdown';
    }

    /** 出力形式に合わせて編集画面の見た目（見出し下線など）を切替 */
    function applyDisplayStyle(format) {
        const editorEl = document.getElementById('editor');
        const indicator = document.getElementById('display-style-indicator');
        const mode = format === 'backlog' ? 'backlog' : 'markdown';
        if (editorEl) {
            editorEl.classList.remove('display-style-markdown', 'display-style-backlog');
            editorEl.classList.add('display-style-' + mode);
        }
        if (indicator) {
            if (format === 'html') {
                indicator.textContent = '表示スタイル: Markdown（HTML出力時も編集画面は同じ見た目です）';
            } else if (mode === 'backlog') {
                indicator.textContent = '表示スタイル: Backlog（下線は H1・H2 のみ / H1が太く H2は細い）';
            } else {
                indicator.textContent = '表示スタイル: Markdown（下線は H1・H2 のみ / H1が太く H2は細い）';
            }
        }
    }

    applyDisplayStyle(getSelectedFormat());

    document.querySelectorAll('input[name="output-format"]').forEach((radio) => {
        radio.addEventListener('change', () => {
            applyDisplayStyle(getSelectedFormat());
        });
    });

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

    function findCodeBlockElement() {
        const sel = window.getSelection();
        if (!sel || !sel.anchorNode) return null;
        let node = sel.anchorNode;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

        const editorEl = document.getElementById('editor');
        while (node && node !== editorEl) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = /** @type {Element} */ (node);
                if (el.tagName === 'PRE') return el;
                if (el.classList
                    && (el.classList.contains('toastui-editor-ww-code-block')
                        || el.classList.contains('toastui-editor-ww-code-block-highlighting'))) {
                    return el;
                }
            }
            node = node.parentElement;
        }
        return null;
    }

    function isInCodeBlock() {
        return !!findCodeBlockElement();
    }

    /** 外側の ``` フェンスをすべて剥がす（入れ子で増えた分もまとめて除去） */
    function peelFences(text) {
        let s = String(text || '').replace(/\r\n/g, '\n').replace(/^\n+|\n+$/g, '');
        for (let i = 0; i < 30; i += 1) {
            if (!s.startsWith('```')) break;
            const firstNl = s.indexOf('\n');
            if (firstNl < 0) break;
            const lastNl = s.lastIndexOf('\n');
            if (lastNl <= firstNl) break;
            const openLine = s.slice(0, firstNl);
            const lastLine = s.slice(lastNl + 1);
            if (!/^```/.test(openLine) || !/^```/.test(lastLine)) break;
            s = s.slice(firstNl + 1, lastNl).replace(/^\n+|\n+$/g, '');
        }
        return s;
    }

    function getCodeBlockPlainText(block) {
        if (!block) return '';
        const wrapper = (block.classList
            && (block.classList.contains('toastui-editor-ww-code-block')
                || block.classList.contains('toastui-editor-ww-code-block-highlighting')))
            ? block
            : (block.closest('.toastui-editor-ww-code-block')
                || block.closest('.toastui-editor-ww-code-block-highlighting')
                || block);
        const codeEl = wrapper.querySelector('code') || wrapper.querySelector('pre') || wrapper;
        return peelFences(codeEl.textContent || '');
    }

    /**
     * Markdown 内のコードフェンスを解除する。
     * 入れ子で ``` が増えた場合は、最初〜最後のフェンス行をまとめて剥がす。
     */
    function unwrapCodeFenceInMarkdown(md, preferredPlain) {
        const src = String(md || '').replace(/\r\n/g, '\n');
        const preferred = peelFences(preferredPlain);
        const lines = src.split('\n');
        const fenceIdx = [];
        lines.forEach((ln, idx) => {
            if (/^```/.test(ln)) fenceIdx.push(idx);
        });
        if (fenceIdx.length < 2) return null;

        const tryRange = (start, end) => {
            const whole = lines.slice(start, end + 1).join('\n');
            const body = lines.slice(start + 1, end).join('\n');
            const peeledWhole = peelFences(whole);
            const peeledBody = peelFences(body);
            if (preferred) {
                if (peeledWhole === preferred || peeledBody === preferred) return peeledWhole || preferred;
                if (body.includes(preferred) || whole.includes(preferred)) return preferred;
            }
            return null;
        };

        // 外側優先（最初〜最後）、だめなら preferred を含む範囲を探索
        let plain = tryRange(fenceIdx[0], fenceIdx[fenceIdx.length - 1]);
        if (plain === null && preferred) {
            for (let a = 0; a < fenceIdx.length && plain === null; a += 1) {
                for (let b = fenceIdx.length - 1; b > a; b -= 1) {
                    plain = tryRange(fenceIdx[a], fenceIdx[b]);
                    if (plain !== null) {
                        const before = lines.slice(0, fenceIdx[a]).join('\n');
                        const after = lines.slice(fenceIdx[b] + 1).join('\n');
                        return (before ? before + '\n' : '') + plain + (after ? '\n' + after : '');
                    }
                }
            }
        }

        if (plain === null) {
            plain = peelFences(lines.slice(fenceIdx[0], fenceIdx[fenceIdx.length - 1] + 1).join('\n'));
        }

        const start = fenceIdx[0];
        const end = fenceIdx[fenceIdx.length - 1];
        const before = lines.slice(0, start).join('\n');
        const after = lines.slice(end + 1).join('\n');
        return (before ? before + '\n' : '') + plain + (after ? '\n' + after : '');
    }

    /** コードブロックの適用 / 解除（入れ子増殖を防ぐ） */
    function toggleCodeBlock() {
        focusEditor();

        const block = findCodeBlockElement();
        const selected = editor.getSelectedText() || '';

        // --- 解除 ---
        if (block) {
            const plain = getCodeBlockPlainText(block);
            const next = unwrapCodeFenceInMarkdown(editor.getMarkdown(), plain);
            if (next !== null) {
                editor.setMarkdown(next);
            } else {
                try {
                    const codeEl = block.querySelector('code') || block;
                    const sel = window.getSelection();
                    if (sel) {
                        const range = document.createRange();
                        range.selectNodeContents(codeEl);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                    editor.replaceSelection(plain || ' ');
                } catch (e) {
                    insertPlain(plain || '');
                }
            }
            showStatus('コードブロックを解除しました。', 'success');
            return;
        }

        // 選択範囲自体がフェンス文字列なら解除
        if (selected && /```/.test(selected)) {
            try {
                editor.replaceSelection(peelFences(selected));
            } catch (e) {
                insertPlain(peelFences(selected));
            }
            showStatus('コードブロックを解除しました。', 'success');
            return;
        }

        // --- 適用（既存フェンスは剥がしてから1重だけ） ---
        if (selected) {
            const plain = peelFences(selected);
            try {
                editor.replaceSelection('```\n' + plain + '\n```');
            } catch (e) {
                execSafe('codeBlock');
            }
        } else {
            execSafe('codeBlock');
            const after = editor.getMarkdown();
            const normalized = normalizeNestedCodeFences(after);
            if (normalized !== after) {
                editor.setMarkdown(normalized);
            }
        }
        showStatus('コードブロックを適用しました。', 'success');
    }

    /**
     * 多重化したフェンスを、本文を保った1つのコードブロックへ正規化
     * （独立した複数コードブロックは触らない）
     */
    function normalizeNestedCodeFences(md) {
        const src = String(md || '').replace(/\r\n/g, '\n');
        const lines = src.split('\n');
        const fenceIdx = [];
        lines.forEach((ln, idx) => {
            if (/^```/.test(ln)) fenceIdx.push(idx);
        });
        if (fenceIdx.length <= 2) return src;

        const start = fenceIdx[0];
        const end = fenceIdx[fenceIdx.length - 1];
        const slice = lines.slice(start, end + 1);

        let openCount = 0;
        while (openCount < slice.length && /^```/.test(slice[openCount])) openCount += 1;
        let closeCount = 0;
        while (closeCount < slice.length && /^```/.test(slice[slice.length - 1 - closeCount])) closeCount += 1;
        const midLines = slice.slice(openCount, slice.length - closeCount);
        const mid = midLines.join('\n');

        // 先頭・末尾にフェンスが積み上がり、中央に ``` 行がない場合のみ入れ子増殖とみなす
        if (openCount < 2 && closeCount < 2) return src;
        if (openCount + closeCount < 3) return src;
        if (/^```/m.test(mid)) return src;

        const plain = peelFences(slice.join('\n')) || mid.trim();
        const before = lines.slice(0, start).join('\n');
        const after = lines.slice(end + 1).join('\n');
        return (before ? before + '\n' : '') + '```\n' + plain + '\n```' + (after ? '\n' + after : '');
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
                toggleCodeBlock();
                break;
            case 'table':
                // Toast UI は rowCount / columnCount
                if (!execSafe('addTable', { rowCount: 3, columnCount: 3 })) {
                    execSafe('addTable');
                }
                showStatus('表を挿入しました。', 'success');
                break;
            case 'link':
                editOrInsertLink();
                break;
            default:
                break;
        }
    }

    /** 既存リンクがあれば URL・テキストをプリフィルして編集 */
    function editOrInsertLink() {
        focusEditor();
        const existing = findAncestor(['a']);
        let currentUrl = 'https://';
        let currentText = '';

        if (existing) {
            currentUrl = existing.getAttribute('href') || existing.href || 'https://';
            currentText = existing.textContent || '';
            // リンク要素全体を選択してから差し替え
            const sel = window.getSelection();
            if (sel) {
                const range = document.createRange();
                try {
                    range.selectNode(existing);
                } catch (e) {
                    range.selectNodeContents(existing);
                }
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else {
            currentText = editor.getSelectedText() || '';
        }

        const url = window.prompt('リンクURLを入力してください', currentUrl);
        if (url === null) return;
        if (!url.trim()) {
            showStatus('URLが空です。', 'error');
            return;
        }

        const defaultText = currentText || url;
        const text = window.prompt('リンクテキストを入力してください', defaultText);
        if (text === null) return;

        const linkText = text.trim() || url.trim();
        const ok = execSafe('addLink', { linkUrl: url.trim(), linkText: linkText });
        if (!ok) {
            try {
                editor.replaceSelection('[' + linkText + '](' + url.trim() + ')');
            } catch (e) {
                document.execCommand('insertHTML', false,
                    '<a href="' + url.trim().replace(/"/g, '&quot;') + '">' + linkText + '</a>');
            }
        }
        showStatus(existing ? 'リンクを更新しました。' : 'リンクを挿入しました。', 'success');
    }

    function clearFormatting() {
        focusEditor();
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || sel.isCollapsed) {
            showStatus('書式をクリアする文字を選択してください。', 'error');
            return;
        }

        // getSelectedText() は複数ブロック時に先頭行を落とすことがあるため、
        // Selection#toString() で改行込みの全文を取得する
        const plain = sel.toString().replace(/\u00a0/g, ' ');
        if (!plain) {
            showStatus('書式をクリアする文字を選択してください。', 'error');
            return;
        }

        document.execCommand('removeFormat');
        document.execCommand('unlink');

        // 見出し・引用などのブロック装飾も含め、選択範囲をプレーンテキストへ置換
        try {
            editor.replaceSelection(plain);
        } catch (e) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            // 改行を br / テキストノードで再現
            const lines = plain.split(/\r?\n/);
            const frag = document.createDocumentFragment();
            lines.forEach((line, idx) => {
                frag.appendChild(document.createTextNode(line));
                if (idx < lines.length - 1) {
                    frag.appendChild(document.createElement('br'));
                }
            });
            range.insertNode(frag);
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
        let statusMessage;
        if (format === 'backlog') {
            text = converter.markdownToBacklog(markdown);
            statusMessage = 'Backlog形式で出力しました。';
        } else if (format === 'html') {
            text = editor.getHTML();
            statusMessage = 'HTML形式で出力しました。';
        } else {
            text = converter.normalizeMarkdownExtras(markdown);
            statusMessage = 'Markdown形式で出力しました。';
        }

        outputText.value = text;
        switchTab('output');
        showStatus(statusMessage, 'success');
    }

    function loadIntoEditor() {
        const raw = importText.value;
        if (!raw.trim()) {
            showStatus('インポートするテキストを入力してください。', 'error');
            return;
        }

        const format = getSelectedFormat();
        if (format === 'backlog') {
            editor.setMarkdown(converter.backlogToMarkdown(raw));
            showStatus('Backlog形式を読み込み、編集画面に反映しました。', 'success');
        } else if (format === 'html') {
            if (typeof editor.setHTML === 'function') {
                editor.setHTML(raw);
            } else {
                editor.setMarkdown(raw);
            }
            showStatus('HTMLを読み込み、編集画面に反映しました。', 'success');
        } else {
            editor.setMarkdown(raw);
            showStatus('Markdown形式を読み込み、編集画面に反映しました。', 'success');
        }
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

    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    applyBtn.addEventListener('click', applyToOutput);
    loadBtn.addEventListener('click', loadIntoEditor);
    copyBtn.addEventListener('click', copyOutput);
    clearBtn.addEventListener('click', clearAll);
});
