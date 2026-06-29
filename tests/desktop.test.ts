import { test, expect } from 'playwright/test'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  page.on('dialog', dialog => dialog.accept())
  await page.goto('/')
  await page.evaluate(() => localStorage.removeItem('a2key_v3'))
  await page.reload()
})

async function startTest(page: import('playwright/test').Page) {
  await page.getByRole('button', { name: 'Start test' }).click()
  // PartNavBar shows all 7 tabs — "Part 7" visible only on desktop
  await expect(page.getByText('Part 7', { exact: true }).first()).toBeVisible({ timeout: 10_000 })
}

async function navNext(page: import('playwright/test').Page) {
  await page.getByRole('button', { name: /^Next/ }).click()
}

async function goToResults(page: import('playwright/test').Page) {
  await startTest(page)
  for (let i = 0; i < 6; i++) await navNext(page)
  await page.getByRole('button', { name: /Submit/ }).click()
  await page.getByRole('button', { name: 'Submit anyway' }).click()
  await expect(page.getByText('Your results')).toBeVisible()
}

// ── Layout ────────────────────────────────────────────────────────────────────

test('desktop: all 7 part tabs visible simultaneously in PartNavBar', async ({ page }) => {
  await startTest(page)
  for (let i = 1; i <= 7; i++) {
    await expect(page.getByText(`Part ${i}`, { exact: true }).first()).toBeVisible()
  }
})

test('desktop: mobile "Part X of 7" center text is not shown', async ({ page }) => {
  await startTest(page)
  // Mobile footer renders "Part 1 of 7" as visible text; desktop does not
  await expect(page.getByText('Part 1 of 7')).not.toBeVisible()
})

test('desktop: PartNavBar has correct aria-label for active part', async ({ page }) => {
  await startTest(page)
  await expect(page.locator('[aria-label="Part 1 of 7"]')).toBeVisible()
})

// ── Navigation ────────────────────────────────────────────────────────────────

test('desktop: clicking a part tab navigates directly to that part', async ({ page }) => {
  await startTest(page)
  await page.getByText('Part 4', { exact: true }).first().click()
  await expect(page.locator('[aria-label="Part 4 of 7"]')).toBeVisible()
})

test('desktop: Next button advances through all 7 parts', async ({ page }) => {
  await startTest(page)
  for (let part = 1; part < 7; part++) {
    await navNext(page)
    await expect(page.locator(`[aria-label="Part ${part + 1} of 7"]`)).toBeVisible()
  }
})

test('desktop: Back button returns to previous part', async ({ page }) => {
  await startTest(page)
  await navNext(page)
  await expect(page.locator('[aria-label="Part 2 of 7"]')).toBeVisible()
  await page.getByRole('button', { name: /Back/ }).click()
  await expect(page.locator('[aria-label="Part 1 of 7"]')).toBeVisible()
})

// ── Part 4 inline selects ─────────────────────────────────────────────────────

test('desktop: Part 4 inline selects appear in passage', async ({ page }) => {
  await startTest(page)
  await page.getByText('Part 4', { exact: true }).first().click()
  const selects = page.locator('select')
  await expect(selects.first()).toBeVisible()
  expect(await selects.count()).toBeGreaterThanOrEqual(1)
})

test('desktop: selecting a Part 4 option records answer in localStorage', async ({ page }) => {
  await startTest(page)
  await page.getByText('Part 4', { exact: true }).first().click()
  await page.locator('select').first().selectOption({ index: 1 })
  const stored = await page.evaluate(() => localStorage.getItem('a2key_v3'))
  const state = JSON.parse(stored!)
  expect(Object.keys(state.answers).length).toBeGreaterThan(0)
})

// ── Part 5 inline inputs ──────────────────────────────────────────────────────

test('desktop: Part 5 inline inputs appear in passage', async ({ page }) => {
  await startTest(page)
  await page.getByText('Part 5', { exact: true }).first().click()
  const inputs = page.locator('input[type="text"]')
  await expect(inputs.first()).toBeVisible()
  expect(await inputs.count()).toBeGreaterThanOrEqual(1)
})

