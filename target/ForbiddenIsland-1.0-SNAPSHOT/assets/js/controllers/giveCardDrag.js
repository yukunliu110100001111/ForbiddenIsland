// src/controllers/giveCardDrag.js

// 删除 “clearCurrentDragData” 的导入
// import { clearCurrentDragData } from './useCardDrag.js';

import { sendAction } from '../api/inGameApi.js';

/**
 * 绑定“给卡”拖放逻辑
 * @param {Function} onRefresh  给卡后拉取并刷新
 */
export function bindGiveCardDrag(onRefresh) {
    const footer = document.getElementById('players-footer');
    if (!footer) {
        console.warn('bindGiveCardDrag: 找不到 #players-footer');
        return;
    }

    footer.addEventListener('dragover', e => {
        const p = e.target.closest('.player');
        if (!p) return;
        const targetIdx = +p.dataset.playerIndex;
        if (targetIdx === window.myPlayerIndex) return;
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

        const targetIdx = +p.dataset.playerIndex;
        if (targetIdx === window.myPlayerIndex) {
            console.warn('[GiveCard] 禁止给自己');
            return;
        }
        if (window.isOverLimit) {
            console.warn('[GiveCard] 手牌超限，无法给卡');
            return;
        }

        // 从 dataTransfer 或者全局 currentDragData 拿 cardId
        let data = {};
        try {
            data = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch {
            const cardIdNum = parseInt(e.dataTransfer.getData('text/plain'));
            if (!isNaN(cardIdNum)) {
                data = { cardId: cardIdNum };
            }
        }
        if (!data.cardId && window.currentDragData) {
            data = window.currentDragData;
        }
        if (!data.cardId) {
            console.warn('[GiveCard] drop 时未拿到 cardId，data =', data);
            return;
        }

        console.log(
            '%c[GiveCard] 玩家', window.myPlayerIndex,
            '→', targetIdx,
            '| 卡牌 ID =', data.cardId
        );

        // 直接调用 sendAction，不用 clearCurrentDragData
        const success = await sendAction({
            action:       'GIVE_CARD',
            cardId:       data.cardId,
            targetPlayers: [window.myPlayerIndex,targetIdx]
        });
        console.log('[GiveCard] sendAction 返回：', success);

        if (success) {
            // 直接清空全局 currentDragData
            window.currentDragData = null;
            await onRefresh?.();
        }
    });
}
