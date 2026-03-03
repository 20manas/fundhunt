export const clickOutside = (element: Element, callback: () => unknown) => {
  const onClick = (event: MouseEvent) => {
    if (!element.contains(event.target as Node)) {
      callback();
    }
  };

  document.body.addEventListener('click', onClick);

  return {
    update: (newCallbackFunction: () => unknown) => {
      callback = newCallbackFunction;
    },
    destroy: () => {
      document.body.removeEventListener('click', onClick);
    },
  };
};
