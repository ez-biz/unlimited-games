---
description: Workflow for adding new features or games to the project.
---

# Feature Addition Workflow

Follow this process when adding a new game or feature to the **Unlimited Games** repository.

## 1. Preparation

1. **Read the Request**: Understand the requirements fully.
2. **Plan**: Create or update an implementation plan if the feature is complex.
   - For new games, plan mechanics, controls, and visual style.
3. **Branch**: Create a feature branch from `main`:

// turbo
```bash
git checkout main && git pull origin main
git checkout -b feature/<feature-name>
# Examples: feature/memory-match, feature/dark-mode, game/chess
```

## 2. Implementation

1. **Structure**:
   - **New Games**: Create a directory in `games/` using the template.
// turbo
```bash
cp -r games/_template games/<game-name>
```
   - **Core Features**: Edit files in root (`index.html`, `style.css`, `script.js`).
   - **Shared Assets**: Place in `assets/` (e.g., `assets/lib/`, `assets/img/`).

2. **Coding Standards**:
   - Use clean, commented ES6+ code.
   - Follow the Dark/Neon aesthetic.
   - Ensure mobile responsiveness.
   - Run linting before committing.

// turbo
```bash
npm run lint:fix
```

3. **Commit Often** using [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(game): add new memory match game
feat(hub): add game card for memory match
style(runner): fix mobile layout
refactor(space-invaders): extract enemy factory
```

   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
   - Scope: game name, `hub`, `assets`, etc.

## 3. Testing

1. **Dev Server**: Test using the Vite dev server.
// turbo
```bash
npm run dev
```

2. **Browser Testing**:
   - Open the game/feature in the browser.
   - Check console for JavaScript errors.
   - Test on different screen sizes (responsive).
   - Verify integration with the Main Hub (`index.html`).

3. **Lint Check**:
// turbo
```bash
npm run lint
```

## 4. Documentation

1. **README.md**: Update the main README if adding a new game.
2. **Game README**: (Optional) Add a `README.md` inside the game folder.
3. **CHANGELOG**: Note significant changes if maintaining a changelog.

## 5. Pull Request & Merge

1. **Push** the branch:
```bash
git push origin feature/<feature-name>
```

2. **Create PR** with a clear title and description:
   - Title: `feat(game): Add Memory Match game`
   - Description: What was added, how to test, screenshots if UI changes.

3. **Review**: Self-review or request team review.

4. **Merge**: Use squash merge for clean history:
```bash
git checkout main
git merge --squash feature/<feature-name>
git commit -m "feat(game): add memory match game (#42)"
git push origin main
```

5. **Cleanup**:
```bash
git branch -d feature/<feature-name>
git push origin --delete feature/<feature-name>
```
