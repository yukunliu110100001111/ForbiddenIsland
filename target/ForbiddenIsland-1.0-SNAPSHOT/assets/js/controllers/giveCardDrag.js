    import { setCurrentDragData, clearCurrentDragData } from './tileDragHandler.js';

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

        if (window.isOverLimit) return;  // 自己超限不能给牌

        // 尝试从dataTransfer获取数据
        let data;
        try {
            // 先尝试application/json格式
            data = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch (err) {
            // 如果解析失败，尝试text/plain格式
            try {
                const cardId = parseInt(e.dataTransfer.getData('text/plain'));
                if (!isNaN(cardId)) {
                    data = { cardId };
                } else {
                    data = {};
                }
            } catch {
                data = {};
            }
        }

        // 如果从dataTransfer获取不到数据，则尝试使用全局变量
        if (!data.cardId && window.currentDragData) {
            data = window.currentDragData;
        }

        // 只过滤特定类型的卡（ACTION和EVENT），但允许TREASURE类型通过
        if (!data.cardId || (data.cardType === 'ACTION' || data.cardType === 'EVENT')) return;

        // 添加调试信息：显示给卡操作的详细信息
        console.log('[Debug] Attempting to give card:', {
            cardId: data.cardId,
            playerIndex: window.myPlayerIndex,
            targetPlayerIndex: +p.dataset.playerIndex
        });

        // 调用后端 API 执行给卡操作
        const success = await window.api.sendAction({
            action: 'GIVE_CARD',
            cardId: data.cardId,
            playerIndex: window.myPlayerIndex, // 明确添加当前玩家索引
            targetPlayers: [ +p.dataset.playerIndex ]
        });

        // 添加调试信息：显示给卡操作的结果
        if (success) {
            console.log('[Debug] GIVE_CARD 操作成功');
        } else {
            console.error('[Debug] GIVE_CARD 操作失败');
        }

        // 每次给卡操作后，手动刷新
        onRefresh?.(); // 强制刷新，确保后续操作有效
    });
}
