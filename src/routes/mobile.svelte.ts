const mql = window.matchMedia(`(max-width: 480px)`);

export const isMobileHook = () => {
  let isMobile = $state<boolean>(mql.matches);

  $effect(() => {
    const handler = () => {
      console.log('Mobile state changed');
      isMobile = mql.matches;
    };

    mql.addEventListener('change', handler);

    return () => {
      mql.removeEventListener('change', handler);
    };
  });

  // $inspect(isMobile);

  return isMobile;
};
