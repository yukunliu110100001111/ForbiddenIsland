// assets/js/binders/inGameBinder.js

import { pull } from '../state/gameStateStore.js';
import { renderTiles } from '../renderers/mapRenderer.js';
import { renderFooter } from '../renderers/footerRenderer.js';
import { renderAllHands } from '../renderers/handRenderer.js';
import { renderWaterMeter } from '../renderers/waterMeterRenderer.js';
import { renderDeckCounts } from '../renderers/deckRenderer.js';
import { renderDrawnCards } from '../renderers/drawnCardsRenderer.js';
import { renderDiscardPiles } from '../renderers/discardRenderer.js';
import { renderTreasureProgress } from '../renderers/progressRenderer.js';
import { highlightTiles } from '../renderers/highlightRenderer.js';
import { wireControls } from '../controllers/controls.js';


import * as api from '../api/inGameApi.js';
window.api = api;  // 供各子模块统一调用

/**
 * 入口：在游戏内页面调用 bindInGame()，一次性绑定所有交互
 */
export async function bindInGame() {
    let gs;  // 缓存最新 GameState
    let timer;

    /* ---------- 缓存所有常用 DOM ---------- */
    const dom = {
        mapLayer:        document.getElementById('tiles-layer'),
        footer:          document.getElementById('players-footer'),
        status:          document.getElementById('action-status'),
        drawnCards:      document.getElementById('drawn-cards'),
        treasureDiscard: document.getElementById('treasure-discard'),
        floodDiscard:    document.getElementById('flood-discard'),
        progress:        document.getElementById('treasure-progress'),
        btns: {
            move:  document.getElementById('btn-move'),
            shore: document.getElementById('btn-shore'),
            take:  document.getElementById('btn-take'),
            end:   document.getElementById('btn-end-turn'),
            reset: document.getElementById('btn-reset')
        },
        modal:       document.getElementById('result-modal'),
        titleEl:     document.getElementById('result-title'),
        restart:     document.getElementById('btn-restart'),
        historyList: document.getElementById('history-list'),
        actionLog:   document.getElementById('action-log')
    };

    /* ---------- 绑定所有按钮 / 拖拽 / 地图点击 ---------- */
    // wireControls 内部会把 move/shore/take/end 按钮 与地图点击事件绑定，
    // 同时它也可以在 controls.js 里调用 bindGiveCardDrag(refresh) 和 bindUseCardDrag(refresh)。
    const { getCurrentAction } = wireControls(dom.btns, refresh);

    /* ---------- Restart（回到大厅） ---------- */
    dom.restart?.addEventListener('click', () => {
        sessionStorage.clear();
        localStorage.removeItem('roomId');
        localStorage.removeItem('userName');
        window.location.href = '/ForbiddenIsland_war_exploded/';
    });

    /* ---------- 首次拉取并每 2 秒刷新 ---------- */
    await refresh();
    timer = setInterval(refresh, 2000);

    /**
     * 刷新函数：拉最新 GameState → 更新全局变量 → 渲染各个 UI 区域
     */
    async function refresh() {
        gs = await pull();
        if (!gs) return;

        window.myPlayerIndex    = gs.myPlayerIndex;          // 供其他模块使用
        window.gs                = gs;                       // 全局暴露整个 GameState
        window.refreshGame       = refresh;                  // 便于外部手动触发刷新

        /* ===== 1. 地图渲染 & 高亮 ===== */
        // 注意：renderTiles 多传 refresh，让 bindTileDrag 能在 drop 后调用它
        renderTiles(
            gs.board,
            gs.players,
            dom.mapLayer,
            gs.currentPlayerIndex,
            refresh
        );

        // highlightTiles 负责“移动/修复/捕获 时各自的高亮图层”
        highlightTiles(
            getCurrentAction(),
            gs.legalMoves,
            gs.legalShores,
            gs.legalCaptures,
            dom.mapLayer
        );

        /* ===== 2. 玩家头像 + 空手牌容器 ===== */
        renderFooter(
            gs.players,
            gs.myPlayerIndex,
            gs.currentPlayerIndex,
            dom.footer
        );

        /* ===== 3. 手牌渲染 ===== */
        const isMyTurn = gs.currentPlayerIndex === gs.myPlayerIndex;
        const allHands = gs.players.map(p => p.hand || []);
        renderAllHands(
            allHands,
            dom.footer,
            gs.myPlayerIndex,
            isMyTurn
        );

        /* ===== 4. 手牌超限检测 & UI ===== */
        const myHandSize = allHands[gs.myPlayerIndex].length;
        const overLimit  = myHandSize > 5;
        window.isOverLimit = overLimit && isMyTurn;

        // 如果超限且是自己回合，给自己那行手牌加红框闪烁提示
        document.querySelectorAll('.player').forEach(el => el.classList.remove('over-limit'));
        if (overLimit) {
            dom.footer
                .querySelector(`.player[data-player-index="${gs.myPlayerIndex}"]`)
                ?.classList.add('over-limit');
        }

        /* ===== 5. 其它 UI（牌堆 / 弃牌 / 进度） ===== */
        renderWaterMeter(gs.waterLevel, document.getElementById('water-meter'));
        renderDeckCounts(gs.treasureDeckRemaining, gs.floodDeckRemaining);
        renderDrawnCards(gs.recentTreasureDraws, gs.recentFloodDraws, dom.drawnCards);
        renderDiscardPiles(
            gs.treasureDiscardPile, gs.floodDiscardPile,
            dom.treasureDiscard, dom.floodDiscard
        );
        renderTreasureProgress(gs.collectedTreasures, dom.progress);

        /* ===== 6. 按钮启停 & 状态栏 ===== */
        Object.entries(dom.btns).forEach(([key, btn]) => {
            if (!btn) return;
            const lockBtns = ['move', 'shore', 'take', 'end'];
            btn.disabled = lockBtns.includes(key)
                ? (!isMyTurn || overLimit)  // 只有自己回合 & 不超限才能点
                : false;                    // 其余（如 reset）永远可点
            btn.classList.remove('active');
        });
        dom.status.textContent = overLimit && isMyTurn
            ? 'If you have more than 5 cards in your hand, please drag the extra cards to the treasure discard area first.'
            : (isMyTurn
                    ? `Your turn! Remaining actions: ${gs.actionsLeft}`
                    : `Waiting for player ${gs.currentPlayerIndex + 1}...`
            );

        /* ===== 7. 历史 / 日志 ===== */
        if (dom.historyList) {
            dom.historyList.innerHTML = '';
            gs.history.slice(-50).forEach(h => {
                const d = new Date(h.ts * 1000);
                const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                dom.historyList.insertAdjacentHTML(
                    'beforeend',
                    `<div class="history-entry">[${time}] player${h.player + 1} ${h.action}${h.detail ? ' - ' + h.detail : ''}</div>`
                );
            });
            dom.historyList.scrollTop = dom.historyList.scrollHeight;
        }
        if (dom.actionLog) {
            dom.actionLog.innerHTML = gs.logs ?? '';
        }

        /* ===== 8. 胜负检测 ===== */
        if ((gs.gameWon || gs.gameLost) && dom.modal) {
            dom.titleEl.textContent = gs.gameWon ? 'YOU WIN!' : 'GAME OVER';
            dom.modal.classList.remove('hidden');
            clearInterval(timer);
        }
    }
}
