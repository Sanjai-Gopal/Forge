export const THEME_STORAGE_KEY = "forge-theme";

export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var isDark = stored === 'dark' || (!stored && mql.matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;
