// 検索・フィルタリング機能
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    
    let currentCategory = 'all';
    let currentSearchTerm = '';
    let debounceTimer = null;

    // パフォーマンス向上のため、カード情報を事前にキャッシュ
    const toolsData = Array.from(toolCards).map(card => ({
        element: card,
        category: card.getAttribute('data-category'),
        text: card.textContent.toLowerCase()
    }));

    // 要素の存在チェック強化
    if (!searchInput || !clearSearchBtn) {
        console.warn('検索要素が見つかりません');
        return;
    }
    
    if (!categoryBtns || categoryBtns.length === 0) {
        console.warn('カテゴリボタンが見つかりません');
        return;
    }
    
    if (!toolCards || toolCards.length === 0) {
        console.warn('ツールカードが見つかりません');
        return;
    }

    // デバウンス処理付き検索機能（パフォーマンス改善）
    searchInput.addEventListener('input', function() {
        currentSearchTerm = this.value.toLowerCase();
        clearSearchBtn.style.display = currentSearchTerm ? 'block' : 'none';
        
        // デバウンス処理で頻繁な検索を防ぐ
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(() => {
            filterTools();
            debounceTimer = null;
        }, 150); // 150ms の遅延
    });

    // 検索クリアボタン
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        currentSearchTerm = '';
        this.style.display = 'none';
        
        // デバウンスタイマーもクリア
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        
        filterTools();
    });

    // カテゴリフィルタ機能
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // アクティブボタンの切り替え
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = this.getAttribute('data-category');
            filterTools();
        });
    });

    // ツールをフィルタリングする関数（パフォーマンス改善版）
    function filterTools() {
        toolsData.forEach(tool => {
            const categoryMatch = currentCategory === 'all' || tool.category === currentCategory;
            const searchMatch = !currentSearchTerm || tool.text.includes(currentSearchTerm);
            
            const shouldShow = categoryMatch && searchMatch;
            const isCurrentlyVisible = tool.element.style.display !== 'none';
            
            if (shouldShow && !isCurrentlyVisible) {
                tool.element.classList.remove('fadeOut'); // fadeOutアニメーション中に表示される場合を考慮
                tool.element.style.display = 'block';
                tool.element.classList.add('fadeIn');
                
                tool.element.addEventListener('animationend', function handler() {
                    tool.element.classList.remove('fadeIn');
                    tool.element.removeEventListener('animationend', handler);
                }, { once: true });

            } else if (!shouldShow && isCurrentlyVisible) {
                tool.element.classList.add('fadeOut');
                
                tool.element.addEventListener('animationend', function handler() {
                    tool.element.style.display = 'none';
                    tool.element.classList.remove('fadeOut');
                    tool.element.removeEventListener('animationend', handler);
                }, { once: true });
            }
        });
    }
});