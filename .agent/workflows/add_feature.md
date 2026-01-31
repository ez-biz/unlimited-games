---
description: Workflow for adding new features or games to the project.
---

# Feature Addition Workflow

Follow this process when adding a new game or feature to the **Unlimited Games** repository.

## 1. Preparation
1.  **Read the Request**: Understand the requirements fully.
2.  **Plan**: Create or update an implementation plan if the feature is complex (e.g., a new game).
    *   For new games, plan the mechanics, controls, and visual style.
3.  **Branch Name**: (If using git) Create a new branch with a descriptive name.
    *   Format: `feature/name-of-feature` or `game/name-of-game`
    *   Example: `game/pong`, `feature/dark-mode`

## 2. Implementation
1.  **Structure**:
    *   **New Games**: Create a new directory in `games/` (e.g., `games/snake/`).
        *   Copy `games/_template/` as a starting point.
    *   **Core Features**: edit files in the root (`index.html`, `style.css`, `script.js`).
2.  **Coding Standards**:
    *   Use clean, commented code.
    *   Follow the existing style guide (Dark/Neon aesthetic).
    *   Ensure responsiveness (mobile-friendly).
3.  **Assets**: Place game-specific assets in the game's folder or global assets in `assets/`.

## 3. Documentation
1.  **README.md**: Update the main README if necessary (e.g., listing the new game).
2.  **Game README**: (Optional) Add a `README.md` inside the game folder explaining controls and credits.
3.  **Prompts**: Save any significant prompts used to generate code in `prompts/` if valuable for future reference.

## 4. Verification
1.  **Test Locally**: Run the game/feature in the browser.
2.  **Check Console**: Ensure no JavaScript errors.
3.  **Responsiveness**: Resize browser to check mobile view.
4.  **Integration**: Verify the game is listed and accessible from the Main Hub (`index.html`).

## 5. Finalization
1.  **Commit**: Commit changes with clear messages.
2.  **Merge**: Merge into the main branch (or simulate PR approval if working solo/with agent).
