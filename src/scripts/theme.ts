/**
 * Theme toggle logic — manages dark/light mode with localStorage + OS preference.
 * Designed to work with Astro View Transitions: re-initializes on every page swap.
 */

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function getStoredTheme(): string | null {
    return localStorage.getItem('theme');
}

function getEffectiveTheme(): string {
    return getStoredTheme() || 'dark';
}

function applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update all toggle button icons
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
        btn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    });
}

function initTheme(): void {
    // Apply the current theme (ensures correct state after View Transition)
    applyTheme(getEffectiveTheme());

    // Re-bind click handlers on fresh DOM elements
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
        // Remove old listener by cloning
        const fresh = btn.cloneNode(true);
        btn.parentNode?.replaceChild(fresh, btn);

        fresh.addEventListener('click', () => {
            const current = getEffectiveTheme();
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    });
}

// Set theme on the INCOMING document BEFORE the swap — prevents flash
document.addEventListener('astro:before-swap', (e: any) => {
    const theme = getEffectiveTheme();
    e.newDocument.documentElement.setAttribute('data-theme', theme);
});

// Run on every page load (initial + View Transitions)
document.addEventListener('astro:page-load', initTheme);

// Respond to OS theme changes when no stored preference
prefersDark.addEventListener('change', (e) => {
    if (!getStoredTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});
