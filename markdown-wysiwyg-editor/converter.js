/**
 * Markdown ↔ Backlog Wiki 記法の相互変換
 * よく使う記法を対象（完全往復は保証しない）
 */
(function (global) {
    'use strict';

    function convertInlineMarkdownToBacklog(text) {
        // インラインコードを一旦退避
        const codeSpans = [];
        text = text.replace(/`([^`\n]+)`/g, (_, code) => {
            const i = codeSpans.length;
            codeSpans.push(code);
            return `\u0000CODE${i}\u0000`;
        });

        // リンク [label](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[[$1>$2]]');
        // 自動リンク風 <url>
        text = text.replace(/<(https?:\/\/[^>]+)>/g, '[[$1]]');

        // 太字 ** ** / __ __
        text = text.replace(/\*\*(.+?)\*\*/g, "''$1''");
        text = text.replace(/__(.+?)__/g, "''$1''");

        // 打消し ~~ ~~
        text = text.replace(/~~(.+?)~~/g, '%%$1%%');

        // 斜体 * * / _ _（太字処理後）
        text = text.replace(/(^|[^*\w])\*(?!\*)([^*\n]+?)\*(?!\*)/g, "$1'''$2'''");
        text = text.replace(/(^|[^_\w])_(?!_)([^_\n]+?)_(?!_)/g, "$1'''$2'''");

        // インラインコード復元 → Backlog では {code}...{code} をインライン相当として使用
        text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `{code}${codeSpans[Number(i)]}{code}`);

        return text;
    }

    function convertInlineBacklogToMarkdown(text) {
        const codeSpans = [];
        // 単一行の {code}...{code} をインライン扱いで退避
        text = text.replace(/\{code\}([^{}\n]+?)\{code\}/g, (_, code) => {
            const i = codeSpans.length;
            codeSpans.push(code);
            return `\u0000CODE${i}\u0000`;
        });

        // リンク [[label>url]] / [[url]]
        text = text.replace(/\[\[([^\]>]+)>([^\]]+)\]\]/g, '[$1]($2)');
        text = text.replace(/\[\[([^\]]+)\]\]/g, '<$1>');

        // 斜体 ''' '''（太字より先に処理）
        text = text.replace(/'''(.+?)'''/g, '*$1*');

        // 太字 '' ''
        text = text.replace(/''(.+?)''/g, '**$1**');

        // 打消し %% %%
        text = text.replace(/%%(.+?)%%/g, '~~$1~~');

        // 下線 ___ ___ → プレーン（Markdownに標準がないため内容のみ）
        text = text.replace(/___(.+?)___/g, '$1');

        text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => '`' + codeSpans[Number(i)] + '`');

        return text;
    }

    function convertMarkdownTableToBacklog(lines) {
        const rows = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed)) {
                continue; // 区切り行はスキップ
            }
            const cells = trimmed
                .replace(/^\|/, '')
                .replace(/\|$/, '')
                .split('|')
                .map((c) => convertInlineMarkdownToBacklog(c.trim()));
            rows.push(cells);
        }
        if (rows.length === 0) return '';

        let out = '';
        rows.forEach((cells, idx) => {
            if (idx === 0) {
                out += '|' + cells.join('|') + '|h\n';
            } else {
                out += '|' + cells.join('|') + '|\n';
            }
        });
        return out.replace(/\n$/, '');
    }

    function convertBacklogTableToMarkdown(lines) {
        const rows = [];
        let headerDone = false;
        for (const line of lines) {
            const trimmed = line.trim();
            const isHeader = /\|h\s*$/.test(trimmed);
            const body = trimmed.replace(/\|h\s*$/, '').replace(/^\|/, '').replace(/\|$/, '');
            const cells = body.split('|').map((c) => convertInlineBacklogToMarkdown(c.trim()));
            rows.push({ cells, isHeader });
            if (isHeader) headerDone = true;
        }
        if (rows.length === 0) return '';

        // 先頭がヘッダーでない場合も1行目をヘッダー扱い
        if (!headerDone && rows.length > 0) {
            rows[0].isHeader = true;
        }

        const headerRow = rows.find((r) => r.isHeader) || rows[0];
        const dataRows = rows.filter((r) => r !== headerRow);
        const colCount = headerRow.cells.length;

        let md = '| ' + headerRow.cells.join(' | ') + ' |\n';
        md += '| ' + Array(colCount).fill('---').join(' | ') + ' |\n';
        for (const row of dataRows) {
            md += '| ' + row.cells.join(' | ') + ' |\n';
        }
        return md.replace(/\n$/, '');
    }

    function markdownToBacklog(markdown) {
        if (!markdown) return '';

        const lines = markdown.replace(/\r\n/g, '\n').split('\n');
        const result = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // フェンスコードブロック
            const fenceMatch = line.match(/^```(\w*)\s*$/);
            if (fenceMatch) {
                const lang = fenceMatch[1];
                const codeLines = [];
                i += 1;
                while (i < lines.length && !/^```\s*$/.test(lines[i])) {
                    codeLines.push(lines[i]);
                    i += 1;
                }
                i += 1; // closing ```
                if (lang) {
                    result.push(`{code:${lang}}`);
                } else {
                    result.push('{code}');
                }
                result.push(...codeLines);
                result.push('{code}');
                continue;
            }

            // 表（連続する | 行）
            if (/^\s*\|/.test(line) && line.includes('|')) {
                const tableLines = [];
                while (i < lines.length && /^\s*\|/.test(lines[i])) {
                    tableLines.push(lines[i]);
                    i += 1;
                }
                result.push(convertMarkdownTableToBacklog(tableLines));
                continue;
            }

            // 水平線
            if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
                result.push('----');
                i += 1;
                continue;
            }

            // 見出し
            const heading = line.match(/^(#{1,6})\s+(.*)$/);
            if (heading) {
                const level = heading[1].length;
                const stars = '*'.repeat(level);
                result.push(`${stars} ${convertInlineMarkdownToBacklog(heading[2])}`);
                i += 1;
                continue;
            }

            // 引用
            if (/^\s*>\s?/.test(line)) {
                const quoteLines = [];
                while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
                    quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
                    i += 1;
                }
                result.push('{quote}');
                result.push(...quoteLines.map(convertInlineMarkdownToBacklog));
                result.push('{quote}');
                continue;
            }

            // 番号付きリスト
            const numbered = line.match(/^(\s*)\d+\.\s+(.*)$/);
            if (numbered) {
                const depth = Math.floor(numbered[1].length / 2) + 1;
                result.push('+'.repeat(depth) + ' ' + convertInlineMarkdownToBacklog(numbered[2]));
                i += 1;
                continue;
            }

            // 箇条書き
            const bullet = line.match(/^(\s*)[-*+]\s+(.*)$/);
            if (bullet) {
                const depth = Math.floor(bullet[1].length / 2) + 1;
                result.push('-'.repeat(depth) + ' ' + convertInlineMarkdownToBacklog(bullet[2]));
                i += 1;
                continue;
            }

            // 通常行
            result.push(convertInlineMarkdownToBacklog(line));
            i += 1;
        }

        return result.join('\n');
    }

    function backlogToMarkdown(backlog) {
        if (!backlog) return '';

        const lines = backlog.replace(/\r\n/g, '\n').split('\n');
        const result = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // コードブロック {code} / {code:lang}
            const codeOpen = line.match(/^\{code(?::([^\s}]+))?\}\s*$/);
            if (codeOpen) {
                const lang = codeOpen[1] || '';
                const codeLines = [];
                i += 1;
                while (i < lines.length && !/^\{code\}\s*$/.test(lines[i])) {
                    codeLines.push(lines[i]);
                    i += 1;
                }
                i += 1;
                result.push('```' + lang);
                result.push(...codeLines);
                result.push('```');
                continue;
            }

            // 引用 {quote}
            if (/^\{quote\}\s*$/.test(line)) {
                const quoteLines = [];
                i += 1;
                while (i < lines.length && !/^\{quote\}\s*$/.test(lines[i])) {
                    quoteLines.push(lines[i]);
                    i += 1;
                }
                i += 1;
                for (const q of quoteLines) {
                    result.push('> ' + convertInlineBacklogToMarkdown(q));
                }
                continue;
            }

            // 表（|...| または |...|h）
            if (/^\s*\|/.test(line) && /\|/.test(line)) {
                const tableLines = [];
                while (i < lines.length && /^\s*\|/.test(lines[i])) {
                    tableLines.push(lines[i]);
                    i += 1;
                }
                result.push(convertBacklogTableToMarkdown(tableLines));
                continue;
            }

            // 水平線
            if (/^\s*-{4,}\s*$/.test(line)) {
                result.push('---');
                i += 1;
                continue;
            }

            // 見出し * ** *** ...
            const heading = line.match(/^(\*{1,6})\s+(.*)$/);
            if (heading) {
                const level = heading[1].length;
                result.push('#'.repeat(level) + ' ' + convertInlineBacklogToMarkdown(heading[2]));
                i += 1;
                continue;
            }

            // 番号リスト + ++ +++
            const ordered = line.match(/^(\+{1,6})\s+(.*)$/);
            if (ordered) {
                const depth = ordered[1].length;
                const indent = '  '.repeat(depth - 1);
                result.push(`${indent}1. ${convertInlineBacklogToMarkdown(ordered[2])}`);
                i += 1;
                continue;
            }

            // 箇条書き - -- ---
            const unordered = line.match(/^(-{1,6})\s+(.*)$/);
            if (unordered) {
                const depth = unordered[1].length;
                const indent = '  '.repeat(depth - 1);
                result.push(`${indent}- ${convertInlineBacklogToMarkdown(unordered[2])}`);
                i += 1;
                continue;
            }

            result.push(convertInlineBacklogToMarkdown(line));
            i += 1;
        }

        return result.join('\n');
    }

    global.BacklogMarkdownConverter = {
        markdownToBacklog,
        backlogToMarkdown
    };
})(typeof window !== 'undefined' ? window : globalThis);
