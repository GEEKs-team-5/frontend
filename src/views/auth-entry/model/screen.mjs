export const getNextScreen = (screen, action) => {
  if (screen === 'splash' && action === 'splash-timeout') return 'start';
  if (screen === 'start' && action === 'open-signin') return 'signin';
  if (screen === 'signin' && action === 'go-back') return 'start';
  if (screen === 'start' && action === 'open-signup') return 'signup-email';
  if (screen === 'signin' && action === 'open-signup') return 'signup-email';
  if (screen === 'signup-email' && action === 'next') return 'signup-password';
  if (screen === 'signup-password' && action === 'next') return 'signup-role';
  if (screen === 'signup-role' && action === 'select-guardian') return 'signup-profile';
  if (screen === 'signup-role' && action === 'select-patient') return 'signup-profile';
  if (screen === 'signup-profile' && action === 'register-guardian') return 'signup-invite';
  if (screen === 'signup-profile' && action === 'register-patient') return 'signup-patient';
  if (screen === 'signup-patient' && action === 'complete') return 'start';
  if (screen === 'signup-email' && action === 'go-back') return 'start';
  if (screen === 'signup-password' && action === 'go-back') return 'signup-email';
  if (screen === 'signup-role' && action === 'go-back') return 'signup-password';
  if (screen === 'signup-patient' && action === 'go-back') return 'signup-profile';
  if (screen === 'signup-profile' && action === 'go-back') return 'signup-role';
  if (screen === 'signup-invite' && action === 'go-back') return 'signup-profile';

  return screen;
};
