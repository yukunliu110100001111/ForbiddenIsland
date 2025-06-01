/**
 * Initialize or update the stacked display of two card decks (Treasure and Flood).
 * @param {number} treasureRemain - Number of remaining Treasure cards
 * @param {number} floodRemain    - Number of remaining Flood cards
 */
export function renderDeckCounts(treasureRemain, floodRemain) {
    const treasureDeck = document.getElementById('treasure-deck');
    const floodDeck    = document.getElementById('flood-deck');

    const TREASURE_INIT = 28;
    const FLOOD_INIT    = 24;

    /**
     * Ensure the input value is an integer within [0, init].
     * @param {number} val
     * @param {number} init
     * @returns {number}
     */
    const sanitize = (val, init) => {
        let n = Number(val);
        if (Number.isNaN(n) || n == null) n = 0;
        n = Math.floor(n);
        if (n < 0)    n = 0;
        if (n > init) n = init;
        return n;
    };

    /**
     * Render stacked card backs and count label for a deck container.
     * @param {HTMLElement} container - The deck container element
     * @param {number} remain         - Remaining cards in the deck
     * @param {number} init           - Initial total number of cards
     */
    function renderPile(container, remain, init) {
        if (!container) return;
        remain = sanitize(remain, init);

        // Remove old card back elements
        container.querySelectorAll('.card-back').forEach(el => el.remove());

        const MAX_SHOW = 6;                  // Maximum cards to visually stack
        const VIS_MIN  = remain > 0 ? 2 : 0; // At least 2 visible if not empty
        const count    = Math.max(Math.min(remain, MAX_SHOW), VIS_MIN);

        // Create card back visuals
        for (let i = 0; i < count; i++) {
            const card = document.createElement('div');
            card.className = 'card-back';
            card.style.top  = `${-i * 2}px`;
            card.style.left = `${-i * 2}px`;
            container.appendChild(card);
        }

        // Update or create the deck count label
        let label = container.querySelector('.deck-count');
        if (!label) {
            label = document.createElement('div');
            label.className = 'deck-count';
            container.appendChild(label);
        }
        label.textContent = `${remain} / ${init}`;
        label.classList.toggle('deck-empty', remain === 0);
    }

    renderPile(treasureDeck, treasureRemain, TREASURE_INIT);
    renderPile(floodDeck,    floodRemain,    FLOOD_INIT);
}
