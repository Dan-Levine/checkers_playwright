const { expect } = require("@playwright/test");

class CheckersPage {
  constructor(page) {
    this.page = page;
    this.board = page.locator("#board");
    this.message = page.locator("#message");
  }

  /**
   * Wait for the game to fully load
   * Message is last piece to load
   */
  async waitForGameLoad() {
    await expect(this.message).toHaveText("Select an orange piece to move.");
  }

  /**
   * Get the current game message
   */
  async getMessage() {
    return this.message.textContent();
  }

  /**
   * Get a space element by its space name
   * @param {string} spaceName - e.g., 'space62'
   */
  async getSpace(spaceName) {
    return this.page.locator(`[name="${spaceName}"]`);
  }

  /**
   * Make a move by clicking source then destination
   * @param {string} fromSpace - e.g., 'space62'
   * @param {string} toSpace - e.g., 'space73'
   */
  async makeMove(fromSpace, toSpace) {
    await this.getSpace(fromSpace).click();
    await this.getSpace(toSpace).click();
  }

  /**
   * Wait for the computer to make its move
   */
  async waitForComputerMove() {
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

  // - hasOrangePiece(spaceName)
  // - hasBluePiece(spaceName)
  // - isEmpty(spaceName)
  // - countPieces(color)
  // - isKing(spaceName)

  /**
   * Check specific piece at location
   * @param {string} spaceName
   */
  async getSpaceSrc(spaceName) {
    // Get the 'src' attribute of the image at this space
    const piece = this.getPiece(spaceName);
    return await piece.getAttribute('src');
  }

  /**
   * TODO: Add your own helper methods below
   */
}

module.exports = { CheckersPage };
