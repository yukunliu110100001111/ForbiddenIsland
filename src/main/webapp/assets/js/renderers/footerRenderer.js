import { ROLE_INFO } from '../constants/roleInfo.js';
import { cardHtml }  from '../constants/cardIcons.js';

export function renderFooter(players,myIdx,curIdx,footer){
    const blocks = footer.querySelectorAll('.player');
    const ordered = players.filter(p=>p.playerIndex!==myIdx)
        .concat(players.find(p=>p.playerIndex===myIdx));
    blocks.forEach((div,i)=>{
        if(i<ordered.length){
            const p = ordered[i];
            const info = ROLE_INFO[p.type];
            div.style.display='';
            div.classList.toggle('me',   p.playerIndex===myIdx);
            div.classList.toggle('active-player',p.playerIndex===curIdx);
            div.querySelector('.avatar').innerHTML =
                `<div class="role-icon" style="background:${info.color}">
            <img src="${info.img}" alt="${info.name}">
         </div>
         <div class="role-label">${info.name}</div>`;
            div.querySelector('.hand').innerHTML =
                p.hand.length ? p.hand.map(cardHtml).join('') : '<div class="hand-empty">No Cards</div>';
        }else div.style.display='none';
    });
}
