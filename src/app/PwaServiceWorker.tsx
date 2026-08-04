'use client';

import { useEffect } from 'react';

const PwaServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return null;
};

export default PwaServiceWorker;
