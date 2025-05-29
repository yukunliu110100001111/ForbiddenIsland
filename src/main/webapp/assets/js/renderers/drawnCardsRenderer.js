/**
 * drawnCardsRenderer.js
 * 负责渲染最近抽到的宝藏牌和洪水牌到指定容器
 */
export function renderDrawnCards(treasures = [], floods = [], container) {
    if (!container) return;

    // 查询所有 .drawn-card 槽位
    const slots = container.querySelectorAll('.drawn-card');

    // 合并宝藏和洪水牌列表，保持顺序
    const list = [...treasures, ...floods];

    slots.forEach((el, i) => {
        if (list[i]) {
            el.textContent = list[i].cardName;
            el.classList.add('active');
        } else {
            el.textContent = '';
            el.classList.remove('active');
        }
    });
}
