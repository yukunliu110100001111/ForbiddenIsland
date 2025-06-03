// src/controllers/useCardDrag.js

import { sendAction } from '../api/inGameApi.js';

// 全局变量：跟踪当前拖拽的卡片信息 (cardType, cardId)
window.currentDragData = null;

function isLegalTarget(tileView, cardType) {
    const state = tileView.state.toLowerCase();
    if (cardType === 'ACTION') {
        return state !== 'sink';
    }
    if (cardType === 'EVENT') {
        return state === 'flooded';
    }
    return false;
}

/**
 * 给指定的地图格子 DOM 绑定“拖放使用卡片”事件
 * @param {HTMLElement} tileEl    - <div class="tile" data-x="…" data-y="…">
 * @param {Object}      tileView  - { x, y, state, name, … }
 * @param {Function}    onRefresh - 卡片 drop 后要调用的刷新
 */
export function bindTileDrag(tileEl, tileView, onRefresh) {
    tileEl.addEventListener('dragenter', e => {
        if (!window.currentDragData) return;
        if (isLegalTarget(tileView, window.currentDragData.cardType)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.classList.add('tile-droppable');
        }
    });

    tileEl.addEventListener('dragover', e => {
        if (!window.currentDragData) return;
        if (isLegalTarget(tileView, window.currentDragData.cardType)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.classList.add('tile-droppable');
        }
    });

    tileEl.addEventListener('dragleave', () => {
        tileEl.classList.remove('tile-droppable');
    });

    tileEl.addEventListener('drop', async e => {
        tileEl.classList.remove('tile-droppable');

        // 从 dataTransfer 里取卡片信息
        let dragData = {};
        try {
            dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch {
            dragData = {};
        }
        // 如果 dataTransfer 里没写 cardType，就用全局 currentDragData
        if (!dragData.cardType && window.currentDragData) {
            dragData = window.currentDragData;
        }

        // 目标不合法时，抖动提示
        if (!isLegalTarget(tileView, dragData.cardType)) {
            tileEl.classList.add('tile-invalid-drop');
            setTimeout(() => tileEl.classList.remove('tile-invalid-drop'), 300);
            return;
        }

        // 合法：立刻执行一次 GIVE_CARD → tell 后端“使用这张卡放在 (x,y)”
        await sendAction({
            action:      'USE_CARD',
            playerIndex: window.myPlayerIndex,
            cardId:      dragData.cardId,
            x:           tileView.x,
            y:           tileView.y
        });

        // 先清理全局，再刷新
        window.currentDragData = null;
        await onRefresh?.();
    });
}

/**
 * 绑定“使用卡片拖放” 与 “丢弃卡片” 的逻辑
 * @param {Function} onRefresh  卡片用完 / 丢弃后要调用的刷新函数
 */
export function bindUseCardDrag(onRefresh) {
    window.currentDragData = null;
    // 1) 给当前玩家手牌中可用的卡 (ACTION / EVENT) 绑定 draggable & dragstart/dragend
    const handArea    = document.querySelector(`.player[data-player-index="${window.myPlayerIndex}"] .hand`);
    const discardZone = document.getElementById('treasure-discard');
    if (!handArea || !discardZone) return;

    [...handArea.children].forEach(cardEl => {
        const cardType = cardEl.dataset.cardType;
        const cardId   = parseInt(cardEl.dataset.cardId);
        if (cardType !== 'ACTION' && cardType !== 'EVENT') return;

        cardEl.setAttribute('draggable', 'true');
        cardEl.style.cursor = 'grab';

        cardEl.addEventListener('dragstart', e => {
            const payload = { cardType, cardId };
            window.currentDragData = payload;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json', JSON.stringify(payload));
            e.dataTransfer.setData('text/plain', String(cardId));
            discardZone.classList.add('highlight-zone');
        });

        cardEl.addEventListener('dragend', () => {
            discardZone.classList.remove('highlight-zone');
            window.currentDragData = null;
        });
    });

    // 2) 监听“弃牌区”拖放 → 放弃卡片
    discardZone.addEventListener('dragover', e => e.preventDefault());
    discardZone.addEventListener('drop', async e => {
        e.preventDefault();
        const cardIdNum = parseInt(e.dataTransfer.getData('text/plain'));
        const cardId    = isNaN(cardIdNum) && window.currentDragData
            ? window.currentDragData.cardId
            : cardIdNum;

        if (!cardId) {
            console.warn('[UseCard] 丢弃时未拿到 cardId');
            return;
        }

        await sendAction({
            action:      'USE_CARD',
            playerIndex: window.myPlayerIndex,
            cardId:      cardId
        });

        discardZone.classList.remove('highlight-zone');
        window.currentDragData = null;
        await onRefresh?.();
    });

    // 3) “使用卡片” 的 drop 事件由 bindTileDrag 统一绑定，不需要在这里额外遍历 .tile
}
