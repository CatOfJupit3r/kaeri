import { chromium, type FullConfig } from "@playwright/test";

import { TEST_USERS } from "./fixtures/auth.fixture";

const STORAGE_STATE_PATH = "src/.auth/user.json";

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3030";
  const browser = await chromium.launch();
  const context = await browser.newContext({
    extraHTTPHeaders: {
      Origin: baseURL,
    },
  });
  const page = await context.newPage();

  // First try to login (user might already exist)
  let loginResponse = await page.request.post(
    `${baseURL}/api/auth/sign-in/username`,
    {
      data: {
        username: TEST_USERS.default.username,
        password: TEST_USERS.default.password,
      },
      headers: { Origin: baseURL },
      failOnStatusCode: false,
    },
  );

  // If login failed, try to sign up
  if (!loginResponse.ok()) {
    console.log("Login failed, attempting signup...");

    const signupResponse = await page.request.post(
      `${baseURL}/api/auth/sign-up/email`,
      {
        data: {
          email: TEST_USERS.default.email,
          username: TEST_USERS.default.username,
          name: TEST_USERS.default.name,
          password: TEST_USERS.default.password,
        },
        headers: { Origin: baseURL },
        failOnStatusCode: false,
      },
    );

    console.log(
      "Signup response:",
      signupResponse.status(),
      await signupResponse.text(),
    );

    // Try login again after signup
    loginResponse = await page.request.post(
      `${baseURL}/api/auth/sign-in/username`,
      {
        data: {
          username: TEST_USERS.default.username,
          password: TEST_USERS.default.password,
        },
        headers: { Origin: baseURL },
      },
    );
  }

  if (!loginResponse.ok()) {
    const errorText = await loginResponse.text();
    console.error("Login failed:", errorText);
    throw new Error(`Failed to login test user: ${errorText}`);
  }

  console.log("Login successful!");

  // Save storage state for reuse across tests
  await context.storageState({ path: STORAGE_STATE_PATH });

  await browser.close();
}

export default globalSetup;
