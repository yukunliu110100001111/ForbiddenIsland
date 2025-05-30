import { cardHtml } from '../constants/cardIcons.js';

/**
 * 渲染所有玩家的手牌
 * @param {Array} allHands - 所有玩家的手牌数组，例如 [[card1, card2], [card3], ...]
 * @param {HTMLElement} playersFooter - #players-footer 节点
 */
export function renderAllHands(allHands, playersFooter) {
    if (!playersFooter) {
        console.warn('renderAllHands: playersFooter is null or undefined');
        return;
    }
    const handDivs = playersFooter.querySelectorAll('.hand');
    for (let i = 0; i < handDivs.length; ++i) {
        renderHand(allHands[i] || [], handDivs[i]);
    }
}

/**
 * 渲染单个玩家的手牌列表
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
        const wrapper = document.createElement('div');
        wrapper.innerHTML = cardHtml(card);
        const cardEl = wrapper.firstElementChild;
        if (cardEl) container.appendChild(cardEl);
    });
}
