function searchKeyInObject(obj, key, results = []) {
    if (!obj || typeof obj !== 'object') {
        return results;
    }
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        results.push(obj[key]);
    }
    for (const i in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, i)) {
            searchKeyInObject(obj[i], key, results);
        }
    }
    return results;
}

function createTable() {
    const input = document.getElementById('jsonInput').value.trim();
    const tableBody = document.querySelector('#jsonTable tbody');
    tableBody.replaceChildren();

    if (!input) {
        alert('JSONデータを入力してください。');
        return;
    }

    let data;
    try {
        data = JSON.parse(input);
    } catch (e) {
        alert('JSONの解析に失敗しました: ' + e.message);
        return;
    }

    if (!data.pages || !Array.isArray(data.pages)) {
        alert('pages 配列を含む JSON を入力してください。');
        return;
    }

    for (const page of data.pages) {
        const titles = searchKeyInObject(page, 'title');
        const ids = searchKeyInObject(page, 'id');
        const queries = searchKeyInObject(page, 'query');

        if (titles.length === ids.length && ids.length === queries.length) {
            for (let i = 0; i < titles.length; i++) {
                const row = document.createElement('tr');
                const cell1 = document.createElement('td');
                const cell2 = document.createElement('td');
                const cell3 = document.createElement('td');
                cell1.textContent = titles[i];
                cell2.textContent = ids[i];
                cell3.textContent = queries[i];
                row.append(cell1, cell2, cell3);
                tableBody.appendChild(row);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createTableBtn').addEventListener('click', createTable);
});
