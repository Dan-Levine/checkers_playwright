const { test, expect } = require("@playwright/test");
const { CheckersPage } = require("../pages/CheckersPage");

test.describe(
  "Smoke Tests",
  {
    tag: "@smoke",
  },
  () => {
    test.beforeEach(async ({ page }) => {
      page.goto("/game/checkers");
    });

    test("Application loads successfully", async ({ page }) => {
      const checkersPage = new CheckersPage(page);
      await checkersPage.waitForGameLoad();
    });
  }
);
