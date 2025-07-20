class CronTool {
    constructor() {
        this.minute = document.getElementById('minute');
        this.hour = document.getElementById('hour');
        this.day = document.getElementById('day');
        this.month = document.getElementById('month');
        this.weekday = document.getElementById('weekday');
        this.year = document.getElementById('year');
        this.yearGroup = document.getElementById('yearGroup');
        this.cronOutput = document.getElementById('cronOutput');
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.cronInput = document.getElementById('cronInput');
        this.validateBtn = document.getElementById('validateBtn');
        this.statusBar = document.getElementById('statusBar');

        this.fillSelect(this.minute, 0, 59);
        this.fillSelect(this.hour, 0, 23);
        this.fillSelect(this.day, 1, 31);
        this.fillSelect(this.month, 1, 12);
        this.fillSelect(this.weekday, 0, 6);
        this.fillYearSelect();

        // Radio button event listeners
        document.querySelectorAll('input[name="cronFormat"]').forEach(radio => {
            radio.addEventListener('change', () => this.toggleFormat());
        });

        this.generateBtn.addEventListener('click', () => this.generate());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.copyBtn.addEventListener('click', () => this.copyCron());
        this.validateBtn.addEventListener('click', () => this.validate());
    }

    fillSelect(select, start, end) {
        select.innerHTML = '<option value="*">*</option>';
        for (let i = start; i <= end; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            select.appendChild(opt);
        }
    }

    fillYearSelect() {
        this.year.innerHTML = '<option value="*">*</option>';
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i <= currentYear + 10; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            this.year.appendChild(opt);
        }
    }

    toggleFormat() {
        const selectedFormat = document.querySelector('input[name="cronFormat"]:checked').value;
        if (selectedFormat === 'aws') {
            this.yearGroup.style.display = 'block';
        } else {
            this.yearGroup.style.display = 'none';
        }
    }

    getSelectedFormat() {
        return document.querySelector('input[name="cronFormat"]:checked').value;
    }

    generate() {
        const format = this.getSelectedFormat();
        let cron;
        
        if (format === 'aws') {
            cron = [
                this.minute.value,
                this.hour.value,
                this.day.value,
                this.month.value,
                this.weekday.value,
                this.year.value
            ].join(' ');
        } else {
            cron = [
                this.minute.value,
                this.hour.value,
                this.day.value,
                this.month.value,
                this.weekday.value
            ].join(' ');
        }
        
        this.cronOutput.value = cron;
        this.cronInput.value = cron;
        this.showStatus(`${format === 'aws' ? 'AWS EventBridge' : 'Linux Cron'}形式で生成しました`, 'success');
    }

    clear() {
        this.minute.value = '*';
        this.hour.value = '*';
        this.day.value = '*';
        this.month.value = '*';
        this.weekday.value = '*';
        this.year.value = '*';
        this.cronOutput.value = '';
        this.showStatus('クリアしました', 'success');
    }

    copyCron() {
        if (!this.cronOutput.value) return;
        navigator.clipboard.writeText(this.cronOutput.value)
            .then(() => this.showStatus('コピーしました', 'success'))
            .catch(() => this.showStatus('コピーに失敗しました', 'error'));
    }

    showStatus(message, type = 'info') {
        this.statusBar.textContent = message;
        this.statusBar.className = 'status-bar' + (type ? ` status-${type}` : '');
    }

    validate() {
        const cron = this.cronInput.value.trim();
        const result = this.isValidCron(cron);
        if (result.valid) {
            this.showStatus(`有効なCron式です（${result.format}形式）`, 'success');
        } else {
            this.showStatus(`無効なCron式です: ${result.error}`, 'error');
        }
    }

    isValidCron(expr) {
        const parts = expr.split(/\s+/);
        
        if (parts.length === 5) {
            // Linux Cron format
            const validFields = [
                this.validateField(parts[0], 0, 59, '分'),
                this.validateField(parts[1], 0, 23, '時'),
                this.validateField(parts[2], 1, 31, '日'),
                this.validateField(parts[3], 1, 12, '月'),
                this.validateField(parts[4], 0, 6, '曜日')
            ];
            
            const invalidField = validFields.find(result => !result.valid);
            if (invalidField) {
                return { valid: false, error: invalidField.error, format: 'Linux Cron' };
            }
            return { valid: true, format: 'Linux Cron' };
            
        } else if (parts.length === 6) {
            // AWS EventBridge format
            const validFields = [
                this.validateField(parts[0], 0, 59, '分'),
                this.validateField(parts[1], 0, 23, '時'),
                this.validateField(parts[2], 1, 31, '日'),
                this.validateField(parts[3], 1, 12, '月'),
                this.validateField(parts[4], 0, 6, '曜日'),
                this.validateYearField(parts[5])
            ];
            
            const invalidField = validFields.find(result => !result.valid);
            if (invalidField) {
                return { valid: false, error: invalidField.error, format: 'AWS EventBridge' };
            }
            return { valid: true, format: 'AWS EventBridge' };
            
        } else {
            return { 
                valid: false, 
                error: `フィールド数が無効です (${parts.length}個)。Linux Cronは5個、AWS EventBridgeは6個である必要があります。`,
                format: 'Unknown'
            };
        }
    }

    validateField(field, min, max, fieldName = 'フィールド') {
        if (field === '*') return { valid: true };
        
        if (/^\d+$/.test(field)) {
            const n = parseInt(field, 10);
            if (n >= min && n <= max) {
                return { valid: true };
            } else {
                return { valid: false, error: `${fieldName}の値が範囲外です (${n}は${min}-${max}の範囲内である必要があります)` };
            }
        }
        
        if (/^\*(\/\d+)?$/.test(field)) {
            if (field === '*') return { valid: true };
            const step = parseInt(field.split('/')[1], 10);
            if (step > 0) {
                return { valid: true };
            } else {
                return { valid: false, error: `${fieldName}のステップ値が無効です (${step}は0より大きい必要があります)` };
            }
        }
        
        if (/^\d+-\d+$/.test(field)) {
            const [s, e] = field.split('-').map(Number);
            if (s >= min && e <= max && s <= e) {
                return { valid: true };
            } else {
                return { valid: false, error: `${fieldName}の範囲指定が無効です (${s}-${e}は${min}-${max}の範囲内かつ開始値≤終了値である必要があります)` };
            }
        }
        
        if (/^(\d+,)+\d+$/.test(field)) {
            const values = field.split(',').map(v => parseInt(v, 10));
            const invalidValue = values.find(num => num < min || num > max);
            if (!invalidValue) {
                return { valid: true };
            } else {
                return { valid: false, error: `${fieldName}のリスト値に無効な値があります (${invalidValue}は${min}-${max}の範囲内である必要があります)` };
            }
        }
        
        return { valid: false, error: `${fieldName}の形式が無効です (${field})` };
    }

    validateYearField(field) {
        if (field === '*') return { valid: true };
        
        if (/^\d{4}$/.test(field)) {
            const year = parseInt(field, 10);
            if (year >= 2025 && year <= 2125) {
                return { valid: true };
            } else {
                return { valid: false, error: `年の値が範囲外です (${year}は2025-2125の範囲内である必要があります)` };
            }
        }
        
        if (/^\d{4}-\d{4}$/.test(field)) {
            const [start, end] = field.split('-').map(Number);
            if (start >= 2025 && end <= 2125 && start <= end) {
                return { valid: true };
            } else {
                return { valid: false, error: `年の範囲指定が無効です (${start}-${end}は2025-2125の範囲内かつ開始年≤終了年である必要があります)` };
            }
        }
        
        if (/^(\d{4},)+\d{4}$/.test(field)) {
            const years = field.split(',').map(y => parseInt(y, 10));
            const invalidYear = years.find(year => year < 2025 || year > 2125);
            if (!invalidYear) {
                return { valid: true };
            } else {
                return { valid: false, error: `年のリスト値に無効な値があります (${invalidYear}は2025-2125の範囲内である必要があります)` };
            }
        }
        
        if (/^\*(\/\d+)?$/.test(field)) {
            if (field === '*') return { valid: true };
            const step = parseInt(field.split('/')[1], 10);
            if (step > 0) {
                return { valid: true };
            } else {
                return { valid: false, error: `年のステップ値が無効です (${step}は0より大きい必要があります)` };
            }
        }
        
        return { valid: false, error: `年の形式が無効です (${field})` };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CronTool();
});
