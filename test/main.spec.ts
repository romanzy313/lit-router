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
  expect(page.locator(`lit-router:has-text("${pageContent}")`)).resolves;
}

test('test', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Lit Router example');

  expect(page.locator('lit-router:has-text("index page")')).resolves;

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
  expect(page.locator("lit-router:has-text('Will never render')")).rejects;

  await testLink(page, 'Admin page', '#/admin', 'You have no access to /admin');

  // now do manual page navigation

  await page.goto('#/remote-component/manual');
  expect(page.locator(`lit-router:has-text("Hello, manual")`)).resolves;

  //test the hash router

  await page.goBack();
  expect(page.locator(`lit-router:has-text("You have no access to /admin")`))
    .resolves;

  await page.goForward();
  expect(page.locator(`lit-router:has-text("Hello, manual")`)).resolves;
});
