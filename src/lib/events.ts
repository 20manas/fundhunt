export const runAfterPaint = (callback: () => unknown) => requestAnimationFrame(() => setTimeout(callback));

export const waitForPaint = () =>
  new Promise(resolve => {
    requestAnimationFrame(() => setTimeout(resolve));
  });
