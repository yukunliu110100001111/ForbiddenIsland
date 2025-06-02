// controls/giveCardDrag.js
export function bindGiveCardDrag(onRefresh) {
    const playersFooter = document.getElementById('players-footer');
    if (!playersFooter) return;
    playersFooter.addEventListener('dragover', e => {
        // ...同原来
    });
    playersFooter.addEventListener('dragleave', e => {
        // ...同原来
    });
    playersFooter.addEventListener('drop', async e => {
        // ...同原来
        await window.api.sendAction({
            action: 'GIVE_CARD',
            cardId: dragData.cardId,
            targetPlayers: [ targetIdx ]
        });
        if (typeof window.gs === 'object' && window.gs.actionsLeft != null) {
            window.gs.actionsLeft--;
        }
        onRefresh();
    });
}
