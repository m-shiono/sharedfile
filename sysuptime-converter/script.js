// Constants
const MAX_TIMETICKS = 4294967295; // 2^32 - 1

document.addEventListener('DOMContentLoaded', function() {
    const sysuptimeInput = document.getElementById('sysuptimeInput');
    const convertBtn = document.getElementById('convertBtn');
    const resultSection = document.getElementById('resultSection');
    const totalResult = document.getElementById('totalResult');
    const daysResult = document.getElementById('daysResult');
    const hoursResult = document.getElementById('hoursResult');
    const minutesResult = document.getElementById('minutesResult');
    const secondsResult = document.getElementById('secondsResult');
    const totalSecondsResult = document.getElementById('totalSecondsResult');
    const originalValueResult = document.getElementById('originalValueResult');
    const exampleButtons = document.querySelectorAll('.example-btn');
    const errorContainer = document.getElementById('errorContainer');
    
    // 変換関数
    function convertSysUpTime(timeTicks) {
        if (timeTicks < 0) {
            throw new Error('TimeTicks値は0以上である必要があります');
        }
        
        if (timeTicks > MAX_TIMETICKS) {
            throw new Error(`TimeTicks値の最大値（${MAX_TIMETICKS.toLocaleString()}）を超えています`);
        }
        
        // TimeTicks を秒に変換（1 TimeTick = 1/100 秒）
        const totalSeconds = Math.floor(timeTicks / 100);
        
        // 日、時、分、秒に分解
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return {
            totalSeconds: totalSeconds,
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            originalValue: timeTicks
        };
    }
    
    // 結果を表示する関数
    function displayResult(result) {
        const formatTotalTime = () => {
            const parts = [];
            if (result.days > 0) parts.push(`${result.days}日`);
            if (result.hours > 0) parts.push(`${result.hours}時間`);
            if (result.minutes > 0) parts.push(`${result.minutes}分`);
            if (result.seconds > 0) parts.push(`${result.seconds}秒`);
            return parts.length > 0 ? parts.join(' ') : '0秒';
        };
        
        totalResult.textContent = formatTotalTime();
        daysResult.textContent = `${result.days}日`;
        hoursResult.textContent = `${result.hours}時間`;
        minutesResult.textContent = `${result.minutes}分`;
        secondsResult.textContent = `${result.seconds}秒`;
        totalSecondsResult.textContent = `${result.totalSeconds.toLocaleString()}秒`;
        originalValueResult.textContent = result.originalValue.toLocaleString();
        
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // エラーを表示する関数
    function showError(message) {
        errorContainer.textContent = `エラー: ${message}`;
        errorContainer.style.display = 'block';
        resultSection.style.display = 'none';
    }
    
    // エラーを非表示にする関数
    function hideError() {
        errorContainer.style.display = 'none';
    }
    
    // 変換実行関数
    function performConversion() {
        const inputValue = sysuptimeInput.value.trim();
        
        if (!inputValue) {
            showError('sysUpTime値を入力してください');
            return;
        }
        
        const timeTicks = parseInt(inputValue, 10);
        
        if (isNaN(timeTicks)) {
            showError('有効な数値を入力してください');
            return;
        }
        
        try {
            hideError();
            const result = convertSysUpTime(timeTicks);
            displayResult(result);
        } catch (error) {
            showError(error.message);
        }
    }
    
    // イベントリスナーの設定
    convertBtn.addEventListener('click', performConversion);
    
    // Enterキーで変換実行
    sysuptimeInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            performConversion();
        }
    });
    
    // 入力値のリアルタイム検証
    sysuptimeInput.addEventListener('input', function() {
        const value = this.value.trim();
        const numValue = parseInt(value, 10);
        
        if (value && (isNaN(numValue) || numValue < 0 || numValue > MAX_TIMETICKS)) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#81c784';
        }
    });
    
    // 例文ボタンのイベントリスナー
    exampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const exampleValue = this.dataset.value;
            sysuptimeInput.value = exampleValue;
            sysuptimeInput.style.borderColor = '#81c784';
            performConversion();
        });
    });
    
    // 初期状態では入力欄にフォーカス
    sysuptimeInput.focus();
});