// 主要なタイムゾーン（一覧表示・ラジオ選択用）
const MAJOR_TIMEZONES = [
    { value: 'Asia/Tokyo', display: '日本標準時 (JST)', short: '東京' },
    { value: 'UTC', display: '協定世界時 (UTC)', short: 'UTC' },
    { value: 'America/New_York', display: 'ニューヨーク (EST/EDT)', short: 'ニューヨーク' },
    { value: 'America/Los_Angeles', display: 'ロサンゼルス (PST/PDT)', short: 'ロサンゼルス' },
    { value: 'Europe/London', display: 'ロンドン (GMT/BST)', short: 'ロンドン' },
    { value: 'Europe/Paris', display: 'パリ (CET/CEST)', short: 'パリ' },
    { value: 'Asia/Shanghai', display: '上海 (CST)', short: '上海' },
    { value: 'Asia/Seoul', display: 'ソウル (KST)', short: 'ソウル' },
    { value: 'Australia/Sydney', display: 'シドニー (AEST/AEDT)', short: 'シドニー' },
    { value: 'Asia/Singapore', display: 'シンガポール (SGT)', short: 'シンガポール' },
    { value: 'Asia/Dubai', display: 'ドバイ (GST)', short: 'ドバイ' },
    { value: 'Europe/Berlin', display: 'ベルリン (CET/CEST)', short: 'ベルリン' }
];

