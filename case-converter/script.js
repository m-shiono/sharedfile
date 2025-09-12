class CaseConverter {
    constructor() {
        this.inputText = document.getElementById('inputText');
        this.clearBtn = document.getElementById('clearBtn');
        this.convertAllBtn = document.getElementById('convertAllBtn');
        this.exampleButtons = document.querySelectorAll('.example-btn');
        this.conversionGrid = document.getElementById('conversionGrid');

        // 出力要素の参照を格納
        this.outputs = {};

        // 表示用メタ情報
        this.caseDefinitions = [
            { key: 'camelCase', name: 'camelCase', desc: '先頭小文字＋単語の先頭を大文字' },
            { key: 'pascalCase', name: 'PascalCase', desc: '各単語の先頭を大文字' },
            { key: 'snakeCase', name: 'snake_case', desc: '小文字単語をアンダースコア区切り' },
            { key: 'screamingSnakeCase', name: 'SCREAMING_SNAKE_CASE', desc: '大文字＋アンダースコア区切り' },
            { key: 'kebabCase', name: 'kebab-case', desc: '小文字単語をハイフン区切り' },
            { key: 'screamingKebabCase', name: 'SCREAMING-KEBAB-CASE', desc: '大文字＋ハイフン区切り' },
            { key: 'trainCase', name: 'Train-Case', desc: '各単語の先頭大文字＋ハイフン区切り' },
            { key: 'dotCase', name: 'dot.case', desc: '小文字単語をドット区切り' },
            { key: 'pathCase', name: 'path/case', desc: '小文字単語をスラッシュ区切り' },
            { key: 'titleCase', name: 'Title Case', desc: '英語タイトルの大文字小文字規則' },
            { key: 'sentenceCase', name: 'Sentence case', desc: '文頭のみ大文字' },
            { key: 'lowerCase', name: 'lower case', desc: 'すべて小文字' },
            { key: 'upperCase', name: 'UPPER CASE', desc: 'すべて大文字' }
        ];

        this.renderConversionItems();
        this.initializeEventListeners();
        this.updatePlaceholder();
    }
    
    initializeEventListeners() {
        this.inputText.addEventListener('input', () => this.convertAll());
        this.inputText.addEventListener('paste', () => {
            setTimeout(() => this.convertAll(), 10);
        });

        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.convertAllBtn.addEventListener('click', () => this.convertAll());

        this.exampleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const exampleText = e.target.getAttribute('data-text');
                this.inputText.value = exampleText;
                this.convertAll();
            });
        });

        this.inputText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.convertAll();
            }
        });
    }

    renderConversionItems() {
        if (!this.conversionGrid) return;
        this.conversionGrid.innerHTML = '';
        this.outputs = {};

        this.caseDefinitions.forEach(def => {
            const item = document.createElement('div');
            item.className = 'conversion-item';

            const label = document.createElement('div');
            label.className = 'conversion-label';
            const nameSpan = document.createElement('span');
            nameSpan.className = 'case-name';
            nameSpan.textContent = def.name;
            const descSpan = document.createElement('span');
            descSpan.className = 'case-description';
            descSpan.textContent = def.desc;
            label.appendChild(nameSpan);
            label.appendChild(descSpan);

            const output = document.createElement('div');
            output.className = 'conversion-output';
            const textarea = document.createElement('textarea');
            textarea.id = def.key;
            textarea.readOnly = true;
            textarea.rows = 1;
            textarea.spellcheck = false;
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.type = 'button';
            copyBtn.textContent = 'コピー';
            copyBtn.dataset.target = def.key;
            copyBtn.addEventListener('click', (e) => {
                this.copyToClipboard(def.key, e.currentTarget);
            });

            output.appendChild(textarea);
            output.appendChild(copyBtn);

            item.appendChild(label);
            item.appendChild(output);
            this.conversionGrid.appendChild(item);

            this.outputs[def.key] = textarea;
        });
    }
    
    updatePlaceholder() {
        this.inputText.placeholder = `変換したいテキストを入力してください...

例:
user name validation
get user by id
database connection string
create new account
validate email address
api rate limit

複数行でも一度に変換できます。`;
    }
    
    convertAll() {
        const text = this.inputText.value.trim();
        
        if (!text) {
            this.clearOutputs();
            return;
        }
        
        const lines = text.split('\n').filter(line => line.trim());
        const results = {};
        
        Object.keys(this.outputs).forEach(caseType => {
            results[caseType] = lines.map(line => this.convertCase(line.trim(), caseType)).join('\n');
        });
        
        Object.keys(results).forEach(caseType => {
            this.outputs[caseType].value = results[caseType];
            this.autoResizeOutput(this.outputs[caseType]);
        });
    }
    
    convertCase(text, caseType) {
        if (!text) return '';
        
        const words = this.tokenize(text);
        
        switch (caseType) {
            case 'camelCase':
                return this.toCamelCase(words);
            case 'pascalCase':
                return this.toPascalCase(words);
            case 'snakeCase':
                return this.toSnakeCase(words);
            case 'screamingSnakeCase':
                return this.toScreamingSnakeCase(words);
            case 'kebabCase':
                return this.toKebabCase(words);
            case 'screamingKebabCase':
                return this.toScreamingKebabCase(words);
            case 'trainCase':
                return this.toTrainCase(words);
            case 'dotCase':
                return this.toDotCase(words);
            case 'pathCase':
                return this.toPathCase(words);
            case 'titleCase':
                return this.toTitleCase(words);
            case 'sentenceCase':
                return this.toSentenceCase(words);
            case 'lowerCase':
                return this.toLowerCase(text);
            case 'upperCase':
                return this.toUpperCase(text);
            default:
                return text;
        }
    }
    
    tokenize(text) {
        return text
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[_\-\.\/]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(word => word.length > 0)
            .map(word => word.toLowerCase());
    }
    
    capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    toCamelCase(words) {
        if (words.length === 0) return '';
        return words[0].toLowerCase() + words.slice(1).map(word => this.capitalize(word)).join('');
    }
    
    toPascalCase(words) {
        return words.map(word => this.capitalize(word)).join('');
    }
    
    toSnakeCase(words) {
        return words.map(word => word.toLowerCase()).join('_');
    }
    
    toScreamingSnakeCase(words) {
        return words.map(word => word.toUpperCase()).join('_');
    }
    
    toKebabCase(words) {
        return words.map(word => word.toLowerCase()).join('-');
    }
    
    toScreamingKebabCase(words) {
        return words.map(word => word.toUpperCase()).join('-');
    }
    
    toTrainCase(words) {
        return words.map(word => this.capitalize(word)).join('-');
    }
    
    toDotCase(words) {
        return words.map(word => word.toLowerCase()).join('.');
    }
    
    toPathCase(words) {
        return words.map(word => word.toLowerCase()).join('/');
    }
    
    toTitleCase(words) {
        const articles = ['a', 'an', 'the'];
        const prepositions = ['at', 'by', 'for', 'in', 'of', 'on', 'to', 'up', 'and', 'as', 'but', 'or', 'nor'];
        
        return words.map((word, index) => {
            if (index === 0 || index === words.length - 1) {
                return this.capitalize(word);
            }
            
            if (articles.includes(word.toLowerCase()) || prepositions.includes(word.toLowerCase())) {
                return word.toLowerCase();
            }
            
            return this.capitalize(word);
        }).join(' ');
    }
    
    toSentenceCase(words) {
        const sentence = words.join(' ');
        return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    }
    
    toLowerCase(text) {
        return text.toLowerCase();
    }
    
    toUpperCase(text) {
        return text.toUpperCase();
    }
    
    async copyToClipboard(targetId, button) {
        const outputEl = this.outputs[targetId];
        const text = outputEl ? outputEl.value : '';
        
        if (!text) {
            this.showCopyFeedback(button, 'コピーするテキストがありません', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            this.showCopyFeedback(button, 'コピー完了', 'success');
        } catch (error) {
            this.fallbackCopyTextToClipboard(text, button);
        }
    }
    
    fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopyFeedback(button, 'コピー完了', 'success');
        } catch (error) {
            this.showCopyFeedback(button, 'コピー失敗', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    showCopyFeedback(button, message, type) {
        const originalText = button.textContent;
        button.textContent = message;
        
        if (type === 'success') {
            button.classList.add('copied');
        }
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 1500);
    }
    
    clearAll() {
        this.inputText.value = '';
        this.clearOutputs();
        this.inputText.focus();
    }
    
    clearOutputs() {
        Object.values(this.outputs).forEach(output => {
            output.value = '';
            this.autoResizeOutput(output);
        });
    }

    autoResizeOutput(element) {
        if (!element) return;
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }
    
    exportResults() {
        const inputText = this.inputText.value.trim();
        if (!inputText) {
            alert('エクスポートするテキストがありません');
            return;
        }
        
        const results = {
            input: inputText,
            conversions: {},
            timestamp: new Date().toISOString()
        };
        
        Object.keys(this.outputs).forEach(caseType => {
            const value = this.outputs[caseType].value;
            if (value) {
                results.conversions[caseType] = value;
            }
        });
        
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'case-conversion-results.json';
        link.click();
    }
    
    importFromJSON(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.input) {
                this.inputText.value = data.input;
                this.convertAll();
            }
        } catch (error) {
            alert('無効なJSONデータです');
        }
    }
    
    getVariableNameSuggestions(text) {
        const words = this.tokenize(text);
        const suggestions = {};
        
        suggestions.javascript = {
            variable: this.toCamelCase(words),
            function: this.toCamelCase(words),
            class: this.toPascalCase(words),
            constant: this.toScreamingSnakeCase(words)
        };
        
        suggestions.python = {
            variable: this.toSnakeCase(words),
            function: this.toSnakeCase(words),
            class: this.toPascalCase(words),
            constant: this.toScreamingSnakeCase(words)
        };
        
        suggestions.java = {
            variable: this.toCamelCase(words),
            method: this.toCamelCase(words),
            class: this.toPascalCase(words),
            constant: this.toScreamingSnakeCase(words)
        };
        
        suggestions.css = {
            class: this.toKebabCase(words),
            id: this.toKebabCase(words),
            property: this.toKebabCase(words)
        };
        
        return suggestions;
    }
    
    validateVariableName(name, language = 'javascript') {
        const patterns = {
            javascript: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
            python: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
            java: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
            css: /^-?[a-zA-Z_][a-zA-Z0-9_-]*$/
        };
        
        const pattern = patterns[language] || patterns.javascript;
        return pattern.test(name);
    }
    
    getLanguageReservedWords(language) {
        const reservedWords = {
            javascript: ['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'],
            python: ['and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'exec', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'not', 'or', 'pass', 'print', 'raise', 'return', 'try', 'while', 'with', 'yield'],
            java: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while']
        };
        
        return reservedWords[language] || [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CaseConverter();
});