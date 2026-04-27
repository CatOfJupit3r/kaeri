import { test } from '../fixtures/base.fixture';

test.describe('Dashboard', () => {
  test('shows the authenticated dashboard entry state', async ({ dashboardPage }) => {
    await dashboardPage.navigateToDashboard();
    await dashboardPage.expectEmptyState();
  });
});
