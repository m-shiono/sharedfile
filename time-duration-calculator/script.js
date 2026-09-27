document.addEventListener('DOMContentLoaded', function () {
    const forwardBase = document.getElementById('forwardBase');
    const forwardDays = document.getElementById('forwardDays');
    const forwardHours = document.getElementById('forwardHours');
    const forwardMinutes = document.getElementById('forwardMinutes');
    const forwardNowBtn = document.getElementById('forwardNowBtn');
    const forwardCalcBtn = document.getElementById('forwardCalcBtn');
    const forwardError = document.getElementById('forwardError');
    const forwardResultSection = document.getElementById('forwardResultSection');
    const forwardResultDatetime = document.getElementById('forwardResultDatetime');
    const forwardResultRelative = document.getElementById('forwardResultRelative');
    const forwardCopyBtn = document.getElementById('forwardCopyBtn');

    const reverseBase = document.getElementById('reverseBase');
    const reverseTarget = document.getElementById('reverseTarget');
    const reverseNowBtn = document.getElementById('reverseNowBtn');
    const reverseCalcBtn = document.getElementById('reverseCalcBtn');
    const reverseError = document.getElementById('reverseError');
    const reverseResultSection = document.getElementById('reverseResultSection');
    const reverseResultDuration = document.getElementById('reverseResultDuration');
    const reverseResultTotalHours = document.getElementById('reverseResultTotalHours');
    const reverseResultTotalMinutes = document.getElementById('reverseResultTotalMinutes');
    const reverseCopyBtn = document.getElementById('reverseCopyBtn');

    let forwardCopyText = '';
    let reverseCopyText = '';

    /** datetime-local 用の文字列に変換 */
    function toDatetimeLocalValue(date) {
        const pad = (n) => String(n).padStart(2, '0');
        return (
            date.getFullYear() +
            '-' +
            pad(date.getMonth() + 1) +
            '-' +
            pad(date.getDate()) +
            'T' +
            pad(date.getHours()) +
            ':' +
            pad(date.getMinutes())
        );
    }

    /** 表示用の日時文字列 */
    function formatDateTime(date) {
        const pad = (n) => String(n).padStart(2, '0');
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        return (
            date.getFullYear() +
            '/' +
            pad(date.getMonth() + 1) +
            '/' +
            pad(date.getDate()) +
            ' (' +
            weekdays[date.getDay()] +
            ') ' +
            pad(date.getHours()) +
            ':' +
            pad(date.getMinutes())
        );
    }

    /** 基準日からの相対表示（+N日 HH:MM） */
    function formatRelative(baseDate, targetDate) {
        const pad = (n) => String(n).padStart(2, '0');
        const baseDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
        const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const dayDiff = Math.round((targetDay - baseDay) / 86400000);
        const timePart = pad(targetDate.getHours()) + ':' + pad(targetDate.getMinutes());

        if (dayDiff === 0) {
            return timePart + '（同日）';
        }
        if (dayDiff > 0) {
            return '+' + dayDiff + '日 ' + timePart;
        }
        return dayDiff + '日 ' + timePart;
    }

    /** 経過時間を「X日 Y時間 Z分」形式に */
    function formatDuration(totalMinutes) {
        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const minutes = totalMinutes % 60;
        const parts = [];
        if (days > 0) parts.push(days + '日');
        if (hours > 0) parts.push(hours + '時間');
        if (minutes > 0 || parts.length === 0) parts.push(minutes + '分');
        return parts.join(' ');
    }

    function parseNonNegativeInt(value, label) {
        if (value === '' || value === null || value === undefined) {
            return 0;
        }
        const num = Number(value);
        if (!Number.isInteger(num) || num < 0) {
            throw new Error(label + 'は0以上の整数で入力してください');
        }
        return num;
    }

    function showError(el, message) {
        el.textContent = 'エラー: ' + message;
        el.style.display = 'block';
    }

    function hideError(el) {
        el.style.display = 'none';
        el.textContent = '';
    }

    function setNow(inputEl) {
        inputEl.value = toDatetimeLocalValue(new Date());
    }

    async function copyText(text, button) {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            const original = button.textContent;
            button.textContent = 'コピーしました';
            setTimeout(function () {
                button.textContent = original;
            }, 1500);
        } catch (e) {
            alert('コピーに失敗しました');
        }
    }

    // 初期値: 現在時刻
    setNow(forwardBase);
    setNow(reverseBase);

    forwardNowBtn.addEventListener('click', function () {
        setNow(forwardBase);
    });

    reverseNowBtn.addEventListener('click', function () {
        setNow(reverseBase);
    });

    // 基準時刻 + 経過時間 → 到達時刻
    forwardCalcBtn.addEventListener('click', function () {
        hideError(forwardError);
        forwardResultSection.style.display = 'none';

        try {
            if (!forwardBase.value) {
                throw new Error('基準時刻を入力してください');
            }

            const base = new Date(forwardBase.value);
            if (isNaN(base.getTime())) {
                throw new Error('基準時刻の形式が正しくありません');
            }

            const days = parseNonNegativeInt(forwardDays.value, '日');
            const hours = parseNonNegativeInt(forwardHours.value, '時間');
            const minutes = parseNonNegativeInt(forwardMinutes.value, '分');

            if (days === 0 && hours === 0 && minutes === 0) {
                throw new Error('経過時間（日・時・分のいずれか）を入力してください');
            }

            const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
            const target = new Date(base.getTime() + totalMinutes * 60 * 1000);

            const datetimeText = formatDateTime(target);
            const relativeText = formatRelative(base, target);

            forwardResultDatetime.textContent = datetimeText;
            forwardResultRelative.textContent = relativeText;
            forwardCopyText =
                '到達時刻: ' + datetimeText + '\n相対表示: ' + relativeText + '\n経過時間: ' + formatDuration(totalMinutes);
            forwardResultSection.style.display = 'block';
        } catch (e) {
            showError(forwardError, e.message);
        }
    });

    // 基準時刻 + 到達時刻 → 経過時間
    reverseCalcBtn.addEventListener('click', function () {
        hideError(reverseError);
        reverseResultSection.style.display = 'none';

        try {
            if (!reverseBase.value) {
                throw new Error('基準時刻を入力してください');
            }
            if (!reverseTarget.value) {
                throw new Error('到達時刻を入力してください');
            }

            const base = new Date(reverseBase.value);
            const target = new Date(reverseTarget.value);

            if (isNaN(base.getTime())) {
                throw new Error('基準時刻の形式が正しくありません');
            }
            if (isNaN(target.getTime())) {
                throw new Error('到達時刻の形式が正しくありません');
            }

            if (target.getTime() < base.getTime()) {
                throw new Error('到達時刻は基準時刻以降を指定してください');
            }

            const totalMinutes = Math.round((target.getTime() - base.getTime()) / 60000);
            const durationText = formatDuration(totalMinutes);
            const totalHours = Math.floor(totalMinutes / 60);
            const remainMinutes = totalMinutes % 60;
            const totalHoursText =
                remainMinutes === 0
                    ? totalHours + '時間'
                    : totalHours + '時間 ' + remainMinutes + '分';

            reverseResultDuration.textContent = durationText;
            reverseResultTotalHours.textContent = totalHoursText;
            reverseResultTotalMinutes.textContent = totalMinutes + '分';
            reverseCopyText =
                '経過時間: ' +
                durationText +
                '\n総時間: ' +
                totalHoursText +
                '\n総分: ' +
                totalMinutes +
                '分';
            reverseResultSection.style.display = 'block';
        } catch (e) {
            showError(reverseError, e.message);
        }
    });

    forwardCopyBtn.addEventListener('click', function () {
        copyText(forwardCopyText, forwardCopyBtn);
    });

    reverseCopyBtn.addEventListener('click', function () {
        copyText(reverseCopyText, reverseCopyBtn);
    });
});
