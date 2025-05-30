import { cardHtml } from '../constants/cardIcons.js';

/**
 * 批量渲染所有玩家的手牌
 * @param {Array<Array>} allHands   - 格式 [[card, card], [card], ...]
 * @param {HTMLElement} playersFooter - #players-footer 容器
 */
export function renderAllHands(allHands, playersFooter) {
    if (!playersFooter) {
        console.warn('renderAllHands: playersFooter is null or undefined');
        return;
    }
    const handDivs = playersFooter.querySelectorAll('.hand');
    handDivs.forEach((container, idx) => {
        renderHand(allHands[idx] || [], container);
    });
}

/**
 * 渲染单个玩家的手牌列表
 * @param {Array} hand       - 玩家手牌数组，元素格式: { cardId, cardName, cardType, ... }
 * @param {HTMLElement} container - 承载手牌的 DOM 容器
 */
export function renderHand(hand, container) {
    if (!container) {
        console.warn('renderHand: container is null or undefined');
        return;
    }

    // 清空旧内容
    container.innerHTML = '';

    // 无手牌时提示
    if (!Array.isArray(hand) || hand.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'hand-empty';
        empty.textContent = 'No Cards';
        container.appendChild(empty);
        return;
    }

    // 渲染每张卡
    hand.forEach(card => {
        // cardHtml(card) 返回如 '<div class="card-treasure">...</div>'
        const wrapper = document.createElement('div');
        wrapper.innerHTML = cardHtml(card);
        const cardEl = wrapper.firstElementChild;
        if (!cardEl) return;

        // 强制加上 .card 类，方便事件委托
        cardEl.classList.add('card');
        // 绑定卡片 ID
        if (card.cardId != null) {
            cardEl.dataset.cardId = card.cardId;
        }
        container.appendChild(cardEl);
    });
}
