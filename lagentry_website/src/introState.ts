// Persistent state via localStorage + Memory flag for SPA navigation + Reload detection

const INTRO_STORAGE_KEY = 'lagentry_intro_completed';
let playedInCurrentDocument = false; // Memory flag: resets on reload/close, persists during route changes

export const markIntroCompleted = () => {
  playedInCurrentDocument = true;
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, 'true');
  } catch (e) {
    (window as any).__introCompleted = true;
  }
};

export const hasIntroCompleted = () => {
  // 1. If we already played it since the last page load/refresh, NEVER play it again
  // regardless of navigation type or storage. This fixes the issue where
  // navigating back to Home after a Refresh would re-trigger it.
  if (playedInCurrentDocument) return true;

  try {
    // 2. If it's a Hard Reload, we WANT to play it (return false),
    // unless step 1 already caught it (which it won't on first render after reload).
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
      return false;
    }

    // 3. Otherwise, check if user has ever seen it in previous sessions
    return localStorage.getItem(INTRO_STORAGE_KEY) === 'true' || (window as any).__introCompleted === true;
  } catch (e) {
    return (window as any).__introCompleted === true;
  }
};


