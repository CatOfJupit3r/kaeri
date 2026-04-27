import { type Page, expect } from '@playwright/test';

import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  private readonly pageHeading = this.page.getByRole('heading', { name: /my projects/i });
  private readonly createProjectButton = this.page.getByTestId('create-series-button');
  private readonly emptyState = this.page.getByTestId('empty-series');
  private readonly seriesGrid = this.page.getByTestId('series-grid');
  private readonly createProjectDialog = this.page.getByRole('dialog', { name: /create new project/i });
  private readonly userMenuContent = this.page.locator('[data-slot="dropdown-menu-content"]');
  private readonly signOutMenuItem = this.page.getByRole('menuitem', { name: /sign out/i });

  constructor(page: Page) {
    super(page);
  }

  private getSeriesCard(title: string) {
    return this.page.getByTestId('series-card').filter({
      has: this.page.getByRole('heading', { name: title, exact: true }),
    });
  }

  async navigateToDashboard() {
    await this.goto('/dashboard');
    await this.expectLoaded();
  }

  async expectLoaded() {
    await this.waitForSkeleton();
    await expect(this.pageHeading).toBeVisible({ timeout: 10_000 });
    await this.expectAuthenticatedUI();
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible({ timeout: 10_000 });
  }

  async createProject(title: string) {
    const triggers = [this.createProjectButton.first(), this.createProjectButton.last()];

    for (const trigger of triggers) {
      await this.page.waitForTimeout(1_000);
      await trigger.click({ force: true });

      if (await this.createProjectDialog.isVisible({ timeout: 1_500 }).catch(() => false)) {
        break;
      }
    }

    if (!(await this.createProjectDialog.isVisible({ timeout: 1_000 }).catch(() => false))) {
      await this.page.keyboard.press('Control+N');
    }

    await this.waitForDialog();
    await this.page.getByLabel(/^title$/i).fill(title);
    await this.page.getByRole('button', { name: /^create project$/i }).click();
    await this.waitForDialogClose();
    await this.expectProjectVisible(title);
  }

  async expectProjectVisible(title: string) {
    const card = this.getSeriesCard(title);
    await expect(this.seriesGrid.or(this.emptyState)).toBeVisible({ timeout: 10_000 });
    await expect(card).toBeVisible({ timeout: 10_000 });
  }

  async expectProjectNotVisible(title: string) {
    await expect(this.getSeriesCard(title)).toHaveCount(0, { timeout: 10_000 });
  }

  async deleteProject(title: string) {
    const card = this.getSeriesCard(title);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await card.getByTestId('series-card-menu').click();
    await this.page.getByRole('menuitem', { name: /^delete$/i }).click();
    await this.waitForDialog();
    await this.page.getByRole('button', { name: /^delete$/i }).click();
    await this.waitForDialogClose();
    await this.expectProjectNotVisible(title);
  }

  async signOut() {
    const userMenuTrigger = this.getUserMenuTrigger();

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.page.waitForTimeout(500);
      await userMenuTrigger.click({ force: true });

      if (await this.userMenuContent.isVisible({ timeout: 1_000 }).catch(() => false)) {
        break;
      }

      await userMenuTrigger.press('Enter').catch(() => null);
      if (await this.userMenuContent.isVisible({ timeout: 1_000 }).catch(() => false)) {
        break;
      }

      if (attempt === 3) {
        await expect(this.userMenuContent).toBeVisible({ timeout: 5_000 });
      }
    }

    await expect(this.signOutMenuItem).toBeVisible({ timeout: 5_000 });
    await this.signOutMenuItem.click({ force: true });
    await expect(this.page).toHaveURL(/\/auth/, { timeout: 10_000 });
  }
}
