/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect, Page } from '@playwright/test';
import { assert } from 'console';

async function testLink(
  page: Page,
  linkText: string,
  url: string,
  pageContent: string
) {
  await page.locator(`a:has-text("${linkText}")`).click();
  await expect(page).toHaveURL(url);
  await expect(page.locator(`lit-router >> div`)).toHaveText(pageContent);
}

test('main test', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Lit Router example');

  // Error here
  await expect(page.locator(`lit-router >> div`)).toHaveText('index page');

  await testLink(page, 'Test', '#/test', 'test page');
  await testLink(
    page,
    'Parameters',
    '#/remote-component/lit-router',
    'Hello, lit-router'
  );
  await testLink(
    page,
    'Not found',
    '#/not-found',
    'Page "/not-found" is not found'
  );
  await testLink(
    page,
    'Resolve Error',
    '#/resolve-error',
    'Unhandled route error in /resolve-error. Error message: resolve error'
  );
  await expect(page.locator(`lit-router >> div`)).not.toHaveText(
    'Will never render'
  );

  await testLink(page, 'Admin page', '#/admin', 'You have no access to /admin');

  // now do manual page navigation

  await page.goto('#/remote-component/manual');

  await expect(page.locator(`lit-router >> div`)).toHaveText('Hello, manual');

  await page.goBack();

  await expect(page.locator(`lit-router >> div`)).toHaveText(
    'You have no access to /admin'
  );
  await page.goForward();

  await expect(page.locator(`lit-router >> div`)).toHaveText('Hello, manual');
});

test('can start on a non-index hash', async ({ page }) => {
  await page.goto('#/test');

  await expect(page).toHaveTitle('Lit Router example');

  expect(page.locator('lit-router:has-text("test page")')).resolves;
});
