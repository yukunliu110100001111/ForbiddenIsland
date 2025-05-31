// assets/js/renderers/discardRenderer.js

/**
 * Render the discard piles with a stacked effect, showing card faces.
 * @param {Array} treasureDiscardPile      - Array of discarded treasure cards (with treasureType/cardType/cardName)
 * @param {Array} floodDiscardPile         - Array of discarded flood cards (with targetTile.name)
 * @param {HTMLElement} treasureContainer  - DOM element for the treasure discard pile
 * @param {HTMLElement} floodContainer     - DOM element for the flood discard pile
 */
export function renderDiscardPiles(
    treasureDiscardPile, floodDiscardPile,
    treasureContainer, floodContainer
) {
    const MAX_SHOW = 6; // Maximum number of cards to display

    /**
     * Render a stack of cards for a given pile.
     * @param {Array} cards           - Array of card objects
     * @param {HTMLElement} container - Container to render into
     * @param {Function} getImgSrc    - Function to get image src for each card
     */
    function renderPile(cards, container, getImgSrc) {
        if (!container || !Array.isArray(cards)) return;
        container.innerHTML = ''; // Clear previous content

        const count = Math.min(cards.length, MAX_SHOW);
        for (let i = 0; i < count; i++) {
            const card = cards[cards.length - 1 - i]; // Render from newest to oldest
            if (!card) continue;

            let src = '';
            try {
                src = getImgSrc(card) || '';
            } catch (e) {
                console.warn('renderDiscardPiles: getImgSrc failed', e);
            }

            const img = document.createElement('img');
            img.className = 'discard-card';
            if (src) img.src = src;
            img.style.position = 'absolute';
            img.style.top      = `${-i * 2}px`;
            img.style.left     = `${-i * 2}px`;
            container.appendChild(img);
        }
    }

    // Treasure discard: distinguish by TREASURE / ACTION / EVENT
    renderPile(treasureDiscardPile, treasureContainer, card => {
        const type = (card.cardType || '').toUpperCase();
        if (type === 'TREASURE' && card.treasureType) {
            // Example: treasure-fire.png
            return `assets/Images/Cards/treasure/treasure-${card.treasureType.toLowerCase()}.png`;
        }
        if (type === 'ACTION') {
            // Example: action-helicopter.png
            return `assets/Images/Cards/action/${card.cardName.toLowerCase()}.png`;
        }
        if (type === 'EVENT') {
            // Example: event-waterrise.png
            return `assets/Images/Cards/event/${card.cardName.toLowerCase()}.png`;
        }
        // Fallback: show card back or blank
        return `assets/Images/Cards/back.png`;
    });

    // Flood discard: use the tile's background image directly
    renderPile(floodDiscardPile, floodContainer, card => {
        const t = card.targetTile;
        const name = t && t.name ? encodeURI(t.name) : '';
        return name
            ? `assets/Images/tiles/${name}.png`
            : `assets/Images/Cards/back.png`;
    });
}
