declare global {
  interface Window {
    __movieMashOfflineReady?: boolean;
  }
}

function uniqueUrls(urls: string[]) {
  return [...new Set(urls)];
}

function cacheUrls(controller: ServiceWorker, urls: string[]) {
  return new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      resolve();
    };
    controller.postMessage({ type: 'CACHE_URLS', urls: uniqueUrls(urls) }, [channel.port2]);
  });
}

export function registerServiceWorker(assetUrls: string[]) {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) {
    return;
  }

  const serviceWorkerUrl = `${import.meta.env.BASE_URL}sw.js`;

  void navigator.serviceWorker.register(serviceWorkerUrl).then(async () => {
    const registration = await navigator.serviceWorker.ready;
    const controller = registration.active ?? navigator.serviceWorker.controller;

    if (!controller) {
      return;
    }

    const resourceUrls = performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => url.startsWith(window.location.origin));

    const appUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href;
    await cacheUrls(controller, [appUrl, `${appUrl}index.html`, ...resourceUrls]);
    await cacheUrls(controller, assetUrls);
    window.__movieMashOfflineReady = true;
    window.dispatchEvent(new Event('movie-mash-offline-ready'));
  });
}
