function excelDataToHTML(input) {
    const rows = input.split('\n');
    let html = '<table>';

    for (const row of rows) {
        html += '<tr>';

        const cells = row.split('\t');
        for (const cell of cells) {
            html += `<td>${cell}</td>`;
        }

        html += '</tr>';
    }

    html += '</table>';
    return html;
}

document.getElementById('convert').addEventListener('click', () => {
    const excelData = document.getElementById('excel-data').value;
    const html = excelDataToHTML(excelData);
    document.getElementById('html-output').value = html;
});
