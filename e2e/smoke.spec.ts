import { expect, test, type Page } from '@playwright/test';

/**
 * Collects console errors, uncaught exceptions, CSP violations and failed non-API requests.
 * The API isn't running in smoke tests, so its (expected) 404s are ignored.
 */
function watchForErrors(page: Page): string[] {
  const errors: string[] = [];
  const isApi = (url: string) => new URL(url, 'http://x').pathname.startsWith('/api/');
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !isApi(m.location().url || '/')) errors.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && !isApi(r.url())) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

/** Stand-in for Cloudflare Turnstile: hands the form a token immediately, no network. */
async function stubTurnstile(page: Page) {
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.turnstile = {
        render: (el, opts) => { setTimeout(() => opts.callback('e2e-token'), 0); return 'w1'; },
        reset: () => {}, remove: () => {},
      };`,
    }),
  );
}

test.describe('public site', () => {
  test('home page renders the pre-rendered content without errors', async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Coral');
    await expect(page).toHaveTitle(/Coral Bareket/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\.png$/);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    for (const id of ['stack', 'experience', 'about', 'contact']) {
      await expect(page.locator(`section#${id}`)).toBeAttached();
    }
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  test('keyboard users can skip straight to the content', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard navigation is a desktop concern');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('contact form validates, then sends', async ({ page }) => {
    const errors = watchForErrors(page);
    await stubTurnstile(page);
    let sent: Record<string, string> | null = null;
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON() as Record<string, string>;
      await route.fulfill({ status: 201, json: { ok: true } });
    });

    await page.goto('/#contact');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true');

    await page.getByLabel('Name', { exact: true }).fill('Smoke Test');
    await page.getByLabel('Email', { exact: true }).fill('smoke@example.com');
    await page.getByLabel('Message', { exact: true }).fill('Hello from the Playwright smoke test.');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByRole('status')).toContainText('Thanks');
    expect(sent).toMatchObject({
      name: 'Smoke Test',
      email: 'smoke@example.com',
      turnstileToken: 'e2e-token',
    });
    expect(errors).toEqual([]);
  });

  test('unknown project slugs get the loading shell, unknown pages a 404', async ({ page }) => {
    await page.goto('/projects/not-published-yet');
    await expect(page.getByText(/Project not found|Loading project/)).toBeVisible();
    const res = await page.goto('/definitely-not-a-page');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /doesn't exist/ })).toBeVisible();
  });
});

test.describe('admin', () => {
  test('is private: shows sign-in (or the setup notice) and is not indexed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(
      page
        .getByRole('button', { name: 'Sign in with Google' })
        .or(page.getByText("Firebase isn't configured")),
    ).toBeVisible();
  });
});
