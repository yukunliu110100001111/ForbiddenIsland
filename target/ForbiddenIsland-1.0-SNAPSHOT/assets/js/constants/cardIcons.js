// assets/js/constants/cardIcons.js
import { BASE_HREF } from './config.js';

export function cardHtml(card) {
    const type = card.cardType.toLowerCase(); // "treasure" / "action" / "event"
    const name = card.cardName.toLowerCase(); // e.g. "crystal_of_fire"

    // 根据类型拼图
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

    const url = BASE_HREF + path;

    return `
    <div class="card card-${type}"
         style="
           background-image: url('${url}');
           background-size: cover;
           background-position: center;
         ">
      <span class="card-label">${card.cardName.replace(/_/g,' ')}</span>
    </div>
  `;
}
