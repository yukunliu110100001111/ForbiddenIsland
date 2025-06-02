// src/controllers/giveCardDrag.js
export function bindGiveCardDrag(onRefresh) {
    const footer = document.getElementById('players-footer');
    if (!footer) return;

    footer.addEventListener('dragover', e => {
        const p = e.target.closest('.player');
        if (!p) return;
        if (+p.dataset.playerIndex === window.myPlayerIndex) return; // 不能给自己
        e.preventDefault();
        p.classList.add('player-droppable');
    });
    footer.addEventListener('dragleave', e => {
        e.target.closest('.player')?.classList.remove('player-droppable');
    });
    footer.addEventListener('drop', async e => {
        const p = e.target.closest('.player');
        if (!p) return;
        p.classList.remove('player-droppable');

        if (window.isOverLimit) return;                        // 自己超限不能给牌

        const data = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        if (!data.cardId || data.cardType === 'ACTION' || data.cardType === 'EVENT') return;

        await window.api.sendAction({
            action:'GIVE_CARD',
            cardId:data.cardId,
            targetPlayers:[ +p.dataset.playerIndex ]
        });
        window.refreshGame?.();
    });
}
