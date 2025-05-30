/**
 * 初始化或更新两个卡堆的卡背堆叠显示
 * @param {number} treasureRemain - 当前宝藏剩余卡数
 * @param {number} floodRemain - 当前洪水剩余卡数
 */
export function renderDeckCounts(treasureRemain, floodRemain) {
    const treasureDeck = document.getElementById('treasure-deck');
    const floodDeck = document.getElementById('flood-deck');

    const treasureInit = 28;
    const floodInit = 24;

    // 统一方法：渲染堆叠卡背
    function renderPile(container, remain, init) {
        // 清除旧卡背
        container.querySelectorAll('.card-back').forEach(el => el.remove());

        const maxShow = 6; // 最多只展示 6 张（否则太密）
        const count = Math.min(remain, maxShow);

        for (let i = 0; i < count; i++) {
            const card = document.createElement('div');
            card.className = 'card-back';
            card.style.top = `${-i * 2}px`;
            card.style.left = `${-i * 2}px`;
            container.appendChild(card);
        }

        // 显示数量标签
        let label = container.querySelector('.deck-count');
        if (!label) {
            label = document.createElement('div');
            label.className = 'deck-count';
            container.appendChild(label);
        }
        label.textContent = `${remain} / ${init}`;
        label.classList.toggle('deck-empty', remain === 0);
    }

    if (treasureDeck) renderPile(treasureDeck, treasureRemain, treasureInit);
    if (floodDeck) renderPile(floodDeck, floodRemain, floodInit);
}
