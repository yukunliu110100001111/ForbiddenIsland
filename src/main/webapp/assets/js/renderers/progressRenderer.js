/**
 * progressRenderer.js
 * Add or remove the .collected class on treasure icons based on collectedTreasures state.
 * @param {{[key: string]: boolean}} collectedTreasures - Object indicating whether each treasure is collected
 * @param {HTMLElement} container - Container element holding the treasure icons
 */
export function renderTreasureProgress(collectedTreasures = {}, container) {
    if (!container) return;

    // Iterate over the four treasure <img> elements with data-key
    container.querySelectorAll('.treas-icon').forEach(img => {
        const key = img.dataset.key;
        if (collectedTreasures[key]) {
            img.classList.add('collected');
        } else {
            img.classList.remove('collected');
        }
    });
}
