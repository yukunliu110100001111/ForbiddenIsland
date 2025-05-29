// assets/js/preGameBinder.js

import * as api     from '../api/preGameApi.js';
import { loadView } from '../app.js';

let roomInterval = null;

// Toast 显示（同前）
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
    // 清除旧的 interval
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
            const exitBtn   = document.getElementById('btn-room-exit');    // 新增：退出按钮
            const destroyBtn = document.getElementById('btn-room-destroy');
            const tipEl     = document.getElementById('start-tip');
            let isReady     = false;

            // ① 卡槽首次渲染
            if (container && container.children.length === 0) {
                const maxCount = +localStorage.getItem('playerCount') || 0;
                for (let i = 0; i < maxCount; i++) {
                    const slot = document.createElement('div');
                    slot.className   = 'slot';
                    slot.textContent = `P${i+1}`;
                    container.appendChild(slot);
                }
            }

            // ② Ready/Unready
            readyBtn.textContent = 'Ready';
            readyBtn.classList.remove('ready');
            readyBtn.setAttribute('aria-pressed', 'false');
            readyBtn.onclick = async () => {
                try {
                    if (!isReady) {
                        const res = await api.setReady();
                        if (res.error) {
                            showToast(res.error, "error");
                            return;
                        }
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
                        isReady = false;
                        readyBtn.textContent = 'Ready';
                        readyBtn.classList.remove('ready');
                        readyBtn.setAttribute('aria-pressed', 'false');
                    }
                } catch (e) {
                    showToast(e.message, "error");
                }
            };

            // ③ 新增：退出房间
            if (exitBtn) {
                exitBtn.onclick = async () => {
                    try {
                        const res = await api.exitRoom();
                        if (res.error) {
                            showToast(res.error, "error");
                        } else {
                            showToast("You left the room.", "info");
                            // 回到 lobby 或 cover
                            setTimeout(() => loadView('lobby'), 500);
                        }
                    } catch (e) {
                        showToast(e.message, "error");
                    }
                };
            }

            // ④ 如果当前是房主，再给加个销毁按钮（示例，实际你可根据用户身份/逻辑判断）
            // 推荐：房主才能见到（不然也可以在服务端多判断一次）
            // 页面加一个 <button id="btn-room-destroy">Destroy Room</button>（可选）
            if (destroyBtn) {
                // 这里用 localStorage 判断，真实项目推荐用后端 session 校验
                if (localStorage.getItem('isHost') === 'true') {
                    destroyBtn.style.display = '';
                } else {
                    destroyBtn.style.display = 'none';
                }
                destroyBtn.onclick = async () => {
                    if (!window.confirm("Are you sure to destroy the room?")) return;
                    try {
                        const res = await api.destroyRoom();
                        if (res.error) {
                            showToast(res.error, "error");
                        } else {
                            showToast("Room destroyed.", "info");
                            setTimeout(() => loadView('lobby'), 500);
                        }
                    } catch (e) {
                        showToast(e.message, "error");
                    }
                };
            }

            // ⑤ 轮询房间状态（不变）
            const pollRoomStatus = async () => {
                try {
                    const { players, max, ready } = await api.getRoomStatus();
                    status.textContent = `Players: ${players}/${max}, Ready: ${ready}/${max}`;

                    // 卡槽样式
                    if (container) {
                        container.querySelectorAll('.slot').forEach((slot, idx) => {
                            slot.classList.toggle('occupied', idx < players);
                            slot.classList.toggle('ready',    idx < ready);
                        });
                    }

                    if (tipEl) {
                        if (ready < max) {
                            tipEl.textContent = `Waiting for ${max - ready} more to be ready…`;
                            tipEl.style.color = "#e57373";
                        } else {
                            tipEl.textContent = 'All players ready! Starting…';
                            tipEl.style.color = "#4caf50";
                        }
                    }

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
            pollRoomStatus();
            roomInterval = setInterval(pollRoomStatus, 1000);

            break;
        }

        default:
            break;
    }
}
