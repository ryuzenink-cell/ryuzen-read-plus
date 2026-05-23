(() => {
  const root = document.querySelector('[data-install-app]');

  const installButton = root?.querySelector('[data-install-button]');
  const iosHelp = root?.querySelector('[data-ios-install-help]');
  const iosClose = root?.querySelector('[data-ios-install-close]');
  const updateBanner = root?.querySelector('[data-pwa-update]');
  const updateButton = root?.querySelector('[data-pwa-update-button]');
  let deferredPrompt;
  let waitingWorker;

  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);

  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((registration) => {
        if (registration.waiting) showUpdate(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker);
          });
        });
      }).catch(() => {
        // O site permanece funcional mesmo que o registro seja bloqueado.
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  function showUpdate(worker) {
    waitingWorker = worker;
    if (updateBanner) updateBanner.hidden = false;
  }

  if (!root) return;

  if (updateButton) {
    updateButton.addEventListener('click', () => {
      if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (!standalone && installButton) installButton.hidden = false;
  });

  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      installButton.hidden = true;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = undefined;
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = undefined;
    if (installButton) installButton.hidden = true;
    if (iosHelp) iosHelp.hidden = true;
  });

  if (isIOS && isSafari && !standalone && iosHelp) {
    try {
      if (!localStorage.getItem('rrp-ios-install-dismissed')) iosHelp.hidden = false;
    } catch {
      iosHelp.hidden = false;
    }
  }

  if (iosClose) {
    iosClose.addEventListener('click', () => {
      if (iosHelp) iosHelp.hidden = true;
      try { localStorage.setItem('rrp-ios-install-dismissed', '1'); } catch { /* noop */ }
    });
  }
})();
