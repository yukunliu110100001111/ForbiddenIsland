// controllers/controls.js
import * as api from '../api/inGameApi.js';

let currentAction = null;   // Currently selected button action
let pendingCard   = null;   // For GIVE_CARD – selected cardId

/**
 * Expose currentAction for other modules (e.g., to highlight active controls)
 */
export function getCurrentAction() { return currentAction; }

/**
 * Bind all game control buttons and in-game interactions.
 * @param {Object}   btns      - Object of button elements (move, shore, take, use, give, spec, end, reset)
 * @param {Function} onRefresh - Callback to refresh UI after each operation
 */
export function wireControls(btns, onRefresh) {

    /* ---------- Utility: Clear UI highlight states ---------- */
    const clearUi = () => {
        currentAction = null;
        pendingCard   = null;
        document.querySelectorAll('.color-btn.active')
            .forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.card.selected')
            .forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.player.target')
            .forEach(p => p.classList.remove('target'));
    };

    /**
     * Set the current action and update UI highlight for the selected button.
     * @param {string} act - Action name (MOVE, SHORE_UP, COLLECT_TREASURE, etc.)
     */
    const setAct = act => {
        clearUi();
        currentAction = act;
        const map = {
            MOVE:   'move',
            SHORE_UP: 'shore',
            COLLECT_TREASURE: 'take',
            USE_CARD: 'use',
            GIVE_CARD: 'give',
        };
        Object.entries(btns).forEach(([k, b])=>{
            if (!b) return;
            b.classList.toggle('active', map[act] === k);
        });
    };

    /* ---------- Top bar control buttons ---------- */
    btns.move .onclick = () => setAct('MOVE');
    btns.shore.onclick = () => setAct('SHORE_UP');
    btns.take .onclick = () => setAct('COLLECT_TREASURE');
    if (btns.use)  btns.use .onclick = () => setAct('USE_CARD');
    if (btns.give) btns.give.onclick = () => setAct('GIVE_CARD');

    // Special ability button
    btns.spec.onclick = async () => {
        clearUi();
        await api.useSpecialAbility();
        onRefresh();
    };
    // End turn button
    btns.end .onclick = async () => {
        clearUi();
        await api.sendAction({ action:'END_TURN' });
        onRefresh();
    };
    // Reset game button (optional)
    if (btns.reset) btns.reset.onclick = async ()=>{
        clearUi();
        await api.resetGame();
        onRefresh();
    };

    /* ---------- Map click handler (MOVE / SHORE_UP / COLLECT_TREASURE) ---------- */
    document.getElementById('map-container')
        .addEventListener('click', async ev=>{
            if (!currentAction) return;
            if (!['MOVE','SHORE_UP','COLLECT_TREASURE'].includes(currentAction)) return;
            const tile = ev.target.closest('.tile');
            if (!tile) return;
            await api.sendAction({
                action: currentAction,
                x: +tile.dataset.x,
                y: +tile.dataset.y
            });
            clearUi();
            onRefresh();
        });

    /* ---------- Deck click handlers (draw cards) ---------- */
    document.getElementById('treasure-deck')
        ?.addEventListener('click', async ()=>{
            await api.sendAction({ action:'DRAW_TREASURE' });
            onRefresh();
        });
    document.getElementById('flood-deck')
        ?.addEventListener('click', async ()=>{
            await api.sendAction({ action:'DRAW_FLOOD' });
            onRefresh();
        });

    /* ---------- Footer: hand cards and player avatar click logic ---------- */
    const footer = document.getElementById('players-footer');

    footer.addEventListener('click', async ev=>{
        /* 1) Hand card click --------------------------------------------- */
        const cardEl = ev.target.closest('.card');
        if (cardEl) {
            const cardId = +cardEl.dataset.cardId;

            // --- USE_CARD: Play selected card immediately ---
            if (currentAction === 'USE_CARD') {
                await api.sendAction({ action:'USE_CARD', cardId });
                clearUi();
                return onRefresh();
            }

            // --- GIVE_CARD: Step 1 – select the card ---
            if (currentAction === 'GIVE_CARD') {
                pendingCard = cardId;
                // Visual feedback
                document.querySelectorAll('.card.selected')
                    .forEach(c=>c.classList.remove('selected'));
                cardEl.classList.add('selected');
                return;          // Wait for player avatar click
            }
        }

        /* 2) Player avatar click (target for GIVE_CARD) ------------------ */
        const playerEl = ev.target.closest('.player');
        if (playerEl && currentAction === 'GIVE_CARD' && pendingCard != null) {
            const targetIdx = +playerEl.dataset.playerIndex;
            // Visual feedback
            document.querySelectorAll('.player.target')
                .forEach(p=>p.classList.remove('target'));
            playerEl.classList.add('target');

            await api.sendAction({
                action: 'GIVE_CARD',
                cardId: pendingCard,
                targetPlayer: targetIdx
            });
            clearUi();
            onRefresh();
        }
    });
}
