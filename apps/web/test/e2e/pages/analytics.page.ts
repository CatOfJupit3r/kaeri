import { type Page, expect } from '@playwright/test';

import { BasePage } from './base.page';

function escapeRegExp(value: string) {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class AnalyticsPage extends BasePage {
  private readonly pageHeading = this.page.getByRole('heading', { name: /^analytics$/i });

  constructor(page: Page) {
    super(page);
  }

  async navigateToAnalyticsFromCurrentSeries() {
    const match = /\/series\/([^/]+)/.exec(this.page.url());

    if (match == null) {
      throw new Error(`Cannot derive seriesId from current URL: ${this.page.url()}`);
    }

    await this.goto(`/series/${match[1]}/analytics`);
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.pageHeading).toBeVisible({ timeout: 10_000 });
    await expect(this.page.getByText('Overview of your series statistics and progress', { exact: false })).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectSectionVisible(title: string) {
    await expect(this.page.getByText(new RegExp(`^${escapeRegExp(title)}$`, 'i')).first()).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectSectionTextVisible(text: string) {
    await expect(this.page.getByText(text, { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  }
}
