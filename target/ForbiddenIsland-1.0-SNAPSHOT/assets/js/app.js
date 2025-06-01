// assets/js/app.js
import { bindPreGame } from './binders/preGameBinder.js';
import { bindInGame } from './binders/inGameBinder.js';

/**
 * Intercepts fetch requests to automatically capture playerIndex
 * and store it in sessionStorage for in-game use
 */
(function patchFetchForPlayerIndex() {
    const rawFetch = window.fetch;
    window.fetch = async (...args) => {
        const resp = await rawFetch(...args);
        try {
            // Clone response to avoid consuming the original body
            const clone = resp.clone();
            clone.json().then(data => {
                if (data && typeof data.playerIndex === 'number') {
                    sessionStorage.setItem('myPlayerIndex', String(data.playerIndex));
                    console.log('[playerIndex] set to', data.playerIndex);
                }
            }).catch(() => {/* Ignore non-JSON responses or parse errors */});
        } catch (e) {/* Ignore network errors or non-JSON responses */}
        return resp;
    };
})();

// Get context path from <base> tag (e.g. "/ForbiddenIsland_war_exploded/")
const contextPath = document.querySelector('base')?.getAttribute('href') || '';
// Expose context path for use in binder scripts
window.contextPath = contextPath;

const app = document.getElementById('app');
const blurBar = document.querySelector('.blur-bar');

/**
 * Controls the state transition of blur-bar (center banner ↔ fullscreen blur)
 * @param {string} view - Current view name
 */
function updateBlurBar(view) {
    const isCover = view === 'cover';
    requestAnimationFrame(() => {
        document.body.classList.toggle('cover', isCover);
    });
}

/** Applies exit animation to all cards (scale and fade out) */
function animateCardExit() {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('entering');
        card.classList.add('exiting');
    });
}

/**
 * Main view loading function
 * @param {string} view - View name: cover/lobby/creation/room/game
 * @param {boolean} push - Whether to push hash to history (default: true)
 */
async function loadView(view, push = true) {
    animateCardExit();

    if (push) window.location.hash = view;
    updateBlurBar(view);

    // Wait for exit animation to partially complete
    await new Promise(r => setTimeout(r, 300));

    // Determine HTML path based on view type
    let url;
    if (view === 'game') {
        // game.html is in page root
        url = `${contextPath}page/game.html`;
    } else {
        // Other views are in page/sub directory
        url = `${contextPath}page/sub/${view}.html`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load view: ${url} (${res.status})`);
    const html = await res.text();

    // Inject the view HTML
    app.innerHTML = html;

    // Apply enter animation
    requestAnimationFrame(() => {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('exiting');
            card.classList.add('entering');
        });
    });

    // Call appropriate binder based on view
    if (['cover', 'lobby', 'creation', 'room'].includes(view)) {
        bindPreGame(view);
    } else if (view === 'game') {
        bindInGame();
    }
}

// Handle hash changes for view navigation
window.addEventListener('hashchange', () => {
    const view = window.location.hash.slice(1) || 'cover';
    loadView(view, false);
});

// Initial page load
window.addEventListener('DOMContentLoaded', () => {
    const start = window.location.hash.slice(1) || 'cover';
    loadView(start, false);
});

export { loadView };
