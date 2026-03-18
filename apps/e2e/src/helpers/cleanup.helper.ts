import { type APIRequestContext } from "@playwright/test";

/**
 * Cleanup utilities for test isolation
 */
export class CleanupHelper {
  private cleanupTasks: Array<() => Promise<void>> = [];

  constructor(private request: APIRequestContext) {}

  /**
   * Register a cleanup task to run after the test
   */
  register(task: () => Promise<void>): void {
    this.cleanupTasks.push(task);
  }

  /**
   * Register series for cleanup
   */
  registerSeries(seriesId: string): void {
    this.register(async () => {
      await this.request.post("/api/rpc/series.delete", {
        data: { id: seriesId },
        failOnStatusCode: false,
      });
    });
  }

  /**
   * Register character for cleanup
   */
  registerCharacter(characterId: string): void {
    this.register(async () => {
      await this.request.post("/api/rpc/knowledgeBase.characters.delete", {
        data: { id: characterId },
        failOnStatusCode: false,
      });
    });
  }

  /**
   * Register user for cleanup (use sparingly - prefer reusing test users)
   */
  registerUser(userId: string): void {
    this.register(async () => {
      await this.request.post("/api/rpc/users.delete", {
        data: { id: userId },
        failOnStatusCode: false,
      });
    });
  }

  /**
   * Run all cleanup tasks in reverse order (LIFO)
   */
  async runAll(): Promise<void> {
    const errors: Error[] = [];

    // Run in reverse order for proper dependency cleanup
    for (const task of this.cleanupTasks.reverse()) {
      try {
        await task();
      } catch (error) {
        errors.push(error as Error);
      }
    }

    this.cleanupTasks = [];

    if (errors.length > 0) {
      console.warn(`Cleanup completed with ${errors.length} errors:`, errors);
    }
  }
}

export function createCleanupHelper(request: APIRequestContext): CleanupHelper {
  return new CleanupHelper(request);
}
