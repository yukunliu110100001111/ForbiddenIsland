/**
 * 根据后端返回的 discardPile 长度 + 剩余牌数，渲染两个牌堆的计数
 * @param {number} treasureRemain
 * @param {number} floodRemain
 */
export function renderDeckCounts(treasureRemain, floodRemain) {
    const tc = document.getElementById('treasure-count');
    const fc = document.getElementById('flood-count');
    if (tc) tc.textContent = treasureRemain;
    if (fc) fc.textContent = floodRemain;
}
