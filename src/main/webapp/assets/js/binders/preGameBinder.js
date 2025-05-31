// assets/js/preGameBinder.js

import * as api     from '../api/preGameApi.js';
import { loadView } from '../app.js';

let roomInterval = null;

/**
 * Show a floating toast message.
 * @param {string} msg - The message to display.
 * @param {string} type - Message type ("info" or "error").
 */
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

/**
 * Bind logic for the pre-game views.
 * @param {string} view - The current view to bind (cover, lobby, creation, room).
 */
export function bindPreGame(view) {
    // Clear any existing polling interval
    if (roomInterval) {
        clearInterval(roomInterval);
        roomInterval = null;
    }

    switch (view) {
        // 1) COVER view: bind start button
        case 'cover': {
            const startBtn = document.getElementById('start-btn');
            startBtn?.addEventListener('click', () => loadView('lobby'));
            break;
        }

        // 2) LOBBY view: bind create/join buttons and check player status
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
                    // Save the player's index for host checks
                    sessionStorage.setItem('myPlayerIndex', res.playerIndex);
                    // Optionally mark host in localStorage
                    localStorage.setItem('isHost', (res.playerIndex === 0).toString());
                    loadView('room');
                } catch (e) {
                    showToast(e.message, "error");
                }
            });
            break;
        }

        // 3) CREATION view: bind sliders and create room logic
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

        // 4) ROOM view: bind player slot rendering, ready/unready, exit and destroy logic
        case 'room': {
            const container = document.getElementById('slots-container');
            const status    = document.getElementById('room-status');
            const readyBtn  = document.getElementById('btn-room-ready');
            const exitBtn   = document.getElementById('btn-room-exit');
            const destroyBtn = document.getElementById('btn-room-destroy');
            const tipEl     = document.getElementById('start-tip');
            let isReady     = false;

            // Initial slot rendering
            if (container && container.children.length === 0) {
                const maxCount = +localStorage.getItem('playerCount') || 0;
                for (let i = 0; i < maxCount; i++) {
                    const slot = document.createElement('div');
                    slot.className   = 'slot';
                    slot.textContent = `P${i+1}`;
                    container.appendChild(slot);
                }
            }

            // Ready/Unready logic for the ready button
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

            // Exit room logic
            if (exitBtn) {
                exitBtn.onclick = async () => {
                    try {
                        const res = await api.exitRoom();
                        if (res.error) {
                            showToast(res.error, "error");
                        } else {
                            showToast("You left the room.", "info");
                            setTimeout(() => loadView('lobby'), 500);
                        }
                    } catch (e) {
                        showToast(e.message, "error");
                    }
                };
            }

            // Destroy room logic (host only)
            if (destroyBtn) {
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

            // Poll room status every second, update slot/ready state, and start game if ready
            const pollRoomStatus = async () => {
                try {
                    const { players, max, ready } = await api.getRoomStatus();
                    status.textContent = `Players: ${players}/${max}, Ready: ${ready}/${max}`;

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
