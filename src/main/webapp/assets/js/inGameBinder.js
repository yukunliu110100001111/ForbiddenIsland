// assets/js/binder/inGameBinder.js

/* 路径修正：binder → ../api */
import * as api from '../js/api/inGameApi.js';

let gameInterval = null;
let currentAction = null;

/* 不再接收 view 参数，直接绑定 */
export async function bindInGame() {

  // 清除旧轮询
  if (gameInterval) clearInterval(gameInterval);

  /* DOM 引用 */
  const mapContainer  = document.getElementById('map-container');
  const tilesLayer    = document.getElementById('tiles-layer');   // ← 新增
  const handContainer = document.getElementById('hand-container');
  const statusEl      = document.getElementById('action-status');

  const controls = {
    moveBtn:    document.getElementById('btn-move'),
    shoreBtn:   document.getElementById('btn-shore'),
    takeBtn:    document.getElementById('btn-take'),
    specialBtn: document.getElementById('btn-special'),
    endTurnBtn: document.getElementById('btn-end-turn'),
  };

  /* 地图点击 */
  mapContainer?.addEventListener('click', async e => {
    if (!currentAction) return;
    const tileEl = e.target.closest('.tile');
    if (!tileEl) return;
    const x = +tileEl.dataset.x;
    const y = +tileEl.dataset.y;
    await doAction({ action: currentAction, x, y });
    currentAction = null;
    updateCtrlHL();
  });

  /* 控制按钮 */
  controls.moveBtn   ?.addEventListener('click', () => sel('MOVE'));
  controls.shoreBtn  ?.addEventListener('click', () => sel('SHORE'));
  controls.takeBtn   ?.addEventListener('click', () => sel('TAKE'));
  controls.specialBtn?.addEventListener('click', async () => {
    sel(null); await api.useSpecialAbility(); await refresh();
  });
  controls.endTurnBtn?.addEventListener('click', async () => {
    sel(null); await doAction({ action: 'END_TURN' });
  });

  function sel(a){ currentAction=a; updateCtrlHL(); }
  function updateCtrlHL(){
    Object.entries(controls).forEach(([k,btn])=>{
      btn?.classList.toggle('active', k.toUpperCase().includes(currentAction||''));
    });
  }

  async function doAction(obj){
    try{
      const res = await api.sendAction(obj);
      if(res.error) alert(res.error);
    }finally{ await refresh(); }
  }

  /* ---------- 渲染 ---------- */
    function render(state){
        if(state.error){
            alert(state.error);
            return;
        }
        // 只改这一行！
        renderTiles(state.map?.allTiles ?? []);
        renderPlayers(state.players ?? []);
        renderHand((state.currentPlayer?.hand) ?? []);
        statusEl.textContent = `玩家${state.currentPlayerIndex+1} 剩余行动:${state.actionsLeft}`;
    }

  function renderTiles(tiles){
    if(!tilesLayer) return;
    tilesLayer.innerHTML='';
    tiles.forEach(t=>{
      const d=document.createElement('div');
      d.className=`tile ${t.state}`;
      d.dataset.x=t.x; d.dataset.y=t.y;
      d.style.left=`${t.x*100}px`; d.style.top=`${t.y*100}px`; // 100px 可提常量
      tilesLayer.appendChild(d);
    });
  }
  function renderPlayers(players){ /* 省略，和之前一样… */ }
  function renderHand(hand){ /* 省略 … */ }

  /* -------- 轮询 -------- */
    async function refresh() {
        try {
            const state = await api.updateGameState();
            console.log("后端返回 state =", state);
            render(state);
        } catch(e) { console.error("updateGameState 失败", e); }
    }


  await refresh();
  gameInterval=setInterval(refresh,1000);
}