document.addEventListener('DOMContentLoaded', () => {
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
    const sourceMajorRadios = document.getElementById('source-major-radios');
    const targetMajorRadios = document.getElementById('target-major-radios');

    /** 主要都市ラジオを生成 */
    function buildMajorCityRadios(container, name) {
        container.replaceChildren();
        const fragment = document.createDocumentFragment();

        MAJOR_TIMEZONES.forEach((tz, index) => {
            const label = document.createElement('label');
            label.className = 'major-city-option';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = name;
            radio.value = tz.value;
            radio.id = `${name}-${index}`;

            const text = document.createElement('span');
            text.textContent = tz.short;

            label.append(radio, text);
            fragment.appendChild(label);
        });

        // セレクトで主要都市以外を選んだとき用
        const otherLabel = document.createElement('label');
        otherLabel.className = 'major-city-option other-option';
        const otherRadio = document.createElement('input');
        otherRadio.type = 'radio';
        otherRadio.name = name;
        otherRadio.value = '__other__';
        otherRadio.id = `${name}-other`;
        const otherText = document.createElement('span');
        otherText.textContent = 'その他';
        otherLabel.append(otherRadio, otherText);
        fragment.appendChild(otherLabel);

        container.appendChild(fragment);
    }

    /** セレクトに指定タイムゾーンが無ければ追加する */
    function ensureTimezoneOption(selectEl, tzValue, label) {
        if ([...selectEl.options].some((opt) => opt.value === tzValue)) {
            return;
        }
        const opt = document.createElement('option');
        opt.value = tzValue;
        opt.textContent = label;
        selectEl.insertBefore(opt, selectEl.firstChild);
    }

    /** 主要都市がセレクトに必ず存在するようにする（UTC など supportedValuesOf に無いもの対策） */
    function ensureMajorTimezoneOptions(selectEl) {
        const now = new Date();
        MAJOR_TIMEZONES.forEach((tz) => {
            const label = `(${getOffsetString(tz.value, now)}) ${tz.value}`;
            ensureTimezoneOption(selectEl, tz.value, label);
        });
    }

    /** セレクトの値に合わせてラジオを同期 */
    function syncMajorCityRadio(selectEl, groupName) {
        const value = selectEl.value;
        const isMajor = MAJOR_TIMEZONES.some((tz) => tz.value === value);
        const radios = document.querySelectorAll(`input[name="${groupName}"]`);
        radios.forEach((radio) => {
            if (isMajor) {
                radio.checked = radio.value === value;
            } else {
                radio.checked = radio.value === '__other__';
            }
        });
    }

    /** ラジオ選択をセレクトへ反映 */
    function applyMajorCityRadio(selectEl, radioValue) {
        if (!radioValue || radioValue === '__other__') {
            return;
        }
        ensureMajorTimezoneOptions(selectEl);
        if ([...selectEl.options].some((opt) => opt.value === radioValue)) {
            selectEl.value = radioValue;
            convert();
        }
    }

    // タイムゾーンリストの初期化
    function initTimezoneSelects() {
        const allTimezones = Intl.supportedValuesOf('timeZone');
        const now = new Date();

        // supportedValuesOf に含まれない UTC などを補完
        const tzSet = new Set(allTimezones);
        MAJOR_TIMEZONES.forEach((tz) => tzSet.add(tz.value));

        const tzData = [...tzSet].map((tz) => {
            const offsetMinutes = getOffsetMinutes(tz, now);
            return {
                value: tz,
                offsetMinutes: offsetMinutes,
                label: `(${getOffsetString(tz, now)}) ${tz}`
            };
        });

        const sortedTzData = tzData.sort((a, b) => {
            const priority = { 'Asia/Tokyo': 1, UTC: 2 };
            const aPriority = priority[a.value] || 999;
            const bPriority = priority[b.value] || 999;
            if (aPriority !== bPriority) return aPriority - bPriority;
            if (a.offsetMinutes !== b.offsetMinutes) return a.offsetMinutes - b.offsetMinutes;
            return a.value.localeCompare(b.value);
        });

        const fragmentInput = document.createDocumentFragment();
        const fragmentTarget = document.createDocumentFragment();

        sortedTzData.forEach((data) => {
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

        buildMajorCityRadios(sourceMajorRadios, 'source-major-tz');
        buildMajorCityRadios(targetMajorRadios, 'target-major-tz');
        syncMajorCityRadio(inputTimezone, 'source-major-tz');
        syncMajorCityRadio(targetTimezone, 'target-major-tz');
    }

    function getOffsetString(timezone, date) {
        try {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                timeZoneName: 'longOffset'
            }).formatToParts(date);
            const offsetPart = parts.find((p) => p.type === 'timeZoneName').value;
            if (offsetPart === 'GMT') return '+00:00';
            return offsetPart.replace('GMT', '');
        } catch (e) {
            return '+00:00';
        }
    }

    function getOffsetMinutes(timezone, date) {
        try {
            const offsetStr = getOffsetString(timezone, date);
            const sign = offsetStr.startsWith('+') ? 1 : -1;
            const [hours, minutes] = offsetStr.substring(1).split(':').map(Number);
            return sign * (hours * 60 + minutes);
        } catch (e) {
            return 0;
        }
    }

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

    function setCurrentTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        inputDatetime.value = `${year}-${month}-${day}T${hours}:${minutes}`;

        if (!inputTimezone.dataset.initialized) {
            const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if ([...inputTimezone.options].some((opt) => opt.value === systemTz)) {
                inputTimezone.value = systemTz;
            }
            inputTimezone.dataset.initialized = 'true';
            syncMajorCityRadio(inputTimezone, 'source-major-tz');
        }

        convert();
    }

    function convert() {
        const inputValue = inputDatetime.value;
        if (!inputValue) return;

        const sourceTz = inputTimezone.value;
        const targetTz = targetTimezone.value;

        const baseDate = new Date(inputValue + ':00Z');
        const sourceOffset = getOffsetMinutes(sourceTz, baseDate);
        const utcDate = new Date(baseDate.getTime() - sourceOffset * 60000);

        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: targetTz
        };
        specificResult.textContent = utcDate.toLocaleString('ja-JP', options);

        resultsGrid.innerHTML = '';
        MAJOR_TIMEZONES.forEach((tz) => {
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

    function swapTimezones() {
        const temp = inputTimezone.value;
        inputTimezone.value = targetTimezone.value;
        targetTimezone.value = temp;
        syncMajorCityRadio(inputTimezone, 'source-major-tz');
        syncMajorCityRadio(targetTimezone, 'target-major-tz');
        convert();
    }

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
    inputTimezone.addEventListener('change', () => {
        syncMajorCityRadio(inputTimezone, 'source-major-tz');
        convert();
    });
    targetTimezone.addEventListener('change', () => {
        syncMajorCityRadio(targetTimezone, 'target-major-tz');
        convert();
    });
    sourceMajorRadios.addEventListener('change', (e) => {
        if (e.target && e.target.name === 'source-major-tz') {
            applyMajorCityRadio(inputTimezone, e.target.value);
        }
    });
    targetMajorRadios.addEventListener('change', (e) => {
        if (e.target && e.target.name === 'target-major-tz') {
            applyMajorCityRadio(targetTimezone, e.target.value);
        }
    });
    swapBtn.addEventListener('click', swapTimezones);
    currentTimeBtn.addEventListener('click', setCurrentTime);
    copyBtn.addEventListener('click', copyResult);

    initTimezoneSelects();
    updateCurrentTimeDisplay();
    setCurrentTime();
    setInterval(updateCurrentTimeDisplay, 1000);
});
