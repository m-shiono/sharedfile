/**
 * Markdown ↔ Backlog Wiki 記法の相互変換
 * よく使う記法を対象（完全往復は保証しない）
<<<<<<< HEAD
=======
 * 画像・添付ファイル系は対象外
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
 */
(function (global) {
    'use strict';

<<<<<<< HEAD
    function convertInlineMarkdownToBacklog(text) {
        // インラインコードを一旦退避
=======
    function cssColorToHex(color) {
        if (!color) return color;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color.trim())) {
            const c = color.trim();
            if (c.length === 4) {
                return ('#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]).toLowerCase();
            }
            return c.toLowerCase();
        }
        const m = String(color).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (m) {
            return '#' + [m[1], m[2], m[3]]
                .map((n) => Number(n).toString(16).padStart(2, '0'))
                .join('');
        }
        return String(color).trim().toLowerCase();
    }

    function parseFontSizePx(value) {
        if (!value) return null;
        const m = String(value).match(/(\d+)/);
        return m ? m[1] : null;
    }

    /**
     * getMarkdown() が落とす色・下線・サイズを getHTML() から補完
     */
    function enrichMarkdownFromHtml(markdown, html) {
        if (!html) return markdown || '';
        if (typeof document === 'undefined') return markdown || '';

        let result = markdown || '';

        try {
            const doc = document.createElement('div');
            doc.innerHTML = html;

            // 色
            if (!/{{color:|<span[^>]*style=["'][^"']*color:/i.test(result)) {
                doc.querySelectorAll('span[style*="color"], font[color]').forEach((el) => {
                    const text = el.textContent;
                    if (!text || !result.includes(text)) return;
                    const color = cssColorToHex(el.style.color || el.getAttribute('color'));
                    result = result.replace(text, `{{color:${color}}}${text}{{/color}}`);
                });
            }

            // 下線
            if (!/<u>|{{u}}/i.test(result)) {
                doc.querySelectorAll('u').forEach((el) => {
                    const text = el.textContent;
                    if (!text || !result.includes(text)) return;
                    result = result.replace(text, `<u>${text}</u>`);
                });
            }

            // サイズ
            if (!/{{size:|<span[^>]*style=["'][^"']*font-size:/i.test(result)) {
                doc.querySelectorAll('span[style*="font-size"], span[data-backlog-size]').forEach((el) => {
                    const text = el.textContent;
                    if (!text || !result.includes(text)) return;
                    const size = el.getAttribute('data-backlog-size')
                        || parseFontSizePx(el.style.fontSize);
                    if (!size) return;
                    result = result.replace(text, `{{size:${size}}}${text}{{/size}}`);
                });
            }
        } catch (e) {
            return markdown || '';
        }

        return result;
    }

    /** 後方互換 */
    function enrichMarkdownColorsFromHtml(markdown, html) {
        return enrichMarkdownFromHtml(markdown, html);
    }

    /** Markdown出力向けに内部マーカーを HTML へそろえる */
    function normalizeMarkdownExtras(markdown) {
        let text = markdown || '';
        text = text.replace(
            /\{\{color:([^}]+)\}\}([\s\S]*?)\{\{\/color\}\}/g,
            (_, color, inner) => `<span style="color: ${color}">${inner}</span>`
        );
        text = text.replace(
            /\{\{size:([^}]+)\}\}([\s\S]*?)\{\{\/size\}\}/g,
            (_, size, inner) => `<span style="font-size: ${size}px">${inner}</span>`
        );
        text = text.replace(/\{\{u\}\}([\s\S]*?)\{\{\/u\}\}/g, '<u>$1</u>');
        return text;
    }

    function convertColorMarkersToBacklog(text) {
        return text.replace(/\{\{color:([^}]+)\}\}([\s\S]*?)\{\{\/color\}\}/g, (_, color, inner) => {
            return `&color(${color}) { ${inner} }`;
        });
    }

    function convertSizeMarkersToBacklog(text) {
        return text.replace(/\{\{size:([^}]+)\}\}([\s\S]*?)\{\{\/size\}\}/g, (_, size, inner) => {
            return `&size(${size}) { ${inner} }`;
        });
    }

    function convertColorSpansHtmlToBacklog(text) {
        return text.replace(
            /<span([^>]*)>([\s\S]*?)<\/span>/gi,
            (full, attrs, inner) => {
                const colorMatch = attrs.match(/color:\s*([^;"'\s]+)/i);
                const sizeMatch = attrs.match(/font-size:\s*([^;"'\s]+)/i)
                    || attrs.match(/data-backlog-size=["']?(\d+)/i);
                let out = inner;
                if (sizeMatch) {
                    const size = parseFontSizePx(sizeMatch[1]);
                    if (size) out = `&size(${size}) { ${out} }`;
                }
                if (colorMatch) {
                    out = `&color(${cssColorToHex(colorMatch[1])}) { ${out} }`;
                }
                if (!colorMatch && !sizeMatch) return full;
                return out;
            }
        );
    }

    function convertUnderlineHtmlToBacklog(text) {
        return text
            .replace(/<u>([\s\S]*?)<\/u>/gi, '___$1___')
            .replace(/\{\{u\}\}([\s\S]*?)\{\{\/u\}\}/g, '___$1___');
    }

    function convertBrToBacklog(text) {
        return text.replace(/<br\s*\/?>/gi, '&br;');
    }

    function convertBacklogColorToMarkdown(text) {
        return text.replace(
            /&color\(([^)]+)\)\s*\{\s*([\s\S]*?)\s*\}/g,
            (_, color, inner) => `{{color:${cssColorToHex(color)}}}${inner}{{/color}}`
        );
    }

    function convertBacklogSizeToMarkdown(text) {
        return text.replace(
            /&size\(([^)]+)\)\s*\{\s*([\s\S]*?)\s*\}/g,
            (_, size, inner) => `{{size:${parseFontSizePx(size) || size}}}${inner}{{/size}}`
        );
    }

    function convertBacklogUnderlineToMarkdown(text) {
        // ___text___ （太字 __ より先に処理すること）
        return text.replace(/___(.+?)___/g, '<u>$1</u>');
    }

    function convertBacklogBrToMarkdown(text) {
        return text.replace(/&br;/gi, '<br>');
    }

    function convertColorMarkersToHtml(text) {
        return text.replace(
            /\{\{color:([^}]+)\}\}([\s\S]*?)\{\{\/color\}\}/g,
            (_, color, inner) => `<span style="color: ${color}">${inner}</span>`
        );
    }

    function convertSizeMarkersToHtml(text) {
        return text.replace(
            /\{\{size:([^}]+)\}\}([\s\S]*?)\{\{\/size\}\}/g,
            (_, size, inner) => `<span style="font-size: ${size}px" data-backlog-size="${size}">${inner}</span>`
        );
    }

    function convertInlineMarkdownToBacklog(text) {
        text = convertColorMarkersToBacklog(text);
        text = convertSizeMarkersToBacklog(text);
        text = convertColorSpansHtmlToBacklog(text);
        text = convertUnderlineHtmlToBacklog(text);
        text = convertBrToBacklog(text);

        // 下線 ___...___ を太字/斜体変換から退避
        const underlines = [];
        text = text.replace(/___(.+?)___/g, (_, inner) => {
            const i = underlines.length;
            underlines.push(inner);
            return `\u0000U${i}\u0000`;
        });

>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
        const codeSpans = [];
        text = text.replace(/`([^`\n]+)`/g, (_, code) => {
            const i = codeSpans.length;
            codeSpans.push(code);
            return `\u0000CODE${i}\u0000`;
        });

<<<<<<< HEAD
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
=======
        // URLリンク [label](url) → [[label>url]]
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[[$1>$2]]');
        // 自動リンク <http...> → [[url]]
        text = text.replace(/<(https?:\/\/[^>]+)>/g, '[[$1]]');
        // Wikiリンク [[PageName]] はそのまま残す

        text = text.replace(/\*\*(.+?)\*\*/g, "''$1''");
        text = text.replace(/__(.+?)__/g, "''$1''");
        text = text.replace(/~~(.+?)~~/g, '%%$1%%');
        text = text.replace(/(^|[^*\w])\*(?!\*)([^*\n]+?)\*(?!\*)/g, "$1'''$2'''");
        text = text.replace(/(^|[^_\w])_(?!_)([^_\n]+?)_(?!_)/g, "$1'''$2'''");

        text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `{code}${codeSpans[Number(i)]}{code}`);
        text = text.replace(/\u0000U(\d+)\u0000/g, (_, i) => `___${underlines[Number(i)]}___`);
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)

        return text;
    }

    function convertInlineBacklogToMarkdown(text) {
<<<<<<< HEAD
        const codeSpans = [];
        // 単一行の {code}...{code} をインライン扱いで退避
=======
        text = convertBacklogBrToMarkdown(text);
        text = convertBacklogSizeToMarkdown(text);
        text = convertBacklogColorToMarkdown(text);
        text = convertBacklogUnderlineToMarkdown(text);

        const codeSpans = [];
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
        text = text.replace(/\{code\}([^{}\n]+?)\{code\}/g, (_, code) => {
            const i = codeSpans.length;
            codeSpans.push(code);
            return `\u0000CODE${i}\u0000`;
        });

<<<<<<< HEAD
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

=======
        // URL付きリンク
        text = text.replace(/\[\[([^\]>]+)>([^\]]+)\]\]/g, '[$1]($2)');
        // URLのみ
        text = text.replace(/\[\[(https?:\/\/[^\]]+)\]\]/g, '<$1>');
        // Wikiページ名 [[PageName]] はそのまま残す

        text = text.replace(/'''(.+?)'''/g, '*$1*');
        text = text.replace(/''(.+?)''/g, '**$1**');
        text = text.replace(/%%(.+?)%%/g, '~~$1~~');

        text = text.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => '`' + codeSpans[Number(i)] + '`');

        text = convertColorMarkersToHtml(text);
        text = convertSizeMarkersToHtml(text);

>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
        return text;
    }

    function convertMarkdownTableToBacklog(lines) {
        const rows = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed)) {
<<<<<<< HEAD
                continue; // 区切り行はスキップ
=======
                continue;
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
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

<<<<<<< HEAD
        // 先頭がヘッダーでない場合も1行目をヘッダー扱い
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
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

<<<<<<< HEAD
=======
    function isBacklogMacroLine(line) {
        return /^#(contents|attachments|include\([^)]*\)|rev\([^)]*\))\s*$/.test(line.trim());
    }

>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
    function markdownToBacklog(markdown) {
        if (!markdown) return '';

        const lines = markdown.replace(/\r\n/g, '\n').split('\n');
        const result = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

<<<<<<< HEAD
            // フェンスコードブロック
=======
            // マクロ行はそのまま
            if (isBacklogMacroLine(line) || /^#include\([^)]*\)\s*$/.test(line.trim()) || /^#rev\([^)]*\)\s*$/.test(line.trim()) || /^#contents\s*$/.test(line.trim())) {
                result.push(line.trim());
                i += 1;
                continue;
            }

>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
            const fenceMatch = line.match(/^```(\w*)\s*$/);
            if (fenceMatch) {
                const lang = fenceMatch[1];
                const codeLines = [];
                i += 1;
                while (i < lines.length && !/^```\s*$/.test(lines[i])) {
                    codeLines.push(lines[i]);
                    i += 1;
                }
<<<<<<< HEAD
                i += 1; // closing ```
                if (lang) {
                    result.push(`{code:${lang}}`);
                } else {
                    result.push('{code}');
                }
=======
                i += 1;
                result.push(lang ? `{code:${lang}}` : '{code}');
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
                result.push(...codeLines);
                result.push('{code}');
                continue;
            }

<<<<<<< HEAD
            // 表（連続する | 行）
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
            if (/^\s*\|/.test(line) && line.includes('|')) {
                const tableLines = [];
                while (i < lines.length && /^\s*\|/.test(lines[i])) {
                    tableLines.push(lines[i]);
                    i += 1;
                }
                result.push(convertMarkdownTableToBacklog(tableLines));
                continue;
            }

<<<<<<< HEAD
            // 水平線
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
            if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
                result.push('----');
                i += 1;
                continue;
            }

<<<<<<< HEAD
            // 見出し
            const heading = line.match(/^(#{1,6})\s+(.*)$/);
            if (heading) {
                const level = heading[1].length;
                const stars = '*'.repeat(level);
                result.push(`${stars} ${convertInlineMarkdownToBacklog(heading[2])}`);
=======
            const heading = line.match(/^(#{1,6})\s+(.*)$/);
            if (heading) {
                // #contents 等は上で処理済み。通常見出しのみ
                const level = heading[1].length;
                result.push(`${'*'.repeat(level)} ${convertInlineMarkdownToBacklog(heading[2])}`);
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
                i += 1;
                continue;
            }

<<<<<<< HEAD
            // 引用
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
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

<<<<<<< HEAD
            // 番号付きリスト
=======
            // タスクリスト → 箇条書き相当
            const task = line.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.*)$/);
            if (task) {
                const depth = Math.floor(task[1].length / 2) + 1;
                const mark = /x/i.test(task[2]) ? '✓ ' : '';
                result.push('-'.repeat(depth) + ' ' + mark + convertInlineMarkdownToBacklog(task[3]));
                i += 1;
                continue;
            }

>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
            const numbered = line.match(/^(\s*)\d+\.\s+(.*)$/);
            if (numbered) {
                const depth = Math.floor(numbered[1].length / 2) + 1;
                result.push('+'.repeat(depth) + ' ' + convertInlineMarkdownToBacklog(numbered[2]));
                i += 1;
                continue;
            }

<<<<<<< HEAD
            // 箇条書き
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
            const bullet = line.match(/^(\s*)[-*+]\s+(.*)$/);
            if (bullet) {
                const depth = Math.floor(bullet[1].length / 2) + 1;
                result.push('-'.repeat(depth) + ' ' + convertInlineMarkdownToBacklog(bullet[2]));
                i += 1;
                continue;
            }

<<<<<<< HEAD
            // 通常行
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
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

<<<<<<< HEAD
            // コードブロック {code} / {code:lang}
=======
            // マクロはそのまま（編集画面でもテキストとして残す）
            if (/^#(contents|attachments)\s*$/.test(line.trim())
                || /^#include\([^)]*\)\s*$/.test(line.trim())
                || /^#rev\([^)]*\)\s*$/.test(line.trim())) {
                result.push(line.trim());
                i += 1;
                continue;
            }

>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
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

<<<<<<< HEAD
            // 引用 {quote}
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
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

<<<<<<< HEAD
            // 表（|...| または |...|h）
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
            if (/^\s*\|/.test(line) && /\|/.test(line)) {
                const tableLines = [];
                while (i < lines.length && /^\s*\|/.test(lines[i])) {
                    tableLines.push(lines[i]);
                    i += 1;
                }
                result.push(convertBacklogTableToMarkdown(tableLines));
                continue;
            }

<<<<<<< HEAD
            // 水平線
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
            if (/^\s*-{4,}\s*$/.test(line)) {
                result.push('---');
                i += 1;
                continue;
            }

<<<<<<< HEAD
            // 見出し * ** *** ...
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
            const heading = line.match(/^(\*{1,6})\s+(.*)$/);
            if (heading) {
                const level = heading[1].length;
                result.push('#'.repeat(level) + ' ' + convertInlineBacklogToMarkdown(heading[2]));
                i += 1;
                continue;
            }

<<<<<<< HEAD
            // 番号リスト + ++ +++
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
            const ordered = line.match(/^(\+{1,6})\s+(.*)$/);
            if (ordered) {
                const depth = ordered[1].length;
                const indent = '  '.repeat(depth - 1);
                result.push(`${indent}1. ${convertInlineBacklogToMarkdown(ordered[2])}`);
                i += 1;
                continue;
            }

<<<<<<< HEAD
            // 箇条書き - -- ---
=======
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
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
<<<<<<< HEAD
        backlogToMarkdown
=======
        backlogToMarkdown,
        enrichMarkdownFromHtml,
        enrichMarkdownColorsFromHtml,
        normalizeMarkdownExtras,
        cssColorToHex
>>>>>>> 7578a45 (Enhance Markdown WYSIWYG Editor with custom toolbar and color/size features. Integrate color picker and size options for text formatting, and update editor initialization to support new plugins. Revise HTML structure for improved usability and styling consistency.)
    };
})(typeof window !== 'undefined' ? window : globalThis);
