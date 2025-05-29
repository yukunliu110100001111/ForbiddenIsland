/**
 * roleInfo.js
 * 常量：Forbidden Island 六种角色的信息映射
 */
export const ROLE_INFO = {
    ENGINEER: {
        name: 'Engineer',
        desc: 'Shore up two tiles for one action.',
        img: 'assets/roles/engineer.png',
        color: '#e65c00'
    },
    PILOT: {
        name: 'Pilot',
        desc: 'Fly to any tile once per turn.',
        img: 'assets/roles/pilot.png',
        color: '#0066cc'
    },
    DIVER: {
        name: 'Diver',
        desc: 'Move through any number of adjacent flooded/missing tiles for one action.',
        img: 'assets/roles/diver.png',
        color: '#2ecc71'
    },
    EXPLORER: {
        name: 'Explorer',
        desc: 'Move and shore up diagonally.',
        img: 'assets/roles/explorer.png',
        color: '#27ae60'
    },
    MESSENGER: {
        name: 'Messenger',
        desc: 'Give cards to any player on the island for one action per card.',
        img: 'assets/roles/messenger.png',
        color: '#bfc600'
    },
    NAVIGATOR: {
        name: 'Navigator',
        desc: 'Move other players up to 2 adjacent tiles per action.',
        img: 'assets/roles/navigator.png',
        color: '#9b59b6'
    }
};
