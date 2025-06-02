// src/renderers/tileDragHandler.js

import { sendAction } from '../api/inGameApi.js';

/**
 * 判断某张卡能否放置到这个 tileView 上：
 * - 直升机卡（cardType === 'ACTION'）可以放到任何非 sunk 的格子
 * - 沙袋卡      （cardType === 'EVENT'）只能放到 flooded 格子
 *
 * @param {Object} tileView  - 单个地块数据 { x, y, state, ... }
 * @param {string} cardType  - 拖拽时传过来的 card.cardType，如 "ACTION"、"EVENT"
 * @returns {boolean}
 */
function isLegalTarget(tileView, cardType) {
    const state = (tileView.state || '').toLowerCase();
    if (cardType === 'ACTION') {
        return state !== 'sink';
    }
    if (cardType === 'EVENT') {
        return state === 'flooded';
    }
    return false;
}

/**
 * 为已渲染好的 <div class="tile"> 元素，绑定所有的拖放事件：
 * - dragenter / dragover：做合法性检测并阻止默认，然后加高亮样式
 * - dragleave：移除高亮
 * - drop：再做一次合法性判断，合法则发后端 sendAction({action:'USE_CARD', cardId, x, y})
 *         不合法则抖动提示
 *
 * @param {HTMLElement} tileEl   - 实际的 DOM 节点 <div class="tile"> …
 * @param {Object}      tileView - 对应的 TileView 数据模型，与 renderTilesBase 一致
 */
export function bindTileDrag(tileEl, tileView) {
    // dragenter: 鼠标第一次进入时，如果合法就加高亮
    tileEl.addEventListener('dragenter', e => {
        let dragData;
        try {
            dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch {
            dragData = {};
        }
        if (isLegalTarget(tileView, dragData.cardType)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.classList.add('tile-droppable');
        }
    });

    // dragover: 必须持续 preventDefault 才能让 drop 触发
    tileEl.addEventListener('dragover', e => {
        let dragData;
        try {
            dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch {
            dragData = {};
        }
        if (isLegalTarget(tileView, dragData.cardType)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.classList.add('tile-droppable');
        }
    });

    // dragleave: 鼠标移开时，移除高亮样式
    tileEl.addEventListener('dragleave', () => {
        tileEl.classList.remove('tile-droppable');
    });

    // drop: 用户松手时，最后一次合法性判断，合法调用 sendAction，并刷新棋子动画
    tileEl.addEventListener('drop', async e => {
        tileEl.classList.remove('tile-droppable');
        let dragData;
        try {
            dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch {
            dragData = {};
        }
        if (!isLegalTarget(tileView, dragData.cardType)) {
            tileEl.classList.add('tile-invalid-drop');
            setTimeout(() => tileEl.classList.remove('tile-invalid-drop'), 500);
            return;
        }
        // 合法时调用后端：
        await sendAction({
            action: 'USE_CARD',
            cardId: dragData.cardId,
            x: tileView.x,
            y: tileView.y
        });
        // 成功后，刷新游戏状态（触发棋子动画）
        if (typeof window.refreshGame === 'function') {
            window.refreshGame();
        }
    });
}
