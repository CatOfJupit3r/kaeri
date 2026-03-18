import type { CONTRACT } from "@kaeri/shared";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import type { Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3030";

export type E2EClient = ContractRouterClient<typeof CONTRACT>;

/**
 * Creates an oRPC client that uses cookies from a Playwright page context.
 * This allows authenticated API calls using the page's session.
 */
export function createE2EClient(page: Page): E2EClient {
  const link = new RPCLink({
    url: `${BASE_URL}/api/rpc`,
    async fetch(input, init) {
      // Get cookies from the page context
      const cookies = await page.context().cookies();
      const cookieHeader = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      // Extract URL and body from input (could be Request, URL, or string)
      let url: string;
      let body: string | undefined;

      if (typeof input === "string") {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
        // Clone the request to read the body
        body = await input.text();
      } else {
        url = (input as URL).href;
      }

      // Cast init to RequestInit for proper typing
      const requestInit = init as RequestInit | undefined;

      // Body can come from either the Request object or init
      const requestBody = body ?? (requestInit?.body as string | undefined);

      // Use Playwright's request context which shares cookies with the page
      const response = await page.request.fetch(url, {
        method: (requestInit?.method as string) ?? "POST",
        headers: {
          ...(requestInit?.headers as Record<string, string>),
          Cookie: cookieHeader,
          "Content-Type": "application/json",
        },
        data: requestBody,
      });

      const responseText = await response.text();

      // Return Response object for oRPC client
      return new Response(responseText, {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
      });
    },
  });

  return createORPCClient(link);
}
