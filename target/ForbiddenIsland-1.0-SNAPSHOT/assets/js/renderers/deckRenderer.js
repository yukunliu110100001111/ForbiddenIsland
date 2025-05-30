/**
 * 初始化或更新两个卡堆的卡背堆叠显示
 * @param {number} treasureRemain - 当前宝藏剩余卡数
 * @param {number} floodRemain    - 当前洪水剩余卡数
 */
export function renderDeckCounts(treasureRemain, floodRemain) {
    const treasureDeck = document.getElementById('treasure-deck');
    const floodDeck    = document.getElementById('flood-deck');

    const TREASURE_INIT = 28;
    const FLOOD_INIT    = 24;

    // 保险：把任何非法输入修正为 0～init 之间的整数
    const sanitize = (val, init) => {
        let n = Number(val);
        if (Number.isNaN(n) || n == null) n = 0;
        n = Math.floor(n);
        if (n < 0)    n = 0;
        if (n > init) n = init;
        return n;
    };

    // 统一方法：渲染堆叠卡背
    function renderPile(container, remain, init) {
        if (!container) return;              // 容器不存在就跳过
        remain = sanitize(remain, init);

        // 清除旧卡背
        container.querySelectorAll('.card-back').forEach(el => el.remove());

        const MAX_SHOW = 6;                  // 最多只展示 6 张
        const VIS_MIN  = remain > 0 ? 2 : 0; // 非空最少展示 2 张
        const count    = Math.max(Math.min(remain, MAX_SHOW), VIS_MIN);

        for (let i = 0; i < count; i++) {
            const card = document.createElement('div');
            card.className = 'card-back';
            card.style.top  = `${-i * 2}px`;
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

    renderPile(treasureDeck, treasureRemain, TREASURE_INIT);
    renderPile(floodDeck,    floodRemain,    FLOOD_INIT);
}
