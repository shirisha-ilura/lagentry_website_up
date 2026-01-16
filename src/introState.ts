// Simple module-level state to track whether the landing intro has completed.
// This resets on full page reload, but persists while navigating between routes.

let introCompleted = false;

export const markIntroCompleted = () => {
  introCompleted = true;
};

export const hasIntroCompleted = () => introCompleted;


