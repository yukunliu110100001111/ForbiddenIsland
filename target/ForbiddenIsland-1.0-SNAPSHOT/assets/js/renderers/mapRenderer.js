// src/renderers/mapRenderer.js

import { renderTilesBase } from './tileRenderer.js';
import { updatePawns      } from './pawnRenderer.js';
import { bindTileDrag     } from '../controllers/useCardDrag.js';

/**
 * renderTiles(board, players, layer, currentPlayerIndex, onRefresh)
 *
 *   1. renderTilesBase(board, layer)：静态渲染所有 .tile（并不移除 pawn）
 *   2. updatePawns(players, layer, currentPlayerIndex)：把 pawn 放到正确位置
 *   3. forEach tileElement：
 *       a. 标记 draggable = true（让 tile 自身能拖）
 *       b. 绑定 dragstart/dragend 逻辑（传递 tile 坐标）
 *       c. 绑定 bindTileDrag(tileEl, tileView, onRefresh)：让 tile 本身也能作为 drop 目标
 *
 * @param {Array<Array>}  board              - 2D 数组，每项是 TileView
 * @param {Array}         players            - 所有玩家数据（用于 updatePawns）
 * @param {HTMLElement}   layer              - 地图容器 DOM (#tiles-layer)
 * @param {number|null}   currentPlayerIndex - 当前操作玩家索引
 * @param {Function}      onRefresh          - 地图上 drop 卡片后或拖动 tile 后要调用的回调
 */
export function renderTiles(
    board = [],
    players = [],
    layer,
    currentPlayerIndex = null,
    onRefresh
) {
    if (!layer) return;

    // —— 第一步：静态渲染所有 .tile，不移除 pawn ——
    renderTilesBase(board, layer);

    // —— 第二步：把 pawn 放到各自格子中央（带动画） ——
    updatePawns(players, layer, currentPlayerIndex);

    // —— 第三步：遍历刚渲染的每个 tile DOM，开启“可拖拽”和“可放置”两种功能 ——
    board.forEach(row => {
        row.forEach(tileView => {
            if (!tileView || tileView.state.toLowerCase() === 'sink') return;

            // 根据 tileView.x/y 找到对应的 DOM
            const selector = `.tile[data-x="${tileView.x}"][data-y="${tileView.y}"]`;
            const tileEl = layer.querySelector(selector);
            if (!tileEl) return;

            // —— (a) 开启“拖拽 tile 自身” ——
            tileEl.setAttribute('draggable', 'true');
            tileEl.addEventListener('dragstart', e => {
                // 在 tile 被拖起时，把 tile 的坐标写到 dataTransfer，供 drop 目标（若有）使用
                const payload = { tileX: tileView.x, tileY: tileView.y };
                e.dataTransfer.setData('application/json', JSON.stringify(payload));
                e.dataTransfer.effectAllowed = 'move';
                tileEl.classList.add('tile-dragging');
            });
            tileEl.addEventListener('dragend', () => {
                tileEl.classList.remove('tile-dragging');
            });

            // —— (b) 让 tile 也能作为“使用卡片”的 drop 目标 ——
            bindTileDrag(tileEl, tileView, onRefresh);
        });
    });
}
