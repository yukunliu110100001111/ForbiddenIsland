import { pull }            from '../state/gameStateStore.js';
import { renderTiles }      from '../renderers/mapRenderer.js';
import { renderFooter }     from '../renderers/footerRenderer.js';
import { renderHand }       from '../renderers/handRenderer.js';
import { renderWaterMeter } from '../renderers/waterMeterRenderer.js';
import { renderDeckCounts } from '../renderers/deckRenderer.js';
import { renderDrawnCards } from '../renderers/drawnCardsRenderer.js';
import { renderDiscardPiles } from '../renderers/discardRenderer.js';
import { renderTreasureProgress } from '../renderers/progressRenderer.js';
import { highlightTiles }   from '../renderers/highlightRenderer.js';
import { wireControls, getCurrentAction } from '../controllers/controls.js';
import * as api from '../api/inGameApi.js';

export async function bindInGame() {
    let gs;

    // --- DOM 引用 ---
    const dom = {
        mapLayer:         document.getElementById('tiles-layer'),
        footer:           document.getElementById('players-footer'),
        hand:             document.getElementById('hand-container'),
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
            end:   document.getElementById('btn-end-turn')
        },
        // 胜负弹窗
        modal:    document.getElementById('result-modal'),
        titleEl:  document.getElementById('result-title'),
        restart:  document.getElementById('btn-restart')
    };

    // 特殊牌弹窗引用
    const specialModal   = document.getElementById('special-modal');
    const specialListEl  = document.getElementById('special-list');
    const specialClose   = document.getElementById('btn-special-close');

    // 获取当前玩家索引
    const myPlayerIndex = parseInt(sessionStorage.getItem('myPlayerIndex') || '0', 10);

    // 重开按钮
    dom.restart.onclick = () => window.location.reload();

    // 关闭特殊牌弹窗
    specialClose.onclick = () => specialModal.classList.add('hidden');

    // 重写 Special 按钮行为 - 弹窗
    dom.btns.spec.onclick = () => {
        const hand = gs.players[myPlayerIndex]?.hand || [];
        const specials = hand.filter(c => c.cardType === 'ACTION');
        specialListEl.innerHTML = '';
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

    // 绑定其余按钮
    wireControls(dom.btns, refresh);

    // 初始渲染 & 轮询
    await refresh();
    const timer = setInterval(refresh, 1000);

    async function refresh() {
        gs = await pull();
        if (!gs) return;

        // 1. 地图 + 棋子
        renderTiles(gs.board, gs.players, dom.mapLayer);

        // 2. 高亮
        highlightTiles(
            getCurrentAction(),
            gs.legalMoves, gs.legalShores, gs.legalCaptures,
            dom.mapLayer
        );

        // 3. 其它渲染
        renderFooter(gs.players, myPlayerIndex, gs.currentPlayerIndex, dom.footer);
        renderHand(gs.players[myPlayerIndex]?.hand || [], dom.hand);
        renderWaterMeter(gs.waterLevel, document.getElementById('water-meter'));
        renderDeckCounts(gs.treasureDeckRemaining, gs.floodDeckRemaining);
        renderDrawnCards(gs.recentTreasureDraws, gs.recentFloodDraws, dom.drawnCards);
        renderDiscardPiles(
            gs.treasureDiscardPile, gs.floodDiscardPile,
            dom.treasureDiscard, dom.floodDiscard
        );
        renderTreasureProgress(gs.collectedTreasures, dom.progress);

        // 4. 按钮启停 & 状态栏
        const isMyTurn = gs.currentPlayerIndex === myPlayerIndex;
        Object.values(dom.btns).forEach(btn => {
            btn.disabled = !isMyTurn;
            btn.classList.remove('active');
        });
        dom.status.textContent = isMyTurn
            ? `你的回合，剩余行动：${gs.actionsLeft}`
            : `等待 玩家${gs.currentPlayerIndex+1} 操作`;

        // 5. 胜负检测
        if (gs.gameWon || gs.gameLost) {
            dom.titleEl.textContent = gs.gameWon ? 'You Win!' : 'Game Over';
            dom.modal.classList.remove('hidden');
            clearInterval(timer);
        }
    }
}
