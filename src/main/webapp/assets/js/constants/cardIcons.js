/**
 * cardIcons.js
 * 常量：卡片图标与渲染工具
 */

/**
 * 生成一张卡片的 HTML
 * @param {Object} card - 后端返回的卡片对象，包含 cardName、cardType、treasureType 等
 * @returns {string} 包含 .card 和 .card-<type> class 的 HTML 字符串
 */
export function cardHtml(card) {
    const type = card.cardType.toLowerCase(); // treasure, action, event
    const name = card.cardName;
    let icon = '';
    switch (type) {
        case 'treasure':
            if (card.treasureType) {
                const tt = card.treasureType.toLowerCase();
                icon = `<span class="icon treasure-${tt}"></span>`;
            }
            break;
        case 'action':
            icon = `<span class="icon action-icon"></span>`;
            break;
        case 'event':
            icon = `<span class="icon event-icon"></span>`;
            break;
        default:
            icon = '';
    }
    return `
    <div class="card card-${type}">
      ${icon}
      <span class="card-label">${name}</span>
    </div>
    `;
}
