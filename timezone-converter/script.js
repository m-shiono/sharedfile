// タイムゾーン情報
const timezones = [
    { value: 'UTC', name: 'UTC', display: '協定世界時 (UTC)' },
    { value: 'Asia/Tokyo', name: 'JST', display: '日本標準時 (JST)' },
    { value: 'America/New_York', name: 'EST/EDT', display: '東部標準時 (EST/EDT)' },
    { value: 'America/Los_Angeles', name: 'PST/PDT', display: '太平洋標準時 (PST/PDT)' },
    { value: 'Europe/London', name: 'GMT/BST', display: 'グリニッジ標準時 (GMT/BST)' },
    { value: 'Europe/Paris', name: 'CET/CEST', display: '中央ヨーロッパ時間 (CET/CEST)' },
    { value: 'Asia/Shanghai', name: 'CST', display: '中国標準時 (CST)' },
    { value: 'Asia/Seoul', name: 'KST', display: '韓国標準時 (KST)' },
    { value: 'Australia/Sydney', name: 'AEST/AEDT', display: 'オーストラリア東部時間 (AEST/AEDT)' }
];

// DOM要素
const currentTimeElement = document.getElementById('current-time');
const inputDatetime = document.getElementById('input-datetime');
const inputTimezone = document.getElementById('input-timezone');
const convertBtn = document.getElementById('convert-btn');
const currentTimeBtn = document.getElementById('current-time-btn');
const resultsContainer = document.getElementById('conversion-results');

// 現在時刻を更新
function updateCurrentTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tokyo',
        timeZoneName: 'short'
    };
    
    currentTimeElement.textContent = `現在時刻 (JST): ${now.toLocaleString('ja-JP', options)}`;
}

// 現在時刻を設定
function setCurrentTime() {
    const now = new Date();
    const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 16);
    inputDatetime.value = localISOTime;
}

// タイムゾーン変換を実行
function convertTimezone() {
    const inputValue = inputDatetime.value;
    if (!inputValue) {
        alert('日時を入力してください。');
        return;
    }

    const inputDate = new Date(inputValue);
    const sourceTimezone = inputTimezone.value;

    // 入力された日時を指定されたタイムゾーンとして解釈
    const sourceDate = new Date(inputValue + ':00');
    
    // 結果をクリア
    resultsContainer.innerHTML = '';

    // 各タイムゾーンに変換
    timezones.forEach(timezone => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'timezone-result';

        try {
            // タイムゾーンの変換
            let convertedTime;
            
            if (sourceTimezone === timezone.value) {
                // 同じタイムゾーンの場合
                convertedTime = sourceDate;
            } else {
                // 異なるタイムゾーンの場合
                // 入力された時刻をUTCとして扱い、各タイムゾーンに変換
                const utcTime = new Date(sourceDate.getTime() - getTimezoneOffset(sourceTimezone) * 60000);
                convertedTime = new Date(utcTime.getTime() + getTimezoneOffset(timezone.value) * 60000);
            }

            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: timezone.value
            };

            const formattedTime = convertedTime.toLocaleString('ja-JP', options);

            resultDiv.innerHTML = `
                <div class="timezone-name">${timezone.display}</div>
                <div class="timezone-time">${formattedTime}</div>
            `;
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="timezone-name">${timezone.display}</div>
                <div class="timezone-time">変換エラー</div>
            `;
        }

        resultsContainer.appendChild(resultDiv);
    });
}

// タイムゾーンオフセットを取得（分単位）
function getTimezoneOffset(timezone) {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    return (target.getTime() - utc.getTime()) / (1000 * 60);
}

// より正確なタイムゾーン変換
function convertTimezoneAccurate() {
    const inputValue = inputDatetime.value;
    if (!inputValue) {
        alert('日時を入力してください。');
        return;
    }

    const sourceTimezone = inputTimezone.value;
    
    // 結果をクリア
    resultsContainer.innerHTML = '';

    // 各タイムゾーンに変換
    timezones.forEach(timezone => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'timezone-result';

        try {
            // 入力された日時を元のタイムゾーンで解釈
            const inputDate = new Date(inputValue);
            
            // 現在のタイムゾーンでの時刻として解釈し、指定されたタイムゾーンに変換
            let displayTime;
            
            if (sourceTimezone === 'UTC') {
                // UTC入力の場合
                displayTime = new Date(inputDate.getTime());
            } else {
                // 特定のタイムゾーン入力の場合、そのタイムゾーンでの時刻として扱う
                displayTime = new Date(inputDate.getTime());
            }

            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: timezone.value
            };

            // より正確な変換のため、Intl.DateTimeFormatを使用
            const formatter = new Intl.DateTimeFormat('ja-JP', options);
            const formattedTime = formatter.format(displayTime);

            resultDiv.innerHTML = `
                <div class="timezone-name">${timezone.display}</div>
                <div class="timezone-time">${formattedTime}</div>
            `;
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="timezone-name">${timezone.display}</div>
                <div class="timezone-time">変換エラー</div>
            `;
        }

        resultsContainer.appendChild(resultDiv);
    });
}

// イベントリスナーの設定
convertBtn.addEventListener('click', convertTimezoneAccurate);
currentTimeBtn.addEventListener('click', setCurrentTime);

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setCurrentTime();
    
    // 1秒ごとに現在時刻を更新
    setInterval(updateCurrentTime, 1000);
});

// Enterキーでの変換実行
inputDatetime.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        convertTimezoneAccurate();
    }
});