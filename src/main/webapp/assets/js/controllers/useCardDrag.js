import { setCurrentDragData, clearCurrentDragData } from './tileDragHandler.js';

export function bindUseCardDrag(onRefresh) {
    const handArea = document.querySelectorAll('.player[data-player-index="' + window.myPlayerIndex + '"] .hand')[0];
    const discardZone = document.getElementById('discard-zone');

    if (!handArea || !discardZone) return;

    [...handArea.children].forEach(cardEl => {
        const cardType = cardEl.dataset.cardType;
        const cardId = parseInt(cardEl.dataset.cardId);

        if (cardType !== 'ACTION') return;

        cardEl.setAttribute('draggable', 'true');

        cardEl.ondragstart = ev => {
            const dragData = {
                cardType: cardType,
                cardId: cardId
            };

            // 设置为全局变量
            setCurrentDragData(dragData);

            // 同时保持兼容性设置多种格式
            ev.dataTransfer.setData('text/plain', cardId);
            ev.dataTransfer.setData('application/json', JSON.stringify(dragData));

            discardZone.classList.add('highlight-zone');
        };

        cardEl.ondragend = () => {
            discardZone.classList.remove('highlight-zone');
            // 清除全局变量
            clearCurrentDragData();
        };
    });

    discardZone.ondragover = ev => {
        ev.preventDefault();
    };

    discardZone.ondrop = async ev => {
        ev.preventDefault();
        const cardId = parseInt(ev.dataTransfer.getData('text/plain')) ;

        await window.api.sendAction({
            action: 'USE_CARD',
            cardId: cardId
        });

        discardZone.classList.remove('highlight-zone');
        onRefresh?.(); // 强制刷新
    };
}
