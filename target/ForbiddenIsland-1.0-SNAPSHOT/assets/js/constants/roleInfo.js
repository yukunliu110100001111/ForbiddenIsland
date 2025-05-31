/**
 * roleInfo.js
 * Constant mapping: Information for the six Forbidden Island roles.
 * Used for displaying role details, images, and color codes in the UI.
 */
export const ROLE_INFO = {
    ENGINEER: {
        name: 'Engineer',
        desc: 'Shore up two tiles for one action.',
        img: 'assets/Images/Cards/roles/engineer.png',
        color: '#e65c00'
    },
    PILOT: {
        name: 'Pilot',
        desc: 'Fly to any tile once per turn.',
        img: 'assets/Images/Cards/roles/pilot.png',
        color: '#a0ccf8'
    },
    DIVER: {
        name: 'Diver',
        desc: 'Move through any number of adjacent flooded/missing tiles for one action.',
        img: 'assets/Images/Cards/roles/diver.png',
        color: '#2a4274'
    },
    EXPLORER: {
        name: 'Explorer',
        desc: 'Move and shore up diagonally.',
        img: 'assets/Images/Cards/roles/explorer.png',
        color: '#32925b'
    },
    MESSENGER: {
        name: 'Messenger',
        desc: 'Give cards to any player on the island for one action per card.',
        img: 'assets/Images/Cards/roles/messenger.png',
        color: '#bfc600'
    },
    NAVIGATOR: {
        name: 'Navigator',
        desc: 'Move other players up to 2 adjacent tiles per action.',
        img: 'assets/Images/Cards/roles/navigator.png',
        color: '#9b59b6'
    }
};
