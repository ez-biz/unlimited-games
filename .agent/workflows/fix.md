---
description: Workflow for fixing bugs in existing games or hub
---

# Bug Fix Workflow

Follow this process when fixing bugs in the **Unlimited Games** repository.

## 1. Create a Fix Branch

```bash
git checkout main && git pull origin main
git checkout -b fix/<bug-description>
# Examples: fix/pong-paddle-collision, fix/hub-mobile-layout
```

## 2. Reproduce the Bug

- Get a clear description of the issue.
- Reproduce in the dev server:
// turbo
```bash
npm run dev
```
- Check browser console for errors.
- Note the exact steps to reproduce.

## 3. Locate the Source

// turbo
```bash
# Search for relevant code
grep -rn "suspected_function_or_variable" games/
```

- Review the relevant `script.js` for the affected game.
- Trace the code flow to find root cause.
- Check for edge cases.

## 4. Implement the Fix

- Make minimal, targeted changes.
- Avoid unrelated refactoring in the same fix.
- Add comments if the fix is non-obvious.
- Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
fix(pong): correct paddle collision bounds
fix(hub): resolve mobile overflow on game cards
```

## 5. Test the Fix

// turbo
```bash
npm run lint
```

- Verify the original bug is fixed.
- Test related functionality for regressions.
- Test on different screen sizes if UI-related.
- Check browser console is clean.

## 6. Commit & PR

```bash
git add .
git commit -m "fix(<scope>): brief description of fix"
git push origin fix/<bug-description>
```

- Create a PR with:
  - **What**: Description of the fix
  - **Why**: Root cause of the bug
  - **How to test**: Steps to verify

## 7. Merge & Cleanup

```bash
git checkout main
git merge --squash fix/<bug-description>
git commit -m "fix(<scope>): description (#PR)"
git push origin main
git branch -d fix/<bug-description>
```

## Common Bug Categories

| Category | Symptom | Typical Fix |
|----------|---------|-------------|
| Collision | Objects passing through | Adjust hitbox/bounds |
| State | Game not resetting | Reset all state vars in `init()` |
| Input | Keys not responding | Check event listeners, `preventDefault` |
| Timing | Animations glitchy | Use `deltaTime` / `requestAnimationFrame` |
| Scoring | Points not counting | Verify condition triggers |
| Memory | Lag after long play | Clean up `scene.remove()`, splice arrays |
| Mobile | Touch not working | Check `touchstart`/`touchend` handlers |
