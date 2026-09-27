/**
 * 時間・日付ツールのタブ切替（ハッシュ連動）
 * #timestamp / #timezone / #duration / #sysuptime
 */
(function () {
    const VALID = ['timestamp', 'timezone', 'duration', 'sysuptime'];
    const DEFAULT = 'timestamp';

    function normalizeHash() {
        const raw = (location.hash || '').replace(/^#/, '').toLowerCase();
        return VALID.includes(raw) ? raw : DEFAULT;
    }

    function activate(tabId, pushHash) {
        const buttons = document.querySelectorAll('.tab-btn');
        const panels = document.querySelectorAll('.tab-panel');

        buttons.forEach((btn) => {
            const on = btn.dataset.tab === tabId;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        panels.forEach((panel) => {
            const on = panel.dataset.tab === tabId;
            panel.hidden = !on;
            panel.classList.toggle('active', on);
        });

        if (pushHash) {
            const next = '#' + tabId;
            if (location.hash !== next) {
                history.replaceState(null, '', next);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => activate(btn.dataset.tab, true));
        });

        window.addEventListener('hashchange', () => activate(normalizeHash(), false));
        activate(normalizeHash(), true);
    });
})();
