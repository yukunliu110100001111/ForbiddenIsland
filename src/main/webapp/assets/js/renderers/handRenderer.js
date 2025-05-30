import { cardHtml } from '../constants/cardIcons.js';

/**
 * 渲染当前玩家的手牌列表
 * @param {Array} hand - 玩家手牌数组，元素格式: { cardName, cardType, ... }
 * @param {HTMLElement} container - 承载手牌的 DOM 容器
 */
export function renderHand(hand, container) {
    if (!container) {
        console.warn('renderHand: container is null or undefined');
        return;
    }

    // 清空容器
    container.innerHTML = '';

    // 无手牌时显示提示
    if (!Array.isArray(hand) || hand.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'hand-empty';
        empty.textContent = 'No Cards';
        container.appendChild(empty);
        return;
    }

    // 有手牌时逐张渲染
    hand.forEach(card => {
        // cardHtml 返回一个带有 class 的字符串，如 <div class="card card-treasure">TREASURE</div>
        const wrapper = document.createElement('div');
        wrapper.innerHTML = cardHtml(card);
        // 取出最外层元素并添加到 container
        const cardEl = wrapper.firstElementChild;
        if (cardEl) container.appendChild(cardEl);
    });
}
