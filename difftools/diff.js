/**
 * Text Comparison Tool - Side-by-Side Diff Logic
 */

function compareTexts() {
    const sourceText = document.getElementById('diff_source').value;
    const targetText = document.getElementById('diff_target').value;
    
    const sourceLines = sourceText.split(/\r?\n/);
    const targetLines = targetText.split(/\r?\n/);
    
    const diff = computeDiff(sourceLines, targetLines);
    renderDiff(diff);
    setupScrollSync();
}

/**
 * Computes the difference between two arrays of lines using an LCS-based approach.
 * Returns an array of change objects.
 */
function computeDiff(oldLines, newLines) {
    const n = oldLines.length;
    const m = newLines.length;
    
    // Fill the DP table for LCS
    const matrix = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (oldLines[i - 1] === newLines[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1] + 1;
            } else {
                matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
            }
        }
    }
    
    // Backtrack to find the diff
    const result = [];
    let i = n, j = m;
    
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            result.unshift({ type: 'equal', old: oldLines[i - 1], new: newLines[j - 1], oldIdx: i, newIdx: j });
            i--; j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
            result.unshift({ type: 'add', old: null, new: newLines[j - 1], oldIdx: null, newIdx: j });
            j--;
        } else {
            result.unshift({ type: 'remove', old: oldLines[i - 1], new: null, oldIdx: i, newIdx: null });
            i--;
        }
    }
    
    // Post-processing: Group consecutive remove+add as 'modified'
    const groupedResult = [];
    for (let k = 0; k < result.length; k++) {
        const current = result[k];
        const next = result[k + 1];
        
        if (current.type === 'remove' && next && next.type === 'add') {
            groupedResult.push({
                type: 'modify',
                old: current.old,
                new: next.new,
                oldIdx: current.oldIdx,
                newIdx: next.newIdx
            });
            k++; // skip next
        } else {
            groupedResult.push(current);
        }
    }
    
    return groupedResult;
}

/**
 * Renders the diff results into the side-by-side panes.
 */
function renderDiff(diff) {
    const leftPane = document.getElementById('left-content');
    const rightPane = document.getElementById('right-content');
    
    leftPane.innerHTML = '';
    rightPane.innerHTML = '';
    
    diff.forEach(item => {
        const leftLine = document.createElement('div');
        const rightLine = document.createElement('div');
        
        leftLine.className = 'diff-line';
        rightLine.className = 'diff-line';
        
        const leftNum = document.createElement('div');
        const rightNum = document.createElement('div');
        leftNum.className = 'line-number';
        rightNum.className = 'line-number';
        
        const leftText = document.createElement('div');
        const rightText = document.createElement('div');
        leftText.className = 'line-text';
        rightText.className = 'line-text';
        
        if (item.type === 'equal') {
            leftNum.textContent = item.oldIdx;
            rightNum.textContent = item.newIdx;
            leftText.textContent = item.old;
            rightText.textContent = item.new;
        } else if (item.type === 'add') {
            leftNum.textContent = '';
            rightNum.textContent = item.newIdx;
            leftText.textContent = '';
            rightText.textContent = item.new;
            leftLine.classList.add('empty-line');
            rightLine.classList.add('diff-added');
        } else if (item.type === 'remove') {
            leftNum.textContent = item.oldIdx;
            rightNum.textContent = '';
            leftText.textContent = item.old;
            rightText.textContent = '';
            leftLine.classList.add('diff-removed');
            rightLine.classList.add('empty-line');
        } else if (item.type === 'modify') {
            leftNum.textContent = item.oldIdx;
            rightNum.textContent = item.newIdx;
            
            // Character-level diff for modified lines
            const charDiff = computeCharDiff(item.old, item.new);
            leftText.innerHTML = charDiff.oldHtml;
            rightText.innerHTML = charDiff.newHtml;
            
            leftLine.classList.add('diff-modified');
            rightLine.classList.add('diff-modified');
        }
        
        leftLine.appendChild(leftNum);
        leftLine.appendChild(leftText);
        rightLine.appendChild(rightNum);
        rightLine.appendChild(rightText);
        
        leftPane.appendChild(leftLine);
        rightPane.appendChild(rightLine);
    });
}

/**
 * Character-level diff within a modified line.
 */
function computeCharDiff(oldStr, newStr) {
    // Basic character-level diff using same LCS logic
    const n = oldStr.length;
    const m = newStr.length;
    const matrix = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (oldStr[i - 1] === newStr[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1] + 1;
            } else {
                matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
            }
        }
    }
    
    let oldHtml = '', newHtml = '';
    let i = n, j = m;
    
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
            const char = escapeHtml(oldStr[i - 1]);
            oldHtml = char + oldHtml;
            newHtml = char + newHtml;
            i--; j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
            newHtml = `<span class="char-added">${escapeHtml(newStr[j - 1])}</span>` + newHtml;
            j--;
        } else {
            oldHtml = `<span class="char-removed">${escapeHtml(oldStr[i - 1])}</span>` + oldHtml;
            i--;
        }
    }
    
    return { oldHtml, newHtml };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Synchronizes scrolling between left and right panes.
 */
function setupScrollSync() {
    const leftContent = document.getElementById('left-content');
    const rightContent = document.getElementById('right-content');
    
    let isSyncingLeftScroll = false;
    let isSyncingRightScroll = false;
    
    leftContent.onscroll = function() {
        if (!isSyncingLeftScroll) {
            isSyncingRightScroll = true;
            rightContent.scrollTop = this.scrollTop;
            rightContent.scrollLeft = this.scrollLeft;
        }
        isSyncingLeftScroll = false;
    };
    
    rightContent.onscroll = function() {
        if (!isSyncingRightScroll) {
            isSyncingLeftScroll = true;
            leftContent.scrollTop = this.scrollTop;
            leftContent.scrollLeft = this.scrollLeft;
        }
        isSyncingRightScroll = false;
    };
}

function resetTexts() {
    document.getElementById('diff_source').value = '';
    document.getElementById('diff_target').value = '';
    document.getElementById('left-content').innerHTML = '';
    document.getElementById('right-content').innerHTML = '';
}
