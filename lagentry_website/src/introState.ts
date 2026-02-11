// Persistent state to track whether the landing intro has completed.
// We use localStorage so it stays completed even after closing the tab.
// However, we check the navigation type to allow it to play again if the user Refreshes.

const INTRO_STORAGE_KEY = 'lagentry_intro_completed';

export const markIntroCompleted = () => {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, 'true');
  } catch (e) {
    (window as any).__introCompleted = true;
  }
};

export const hasIntroCompleted = () => {
  try {
    // Check if the page was reloaded (Refreshed)
    // If it's a reload, we want to play the animation again.
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
      return false;
    }

    return localStorage.getItem(INTRO_STORAGE_KEY) === 'true' || (window as any).__introCompleted === true;
  } catch (e) {
    return (window as any).__introCompleted === true;
  }
};


