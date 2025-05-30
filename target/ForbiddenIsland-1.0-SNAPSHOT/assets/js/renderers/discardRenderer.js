// assets/js/renderers/discardRenderer.js

/**
 * 把弃牌堆渲染成带正面图像的堆叠效果
 * @param {Array} treasureDiscardPile - 宝藏弃牌数组，元素含 treasureType 或 cardType/eventName
 * @param {Array} floodDiscardPile    - 洪水弃牌数组，元素含 targetTile.name
 * @param {HTMLElement} treasureContainer - 宝藏弃牌容器 DOM
 * @param {HTMLElement} floodContainer    - 洪水弃牌容器 DOM
 */
export function renderDiscardPiles(
    treasureDiscardPile, floodDiscardPile,
    treasureContainer, floodContainer
) {
    const MAX_SHOW = 6; // 最多展示 6 张

    function renderPile(cards, container, getImgSrc) {
        if (!container || !Array.isArray(cards)) return;
        container.innerHTML = ''; // 清空旧内容

        const count = Math.min(cards.length, MAX_SHOW);
        for (let i = 0; i < count; i++) {
            const card = cards[cards.length - 1 - i]; // 从最新的开始
            if (!card) continue;

            let src = '';
            try {
                src = getImgSrc(card) || '';
            } catch (e) {
                console.warn('renderDiscardPiles: getImgSrc 失败', e);
            }

            const img = document.createElement('img');
            img.className = 'discard-card';
            if (src) img.src = src;
            img.style.position = 'absolute';
            img.style.top      = `${-i * 2}px`;
            img.style.left     = `${-i * 2}px`;
            container.appendChild(img);
        }
    }

    // 宝藏弃牌：区分 TREASURE / ACTION / EVENT
    renderPile(treasureDiscardPile, treasureContainer, card => {
        const type = (card.cardType || '').toUpperCase();
        if (type === 'TREASURE' && card.treasureType) {
            // 例： treasure-fire.png
            return `assets/Images/Cards/treasure/treasure-${card.treasureType.toLowerCase()}.png`;
        }
        if (type === 'ACTION') {
            // 例： action-helicopter.png
            return `assets/Images/Cards/action/${card.cardName.toLowerCase()}.png`;
        }
        if (type === 'EVENT') {
            // 例： event-waterrise.png
            return `assets/Images/Cards/event/${card.cardName.toLowerCase()}.png`;
        }
        // 兜底：显示一个背面或空
        return `assets/Images/Cards/back.png`;
    });

    // 洪水弃牌：直接用 tile 的背景图
    renderPile(floodDiscardPile, floodContainer, card => {
        const t = card.targetTile;
        const name = t && t.name ? encodeURI(t.name) : '';
        return name
            ? `assets/Images/tiles/${name}.png`
            : `assets/Images/Cards/back.png`;
    });
}
