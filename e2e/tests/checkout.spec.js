import { test, expect } from '@playwright/test';
import { cartButton } from './helpers.js';

const PRODUCT = '/en/products/court-low-sneaker'; // $139, standard shipping $9 under the $150 free-shipping threshold

async function addSneakerToCart(page) {
  await page.goto(PRODUCT);
  await page.getByRole('radio', { name: '42', exact: true }).first().click();
  await page.getByRole('button', { name: /^add to cart$/i }).first().click();
  await expect(cartButton(page)).toHaveAccessibleName('Cart (1)');
}

// Errors clear asynchronously as fields are corrected; wait for that so the layout is stable before clicking.
const noErrors = (page) => expect(page.locator('form [role="alert"]')).toHaveCount(0);

const summaryRow = (page, label) =>
  page.getByRole('complementary', { name: 'Order summary' }).locator('div', { has: page.locator('dt').getByText(label, { exact: true }) }).locator('dd').first();

test.describe('Cart & checkout flow', () => {
  test('add to cart updates the header count and the cart page totals', async ({ page }) => {
    await page.goto(PRODUCT);
    await expect(cartButton(page)).toHaveAccessibleName('Cart (0)');
    await addSneakerToCart(page);

    await page.goto('/en/cart');
    await expect(page.getByText('1 items')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Court Low Sneaker' }).first()).toBeVisible();
    await expect(summaryRow(page, 'Subtotal')).toHaveText('$139');
    await expect(summaryRow(page, 'Shipping (estimate)')).toHaveText('$9');
    await expect(summaryRow(page, 'Total')).toHaveText('$148');

    // a second unit crosses the free-shipping threshold
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(cartButton(page)).toHaveAccessibleName('Cart (2)');
    await expect(summaryRow(page, 'Subtotal')).toHaveText('$278');
    await expect(summaryRow(page, 'Shipping (estimate)')).toHaveText('Free');
    await expect(summaryRow(page, 'Total')).toHaveText('$278');

    // an invalid code is rejected with a message
    await page.getByLabel('Discount code').fill('NOPE');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText('That code isn’t valid.')).toBeVisible();
    await expect(summaryRow(page, 'Total')).toHaveText('$278');

    // demo discount code: VANTA10 = 10% off the subtotal
    await page.getByLabel('Discount code').fill('VANTA10');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(summaryRow(page, 'Discount (VANTA10)')).toHaveText('−$27.80');
    await expect(summaryRow(page, 'Total')).toHaveText('$250.20');
  });

  test('checkout validates each step with Zod and places a demo order', async ({ page }) => {
    await addSneakerToCart(page);
    await page.goto('/en/checkout');
    await expect(page.getByRole('heading', { level: 2, name: 'Contact' })).toBeVisible();

    // Step 1: submitting empty fields shows inline, accessible errors
    await page.getByRole('button', { name: 'Continue' }).click();
    const email = page.getByLabel('Email', { exact: true });
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#e-email')).toHaveText('This field is required.');
    await expect(page.locator('#e-firstName')).toHaveText('This field is required.');

    await email.fill('not-an-email');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('#e-email')).toHaveText('Enter a valid email address.');

    await email.fill('qa@example.com');
    await page.getByLabel('First name').fill('Test');
    await page.getByLabel('Last name').fill('Buyer');
    await page.getByLabel(/^Phone/).fill('abc');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('#e-phone')).toHaveText('Use digits, spaces, + ( ) or - only.');
    await page.getByLabel(/^Phone/).fill('+1 (555) 010-0000');
    await noErrors(page);
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: shipping address
    await expect(page.getByRole('heading', { level: 2, name: 'Shipping address' })).toBeVisible();
    await page.getByLabel('Address', { exact: true }).fill('12');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('#e-address1')).toHaveText('Enter your full address.');
    await page.getByLabel('Address', { exact: true }).fill('221 Demo Street');
    await page.getByLabel('City').fill('Springfield');
    await page.getByLabel('Postal code').fill('12345');
    await noErrors(page);
    await page.getByRole('button', { name: 'Continue' }).click();

    // Steps 3–4: delivery and payment (defaults), then review
    await expect(page.getByRole('heading', { level: 2, name: 'Delivery' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Payment' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Review' })).toBeVisible();
    await expect(page.getByText('Test Buyer · qa@example.com')).toBeVisible();

    // Place the order: the server re-prices it and the app redirects to the confirmation page
    await page.getByRole('button', { name: 'Place demo order' }).click();
    await expect(page).toHaveURL(/\/en\/order-confirmation\?id=/);
    await expect(page.getByRole('heading', { level: 1, name: 'Demo order placed' })).toBeVisible();
    await expect(page.getByText('This is a demo confirmation for qa@example.com.')).toBeVisible();
    await expect(cartButton(page)).toHaveAccessibleName('Cart (0)');
  });
});
