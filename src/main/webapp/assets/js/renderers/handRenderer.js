import { cardHtml } from '../constants/cardIcons.js';

/**
 * Render all players' hands (cards) in batch.
 * @param {Array<Array>} allHands      - Format: [[card, card], [card], ...] (each sub-array is a player's hand)
 * @param {HTMLElement} playersFooter  - The #players-footer container element
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
 * Render a single player's hand.
 * @param {Array} hand               - Player's hand array, element format: { cardId, cardName, cardType, ... }
 * @param {HTMLElement} container    - Container element for rendering cards
 */
export function renderHand(hand, container) {
    if (!container) {
        console.warn('renderHand: container is null or undefined');
        return;
    }

    // Clear old content
    container.innerHTML = '';

    // Show hint if hand is empty
    if (!Array.isArray(hand) || hand.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'hand-empty';
        empty.textContent = 'No Cards';
        container.appendChild(empty);
        return;
    }

    // Render each card
    hand.forEach(card => {
        // cardHtml(card) returns HTML string for the card icon
        const wrapper = document.createElement('div');
        wrapper.innerHTML = cardHtml(card);
        const cardEl = wrapper.firstElementChild;
        if (!cardEl) return;

        // Ensure .card class is present for event delegation
        cardEl.classList.add('card');
        // Attach card ID for interaction logic
        if (card.cardId != null) {
            cardEl.dataset.cardId = card.cardId;
        }
        container.appendChild(cardEl);
    });
}
