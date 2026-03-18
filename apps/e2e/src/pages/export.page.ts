import { type Download, type Page, expect } from "@playwright/test";

import { BasePage } from "./base.page";

type ExportFormat = "pdf" | "fdx" | "fountain";

export class ExportPage extends BasePage {
  // Locators
  private readonly exportButton = this.page.locator(
    'button:has-text("Export")',
  );
  private readonly exportMenu = this.page.locator(
    '[data-testid="export-menu"]',
  );
  private readonly formatOption = (format: ExportFormat) =>
    this.exportMenu.locator(`[data-export-format="${format}"]`);
  private readonly exportDialog = this.page.locator(
    '[role="dialog"][data-testid="export-dialog"]',
  );
  private readonly exportProgress = this.page.locator(
    '[data-testid="export-progress"]',
  );
  private readonly downloadButton = this.page.locator(
    'button:has-text("Download")',
  );

  constructor(page: Page) {
    super(page);
  }

  // Actions
  async openExportMenu(): Promise<void> {
    await this.exportButton.click();
    await expect(this.exportMenu).toBeVisible();
  }

  async selectFormat(format: ExportFormat): Promise<void> {
    await this.formatOption(format).click();
  }

  async waitForExportComplete(timeout = 30000): Promise<void> {
    // Wait for progress to appear and then disappear
    await this.exportProgress
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(() => {});
    await this.exportProgress.waitFor({ state: "detached", timeout });
  }

  async exportToPdf(): Promise<Download> {
    // Start waiting for download before triggering export
    const downloadPromise = this.page.waitForEvent("download", {
      timeout: 30000,
    });

    await this.openExportMenu();
    await this.selectFormat("pdf");
    await this.waitForExportComplete();

    // If there's a download button, click it
    if (await this.downloadButton.isVisible()) {
      await this.downloadButton.click();
    }

    return downloadPromise;
  }

  async exportToFdx(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent("download", {
      timeout: 30000,
    });

    await this.openExportMenu();
    await this.selectFormat("fdx");
    await this.waitForExportComplete();

    if (await this.downloadButton.isVisible()) {
      await this.downloadButton.click();
    }

    return downloadPromise;
  }

  async exportToFountain(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent("download", {
      timeout: 30000,
    });

    await this.openExportMenu();
    await this.selectFormat("fountain");
    await this.waitForExportComplete();

    if (await this.downloadButton.isVisible()) {
      await this.downloadButton.click();
    }

    return downloadPromise;
  }

  // Assertions
  async expectExportMenuVisible(): Promise<void> {
    await expect(this.exportMenu).toBeVisible();
  }

  async expectExportDialogVisible(): Promise<void> {
    await expect(this.exportDialog).toBeVisible();
  }

  async expectDownloadStarted(
    download: Download,
    expectedFilename?: string | RegExp,
  ): Promise<void> {
    const filename = download.suggestedFilename();

    if (expectedFilename) {
      if (typeof expectedFilename === "string") {
        expect(filename).toContain(expectedFilename);
      } else {
        expect(filename).toMatch(expectedFilename);
      }
    }
  }

  /**
   * Helper to verify downloaded file size is reasonable
   */
  async expectDownloadSize(download: Download, minBytes = 1000): Promise<void> {
    const path = await download.path();
    if (path) {
      const fs = await import("node:fs/promises");
      const stats = await fs.stat(path);
      expect(stats.size).toBeGreaterThan(minBytes);
    }
  }
}
