function compareTexts() {
  var diff_source = document.getElementById('diff_source').value.split('\n').map(line => line.trim());
  var diff_target = document.getElementById('diff_target').value.split('\n').map(line => line.trim());
  var resultDiv = document.getElementById('diff-result');
  resultDiv.innerHTML = '';

  var i = 0;
  var j = 0;

  while (i < diff_source.length || j < diff_target.length) {
    var line1 = i < diff_source.length ? diff_source[i] : null;
    var line2 = j < diff_target.length ? diff_target[j] : null;

    if (line1 === line2) {
      resultDiv.innerHTML += (line1 !== null ? line1 : '') + '<br>';
      i++;
      j++;
    } else {
      var indices1 = getAllIndices(diff_target.slice(j), line1);
      var indices2 = getAllIndices(diff_source.slice(i), line2);

      if (indices1.length > 0 && (indices2.length === 0 || indices1[0] <= indices2[0])) {
        resultDiv.innerHTML += '<span class="diff">比較元【' + (line1 !== null ? line1 : '') + '】</span><br>';
        resultDiv.innerHTML += '<span class="diff">比較先【' + (line1 !== null ? line1 : '') + '】</span><br>';
        i++;
        j += indices1[0] + 1;
      } else if (indices2.length > 0) {
        resultDiv.innerHTML += '<span class="diff">比較元【' + (line2 !== null ? line2 : '') + '】</span><br>';
        resultDiv.innerHTML += '<span class="diff">比較先【' + (line2 !== null ? line2 : '') + '】</span><br>';
        i += indices2[0] + 1;
        j++;
      } else {
        resultDiv.innerHTML += '<span class="diff">比較元【' + (line1 !== null ? line1 : '') + '】</span><br>';
        resultDiv.innerHTML += '<span class="diff">比較先【' + (line2 !== null ? line2 : '') + '】</span><br>';
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
  document.getElementById('diff-result').innerHTML = '';
}
