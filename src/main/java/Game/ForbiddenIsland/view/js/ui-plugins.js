/* ui-plugins.js */
(function (window, document) {
    /**
     * 设置面板切换插件
     * options: { iconSelector, panelSelector, activeClass }
     */
    function initSettingsToggle(options = {}) {
        const icon = document.querySelector(options.iconSelector || '#settings-icon');
        const panel = document.querySelector(options.panelSelector || '#settings-panel');
        const activeClass = options.activeClass || 'show';
        if (!icon || !panel) return;
        icon.addEventListener('click', () => {
            panel.classList.toggle(activeClass);
        });
    }

    /**
     * 昼夜模式切换插件
     * options: { toggleSelector, iconSelector, themeAttr }
     */
    function initThemeToggle(options = {}) {
        const toggle = document.querySelector(options.toggleSelector || '#theme-toggle');
        const icon = document.querySelector(options.iconSelector || '#theme-icon');
        const themeAttr = options.themeAttr || 'data-theme';
        if (!toggle || !icon) return;
        toggle.addEventListener('click', () => {
            const html = document.documentElement;
            const current = html.getAttribute(themeAttr) || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute(themeAttr, next);
            icon.textContent = next === 'dark' ? '🌙' : '🌞';
        });
    }

    // Expose to global
    window.initSettingsToggle = initSettingsToggle;
    window.initThemeToggle = initThemeToggle;
})(window, document);
