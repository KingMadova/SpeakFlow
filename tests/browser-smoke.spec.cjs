const { test, expect } = require('@playwright/test');

test('library opens and a scene without configured video reports media unavailable', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/?autostart=1');

  await expect(page.getByText('Everyday Conversation').first()).toBeVisible();
  await page.getByText('Everyday Conversation').first().click();

  await expect(page.getByText('Vidéo indisponible')).toBeVisible();
  await expect(
    page.getByText('Cette scène ne peut pas être synchronisée tant qu’une vidéo adaptée n’est pas configurée.')
  ).toBeVisible();
});
