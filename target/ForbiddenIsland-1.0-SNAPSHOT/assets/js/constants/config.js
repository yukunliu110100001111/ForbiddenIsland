// assets/js/constants/config.js

/**
 * BASE_HREF is the base path for loading static assets (e.g., images, CSS).
 * Automatically detects the <base> tag in the HTML if present, otherwise defaults to root "/".
 * Always ensures a trailing slash.
 */
export const BASE_HREF =
    document.querySelector('base')?.getAttribute('href')?.replace(/\/?$/, '/') || '/';
