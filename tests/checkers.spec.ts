import { test, expect } from "@playwright/test";
import { CheckersPage } from "../pages/CheckersPage";

test.describe(
  "Smoke Tests",
  {
    tag: "@smoke",
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/game/checkers");
    });

    test("Application loads successfully", async ({ page }) => {
      const checkersPage = new CheckersPage(page);
      await checkersPage.waitForGameLoad();
    });

    test("Initial board renders with correct piece counts", async ({
      page,
    }) => {
      const checkersPage = new CheckersPage(page);
      await checkersPage.waitForGameLoad();

      // Verify both players have 12 pieces at start
      const userPieceCount = await checkersPage.getNumUserPieces();
      const computerPieceCount = await checkersPage.getNumComputerPieces();

      expect(userPieceCount).toBe(12);
      expect(computerPieceCount).toBe(12);
    });

    test("User can select and move a piece", async ({ page }) => {
      const checkersPage = new CheckersPage(page);
      await checkersPage.waitForGameLoad();

      // Make a valid opening move (e.g., from space62 to space73)
      await checkersPage.makeMove("space62", "space73");

      // Verify the piece moved to the destination
      expect(await checkersPage.hasOrangePiece("space73")).toBe(true);

      // Wait for computer's response
      await checkersPage.waitForAnimation();

      // Verify game continues (message updates)
      const message = await checkersPage.getMessage();
      expect(message).toMatch(
        /^(Select an orange piece to move\.|Click on your orange piece, then click where you want to move it\.|Make a move\.)$/
      );
    });

    test("Invalid selections do not cause errors", async ({ page }) => {
      const checkersPage = new CheckersPage(page);
      await checkersPage.waitForGameLoad();

      // Click an empty square - should not cause errors
      await checkersPage.getSpace("space44").click();

      // Click a computer piece - should not cause errors
      await checkersPage.getSpace("space11").click();

      // Verify game is still playable
      const message = await checkersPage.getMessage();
      expect(message).toMatch(
        /^(Select an orange piece to move\.|Click on your orange piece, then click where you want to move it\.|Make a move\.)$/
      );
    });

    test("Restart game resets to initial state", async ({ page }) => {
      const checkersPage = new CheckersPage(page);
      await checkersPage.waitForGameLoad();

      // Make a move
      await checkersPage.makeMove("space62", "space73");
      await checkersPage.waitForAnimation();

      // Restart the game
      await checkersPage.restartGame();

      // Verify board is reset
      expect(await checkersPage.hasOrangePiece("space62")).toBe(true);
      expect(await checkersPage.isEmpty("space73")).toBe(true);
      expect(await checkersPage.getNumUserPieces()).toBe(12);
      expect(await checkersPage.getNumComputerPieces()).toBe(12);
    });
  }
);
