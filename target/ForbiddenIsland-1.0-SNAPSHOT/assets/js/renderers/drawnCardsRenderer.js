// assets/js/renderers/drawnCardsRenderer.js
import { BASE_HREF } from '../constants/config.js';

export function renderDrawnCards(treasures = [], floods = [], container) {
    const slots = container.querySelectorAll('.drawn-card');
    const list  = [...treasures, ...floods];

    slots.forEach((el, i) => {
        const card = list[i];
        if (!card) {
            el.classList.remove('active');
            el.style.backgroundImage = '';
            return;
        }
        const type = card.cardType.toLowerCase();
        const name = card.cardName.toLowerCase();
        let path;

        if (type === 'treasure' && card.treasureType) {
            path = `assets/Images/Cards/treasure/treasure-${card.treasureType.toLowerCase()}.png`;
        } else if (type === 'action') {
            path = `assets/Images/Cards/actions/${name}.png`;
        } else if (type === 'event') {
            path = `assets/Images/Cards/event/${name}.png`;
        } else {
            path = `assets/Images/Cards/${type}/${name}.png`;
        }

        el.classList.add('active');
        el.style.cssText = `
      background-image: url('${BASE_HREF + path}');
      background-size: cover;
      background-position: center;
      color: transparent; /* 隐藏文字 */
    `;
    });
}
