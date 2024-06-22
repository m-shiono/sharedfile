function excelDataToHTML(input) {
    input = input.trim();  // 末尾の空白行を削除
    const rows = input.split('\n');
    let html = '<table>\n';

    for (const row of rows) {
        html += '  <tr>\n';

        const cells = row.split('\t');
        for (const cell of cells) {
            html += `    <td>${cell}</td>\n`;
        }

        html += '  </tr>\n';
    }

    html += '</table>';
    return html;
}

function excelDataToMarkdown(input) {
    input = input.trim();  // 末尾の空白行を削除
    const rows = input.split('\n');
    let markdown = '';

    let headerRow = true;
    for (const row of rows) {
        const cells = row.split('\t');
        markdown += '| ' + cells.join(' | ') + ' |\n';

        if (headerRow) {
            markdown += '| ' + '--- |'.repeat(cells.length) + '\n';
            headerRow = false;
        }
    }

    return markdown;
}

function excelDataToBacklog(input) {
    input = input.trim();  // 末尾の空白行を削除
    const rows = input.split('\n');
    let backlog = '|';
    let isHeaderRow = true;

    for (const row of rows) {
        const cells = row.split('\t');
        if (isHeaderRow) {
            backlog += cells.join('|') + '|h\n|';
            isHeaderRow = false;
        } else {
            backlog += cells.join('|') + '|\n|';
        }
    }


    // 最後の余分なパイプを削除
    backlog = backlog.slice(0, -1);

    return backlog;
}

document.getElementById('convert').addEventListener('click', () => {
    const excelData = document.getElementById('excel-data').value;
    const outputFormat = document.querySelector('input[name="output-format"]:checked').value;
    let output;

    if (outputFormat === 'html') {
        output = excelDataToHTML(excelData);
    } else if (outputFormat === 'markdown') {
        output = excelDataToMarkdown(excelData);
    } else {
        output = excelDataToBacklog(excelData);
    }

    document.getElementById('output').value = output;
});


// ラジオボタンの表示制御
document.querySelectorAll('input[name="output-format"]').forEach((radio) => {
    radio.addEventListener('change', () => {
        const backlogOptions = document.getElementById('backlog-options');
        if (document.getElementById('backlog-format').checked) {
            backlogOptions.style.display = 'block';
        } else {
            backlogOptions.style.display = 'none';
        }
    });
});
