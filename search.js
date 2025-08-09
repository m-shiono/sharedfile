// 検索・フィルタリング機能
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    
    let currentCategory = 'all';
    let currentSearchTerm = '';

    // パフォーマンス向上のため、カード情報を事前にキャッシュ
    const toolsData = Array.from(toolCards).map(card => ({
        element: card,
        category: card.getAttribute('data-category'),
        text: card.textContent.toLowerCase()
    }));

    // 要素の存在チェック
    if (!searchInput || !clearSearchBtn) {
        console.warn('検索要素が見つかりません');
        return;
    }

    // 検索機能
    searchInput.addEventListener('input', function() {
        currentSearchTerm = this.value.toLowerCase();
        clearSearchBtn.style.display = currentSearchTerm ? 'block' : 'none';
        filterTools();
    });

    // 検索クリアボタン
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        currentSearchTerm = '';
        this.style.display = 'none';
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
                tool.element.style.display = 'block';
                tool.element.classList.add('fadeIn');
                // アニメーション終了後にクラスを削除（より信頼性の高い方法）
                tool.element.addEventListener('animationend', function handleAnimationEnd() {
                    tool.element.classList.remove('fadeIn');
                    tool.element.removeEventListener('animationend', handleAnimationEnd);
                }, { once: true });
            } else if (!shouldShow) {
                tool.element.style.display = 'none';
            }
        });
    }
});