test('desktop: typing in a Part 5 input records text in localStorage', async ({ page }) => {
  await startTest(page)
  await page.getByText('Part 5', { exact: true }).first().click()
  await page.locator('input[type="text"]').first().fill('the')
  const stored = await page.evaluate(() => localStorage.getItem('a2key_v3'))
  const state = JSON.parse(stored!)
  expect(state.text[0]).toBe('the')
})

// ── Chip completion ───────────────────────────────────────────────────────────

test('desktop: answering Part 1 question updates localStorage answers', async ({ page }) => {
  await startTest(page)
  await page.getByRole('button', { name: /^A/ }).first().click()
  const stored = await page.evaluate(() => localStorage.getItem('a2key_v3'))
  const state = JSON.parse(stored!)
  expect(Object.keys(state.answers).length).toBeGreaterThan(0)
})

// ── Submit with incomplete warning ────────────────────────────────────────────

test('desktop: submitting with incomplete questions triggers warning dialog', async ({ page }) => {
  // dialog auto-accepted via beforeEach; this verifies the flow completes
  await startTest(page)
  for (let i = 0; i < 6; i++) await navNext(page)
  await page.getByRole('button', { name: /Submit/ }).click()
  // Native <dialog> warning appears — verify it, then dismiss
  await expect(page.getByRole('button', { name: 'Submit anyway' })).toBeVisible()
  await page.getByRole('button', { name: 'Submit anyway' }).click()
  // Submit anyway goes directly to results (no extra confirm step)
  await expect(page.getByText('Your results')).toBeVisible()
})

// ── Review mode ───────────────────────────────────────────────────────────────

test('desktop: review mode shows "Reviewing" prefix in PartNavBar', async ({ page }) => {
  await goToResults(page)
  await page.getByRole('button', { name: 'Review answers' }).click()
  await expect(page.locator('[aria-label="Reviewing · Part 1 of 7"]')).toBeVisible()
})

test('desktop: review mode navigates all 7 parts and returns to results', async ({ page }) => {
  await goToResults(page)
  await page.getByRole('button', { name: 'Review answers' }).click()
  for (let part = 1; part < 7; part++) {
    await navNext(page)
    await expect(page.locator(`[aria-label="Reviewing · Part ${part + 1} of 7"]`)).toBeVisible()
  }
  await page.getByRole('button', { name: /Results/ }).click()
  await expect(page.getByText('Your results')).toBeVisible()
})

// ── Restart PIN modal ─────────────────────────────────────────────────────────

test('desktop: Restart exam button opens PIN modal', async ({ page }) => {
  await goToResults(page)
  await page.getByRole('button', { name: 'Restart exam' }).click()
  await expect(page.getByPlaceholder("Teacher's code")).toBeVisible()
})

test('desktop: wrong PIN shows error and stays on results', async ({ page }) => {
  await goToResults(page)
  await page.getByRole('button', { name: 'Restart exam' }).click()
  await page.getByPlaceholder("Teacher's code").fill('0000')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText('Incorrect code — try again')).toBeVisible()
  await expect(page.getByText('Your results')).toBeVisible()
})

test('desktop: correct PIN restarts to intro screen', async ({ page }) => {
  await goToResults(page)
  await page.getByRole('button', { name: 'Restart exam' }).click()
  await page.getByPlaceholder("Teacher's code").fill('1235')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByRole('button', { name: 'Start test' })).toBeVisible()
})

test('desktop: Cancel closes PIN modal without restarting', async ({ page }) => {
  await goToResults(page)
  await page.getByRole('button', { name: 'Restart exam' }).click()
  await expect(page.getByPlaceholder("Teacher's code")).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByPlaceholder("Teacher's code")).not.toBeVisible()
  await expect(page.getByText('Your results')).toBeVisible()
})
