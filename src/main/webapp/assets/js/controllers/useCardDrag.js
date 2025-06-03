// src/controllers/useCardDrag.js

import { sendAction } from '../api/inGameApi.js';

// 全局变量跟踪当前拖拽的卡片信息（cardType, cardId）
window.currentDragData = null;

/**
 * 判断 tileView 是否是合法的放置目标
 * - 直升机卡（cardType === 'ACTION'）可以放到任何非下沉（sunken）的 tile
 * - 沙袋卡      （cardType === 'EVENT'）只能放到已淹没（flooded）的 tile
 */
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
 *
 * @param {HTMLElement} tileEl   - DOM 节点 <div class="tile" data-x="…" data-y="…">
 * @param {Object}      tileView - 后端返回的 TileView 数据 { x, y, state, name, … }
 * @param {Function}    onRefresh- 地图使用卡片成功后调用的回调（通常是 bindInGame 里传进来的 refresh）
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

        let dragData = {};
        try {
            dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch {
            dragData = {};
        }
        if (!dragData.cardType && window.currentDragData) {
            dragData = window.currentDragData;
        }

        if (!isLegalTarget(tileView, dragData.cardType)) {
            tileEl.classList.add('tile-invalid-drop');
            setTimeout(() => tileEl.classList.remove('tile-invalid-drop'), 300);
            return;
        }

        await sendAction({
            action:      'USE_CARD',
            playerIndex: window.myPlayerIndex,
            cardId:      dragData.cardId,
            x:           tileView.x,
            y:           tileView.y
        });

        window.currentDragData = null;
        await onRefresh?.();
    });
}

/**
 * 将“使用卡拖放”与“丢弃卡片”逻辑一起绑定
 *
 * 使用时在 bindInGame 初始化阶段调用 bindUseCardDrag(refresh)，传入 refresh 回调：
 *   bindUseCardDrag(refresh);
 *
 * 它会：
 *  - 找到当前玩家手牌区里 cardType === 'ACTION' 的卡，设置 draggable，并绑定 dragstart/dragend
 *  - 高亮、释放到地图格子时执行 USE_CARD
 *  - 监听“弃牌区” drop，执行 USE_CARD (丢弃) 操作
 *
 * @param {Function} onRefresh  卡片使用/丢弃成功后调用的刷新函数
 */
export function bindUseCardDrag(onRefresh) {
    window.currentDragData = null;
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

    document.querySelectorAll('.tile').forEach(tileEl => {
        const x     = parseInt(tileEl.dataset.x);
        const y     = parseInt(tileEl.dataset.y);
        const state = tileEl.dataset.state;
        const name  = tileEl.dataset.name;
        const tileView = { x, y, state, name };
        bindTileDrag(tileEl, tileView, onRefresh);
    });
}
