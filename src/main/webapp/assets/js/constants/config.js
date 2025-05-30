// assets/js/constants/config.js
export const BASE_HREF =
    document.querySelector('base')?.getAttribute('href')?.replace(/\/?$/, '/') || '/';
