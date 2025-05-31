// src/renderers/handRenderer.js
import { cardHtml } from '../constants/cardIcons.js';

/**
 * 批量渲染所有玩家的手牌区
 * @param {Array<Array>} allHands      - [[card, card], [card], ...]，每个玩家的手牌
 * @param {HTMLElement} playersFooter  - #players-footer 容器元素
 * @param {number} myPlayerIndex       - 当前本地玩家 index
 * @param {boolean} isMyTurn           - 是否轮到本地玩家
 */
export function renderAllHands(allHands, playersFooter, myPlayerIndex, isMyTurn) {
    if (!playersFooter) {
        console.warn('renderAllHands: playersFooter is null或 undefined');
        return;
    }

    // 调试：打印传入的关键参数
    console.group('renderAllHands 调试');
    console.log('  myPlayerIndex =', myPlayerIndex);
    console.log('  isMyTurn      =', isMyTurn);
    console.log('  allHands 长度 =', allHands.length);
    console.groupEnd();

    // .hand 容器节点要与 allHands 的索引一一对应
    const handDivs = playersFooter.querySelectorAll('.hand');
    handDivs.forEach((container, idx) => {
        renderHand(allHands[idx] || [], container, idx, myPlayerIndex, isMyTurn);
    });
}

/**
 * 渲染单个玩家的手牌区
 * @param {Array} hand               - 该玩家手牌数组
 * @param {HTMLElement} container    - 手牌渲染目标容器
 * @param {number} playerIndex       - 当前渲染的手牌区属于哪个玩家
 * @param {number} myPlayerIndex     - 当前本地玩家 index
 * @param {boolean} isMyTurn         - 是否轮到本地玩家
 */
export function renderHand(hand, container, playerIndex, myPlayerIndex, isMyTurn) {
    if (!container) {
        console.warn('renderHand: container is null或 undefined');
        return;
    }

    // 再次打印以确认每个 hand 独立传入的索引与状态
    console.log(
        `renderHand 调试 → playerIndex = ${playerIndex}, ` +
        `myPlayerIndex = ${myPlayerIndex}, isMyTurn = ${isMyTurn}`
    );

    // 清空旧手牌
    container.innerHTML = '';

    // 如果没有卡，显示“空”
    if (!Array.isArray(hand) || hand.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'hand-empty';
        empty.textContent = 'No Cards';
        container.appendChild(empty);
        return;
    }

    // 渲染每张卡
    hand.forEach(card => {
        // cardHtml(card) 返回一段 <div class="card card-XXX">...</div> 的字符串
        const wrapper = document.createElement('div');
        wrapper.innerHTML = cardHtml(card);
        const cardEl = wrapper.firstElementChild;
        if (!cardEl) return;

        cardEl.classList.add('card');
        if (card.cardId != null) {
            cardEl.dataset.cardId = card.cardId;
        }

        // 仅当“轮到自己”且当前渲染的手牌区正是“自己”的 index 时，才允许拖拽
        if (playerIndex === myPlayerIndex && isMyTurn) {
            cardEl.setAttribute('draggable', 'true');
            cardEl.addEventListener('dragstart', e => {
                e.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({
                        cardType: card.cardType,
                        cardId: card.cardId
                    })
                );
            });
            cardEl.style.cursor = 'grab';
            cardEl.classList.remove('card-disabled');
        } else {
            cardEl.removeAttribute('draggable');
            cardEl.style.cursor = 'not-allowed';
            cardEl.classList.add('card-disabled');
        }

        container.appendChild(cardEl);
    });
}
