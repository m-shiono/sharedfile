// 主要なタイムゾーン（一覧表示用）
const MAJOR_TIMEZONES = [
    { value: 'Asia/Tokyo', display: '日本標準時 (JST)' },
    { value: 'UTC', display: '協定世界時 (UTC)' },
    { value: 'America/New_York', display: 'ニューヨーク (EST/EDT)' },
    { value: 'America/Los_Angeles', display: 'ロサンゼルス (PST/PDT)' },
    { value: 'Europe/London', display: 'ロンドン (GMT/BST)' },
    { value: 'Europe/Paris', display: 'パリ (CET/CEST)' },
    { value: 'Asia/Shanghai', display: '上海 (CST)' },
    { value: 'Asia/Seoul', display: 'ソウル (KST)' },
    { value: 'Australia/Sydney', display: 'シドニー (AEST/AEDT)' },
    { value: 'Asia/Singapore', display: 'シンガポール (SGT)' },
    { value: 'Asia/Dubai', display: 'ドバイ (GST)' },
    { value: 'Europe/Berlin', display: 'ベルリン (CET/CEST)' }
];

// DOM要素
const currentTimeElement = document.getElementById('current-time');
const inputDatetime = document.getElementById('input-datetime');
const inputTimezone = document.getElementById('input-timezone');
const targetTimezone = document.getElementById('target-timezone');
const swapBtn = document.getElementById('swap-btn');
const currentTimeBtn = document.getElementById('current-time-btn');
const copyBtn = document.getElementById('copy-btn');
const specificResult = document.getElementById('specific-result');
const resultsGrid = document.getElementById('conversion-results');

// タイムゾーンリストの初期化
function initTimezoneSelects() {
    const allTimezones = Intl.supportedValuesOf('timeZone');
    const now = new Date();

    // タイムゾーンごとのメタデータを作成
    const tzData = allTimezones.map(tz => {
        const offsetMinutes = getOffsetMinutes(tz, now);
        return {
            value: tz,
            offsetMinutes: offsetMinutes,
            label: `(${getOffsetString(tz, now)}) ${tz}`
        };
    });

    // ソート処理
    const sortedTzData = tzData.sort((a, b) => {
        // 1. Asia/Tokyo と UTC を最優先
        const priority = { 'Asia/Tokyo': 1, 'UTC': 2 };
        const aPriority = priority[a.value] || 999;
        const bPriority = priority[b.value] || 999;
        if (aPriority !== bPriority) return aPriority - bPriority;

        // 2. オフセット順 (マイナスの大きい順 = 数値の小さい順)
        if (a.offsetMinutes !== b.offsetMinutes) return a.offsetMinutes - b.offsetMinutes;

        // 3. 同じオフセットならアルファベット順 (Region/Cityの順になる)
        return a.value.localeCompare(b.value);
    });

    const fragmentInput = document.createDocumentFragment();
    const fragmentTarget = document.createDocumentFragment();

    sortedTzData.forEach(data => {
        const opt1 = document.createElement('option');
        opt1.value = data.value;
        opt1.textContent = data.label;
        if (data.value === 'UTC') opt1.selected = true;
        fragmentInput.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = data.value;
        opt2.textContent = data.label;
        if (data.value === 'Asia/Tokyo') opt2.selected = true;
        fragmentTarget.appendChild(opt2);
    });

    inputTimezone.appendChild(fragmentInput);
    targetTimezone.appendChild(fragmentTarget);
}

// タイムゾーンのオフセット文字列を取得 (例: +09:00)
function getOffsetString(timezone, date) {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset'
        }).formatToParts(date);
        const offsetPart = parts.find(p => p.type === 'timeZoneName').value;
        if (offsetPart === 'GMT') return '+00:00';
        return offsetPart.replace('GMT', '');
    } catch (e) {
        return '+00:00';
    }
}

// タイムゾーンのオフセットを分単位で取得
function getOffsetMinutes(timezone, date) {
    try {
        const offsetStr = getOffsetString(timezone, date); // "+09:00" or "-05:00"
        const sign = offsetStr.startsWith('+') ? 1 : -1;
        const [hours, minutes] = offsetStr.substring(1).split(':').map(Number);
        return sign * (hours * 60 + minutes);
    } catch (e) {
        return 0;
    }
}

// 現在時刻を更新 (ヘッダー表示用)
function updateCurrentTimeDisplay() {
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

// 入力欄に現在時刻を設定
function setCurrentTime() {
    const now = new Date();
    // datetime-local形式 (YYYY-MM-DDThh:mm)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    inputDatetime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // システムのタイムゾーンをデフォルト選択（初期化時のみ）
    if (!inputTimezone.dataset.initialized) {
        const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if ([...inputTimezone.options].some(opt => opt.value === systemTz)) {
            inputTimezone.value = systemTz;
        }
        inputTimezone.dataset.initialized = "true";
    }
    
    convert();
}

// 変換処理
function convert() {
    const inputValue = inputDatetime.value;
    if (!inputValue) return;

    const sourceTz = inputTimezone.value;
    const targetTz = targetTimezone.value;

    // 入力時刻を解析
    // 1. 入力された日時を、一旦UTCとして扱う
    const baseDate = new Date(inputValue + ':00Z');
    // 2. 変換元タイムゾーンのオフセット分だけ逆にずらして、本当のUTC時刻を求める
    const sourceOffset = getOffsetMinutes(sourceTz, baseDate);
    const utcDate = new Date(baseDate.getTime() - sourceOffset * 60000);

    // --- 詳細変換の結果表示 ---
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: targetTz
    };
    specificResult.textContent = utcDate.toLocaleString('ja-JP', options);

    // --- 主要都市の一覧更新 ---
    resultsGrid.innerHTML = '';
    MAJOR_TIMEZONES.forEach(tz => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'timezone-result';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'timezone-name';
        nameDiv.textContent = tz.display;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'timezone-time';
        const gridOptions = { ...options, timeZone: tz.value };
        timeDiv.textContent = utcDate.toLocaleString('ja-JP', gridOptions);

        resultDiv.appendChild(nameDiv);
        resultDiv.appendChild(timeDiv);
        resultsGrid.appendChild(resultDiv);
    });
}

// タイムゾーンの入れ替え
function swapTimezones() {
    const temp = inputTimezone.value;
    inputTimezone.value = targetTimezone.value;
    targetTimezone.value = temp;
    convert();
}

// 結果のコピー
async function copyResult() {
    const text = specificResult.textContent;
    if (text === '---') return;
    
    try {
        await navigator.clipboard.writeText(text);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'コピーしました！';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        alert('コピーに失敗しました。');
    }
}

// イベントリスナー
inputDatetime.addEventListener('input', convert);
inputTimezone.addEventListener('change', convert);
targetTimezone.addEventListener('change', convert);
swapBtn.addEventListener('click', swapTimezones);
currentTimeBtn.addEventListener('click', setCurrentTime);
copyBtn.addEventListener('click', copyResult);

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initTimezoneSelects();
    updateCurrentTimeDisplay();
    setCurrentTime();
    
    setInterval(updateCurrentTimeDisplay, 1000);
});
