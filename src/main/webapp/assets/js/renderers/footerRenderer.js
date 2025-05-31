import { ROLE_INFO } from '../constants/roleInfo.js';
import { renderAllHands } from './handRenderer.js';

export function renderFooter(players, myPlayerIndex, currentPlayerIndex, footer) {
    if (!footer) return;
    footer.innerHTML = '';

    players.forEach((player, idx) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        if (idx === myPlayerIndex) playerDiv.classList.add('me');
        if (idx === currentPlayerIndex) playerDiv.classList.add('active-player');
        playerDiv.dataset.playerIndex = idx;

        // 角色卡片头像（3:2纵向比例，80x120px）
        let roleInfo = player.type && ROLE_INFO[player.type];
        const roleIcon = document.createElement('div');
        roleIcon.className = 'role-icon';
        if (roleInfo && roleInfo.img) {
            const img = document.createElement('img');
            img.src = roleInfo.img;
            img.alt = roleInfo.name;
            roleIcon.appendChild(img);
        } else {
            roleIcon.textContent = player.name ? player.name[0] : (idx + 1);
        }
        playerDiv.appendChild(roleIcon);

        // 名称标签
        const nameDiv = document.createElement('div');
        nameDiv.className = 'role-label';
        nameDiv.textContent = roleInfo ? roleInfo.name : (player.name || `Player ${idx + 1}`);
        playerDiv.appendChild(nameDiv);

        // 手牌区域
        const handDiv = document.createElement('div');
        handDiv.className = 'hand';
        playerDiv.appendChild(handDiv);

        footer.appendChild(playerDiv);

        // 悬浮职业描述（如前，略）
        if (roleInfo) {
            let tooltipTimer = null, hideTimer = null;
            let descTooltip = document.getElementById('role-desc-tooltip');
            if (!descTooltip) {
                descTooltip = document.createElement('div');
                descTooltip.id = 'role-desc-tooltip';
                descTooltip.style.position = 'fixed';
                descTooltip.style.zIndex = 9999;
                descTooltip.style.pointerEvents = 'none';
                descTooltip.style.maxWidth = '220px';
                descTooltip.style.padding = '10px 18px';
                descTooltip.style.background = 'rgba(30,34,55,0.98)';
                descTooltip.style.color = '#ffd260';
                descTooltip.style.borderRadius = '14px';
                descTooltip.style.boxShadow = '0 4px 18px #111a';
                descTooltip.style.fontSize = '1.03rem';
                descTooltip.style.display = 'none';
                document.body.appendChild(descTooltip);
            }
            roleIcon.addEventListener('mouseenter', (e) => {
                if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
                tooltipTimer = setTimeout(() => {
                    descTooltip.textContent = roleInfo.desc || '';
                    const rect = roleIcon.getBoundingClientRect();
                    descTooltip.style.top = `${rect.top + window.scrollY + rect.height / 2 - 28}px`;
                    descTooltip.style.left = `${rect.right + 14}px`;
                    descTooltip.style.display = 'block';
                }, 1000);
            });
            roleIcon.addEventListener('mouseleave', () => {
                if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
                hideTimer = setTimeout(() => {
                    descTooltip.style.display = 'none';
                }, 300);
            });
        }
    });

    // 渲染所有玩家手牌
    const allHands = players.map(p => p.hand || []);
    renderAllHands(allHands, footer);
}
