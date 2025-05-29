// controllers/controls.js
import * as api from '../api/inGameApi.js';

let currentAction = null;
export function getCurrentAction() {
    return currentAction;
}

export function wireControls(btns, onRefresh) {
    currentAction = null;

    const clear = () => {
        currentAction = null;
        Object.values(btns).forEach(b => b.classList.remove('active'));
    };

    const setAct = act => {
        currentAction = act;
        Object.values(btns).forEach(b => b.classList.toggle(
            'active', b === btns[act.toLowerCase()]
        ));
    };

    btns.move.onclick   = () => setAct('MOVE');
    btns.shore.onclick  = () => setAct('SHORE');
    btns.take.onclick   = () => setAct('TAKE');
    btns.spec.onclick   = async () => { clear(); await api.useSpecialAbility(); onRefresh(); };
    btns.end.onclick    = async () => { clear(); await api.sendAction({action:'END_TURN'}); onRefresh(); };

    document.getElementById('map-container')
        .addEventListener('click', async e => {
            if (!currentAction) return;
            const tile = e.target.closest('.tile');
            if (!tile) return;
            await api.sendAction({
                action: currentAction,
                x: +tile.dataset.x,
                y: +tile.dataset.y
            });
            clear();
            onRefresh();
        });
}
