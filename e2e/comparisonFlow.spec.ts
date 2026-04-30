import { expect, test } from '@playwright/test';

test('comparison flow reaches the ranking page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^Choose / }).first()).toBeVisible();
  await expect(page.getByLabel('Open ranking')).toBeHidden();

  await page.getByRole('button', { name: /^Choose / }).first().click();
  await expect(page.getByText('1 picks')).toBeVisible();

  await expect(page.getByLabel('Open ranking')).toBeVisible({ timeout: 6000 });
  await page.getByLabel('Open ranking').click();
  await expect(page.getByRole('heading', { name: 'Your ranking' })).toBeVisible();
  await expect(page.getByRole('listitem').first()).toBeVisible();
});

test('app remains usable after a loaded session goes offline', async ({ context, page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^Choose / }).first()).toBeVisible();

  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    await navigator.serviceWorker.ready;

    if (navigator.serviceWorker.controller) {
      return;
    }

    await new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
    });
  });
  await page.waitForFunction(() => {
    return (window as Window & { __movieMashOfflineReady?: boolean }).__movieMashOfflineReady === true;
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: /^Choose / }).first()).toBeVisible();
  await context.setOffline(false);
});
