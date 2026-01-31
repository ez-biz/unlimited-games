---
description: Workflow for fixing bugs in existing games or hub
---

# Bug Fix Workflow

## 1. Identify the Bug
- Get a clear description of the issue
- Identify which game/file is affected
- Reproduce the bug if possible

## 2. Locate the Source
// turbo
```bash
# Search for relevant code
grep -rn "suspected_function_or_variable" games/
```

- Review the relevant `script.js` for the affected game
- Check browser console for errors

## 3. Understand the Root Cause
- Trace the code flow
- Identify the logic error or missing condition
- Check for edge cases

## 4. Implement the Fix
- Make minimal, targeted changes
- Avoid unrelated refactoring in the same fix
- Add comments if the fix is non-obvious

## 5. Test the Fix
// turbo
```bash
# Open the game in browser for testing
open games/<game-name>/index.html
```

- Verify the original bug is fixed
- Test related functionality for regressions
- Check on different screen sizes if UI-related

## 6. Commit the Fix
```bash
git add .
git commit -m "fix(<game>): brief description of fix"
```

## Common Bug Categories

| Category | Example | Typical Fix |
|----------|---------|-------------|
| Collision | Objects passing through | Adjust hitbox/bounds |
| State | Game not resetting | Reset all state variables |
| Input | Keys not responding | Check event listeners |
| Timing | Animations glitchy | Use deltaTime/requestAnimationFrame |
| Scoring | Points not counting | Verify condition triggers |
