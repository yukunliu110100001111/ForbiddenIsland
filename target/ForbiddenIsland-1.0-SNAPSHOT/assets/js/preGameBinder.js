import * as api     from './api/preGameApi.js';
import { loadView } from './app.js';

let roomInterval = null;

// 简易 toast 占位函数（可替换为更美观的 UI）
function showToast(msg, type = "info") {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.style.cssText =
            'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 24px;z-index:9999;font-weight:bold;border-radius:6px;box-shadow:0 2px 8px #0002;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === "error" ? "#f45c5c" : "#2979ff";
    toast.style.color = "#fff";
    toast.style.display = "block";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.display = "none"; }, 1800);
}

export function bindPreGame(view) {
    // 切换视图前清除上一次的轮询
    if (roomInterval) {
        clearInterval(roomInterval);
        roomInterval = null;
    }

    switch (view) {
        // 1) COVER 视图
        case 'cover': {
            const startBtn = document.getElementById('start-btn');
            startBtn?.addEventListener('click', () => loadView('lobby'));
            break;
        }

        // 2) LOBBY 视图
        case 'lobby': {
            const createBtn = document.getElementById('go-create-room');
            const joinBtn   = document.getElementById('go-join-room');

            (async () => {
                try {
                    const { players, max } = await api.getPlayerCount();
                    if (players > 0) {
                        createBtn.disabled    = true;
                        createBtn.textContent = 'Room already created.';
                    } else {
                        createBtn.disabled    = false;
                        createBtn.textContent = 'Create Room';
                    }
                } catch (e) {
                    showToast('Failed to obtain room status.', "error");
                }
            })();

            createBtn?.addEventListener('click', () => {
                if (!createBtn.disabled) loadView('creation');
            });

            joinBtn?.addEventListener('click', async () => {
                try {
                    const res = await api.joinRoom();
                    if (res.error) {
                        showToast(res.error, "error");
                        return;
                    }
                    loadView('room');
                } catch (e) {
                    showToast(e.message, "error");
                }
            });
            break;
        }

        // 3) CREATION 视图
        case 'creation': {
            const sliderP   = document.getElementById('players');
            const labelP    = document.getElementById('player-count');
            const sliderD   = document.getElementById('difficulty');
            const labelD    = document.getElementById('difficulty-label');
            const createBtn = document.getElementById('create-room');

            if (sliderP && labelP) {
                labelP.textContent = sliderP.value;
                sliderP.oninput    = () => labelP.textContent = sliderP.value;
            }
            if (sliderD && labelD) {
                labelD.textContent = sliderD.value;
                sliderD.oninput    = () => labelD.textContent = sliderD.value;
            }

            createBtn?.addEventListener('click', async () => {
                const count = sliderP ? +sliderP.value : 0;
                const level = sliderD ? +sliderD.value : 1;
                try {
                    const res = await api.createRoom(level, count);
                    if (res.error) {
                        showToast(res.error, "error");
                        return;
                    }
                    localStorage.setItem('playerCount', count);
                    localStorage.setItem('difficulty', level);
                    loadView('room');
                } catch (e) {
                    showToast(e.message, "error");
                }
            });
            break;
        }

        // 4) ROOM 视图
        case 'room': {
            const container = document.getElementById('slots-container');
            const status    = document.getElementById('room-status');
            const readyBtn  = document.getElementById('btn-room-ready');
            const tipEl     = document.getElementById('start-tip');
            let isReady     = false;

            // ① 首次渲染“空槽”
            if (container && container.children.length === 0) {
                const maxCount = +localStorage.getItem('playerCount') || 0;
                for (let i = 0; i < maxCount; i++) {
                    const slot = document.createElement('div');
                    slot.className   = 'slot';
                    slot.textContent = `P${i+1}`;
                    container.appendChild(slot);
                }
            }

            // ② Ready/Cancel Ready 按钮绑定（初始状态）
            readyBtn.textContent           = 'Ready';
            readyBtn.classList.remove('ready');
            readyBtn.setAttribute('aria-pressed', 'false');
            readyBtn.addEventListener('click', async () => {
                try {
                    if (!isReady) {
                        const res = await api.setReady();
                        if (res.error) {
                            showToast(res.error, "error");
                            return;
                        }
                        // 切换到“已准备”
                        isReady = true;
                        readyBtn.textContent = 'Cancel Ready';
                        readyBtn.classList.add('ready');
                        readyBtn.setAttribute('aria-pressed', 'true');
                    } else {
                        const res = await api.setUnready();
                        if (res.error) {
                            showToast(res.error, "error");
                            return;
                        }
                        // 切换到“未准备”
                        isReady = false;
                        readyBtn.textContent = 'Ready';
                        readyBtn.classList.remove('ready');
                        readyBtn.setAttribute('aria-pressed', 'false');
                    }
                } catch (e) {
                    showToast(e.message, "error");
                }
            });

            // ③ 轮询函数
            const pollRoomStatus = async () => {
                try {
                    const { players, max, ready } = await api.getRoomStatus();
                    status.textContent = `Players: ${players}/${max}, Ready: ${ready}/${max}`;

                    // 更新卡槽 occupied & ready 样式
                    if (container) {
                        container.querySelectorAll('.slot').forEach((slot, idx) => {
                            slot.classList.toggle('occupied', idx < players);
                            slot.classList.toggle('ready',    idx < ready);
                        });
                    }

                    // 更新提示文字
                    if (tipEl) {
                        if (ready < max) {
                            tipEl.textContent = `Waiting for ${max - ready} more to be ready…`;
                            tipEl.style.color = "#e57373";
                        } else {
                            tipEl.textContent = 'All players ready! Starting…';
                            tipEl.style.color = "#4caf50";
                        }
                    }

                    // 全员 ready 且玩家数已满，自动启动游戏
                    if (players === max && ready === max) {
                        clearInterval(roomInterval);
                        try {
                            const res = await api.startGame();
                            if (res.error) {
                                showToast(res.error, "error");
                                roomInterval = setInterval(pollRoomStatus, 1000);
                            } else {
                                setTimeout(() => {
                                    window.location.href = `${window.contextPath}page/game.html`;
                                }, 2000);
                            }
                        } catch (e) {
                            showToast(e.message, "error");
                            roomInterval = setInterval(pollRoomStatus, 1000);
                        }
                    }
                } catch (e) {
                    showToast('Failed to poll room status', "error");
                }
            };

            // 启动第一次轮询，并开启定时
            pollRoomStatus();
            roomInterval = setInterval(pollRoomStatus, 1000);

            break;
        }


        default:
            break;
    }
}
