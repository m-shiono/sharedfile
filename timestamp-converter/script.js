class TimestampConverter {
    constructor() {
        this.currentTimestamp = document.getElementById('currentTimestamp');
        this.currentDateTime = document.getElementById('currentDateTime');
        this.currentDateTimeUTC = document.getElementById('currentDateTimeUTC');
        
        this.timestampInput = document.getElementById('timestampInput');
        this.localDateTime = document.getElementById('localDateTime');
        this.utcDateTime = document.getElementById('utcDateTime');
        this.isoDateTime = document.getElementById('isoDateTime');
        this.rfcDateTime = document.getElementById('rfcDateTime');
        this.customFormat = document.getElementById('customFormat');
        this.customDateTime = document.getElementById('customDateTime');
        
        this.dateInput = document.getElementById('dateInput');
        this.timeInput = document.getElementById('timeInput');
        this.timezoneSelect = document.getElementById('timezoneSelect');
        this.dateTextInput = document.getElementById('dateTextInput');
        this.datePickerInputs = document.getElementById('datePickerInputs');
        this.dateTextInputs = document.getElementById('dateTextInputs');
        
        this.resultTimestampSeconds = document.getElementById('resultTimestampSeconds');
        this.resultTimestampMilliseconds = document.getElementById('resultTimestampMilliseconds');
        
        this.batchInput = document.getElementById('batchInput');
        this.batchOutput = document.getElementById('batchOutput');
        
        this.quickTimestampResult = document.getElementById('quickTimestampResult');
        this.quickDateTimeResult = document.getElementById('quickDateTimeResult');
        
        this.copyButtons = document.querySelectorAll('.copy-btn');
        this.timestampUnitRadios = document.querySelectorAll('input[name="timestampUnit"]');
        this.dateInputModeRadios = document.querySelectorAll('input[name="dateInputMode"]');
        this.batchModeRadios = document.querySelectorAll('input[name="batchMode"]');
        this.quickButtons = document.querySelectorAll('.quick-btn');
        
        this.initializeEventListeners();
        this.startCurrentTimeUpdate();
        this.initializeDateTime();
    }
    
    initializeEventListeners() {
        document.getElementById('convertTimestampBtn').addEventListener('click', () => this.convertTimestamp());
        document.getElementById('convertDateBtn').addEventListener('click', () => this.convertDate());
        document.getElementById('batchConvertBtn').addEventListener('click', () => this.batchConvert());
        
        this.timestampInput.addEventListener('input', () => this.autoConvertTimestamp());
        this.timestampInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.convertTimestamp();
            }
        });
        
        this.customFormat.addEventListener('input', () => this.updateCustomFormat());
        
        this.dateInputModeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.onDateInputModeChange());
        });
        
        this.dateInput.addEventListener('change', () => this.autoConvertDate());
        this.timeInput.addEventListener('change', () => this.autoConvertDate());
        this.timezoneSelect.addEventListener('change', () => this.autoConvertDate());
        this.dateTextInput.addEventListener('input', () => this.autoConvertDate());
        
        this.copyButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleCopy(e));
        });
        
        this.quickButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleQuickTimestamp(e));
        });
        
        document.getElementById('copyCurrentTimestamp').addEventListener('click', () => {
            this.copyText(this.currentTimestamp.textContent);
        });
        
        document.getElementById('copyCurrentDateTime').addEventListener('click', () => {
            this.copyText(this.currentDateTime.textContent);
        });
        
        document.getElementById('copyCurrentDateTimeUTC').addEventListener('click', () => {
            this.copyText(this.currentDateTimeUTC.textContent);
        });
    }
    
    startCurrentTimeUpdate() {
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);
        
        this.currentTimestamp.textContent = timestamp;
        this.currentDateTime.textContent = this.formatDateTime(now, 'local');
        this.currentDateTimeUTC.textContent = this.formatDateTime(now, 'utc');
    }
    
    initializeDateTime() {
        const now = new Date();
        this.dateInput.value = now.toISOString().split('T')[0];
        this.timeInput.value = now.toTimeString().split(' ')[0];
    }
    
    onDateInputModeChange() {
        const mode = document.querySelector('input[name="dateInputMode"]:checked').value;
        if (mode === 'picker') {
            this.datePickerInputs.style.display = 'block';
            this.dateTextInputs.style.display = 'none';
        } else {
            this.datePickerInputs.style.display = 'none';
            this.dateTextInputs.style.display = 'block';
        }
    }
    
    convertTimestamp() {
        const input = this.timestampInput.value.trim();
        if (!input) {
            alert('タイムスタンプを入力してください');
            return;
        }
        
        const unit = document.querySelector('input[name="timestampUnit"]:checked').value;
        let timestamp = parseInt(input);
        
        if (isNaN(timestamp)) {
            alert('有効な数値を入力してください');
            return;
        }
        
        if (unit === 'milliseconds') {
            timestamp = Math.floor(timestamp / 1000);
        }
        
        if (timestamp < 0 || timestamp > 4102444800) { // 2100年まで
            alert('有効な範囲のタイムスタンプを入力してください');
            return;
        }
        
        const date = new Date(timestamp * 1000);
        
        this.localDateTime.value = this.formatDateTime(date, 'local');
        this.utcDateTime.value = this.formatDateTime(date, 'utc');
        this.isoDateTime.value = date.toISOString();
        this.rfcDateTime.value = date.toUTCString();
        
        this.updateCustomFormat();
    }
    
    autoConvertTimestamp() {
        const input = this.timestampInput.value.trim();
        if (input && !isNaN(parseInt(input))) {
            this.convertTimestamp();
        }
    }
    
    updateCustomFormat() {
        const input = this.timestampInput.value.trim();
        const format = this.customFormat.value.trim();
        
        if (!input || !format) {
            this.customDateTime.value = '';
            return;
        }
        
        const unit = document.querySelector('input[name="timestampUnit"]:checked').value;
        let timestamp = parseInt(input);
        
        if (unit === 'milliseconds') {
            timestamp = Math.floor(timestamp / 1000);
        }
        
        const date = new Date(timestamp * 1000);
        this.customDateTime.value = this.formatCustomDateTime(date, format);
    }
    
    convertDate() {
        const mode = document.querySelector('input[name="dateInputMode"]:checked').value;
        let date;
        
        if (mode === 'picker') {
            const dateValue = this.dateInput.value;
            const timeValue = this.timeInput.value || '00:00:00';
            const timezone = this.timezoneSelect.value;
            
            if (!dateValue) {
                alert('日付を選択してください');
                return;
            }
            
            const dateTimeString = `${dateValue}T${timeValue}`;
            
            if (timezone === 'local') {
                date = new Date(dateTimeString);
            } else if (timezone === 'UTC') {
                date = new Date(dateTimeString + 'Z');
            } else {
                // 特定のタイムゾーンの場合
                date = new Date(dateTimeString);
                // 簡易的な処理（実際のタイムゾーン変換は複雑）
            }
        } else {
            const dateText = this.dateTextInput.value.trim();
            if (!dateText) {
                alert('日時文字列を入力してください');
                return;
            }
            
            date = new Date(dateText);
        }
        
        if (isNaN(date.getTime())) {
            alert('有効な日時を入力してください');
            return;
        }
        
        const timestampSeconds = Math.floor(date.getTime() / 1000);
        const timestampMilliseconds = date.getTime();
        
        this.resultTimestampSeconds.value = timestampSeconds;
        this.resultTimestampMilliseconds.value = timestampMilliseconds;
    }
    
    autoConvertDate() {
        setTimeout(() => {
            try {
                this.convertDate();
            } catch (error) {
                // 自動変換でのエラーは無視
            }
        }, 100);
    }
    
    batchConvert() {
        const input = this.batchInput.value.trim();
        if (!input) {
            alert('変換したいデータを入力してください');
            return;
        }
        
        const lines = input.split('\n').filter(line => line.trim());
        const mode = document.querySelector('input[name="batchMode"]:checked').value;
        const results = [];
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            try {
                if (mode === 'timestamp') {
                    const timestamp = parseInt(trimmedLine);
                    if (!isNaN(timestamp)) {
                        let actualTimestamp = timestamp;
                        if (timestamp > 1000000000000) {
                            actualTimestamp = Math.floor(timestamp / 1000);
                        }
                        const date = new Date(actualTimestamp * 1000);
                        results.push(`${trimmedLine} → ${this.formatDateTime(date, 'local')}`);
                    } else {
                        results.push(`${trimmedLine} → エラー: 無効なタイムスタンプ`);
                    }
                } else {
                    const date = new Date(trimmedLine);
                    if (!isNaN(date.getTime())) {
                        const timestamp = Math.floor(date.getTime() / 1000);
                        results.push(`${trimmedLine} → ${timestamp}`);
                    } else {
                        results.push(`${trimmedLine} → エラー: 無効な日時`);
                    }
                }
            } catch (error) {
                results.push(`${trimmedLine} → エラー: ${error.message}`);
            }
        });
        
        this.batchOutput.value = results.join('\n');
    }
    
    handleQuickTimestamp(e) {
        const offset = parseInt(e.target.getAttribute('data-offset'));
        const now = Math.floor(Date.now() / 1000);
        const targetTimestamp = now + offset;
        
        // Update the main timestamp input (existing behavior)
        this.timestampInput.value = targetTimestamp;
        this.convertTimestamp();
        
        // Update the quick result display (new behavior)
        const date = new Date(targetTimestamp * 1000);
        this.quickTimestampResult.value = targetTimestamp;
        this.quickDateTimeResult.value = this.formatDateTime(date, 'local');
    }
    
    formatDateTime(date, type) {
        if (type === 'utc') {
            return date.toISOString().replace('T', ' ').replace('.000Z', ' UTC');
        } else {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            
            const timezone = date.toTimeString().split(' ')[1];
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${timezone}`;
        }
    }
    
    formatCustomDateTime(date, format) {
        const replacements = {
            'yyyy': date.getFullYear(),
            'MM': String(date.getMonth() + 1).padStart(2, '0'),
            'dd': String(date.getDate()).padStart(2, '0'),
            'HH': String(date.getHours()).padStart(2, '0'),
            'mm': String(date.getMinutes()).padStart(2, '0'),
            'ss': String(date.getSeconds()).padStart(2, '0'),
            'SSS': String(date.getMilliseconds()).padStart(3, '0')
        };
        
        let result = format;
        Object.keys(replacements).forEach(key => {
            result = result.replace(new RegExp(key, 'g'), replacements[key]);
        });
        
        return result;
    }
    
    async handleCopy(e) {
        const button = e.target;
        const targetId = button.getAttribute('data-target');
        
        if (targetId) {
            const element = document.getElementById(targetId);
            await this.copyText(element.value, button);
        }
    }
    
    async copyText(text, button = null) {
        if (!text) {
            if (button) this.showCopyFeedback(button, 'コピーするデータがありません', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            if (button) this.showCopyFeedback(button, 'コピー完了', 'success');
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
            if (button) this.showCopyFeedback(button, 'コピー完了', 'success');
        } catch (error) {
            if (button) this.showCopyFeedback(button, 'コピー失敗', 'error');
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
    
    validateTimestamp(timestamp) {
        return !isNaN(timestamp) && timestamp >= 0 && timestamp <= 4102444800;
    }
    
    detectTimestampUnit(timestamp) {
        if (timestamp > 1000000000000) {
            return 'milliseconds';
        } else {
            return 'seconds';
        }
    }
    
    getRelativeTime(timestamp) {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;
        
        if (diff < 60) {
            return `${diff}秒前`;
        } else if (diff < 3600) {
            return `${Math.floor(diff / 60)}分前`;
        } else if (diff < 86400) {
            return `${Math.floor(diff / 3600)}時間前`;
        } else {
            return `${Math.floor(diff / 86400)}日前`;
        }
    }
    
    exportTimestampHistory() {
        const history = {
            timestamp: this.timestampInput.value,
            converted: {
                local: this.localDateTime.value,
                utc: this.utcDateTime.value,
                iso: this.isoDateTime.value,
                rfc: this.rfcDateTime.value
            },
            exportTime: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'timestamp-conversion.json';
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TimestampConverter();
});