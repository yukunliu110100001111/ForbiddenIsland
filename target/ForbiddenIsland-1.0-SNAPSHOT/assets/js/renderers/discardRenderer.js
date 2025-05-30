// assets/js/renderers/discardRenderer.js

/**
 * 把弃牌堆渲染成带正面图像的堆叠效果
 * @param {Array} treasureDiscardPile - 宝藏弃牌数组，元素含 treasureType
 * @param {Array} floodDiscardPile    - 洪水弃牌数组，元素含 targetTile.name
 * @param {HTMLElement} treasureContainer - 宝藏弃牌容器 DOM
 * @param {HTMLElement} floodContainer    - 洪水弃牌容器 DOM
 */
export function renderDiscardPiles(
    treasureDiscardPile, floodDiscardPile,
    treasureContainer, floodContainer
) {
    const MAX_SHOW = 6;    // 最多堆 6 张

    /**
     * 通用堆叠渲染
     * @param {Array}  cards     要渲染的卡组
     * @param {HTMLElement} container 容器
     * @param {Function} getImgSrc  (card)->string 返回卡面图 URL
     */
    function renderPile(cards, container, getImgSrc) {
        if (!container) return;
        container.innerHTML = '';               // 清空旧内容

        const count = Math.min(cards.length, MAX_SHOW);
        // 从最新到最旧
        for (let i = 0; i < count; i++) {
            const card = cards[cards.length - 1 - i];
            const img  = document.createElement('img');
            img.className = 'discard-card';
            img.src       = getImgSrc(card);
            // 微微偏移，制造堆叠感
            img.style.position = 'absolute';
            img.style.top      = `${-i * 2}px`;
            img.style.left     = `${-i * 2}px`;
            container.appendChild(img);
        }
    }

    // 渲染宝藏弃牌堆
    renderPile(treasureDiscardPile, treasureContainer, card =>
        `assets/Images/Cards/treasure/treasure-${card.treasureType.toLowerCase()}.png`
    );

    // 渲染洪水弃牌堆
    renderPile(floodDiscardPile, floodContainer, card => {
        const t = card.targetTile;
        // 如果 tile 名中含空格等，请 encodeURI
        return `assets/Images/Cards/tiles/${encodeURI(t.name)}.png`;
    });
}
