import { ROLE_INFO } from '../constants/roleInfo.js';
import { cardHtml }  from '../constants/cardIcons.js';

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

            div.style.display = '';
            div.classList.toggle('me',   p.playerIndex === myIdx);
            div.classList.toggle('active-player', p.playerIndex === curIdx);
            div.querySelector('.avatar').innerHTML =
                `<div class="role-icon" style="background:${color}">
                    <img src="${img}" alt="${name}">
                 </div>
                 <div class="role-label">${name}</div>`;
            div.querySelector('.hand').innerHTML =
                p.hand.length ? p.hand.map(cardHtml).join('') : '<div class="hand-empty">No Cards</div>';
        } else {
            div.style.display = 'none';
        }
    });
}
