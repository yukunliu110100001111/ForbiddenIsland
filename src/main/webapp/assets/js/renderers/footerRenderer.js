import { ROLE_INFO } from '../constants/roleInfo.js';
import { cardHtml }  from '../constants/cardIcons.js';

/**
 * 渲染底部玩家栏
 * @param {Array} players
 * @param {number} myIdx
 * @param {number} curIdx
 * @param {HTMLElement} footer
 */
export function renderFooter(players, myIdx, curIdx, footer) {
    const blocks = footer.querySelectorAll('.player');
    // 构造显示顺序：其他玩家在前，自己在最后
    const others = players.filter(p => p.playerIndex !== myIdx);
    const selfPlayer = players.find(p => p.playerIndex === myIdx);
    const ordered = selfPlayer ? [...others, selfPlayer] : others;

    blocks.forEach((div, i) => {
        if (i < ordered.length) {
            const p = ordered[i];
            // 兜底：info 可能为 undefined
            const info = ROLE_INFO[p.type] || {};
            const color = info.color || '#fff';
            const img   = info.img   || '';
            const name  = info.name  || p.type;

            // 设置 data-player-index，方便事件分发
            div.style.display = '';
            div.dataset.playerIndex = p.playerIndex;

            div.classList.toggle('me',   p.playerIndex === myIdx);
            div.classList.toggle('active-player', p.playerIndex === curIdx);
            div.querySelector('.avatar').innerHTML =
                `<div class="role-icon" style="background:${color}">
                    <img src="${img}" alt="${name}">
                 </div>
                 <div class="role-label">${name}</div>`;

            // 手牌部分：确保每张卡片有 .card 和 data-card-id
            const handDiv = div.querySelector('.hand');
            if (p.hand && p.hand.length) {
                handDiv.innerHTML = p.hand.map(card => {
                    // 包装每个 cardHtml 返回值，强制补充属性
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = cardHtml(card);
                    let cardEl = wrapper.firstElementChild;
                    if (cardEl) {
                        cardEl.classList.add('card');
                        if (card.cardId !== undefined) {
                            cardEl.dataset.cardId = card.cardId;
                        }
                        return cardEl.outerHTML;
                    }
                    return '';
                }).join('');
            } else {
                handDiv.innerHTML = '<div class="hand-empty">No Cards</div>';
            }
        } else {
            div.style.display = 'none';
            div.removeAttribute('data-player-index');
        }
    });
}
