/**
 * discardRenderer.js
 * 负责渲染宝藏与洪水弃牌堆的缩略图（最多显示前 3 张）
 */
export function renderDiscardPiles(
    treasureDiscard = [],
    floodDiscard = [],
    treasureContainer,
    floodContainer
) {
    if (treasureContainer) {
        renderOnePile(treasureDiscard, treasureContainer);
    }
    if (floodContainer) {
        renderOnePile(floodDiscard, floodContainer);
    }
}

function renderOnePile(pile, container) {
    // 清空容器
    container.innerHTML = '';
    const maxShow = 3;
    // 取最后 3 张
    const toShow = pile.slice(-maxShow);

    toShow.forEach((card, idx) => {
        const el = document.createElement('div');
        el.className = 'discard-card';
        // 轻微叠放偏移
        el.style.zIndex = idx;
        el.style.left = `${idx * 10}px`;
        el.style.top  = `${-idx * 4}px`;
        el.textContent = card.cardName;
        container.appendChild(el);
    });
}
