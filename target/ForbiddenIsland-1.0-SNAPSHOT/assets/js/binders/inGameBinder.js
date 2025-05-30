// assets/js/binders/inGameBinder.js

import { pull }            from '../state/gameStateStore.js';
import { renderTiles }      from '../renderers/mapRenderer.js';
import { renderFooter }     from '../renderers/footerRenderer.js';
import {renderAllHands, renderHand} from '../renderers/handRenderer.js';
import { renderWaterMeter } from '../renderers/waterMeterRenderer.js';
import { renderDeckCounts } from '../renderers/deckRenderer.js';
import { renderDrawnCards } from '../renderers/drawnCardsRenderer.js';
import { renderDiscardPiles } from '../renderers/discardRenderer.js';
import { renderTreasureProgress } from '../renderers/progressRenderer.js';
import { highlightTiles }   from '../renderers/highlightRenderer.js';
import { wireControls, getCurrentAction } from '../controllers/controls.js';
import * as api             from '../api/inGameApi.js';

export async function bindInGame() {
    let gs;

    // --- DOM 引用 ---
    const dom = {
        mapLayer:         document.getElementById('tiles-layer'),
        footer:           document.getElementById('players-footer'),
        playersFooter:    document.getElementById('players-footer'),
        status:           document.getElementById('action-status'),
        treasureCount:    document.getElementById('treasure-count'),
        floodCount:       document.getElementById('flood-count'),
        drawnCards:       document.getElementById('drawn-cards'),
        treasureDiscard:  document.getElementById('treasure-discard'),
        floodDiscard:     document.getElementById('flood-discard'),
        progress:         document.getElementById('treasure-progress'),
        btns: {
            move:  document.getElementById('btn-move'),
            shore: document.getElementById('btn-shore'),
            take:  document.getElementById('btn-take'),
            spec:  document.getElementById('btn-special'),
            end:   document.getElementById('btn-end-turn'),
            reset: document.getElementById('btn-reset')      // 新增：重置按钮
        },
        modal:    document.getElementById('result-modal'),
        titleEl:  document.getElementById('result-title'),
        restart:  document.getElementById('btn-restart'),
        historyList: document.getElementById('history-list')
    };

    // 特殊牌弹窗引用
    const specialModal   = document.getElementById('special-modal');
    const specialListEl  = document.getElementById('special-list');
    const specialClose   = document.getElementById('btn-special-close');

    // 重置按钮，如果存在则绑定
    if (dom.btns.reset) {
        dom.btns.reset.onclick = async () => {
            try {
                await api.resetGame();               // 你需要在 inGameApi.js 实现 resetGame()
                specialModal?.classList.add('hidden');
                dom.modal?.classList.add('hidden');
                await refresh();
            } catch (e) {
                console.error('resetGame 失败', e);
                alert('游戏重置失败，请重试');
            }
        };
    }

    // 重开按钮
    if (dom.restart) {
        dom.restart.onclick = () => window.location.reload();
    }

    // 关闭特殊牌弹窗
    if (specialClose && specialModal) {
        specialClose.onclick = () => specialModal.classList.add('hidden');
    }

    // 获取当前玩家索引
    const myPlayerIndex = parseInt(sessionStorage.getItem('myPlayerIndex') || '0', 10);

    // 重写 Special 按钮行为 - 弹窗
    if (dom.btns.spec && specialModal && specialListEl) {
        dom.btns.spec.onclick = () => {
            specialListEl.innerHTML = '';
            const hand = gs?.players?.[myPlayerIndex]?.hand || [];
            const specials = hand.filter(c => c.cardType === 'ACTION');
            if (specials.length === 0) {
                specialListEl.innerHTML = '<p>无可用特殊牌</p>';
            } else {
                specials.forEach(card => {
                    const btn = document.createElement('button');
                    btn.className = 'special-card-btn';
                    btn.textContent = card.cardName;
                    btn.onclick = async () => {
                        await api.sendAction({ action: card.cardName, cardId: card.cardId });
                        specialModal.classList.add('hidden');
                        await refresh();
                    };
                    specialListEl.appendChild(btn);
                });
            }
            specialModal.classList.remove('hidden');
        };
    }

    // 绑定其余按钮（move/shore/take/end） & 地图点击
    wireControls(dom.btns, refresh);

    // 初始渲染 & 轮询
    await refresh();
    const timer = setInterval(refresh, 1000);

    async function refresh() {
        gs = await pull();
        if (!gs) return;

        // 1. 地图 + 棋子
        renderTiles(gs.board, gs.players, dom.mapLayer);

        // 2. 高亮合法格子
        highlightTiles(
            getCurrentAction(),
            gs.legalMoves, gs.legalShores, gs.legalCaptures,
            dom.mapLayer
        );

        // 3. 其它区域渲染
        renderFooter( gs.players, gs.myPlayerIndex, gs.currentPlayerIndex, dom.footer );
        renderHand(   gs.players?.[gs.myPlayerIndex]?.hand || [], dom.hand );
        renderAllHands(gs.players.map(p => p.hand), document.getElementById('players-footer'));
        renderWaterMeter( gs.waterLevel, document.getElementById('water-meter') );
        renderDeckCounts( gs.treasureDeckRemaining, gs.floodDeckRemaining );
        renderDrawnCards( gs.recentTreasureDraws, gs.recentFloodDraws, dom.drawnCards );
        renderDiscardPiles(
            gs.treasureDiscardPile, gs.floodDiscardPile,
            dom.treasureDiscard, dom.floodDiscard
        );
        renderTreasureProgress( gs.collectedTreasures, dom.progress );

        // 4. 按钮启停 & 状态栏
        const isMyTurn = gs.currentPlayerIndex === gs.myPlayerIndex;
        Object.values(dom.btns).forEach(btn => {
            if (btn) {
                btn.disabled = !isMyTurn;
                btn.classList.remove('active');
            }
        });
        if (dom.status) {
            dom.status.textContent = isMyTurn
                ? `你的回合，剩余行动：${gs.actionsLeft}`
                : `等待 玩家${gs.currentPlayerIndex + 1} 操作`;
        }

        // 5. 历史操作渲染
        if (dom.historyList && Array.isArray(gs.history)) {
            dom.historyList.innerHTML = '';
            gs.history.slice(-50).forEach(entry => {
                // entry 推荐结构: { ts, player, action, detail }
                const el = document.createElement('div');
                el.className = 'history-entry';
                el.textContent =
                    `[${formatTime(entry.ts)}] ${entry.player} ${entry.action}${entry.detail ? ' - ' + entry.detail : ''}`;
                dom.historyList.appendChild(el);
            });
            // 滚动到最底部
            dom.historyList.scrollTop = dom.historyList.scrollHeight;
        }

        // 6. 胜负检测
        if ((gs.gameWon || gs.gameLost) && dom.modal && dom.titleEl) {
            dom.titleEl.textContent = gs.gameWon ? 'You Win!' : 'Game Over';
            dom.modal.classList.remove('hidden');
            clearInterval(timer);
        }
    }

    // 时间戳格式化辅助函数
    function formatTime(ts) {
        if (!ts) return '';
        const d = new Date(ts * 1000);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
}
