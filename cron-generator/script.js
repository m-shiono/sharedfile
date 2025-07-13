class CronTool {
    constructor() {
        this.minute = document.getElementById('minute');
        this.hour = document.getElementById('hour');
        this.day = document.getElementById('day');
        this.month = document.getElementById('month');
        this.weekday = document.getElementById('weekday');
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

    generate() {
        const cron = [
            this.minute.value,
            this.hour.value,
            this.day.value,
            this.month.value,
            this.weekday.value
        ].join(' ');
        this.cronOutput.value = cron;
        this.cronInput.value = cron;
        this.showStatus('', 'info');
    }

    clear() {
        this.minute.value = '*';
        this.hour.value = '*';
        this.day.value = '*';
        this.month.value = '*';
        this.weekday.value = '*';
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
        if (this.isValidCron(cron)) {
            this.showStatus('有効なCron式です', 'success');
        } else {
            this.showStatus('Cron式が無効です', 'error');
        }
    }

    isValidCron(expr) {
        const parts = expr.split(/\s+/);
        if (parts.length !== 5) return false;
        return this.validateField(parts[0], 0, 59) &&
               this.validateField(parts[1], 0, 23) &&
               this.validateField(parts[2], 1, 31) &&
               this.validateField(parts[3], 1, 12) &&
               this.validateField(parts[4], 0, 6);
    }

    validateField(field, min, max) {
        if (field === '*') return true;
        if (/^\d+$/.test(field)) {
            const n = parseInt(field, 10);
            return n >= min && n <= max;
        }
        if (/^\*(\/\d+)?$/.test(field)) {
            if (field === '*') return true;
            const step = parseInt(field.split('/')[1], 10);
            return step > 0;
        }
        if (/^\d+-\d+$/.test(field)) {
            const [s, e] = field.split('-').map(Number);
            return s >= min && e <= max && s <= e;
        }
        if (/^(\d+,)+\d+$/.test(field)) {
            return field.split(',').every(v => {
                const num = parseInt(v, 10);
                return num >= min && num <= max;
            });
        }
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CronTool();
});
