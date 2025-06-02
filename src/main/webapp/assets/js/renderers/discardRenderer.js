// renderers/discardRenderer.js
import * as api from '../api/inGameApi.js';

export function renderDiscardPiles(
    treasureDiscardPile, floodDiscardPile,
    treasureContainer, floodContainer
) {
    const MAX_SHOW = 6;

    function renderPile(cards, container, getImgSrc) {
        if (!container || !Array.isArray(cards)) return;
        container.innerHTML = '';
        const count = Math.min(cards.length, MAX_SHOW);
        for (let i = 0; i < count; i++) {
            const card = cards[cards.length - 1 - i];
            if (!card) continue;
            let src = '';
            try {
                src = getImgSrc(card) || '';
            } catch {
                src = '';
            }
            const img = document.createElement('img');
            img.className = 'discard-card';
            if (src) img.src = src;
            img.style.position = 'absolute';
            img.style.top = `${-i * 2}px`;
            img.style.left = `${-i * 2}px`;
            container.appendChild(img);
        }
    }

    renderPile(treasureDiscardPile, treasureContainer, card => {
        const type = (card.cardType || '').toUpperCase();
        if (type === 'TREASURE' && card.treasureType) {
            return `assets/Images/Cards/treasure/treasure-${card.treasureType.toLowerCase()}.png`;
        }
        if (type === 'ACTION') {
            return `assets/Images/Cards/action/${card.cardName.toLowerCase()}.png`;
        }
        if (type === 'EVENT') {
            return `assets/Images/Cards/event/${card.cardName.toLowerCase()}.png`;
        }
        return `assets/Images/Cards/back.png`;
    });

    renderPile(floodDiscardPile, floodContainer, card => {
        const t = card.targetTile;
        const name = t && t.name ? encodeURI(t.name) : '';
        return name
            ? `assets/Images/tiles/${name}.png`
            : `assets/Images/Cards/back.png`;
    });

    // —— 下面保持可拖拽丢牌逻辑 ——
    if (treasureContainer) {
        treasureContainer.style.pointerEvents = 'auto';
        treasureContainer.addEventListener('dragover', e => {
            e.preventDefault();
            treasureContainer.classList.add('discard-droppable');
        });
        treasureContainer.addEventListener('dragleave', () => {
            treasureContainer.classList.remove('discard-droppable');
        });
        treasureContainer.addEventListener('drop', async e => {
            e.preventDefault();
            treasureContainer.classList.remove('discard-droppable');

            let dragData;
            try {
                dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            } catch {
                dragData = {};
            }
            const { cardType, cardId } = dragData;
            if (!cardId) return;

            // 如果是“行动卡”（ACTION），先用再弃
            if (cardType === 'ACTION') {
                await api.sendAction({ action: 'USE_CARD', cardId });
                await api.sendAction({ action: 'DISCARD_CARD', cardId });
            } else {
                // 普通宝物卡 / EVENT 直接丢弃
                await api.sendAction({ action: 'DISCARD_CARD', cardId });
            }

            // 发完请求后刷新游戏状态
            if (typeof window.refreshGame === 'function') {
                window.refreshGame();
            }
        });
    }
}
