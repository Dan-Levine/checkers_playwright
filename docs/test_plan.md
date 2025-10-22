# UI Test Plan: Checkers Game

**Application URL:** https://www.gamesforthebrain.com/game/checkers/

**Author:** Dan Levine

**Date:** 10/21/2025

---

## 1. Application Overview

The application is a browser version of the board game checkers where:

* The player controls the orange pieces
* The computer controls the blue pieces
* The game follows the standard rules of checkers
* There is a message at the bottom of the page telling the user what to do
* There is a restart option
* When a piece is selected, it is highlighted in yellow
* The piece the computer moves is highlighted in yellow for a certain time
* A piece becomes king when reaching the end
* Pieces are only played on light squares
* Multijump behavior:
  * Jumps are made one at a time
  * Can't undo in the middle of move
* Board spaces are identified by name, as `name=spaceXY` where 0,0 is the bottom right, 7,7 is the top :
* ```
    7,7 [top-left] =========> 7,0
    │
    │  
    ▼
    0,7 ========> 0,0 [bottom-right]
* Pieces are tracked by the `src` of image.  Options are:

| Piece | normal   |selected  | 
|--------|----------|------------|
| You  |  `you1.gif` | `you2.gif`  |   
| You (king)  | `you1k.gif` | `you2k.gif` |   
| Computer  | `me1.gif`  |`me2.gif`   |
| Computer (king) | `me1k.gif`| `me2.gif` |  

---

## 2. Testing Objectives

1. Verify core game functionality
2. Validate rules implementation
3. Ensure UI interactions work
4. Test error handling
5. Check browser compatibility

---

## 3. Test Scope

### In Scope

* Board rendering, piece initialization
* User interactions, piece selection, highlighting, moving
* Computer response to player move
* Rules implementation: Must capture if available, pieces are kinged, only kings move backwards
* Restart button
* Responsiveness: Check one desktop and mobile viewport

### Out of Scope

* Performance
* Deep accessability, playability with keys, support for screen reader
* Full browser compatibility testing
* AI logic/making 'smart' moves
* Other games on page
* Persistance: accounts, page refresh, local storage
* Ads

---
## 4. Risks, Assumptions, Constraints

### Risks
* Ads interfere with viewport
* Computer logic may not be deterministic, tests with chains of moves may not be reproducible
* Animation delay may cause flakiness in automated tests.
  
### Assumptions
* Game is fully client side
* The player is acting in good faith, not changing js state, sending spoofed requests

### Constraints
* No API, everything must be validated by UI
* No easy way to set board state, testing certain actions can take a long chain of moves and might not be reproducable



---

## 5. Test Strategy

### Approach
* Treat game as black box, interact with it through the UI
* Use fixtures to control and script clicking, interacting with game
* Prefer role based locators
* Begin with manual verification, play through a game, then automate
* Use typescript and playwright for automation
* Support parallelization of tests, each test must be independent of other tests

### Test types
* Board rendering: pieces are in correct position, squares are properly colored.
* UI Interaction: Pieces highlight when selected.  Moves are reflected on the board.  
* Turn Logic: user can move only on their turn, can only move own pieces, rules are enforced correctly 
* Responsiveness: Game can be displayed and interacted with in desktop and mobile viewports

---

## 6. Test Design

### Example UI Scenarios
```
Feature: Core interactions
Scenario: Initial board renders
Given I open the Checkers page
Then I see an 8x8 board with pieces on the starting rows


Scenario: Select and move a piece
Given it is Player's turn
When I select a movable orange piece and click a valid diagonal target
Then the piece appears on the target square
And the turn indicator switches to the opponent


Scenario: Illegal move is blocked
When I try to move a piece onto a light square or occupied square
Then the board state does not change


Scenario: Kinging visual appears
Given a Player piece is one step before the last rank before an empty square
When I move it onto the last rank
Then the piece displays a king marker immediately


Scenario: Reset returns to initial position
When I click Reset/New Game
Then the initial layout is restored

Scenario: Mandatory capture enforcement
Given the board has a capture available for the player
When I attempt a non-capturing move
Then the move should be blocked/ignored

Scenario: Multiple jump sequence
Given a piece can perform a multi-jump capture
When I complete the jump sequence
Then all captured pieces are removed and the turn switches

Scenario: King backward movement
Given I have a kinged piece
When I move it diagonally backward
Then the move is accepted

Scenario: Invalid selection handling
When I click an empty square
Then Nothing should happen
When I click opponent's piece
Then Nothing should happen
```

### Setup patterns/helper functions
* Select square with helper function `makeMove(startSpace, endSpace)` that tries to move spaces, takes `spaceXY` 
* Wait until computer move is done `waitForComputerMove()` that checks all pieces are unanimated, message says it's our turn
* Return image at square `getPieceAt(x, y)` returns the src for `[name=\"space${x}${y}\"]`
* Wait for turn: Check that no  piece is in the animated state
* Assertions:
  * Move applied: target square’s `src` changes to `you2.gif` (or `you2k.gif` after kinging); starting square changes to `gray.gif`.
  * Turn switches: Message updates, and no pieces are animated
  * King: When kinging, verify `src` changes from `you1.gif` to `you1k.gif` or similar for all pieces
* Create helper function to get the status of any square
---

## 7. Tools and Environment

### Required Tools

- Test Framework: Playwright
- Browser(s): Chrome, firefox
- Language: typescript
- Reporting: Allure reports

## 8) Entry/Exit Criteria

### Entry

* URL loads
* DOM stable
* selectors identified.


### Exit

* All P0 pass 100%
* P1 tests pass >= 95%
* No known Sev‑1/Sev‑2 defects open.
* All automated runs are stable for three consecutive executions

---

### 9) Prioritization (P0/P1/P2)

* P0: Illegal move prevention, capture/kinging correctness, turn order game over detection, input basic usability, page loads, basic functionality
* P1: Multi‑jump display; mobile touch interactions; AI behavior latency.
* P2: Visual polish, minor contrast issues, non‑blocking console warnings, ARIA label validation not testing screen reader, visual discrepancies 

---
### 10) Open Questions

* Are illegal moves blocked silently or with a message?
* Is drag supported on mobile, or tap only?
* What happens when a player has no legal moves? (Game over? Error?)
* Is there a draw condition? Stalemate?

### 11) Future enhancements

* visual regression system to test rendering
* Performance testing
* A function to set board state
* Validate AI logic