/**
 * progressRenderer.js
 * 根据 collectedTreasures 状态给对应图标加 .collected
 * @param {{[key: string]: boolean}} collectedTreasures
 * @param {HTMLElement} container
 */
export function renderTreasureProgress(collectedTreasures = {}, container) {
    if (!container) return;

    // 取出四个 <img data-key="...">
    container.querySelectorAll('.treas-icon').forEach(img => {
        const key = img.dataset.key;
        if (collectedTreasures[key]) {
            img.classList.add('collected');
        } else {
            img.classList.remove('collected');
        }
    });
}
