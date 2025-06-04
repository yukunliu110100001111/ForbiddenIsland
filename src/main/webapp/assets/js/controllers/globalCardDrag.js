// src/controllers/globalCardDrag.js

import { sendAction } from '../api/inGameApi.js';

/**
 * Global tracking of the current dragged card information (cardType, cardId)
 */
window.currentDragData = null;

/**
 * Determine if tileView is a valid drop target for the card type (used for "using a card")
 */
function isLegalTile(tileView, cardType) {
    const state = tileView.state?.toLowerCase() || "";
    if (cardType === 'ACTION') return state !== 'sink';
    if (cardType === 'EVENT')  return state === 'flooded';
    return false;
}

/**
 * Display a temporary status message at the top of the page
 */
function showStatusMessage(msg, duration = 1500) {
    let bar = document.getElementById('status-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'status-bar';
        Object.assign(bar.style, {
            position: 'fixed',
            top:    '8px',
            left:   '50%',
            transform: 'translateX(-50%)',
            padding: '6px 12px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '0.9rem',
            zIndex: '9999',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.3s'
        });
        document.body.appendChild(bar);
    }
    bar.textContent = msg;
    bar.style.opacity = '1';
    setTimeout(() => {
        bar.style.opacity = '0';
    }, duration);
}

/**
 * Make a hand card draggable and bind dragstart/dragend events
 */
export function makeCardDraggable(cardEl) {
    const cardType = cardEl.dataset.cardType;
    const cardId   = parseInt(cardEl.dataset.cardId, 10);
    if (!cardType || isNaN(cardId)) return;

    cardEl.setAttribute('draggable', 'true');
    cardEl.style.cursor = 'grab';

    cardEl.addEventListener('dragstart', e => {
        window.currentDragData = { cardType, cardId };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify({ cardType, cardId }));
        e.dataTransfer.setData('text/plain', String(cardId));
    });

    cardEl.addEventListener('dragend', () => {
        window.currentDragData = null;
    });
}

/**
 * After each refresh, rebind drag events to all cards in the current player's hand area
 */
export function bindHandCardsDraggable(myPlayerIndex) {
    const handArea = document.querySelector(`.player[data-player-index="${myPlayerIndex}"] .hand`);
    if (!handArea) return;
    [...handArea.children].forEach(cardEl => {
        makeCardDraggable(cardEl);
    });
}

/**
 * Main entry point: Unify drag binding for cards (hand, map, player avatar, discard zone)
 * Returns bindTileListeners for use in mapRenderer to bind drag-and-drop on tiles
 */
export function bindGlobalCardDrag(onRefresh) {
    // First bind the current hand cards
    bindHandCardsDraggable(window.myPlayerIndex);

    // Bind drag-and-drop for each tile
    function bindTileListeners(tileEl, tileView) {
        tileEl.addEventListener('dragenter', e => {
            if (!window.currentDragData) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.style.cursor = 'pointer';
            tileEl.classList.add('tile-droppable');
        });
        tileEl.addEventListener('dragover', e => {
            if (!window.currentDragData) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.style.cursor = 'pointer';
            tileEl.classList.add('tile-droppable');
        });
        tileEl.addEventListener('dragleave', () => {
            tileEl.style.cursor = '';
            tileEl.classList.remove('tile-droppable');
        });
        tileEl.addEventListener('drop', async e => {
            e.stopPropagation();
            e.preventDefault();
            tileEl.style.cursor = '';
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

            if (!isLegalTile(tileView, dragData.cardType)) {
                showStatusMessage(`Cannot use this card at [${tileView.x},${tileView.y}]`, 2000);
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

    // Player avatar area (give card)
    const footer = document.getElementById('players-footer');
    if (footer) {
        footer.addEventListener('dragover', e => {
            if (e.target.closest('.tile')) return;
            const p = e.target.closest('.player');
            if (!p) return;
            const targetIdx = +p.dataset.playerIndex;
            if (targetIdx === window.myPlayerIndex) return;
            e.preventDefault();
            p.classList.add('player-droppable');
        });
        footer.addEventListener('dragleave', e => {
            e.target.closest('.player')?.classList.remove('player-droppable');
        });
        footer.addEventListener('drop', async e => {
            if (e.target.closest('.tile')) return;
            const p = e.target.closest('.player');
            if (!p) return;
            p.classList.remove('player-droppable');

            const targetIdx = +p.dataset.playerIndex;
            if (targetIdx === window.myPlayerIndex) {
                showStatusMessage('Cannot give card to yourself', 1500);
                return;
            }
            if (window.isOverLimit) {
                showStatusMessage('Hand limit exceeded, discard or use cards first', 1500);
                return;
            }

            e.stopPropagation();
            e.preventDefault();

            let data = {};
            try {
                data = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            } catch {
                const cardIdNum = parseInt(e.dataTransfer.getData('text/plain'), 10);
                if (!isNaN(cardIdNum)) {
                    data = { cardId: cardIdNum };
                }
            }
            if (!data.cardId && window.currentDragData) {
                data = window.currentDragData;
            }
            if (!data.cardId) {
                showStatusMessage('Card ID not retrieved during drag', 1500);
                return;
            }

            console.log(`[DEBUG] GIVE_CARD Player ${window.myPlayerIndex} → ${targetIdx} | Card ID=${data.cardId}`);
            const success = await sendAction({
                action:        'GIVE_CARD',
                cardId:        data.cardId,
                targetPlayers: [window.myPlayerIndex, targetIdx]
            });
            if (success) {
                window.currentDragData = null;
                await onRefresh?.();
            }
        });
    }

    // Discard zone
    const discardZone = document.getElementById('treasure-discard');
    if (discardZone) {
        discardZone.style.pointerEvents = 'auto';
        discardZone.addEventListener('dragover', e => {
            if (e.target.closest('.tile')) return;
            e.preventDefault();
            discardZone.classList.add('discard-droppable');
        });
        discardZone.addEventListener('dragleave', () => {
            discardZone.classList.remove('discard-droppable');
        });
        discardZone.addEventListener('drop', async e => {
            if (e.target.closest('.tile')) return;
            e.preventDefault();
            discardZone.classList.remove('discard-droppable');

            let dragData = {};
            try {
                dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            } catch {
                dragData = {};
            }
            const { cardType, cardId } = dragData;
            if (!cardId) {
                showStatusMessage('Card ID not retrieved during drag', 1500);
                return;
            }

            console.log('[DEBUG] DISCARD_CARD cardId=', cardId);
            if (cardType === 'ACTION') {
                await sendAction({ action: 'USE_CARD',    cardId });
                await sendAction({ action: 'DISCARD_CARD', cardId });
            } else {
                await sendAction({ action: 'DISCARD_CARD', cardId });
            }
            window.currentDragData = null;
            await onRefresh?.();
        });
    }

    // Return for use in renderTiles
    return bindTileListeners;
}
