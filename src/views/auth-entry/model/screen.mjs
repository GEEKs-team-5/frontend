export const getNextScreen = (screen, action) => {
  if (screen === 'splash' && action === 'splash-timeout') return 'start';
  if (screen === 'start' && action === 'open-signin') return 'signin';
  if (screen === 'signin' && action === 'go-back') return 'start';

  return screen;
};
