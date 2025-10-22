import { expect, Locator, Page } from "@playwright/test";

export class CheckersPage {
  page: Page;
  board: Locator;
  message: Locator;
  computerPiece: Locator;
  userPiece: Locator;
  kingedPieces: Locator;
  movingPiece: Locator;
  constructor(page: Page) {
    this.page = page;
    this.board = page.locator("#board");
    this.message = page.locator("#message");
    this.computerPiece = page.locator(
      'img[src*="me1.gif"], img[src*="me2.gif"], img[src*="me1k.gif"], img[src*="me2k.gif"]'
    );
    this.userPiece = page.locator(
      'img[src*="you1.gif"], img[src*="you2.gif"], img[src*="you1k.gif"], img[src*="you2k.gif"]'
    );
    this.kingedPieces = page.locator(
      'img[src*="you1k.gif"], img[src*="you2k.gif"], img[src*="me1k.gif"], img[src*="me2k.gif"]'
    );
    this.movingPiece = page.locator('img[src*="2.gif"]');
  }

  /**
   * Wait for the game to fully load
   * Message is the last element to load
   * Supports all possible game messages
   */
  async waitForGameLoad(): Promise<void> {
    await expect(this.message).toHaveText(
      /^(Select an orange piece to move\.|Click on your orange piece, then click where you want to move it\.|Make a move\.)$/
    );
  }

  /**
   * Get the current game message text
   * @returns The text content of the message element
   */
  async getMessage(): Promise<string | null> {
    return await this.message.textContent();
  }

  /**
   * Get a space element by its space name
   * @param spaceName - The space name (e.g., 'space62')
   * @returns A Playwright locator for the space
   */
  getSpace(spaceName: string): Locator {
    return this.page.locator(`[name="${spaceName}"]`);
  }

  /**
   * Make a move by clicking source space then destination space
   * Waits for move animation to complete before returning
   * @param fromSpace - The starting space name (e.g., 'space62')
   * @param toSpace - The destination space name (e.g., 'space73')
   */
  async makeMove(fromSpace: string, toSpace: string): Promise<void> {
    await this.getSpace(fromSpace).click();
    await this.getSpace(toSpace).click();
    await this.waitForAnimation();
  }

  /**
   * Wait for animations to complete
   */
  async waitForAnimation(): Promise<void> {
    // Poll until no pieces are in moving state
    await expect
      .poll(
        async () => {
          // Count all pieces with "2" in their src (you2, me2, you2k, me2k)
          const movingPieceCount = await this.page
            .locator('img[src*="2.gif"]')
            .count();
          return movingPieceCount === 0;
        },
        {
          message: "Waiting for all pieces to finish animation",
        }
      )
      .toBe(true);
  }

  /**
   * Check if space contains an orange (user) piece
   * @param spaceName - The space name (e.g., 'space62')
   * @returns True if the space contains a user piece
   */
  async hasOrangePiece(spaceName: string): Promise<boolean> {
    const piece = await this.getPieceAt(spaceName);
    return piece?.includes("you") ?? false;
  }

  /**
   * Check if space contains a blue (computer) piece
   * @param spaceName - The space name (e.g., 'space62')
   * @returns True if the space contains a computer piece
   */
  async hasBluePiece(spaceName: string): Promise<boolean> {
    const piece = await this.getPieceAt(spaceName);
    return piece?.includes("me") ?? false;
  }

  /**
   * Check if space is empty (no piece)
   * @param spaceName - The space name (e.g., 'space62')
   * @returns True if the space is empty
   */
  async isEmpty(spaceName: string): Promise<boolean> {
    const space = await this.getPieceAt(spaceName);
    return space === "gray.gif" || space === "black.gif";
  }

  /**
   * Gets number of computer pieces remaining
   * @returns The count of computer pieces on the board
   */
  async getNumComputerPieces(): Promise<number> {
    return await this.computerPiece.count();
  }

  /**
   * Gets number of user (orange) pieces remaining
   * @returns The count of user pieces on the board
   */
  async getNumUserPieces(): Promise<number> {
    return await this.userPiece.count();
  }

  /**
   * Check if piece at space is a king
   * @param spaceName - The space name (e.g., 'space62')
   * @returns True if piece is kinged, false otherwise
   */
  async isKing(spaceName: string): Promise<boolean> {
    const piece = await this.getPieceAt(spaceName);
    // King pieces: you1k.gif, you2k.gif, me1k.gif, me2k.gif
    return (
      ((piece?.includes("you") || piece?.includes("me")) &&
        piece?.includes("k.gif")) ??
      false
    );
  }

  /**
   * Restart the game by clicking the restart link
   * Waits for game to reload and all animations to complete
   */
  async restartGame(): Promise<void> {
    await this.page.getByRole("link", { name: "Restart" }).click();
    await this.waitForGameLoad();
    await this.waitForAnimation();
  }

  /**
   * Get the image source of the piece at a specific location
   * @param spaceName - The space name (e.g., 'space62')
   * @returns The src attribute of the piece image
   */
  async getPieceAt(spaceName: string): Promise<string | null> {
    const piece = this.getSpace(spaceName);
    return await piece.getAttribute("src");
  }
}

module.exports = { CheckersPage };
