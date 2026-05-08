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
    
    // Backtrack to find the diff (Raw changes)
    const rawChanges = [];
    let i = n, j = m;
    
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            rawChanges.unshift({ type: 'equal', old: oldLines[i - 1], new: newLines[j - 1], oldIdx: i, newIdx: j });
            i--; j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
            rawChanges.unshift({ type: 'add', old: null, new: newLines[j - 1], oldIdx: null, newIdx: j });
            j--;
        } else {
            rawChanges.unshift({ type: 'remove', old: oldLines[i - 1], new: null, oldIdx: i, newIdx: null });
            i--;
        }
    }
    
    // Post-processing: Group consecutive remove+add as 'modify'
    const finalResult = [];
    let k = 0;
    while (k < rawChanges.length) {
        if (rawChanges[k].type === 'equal') {
            finalResult.push(rawChanges[k]);
            k++;
        } else {
            // Collect consecutive non-equal blocks
            const removeBlock = [];
            const addBlock = [];
            
            while (k < rawChanges.length && rawChanges[k].type !== 'equal') {
                if (rawChanges[k].type === 'remove') {
                    removeBlock.push(rawChanges[k]);
                } else if (rawChanges[k].type === 'add') {
                    addBlock.push(rawChanges[k]);
                }
                k++;
            }
            
            // Pair them as 'modify' where possible
            const minLen = Math.min(removeBlock.length, addBlock.length);
            for (let b = 0; b < minLen; b++) {
                finalResult.push({
                    type: 'modify',
                    old: removeBlock[b].old,
                    new: addBlock[b].new,
                    oldIdx: removeBlock[b].oldIdx,
                    newIdx: addBlock[b].newIdx
                });
            }
            
            // Push remaining as pure remove/add
            if (removeBlock.length > minLen) {
                for (let b = minLen; b < removeBlock.length; b++) {
                    finalResult.push(removeBlock[b]);
                }
            } else if (addBlock.length > minLen) {
                for (let b = minLen; b < addBlock.length; b++) {
                    finalResult.push(addBlock[b]);
                }
            }
        }
    }
    
    return finalResult;
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
    
    const oldParts = [];
    const newParts = [];
    let i = n, j = m;
    
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
            const char = escapeHtml(oldStr[i - 1]);
            oldParts.unshift(char);
            newParts.unshift(char);
            i--; j--;
        } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
            newParts.unshift(`<span class="char-added">${escapeHtml(newStr[j - 1])}</span>`);
            j--;
        } else {
            oldParts.unshift(`<span class="char-removed">${escapeHtml(oldStr[i - 1])}</span>`);
            i--;
        }
    }
    
    return { 
        oldHtml: oldParts.join(''), 
        newHtml: newParts.join('') 
    };
}

function escapeHtml(text) {
    if (!text) return '';
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
    
    let isSyncing = false;
    
    leftContent.onscroll = function() {
        if (isSyncing) return;
        isSyncing = true;
        rightContent.scrollTop = this.scrollTop;
        rightContent.scrollLeft = this.scrollLeft;
        setTimeout(() => isSyncing = false, 10);
    };
    
    rightContent.onscroll = function() {
        if (isSyncing) return;
        isSyncing = true;
        leftContent.scrollTop = this.scrollTop;
        leftContent.scrollLeft = this.scrollLeft;
        setTimeout(() => isSyncing = false, 10);
    };
}

function resetTexts() {
    document.getElementById('diff_source').value = '';
    document.getElementById('diff_target').value = '';
    document.getElementById('left-content').innerHTML = '';
    document.getElementById('right-content').innerHTML = '';
}
