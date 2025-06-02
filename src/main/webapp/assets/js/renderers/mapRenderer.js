// src/renderers/mapRenderer.js

import { renderTilesBase } from './tileRenderer.js';
import { bindTileDrag    } from '../controllers/tileDragHandler.js';
import { updatePawns      } from './pawnRenderer.js';

/**
 * mapRenderer.js
 *
 * 该函数只做三件事：
 *   1. renderTilesBase(board, layer)：把静态 tile 都渲染出来（但不移除 pawn）。
 *   2. updatePawns(players, layer, currentPlayerIndex)：把棋子放到 tile 中心，并平滑动画。
 *   3. bindTileDrag(...)：遍历每个 tileDOM，给它绑定拖拽放置特殊卡的能力。
 *
 * @param {Array<Array>} board              - 2D 数组，每项是 TileView
 * @param {Array}        players            - 每个玩家 { currentTile: {x,y}, … }
 * @param {HTMLElement}  layer              - 容器 DOM 节点 (#tiles-layer)
 * @param {number|null}  currentPlayerIndex - 当前操作玩家，用于高亮 pawn
 */
export function renderTiles(board = [], players = [], layer, currentPlayerIndex = null) {
    if (!layer) return;

    // —— 第一步：把地块画出来（只移除现有 .tile，不清空 layer），静态渲染所有 .tile ——
    renderTilesBase(board, layer);

    // —— 第二步：渲染或更新 pawn 位置，带动画 ——
    updatePawns(players, layer, currentPlayerIndex);

    // —— 第三步：把拖拽事件绑定到每个 tile DOM ——
    board.forEach(row => {
        row.forEach(t => {
            if (!t || t.state.toLowerCase() === 'sink') return;

            const tileEl = layer.querySelector(`.tile[data-x="${t.x}"][data-y="${t.y}"]`);
            if (!tileEl) return;
            bindTileDrag(tileEl, t);
        });
    });
}
