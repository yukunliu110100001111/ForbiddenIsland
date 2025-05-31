import { ROLE_INFO } from '../constants/roleInfo.js';
import { cardHtml }  from '../constants/cardIcons.js';

/**
 * Render the footer player area.
 * Shows all players in order, with yourself always displayed last.
 * @param {Array}      players - Array of player objects
 * @param {number}     myIdx   - The current user's playerIndex
 * @param {number}     curIdx  - The current active player's index
 * @param {HTMLElement} footer - The footer DOM container
 */
export function renderFooter(players, myIdx, curIdx, footer) {
    const blocks = footer.querySelectorAll('.player');
    // Construct display order: others first, self last
    const others = players.filter(p => p.playerIndex !== myIdx);
    const selfPlayer = players.find(p => p.playerIndex === myIdx);
    const ordered = selfPlayer ? [...others, selfPlayer] : others;

    blocks.forEach((div, i) => {
        if (i < ordered.length) {
            const p = ordered[i];
            // Fallback in case info is undefined
            const info = ROLE_INFO[p.type] || {};
            const color = info.color || '#fff';
            const img   = info.img   || '';
            const name  = info.name  || p.type;

            // Set data-player-index for event delegation
            div.style.display = '';
            div.dataset.playerIndex = p.playerIndex;

            div.classList.toggle('me',   p.playerIndex === myIdx);
            div.classList.toggle('active-player', p.playerIndex === curIdx);
            div.querySelector('.avatar').innerHTML =
                `<div class="role-icon" style="background:${color}">
                    <img src="${img}" alt="${name}">
                 </div>
                 <div class="role-label">${name}</div>`;

            // Render hand cards, ensuring .card and data-card-id for each
            const handDiv = div.querySelector('.hand');
            if (p.hand && p.hand.length) {
                handDiv.innerHTML = p.hand.map(card => {
                    // Wrap each cardHtml output to force required attributes
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
