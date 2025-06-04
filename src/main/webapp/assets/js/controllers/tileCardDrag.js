// src/controllers/tileCardDrag.js

import { sendAction } from '../api/inGameApi.js';

/**
 * 绑定“给卡”拖放逻辑
 * @param {Function} onRefresh  给卡后拉取并刷新
 */
export function bindUseCardDrag(onRefresh) {
    const footer = document.getElementById('tiles-layer');
    const tilesSection = document.getElementById('tiles-section');
    if (!footer || !tilesSection) {
        console.warn('bindGiveCardDrag: 找不到 #tiles-layer 或 #tiles-section');
        return;
    }

    const handleDragOver = (e) => {
        const p = e.target.closest('.player');
        if (!p) return;
        const targetIdx = +p.dataset.playerIndex;
        if (targetIdx === window.myPlayerIndex) return;
        e.preventDefault();
        p.classList.add('player-droppable');
    };

    const handleDragLeave = (e) => {
        e.target.closest('.player')?.classList.remove('player-droppable');
    };

    const handleDrop = async (e) => {
        const p = e.target.closest('.player');
        if (!p) return;
        p.classList.remove('player-droppable');

        const targetIdx = +p.dataset.playerIndex;
        if (targetIdx === window.myPlayerIndex) {
            console.warn('[GiveCard] not allow give to self');
            return;
        }
        if (window.isOverLimit) {
            console.warn('[GiveCard] cards overlimit!');
            return;
        }

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
            targetPlayers: [window.myPlayerIndex, targetIdx]
        });
        console.log('[GiveCard] sendAction 返回：', success);

        if (success) {
            // 直接清空全局 currentDragData
            window.currentDragData = null;
            await onRefresh?.();
        }
    };

    // 为 tiles-layer 添加事件监听
    footer.addEventListener('dragover', handleDragOver);
    footer.addEventListener('dragleave', handleDragLeave);
    footer.addEventListener('drop', handleDrop);

    // 为 tiles-section 添加事件监听
    tilesSection.addEventListener('dragover', handleDragOver);
    tilesSection.addEventListener('dragleave', handleDragLeave);
    tilesSection.addEventListener('drop', handleDrop);
}
