import { type APIRequestContext, type Page } from "@playwright/test";

export class ApiHelper {
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  // Auth
  async createUser(email: string, username: string, password: string) {
    return this.request.post("/api/auth/sign-up/email", {
      data: { email, name: username, password },
    });
  }

  async login(email: string, password: string) {
    return this.request.post("/api/auth/sign-in/email", {
      data: { email, password },
    });
  }

  // Series
  async createSeries(data: {
    title: string;
    genre?: string;
    logline?: string;
  }) {
    const response = await this.request.post("/api/rpc/series.create", {
      data,
    });
    return response.json();
  }

  async deleteSeries(id: string) {
    return this.request.post("/api/rpc/series.delete", { data: { id } });
  }

  // Scripts
  async createScript(data: { seriesId: string; title: string }) {
    const response = await this.request.post("/api/rpc/scripts.create", {
      data,
    });
    return response.json();
  }

  // Knowledge Base
  async createCharacter(data: {
    seriesId: string;
    name: string;
    description?: string;
  }) {
    const response = await this.request.post(
      "/api/rpc/knowledgeBase.characters.create",
      { data },
    );
    return response.json();
  }

  async createLocation(data: {
    seriesId: string;
    name: string;
    description?: string;
  }) {
    const response = await this.request.post(
      "/api/rpc/knowledgeBase.locations.create",
      { data },
    );
    return response.json();
  }
}

export function createApiHelper(page: Page): ApiHelper {
  return new ApiHelper(page.request);
}
