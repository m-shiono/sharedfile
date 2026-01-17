function compareTexts() {
  var diff_source = document.getElementById('diff_source').value.split('\n').map(line => line.trim());
  var diff_target = document.getElementById('diff_target').value.split('\n').map(line => line.trim());
  var resultDiv = document.getElementById('diff-result');
  clearResults(resultDiv);

  var i = 0;
  var j = 0;

  while (i < diff_source.length || j < diff_target.length) {
    var line1 = i < diff_source.length ? diff_source[i] : null;
    var line2 = j < diff_target.length ? diff_target[j] : null;

    if (line1 === line2) {
      appendLine(resultDiv, line1 !== null ? line1 : '');
      i++;
      j++;
    } else {
      var indices1 = getAllIndices(diff_target.slice(j), line1);
      var indices2 = getAllIndices(diff_source.slice(i), line2);

      if (indices1.length > 0 && (indices2.length === 0 || indices1[0] <= indices2[0])) {
        appendLine(resultDiv, '比較元【' + (line1 !== null ? line1 : '') + '】', true);
        appendLine(resultDiv, '比較先【' + (line1 !== null ? line1 : '') + '】', true);
        i++;
        j += indices1[0] + 1;
      } else if (indices2.length > 0) {
        appendLine(resultDiv, '比較元【' + (line2 !== null ? line2 : '') + '】', true);
        appendLine(resultDiv, '比較先【' + (line2 !== null ? line2 : '') + '】', true);
        i += indices2[0] + 1;
        j++;
      } else {
        appendLine(resultDiv, '比較元【' + (line1 !== null ? line1 : '') + '】', true);
        appendLine(resultDiv, '比較先【' + (line2 !== null ? line2 : '') + '】', true);
        i++;
        j++;
      }
    }
  }
}

function getAllIndices(arr, val) {
  var indices = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      indices.push(i);
    }
  }
  return indices;
}

function resetTexts() {
  document.getElementById('diff_source').value = '';
  document.getElementById('diff_target').value = '';
  clearResults(document.getElementById('diff-result'));
}

function clearResults(resultDiv) {
  resultDiv.textContent = '';
}

function appendLine(resultDiv, text, isDiff) {
  var line = document.createElement('div');
  if (isDiff) {
    line.className = 'diff';
  }
  line.textContent = text;
  resultDiv.appendChild(line);
}
