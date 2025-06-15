export const runAfterPaint = (callback: () => unknown) => requestAnimationFrame(() => setTimeout(callback));

export const waitForPaint = () =>
  new Promise(resolve => {
    requestAnimationFrame(() => setTimeout(resolve));
  });

export const runOnIdle = (callback: () => unknown) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(callback) : runAfterPaint(callback);
