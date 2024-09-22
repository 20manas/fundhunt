export const runAfterPaint = (callback: () => unknown) => requestAnimationFrame(() => setTimeout(callback));
