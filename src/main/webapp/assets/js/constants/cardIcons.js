// assets/js/constants/cardIcons.js
import { BASE_HREF } from './config.js';

/**
 * Generates the HTML markup for a card icon, including the image background and card label.
 * @param {Object} card - Card object with type and name information.
 * @returns {string} HTML string representing the card.
 */
export function cardHtml(card) {
    const type = card.cardType.toLowerCase(); // "treasure" / "action" / "event"
    const name = card.cardName.toLowerCase(); // e.g. "crystal_of_fire"

    // Build the image path based on card type and attributes
    let path;
    if (type === 'treasure' && card.treasureType) {
        path = `assets/Images/Cards/treasure/treasure-${card.treasureType.toLowerCase()}.png`;
    } else if (type === 'action') {
        path = `assets/Images/Cards/action/${name}.png`;
    } else if (type === 'event') {
        path = `assets/Images/Cards/event/${name}.png`;
    } else {
        path = `assets/Images/Cards/${type}/${name}.png`;
    }

    const url = BASE_HREF + path;

    // Return card div HTML with background and label
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
