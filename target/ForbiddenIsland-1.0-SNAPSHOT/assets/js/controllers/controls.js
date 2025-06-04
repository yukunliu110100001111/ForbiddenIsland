import { bindUseCardDrag } from './useCardDrag.js';
import {bindButtons} from "./bindButtons.js";
import {bindMapActions} from "./mapActions.js";
import {bindGiveCardDrag} from "./giveCardDrag.js";

export function wireControls(btns, onRefresh) {
    let currentAction = null;

    const clearUi = () => {
        currentAction = null;
        document.querySelectorAll('.color-btn.active').forEach(b => b.classList.remove('active'));
        import('../renderers/highlightRenderer.js').then(mod => {
            if (mod.highlightTiles) {
                const tileLayer = document.getElementById('tiles-layer');
                mod.highlightTiles(null, [], [], [], tileLayer);
            }
        });
    };

    function setAct(act) { currentAction = act; }
    function getAct() { return currentAction; }

    bindButtons(btns, setAct, clearUi);
    bindMapActions({ getCurrentAction: getAct, setCurrentAction: setAct }, clearUi, onRefresh);
    bindGiveCardDrag(onRefresh);
    bindUseCardDrag(onRefresh);  // ✅ 加入 useCard 拖拽逻辑

    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tileEl => {
        const tileView = getTileViewData(tileEl);
        bindTileDrag(tileEl, tileView);
    });

    return { getCurrentAction: getAct };
}
