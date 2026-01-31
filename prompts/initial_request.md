# Initial Project Request

**User Request:**
"Intialte this repo where many games will be created from js and html.

Plan it out everything

Also add the prompts foolder as well as Initial prompt I will give it you.

Based on that you will create.

Just make to remember we will be deploying this into web in the end.

And also create a workflow for you to any new feature addition which will follow some guidelines which are standard practices like creating branch, raising PR, doicumetnation, updating readme etc."


# Comprehensive Prompt for Browser-Based JavaScript/HTML Games

## Overview

This document serves as a master prompt for creating browser-based games using HTML, CSS, and JavaScript. Each game section contains detailed specifications, features, mechanics, and implementation guidelines that can be used to generate fully functional, polished games that run directly in any modern web browser.

---

## General Game Development Guidelines

When creating any of the games below, follow these universal principles:

**Technical Foundation**: Use a single HTML file containing embedded CSS within `<style>` tags and JavaScript within `<script>` tags. This self-contained approach ensures easy sharing and immediate playability. Use the HTML5 Canvas API for rendering graphics, or DOM manipulation for simpler card and puzzle games.

**Responsive Design**: Implement responsive layouts that adapt to different screen sizes. Use relative units (vh, vw, %) and media queries to ensure games are playable on both desktop and mobile devices. Include touch event handlers alongside mouse events for mobile compatibility.

**Performance Optimization**: Use `requestAnimationFrame` for smooth animations and game loops. Implement object pooling for frequently created and destroyed entities like bullets or particles. Minimize DOM manipulation during gameplay by preferring Canvas rendering for action games.

**User Experience**: Include clear visual feedback for all player actions. Provide audio feedback using the Web Audio API (optional but recommended). Show loading states and graceful error handling. Persist high scores using localStorage.

**Accessibility**: Support keyboard controls with clear keybinding documentation. Use sufficient color contrast. Provide pause functionality and adjustable game speed where appropriate.

---

## Game 1: Classic Snake

### Concept
The player controls a snake that grows longer each time it consumes food. The game ends when the snake collides with the walls or its own body. The objective is to achieve the highest possible score by eating as much food as possible.

### Core Mechanics

**Movement System**: The snake moves continuously in one of four cardinal directions (up, down, left, right). The player can change direction using arrow keys or WASD. The snake cannot reverse direction directly (moving left cannot immediately become moving right). Movement occurs on a grid system where each cell is a fixed pixel size.

**Growth Mechanic**: When the snake's head occupies the same grid cell as food, the snake's length increases by one segment. A new food item spawns at a random unoccupied grid position. The score increases based on the current snake length.

**Collision Detection**: Check if the snake's head position matches any wall boundary. Check if the snake's head position matches any body segment position. Either collision triggers game over state.

### Features to Implement

**Multiple Difficulty Levels**: Easy mode features slower movement speed and larger grid cells. Medium mode uses standard speed and grid size. Hard mode implements faster movement, smaller grid cells, and occasional obstacle walls. Expert mode adds moving obstacles and multiple food types.

**Power-Up System**: Speed boost food (yellow) temporarily increases movement speed. Slow motion food (blue) temporarily decreases speed. Ghost food (white) allows passing through walls temporarily. Score multiplier food (gold) doubles points for a limited time. Shrink food (purple) reduces snake length by half.

**Visual Customization**: Multiple snake skin options (classic green, rainbow gradient, pixel art, neon glow). Background theme selection (classic black, grass field, space, underwater). Animated food items with particle effects on consumption.

**Game Modes**: Classic mode with standard rules. Infinite mode where walls wrap around (snake exits right, enters left). Time attack mode with a countdown timer and bonus time for food. Maze mode with pre-designed obstacle layouts. Two-player mode with split controls.

**Statistics and Progress**: Track total games played, total food consumed, longest snake achieved, and total playtime. Achievement system for milestones (first 10 length, first 50 length, survive 5 minutes, etc.). Daily challenges with specific objectives.

**Audio System**: Background music with mute toggle. Sound effects for eating, dying, power-up activation, and menu navigation. Volume control slider.

### User Interface Elements

**Start Screen**: Game title with animated snake logo. Play button, settings button, high scores button. Difficulty selector dropdown. Skin selection preview.

**Game Screen**: Current score display in corner. Current snake length indicator. Active power-up timers with icons. Pause button and pause overlay. Mini-map for maze mode.

**Game Over Screen**: Final score with animated counter. New high score celebration effect. Cause of death indicator. Restart button and main menu button. Share score button (copies text to clipboard).

**Settings Menu**: Sound volume sliders for music and effects. Control scheme selection (arrows, WASD, or both). Grid line visibility toggle. Color blind mode option.

---

## Game 2: Breakout/Brick Breaker

### Concept
The player controls a paddle at the bottom of the screen, bouncing a ball to destroy bricks arranged at the top. The game features multiple levels with increasingly complex brick arrangements and various power-ups.

### Core Mechanics

**Paddle Physics**: Paddle moves horizontally via arrow keys or mouse position. Paddle has fixed vertical position near screen bottom. Ball bounce angle depends on where it hits the paddle (edges create sharper angles, center creates vertical bounce). Paddle has slight acceleration and deceleration for smooth movement.

**Ball Physics**: Ball moves at constant speed in a direction vector. Ball bounces off walls, paddle, and bricks with reflection physics. Ball speed increases slightly with each brick destroyed. Multiple balls can exist simultaneously with certain power-ups.

**Brick System**: Bricks have different hit points (1-4 hits to destroy). Brick color indicates remaining hit points. Some bricks are indestructible (metal bricks). Hidden bricks become visible when adjacent bricks are destroyed. Bricks may contain power-ups that fall when destroyed.

### Features to Implement

**Brick Types**: Standard bricks (one hit, various colors for points). Hardened bricks (multiple hits, crack animation between hits). Explosive bricks (destroy adjacent bricks when destroyed). Moving bricks (oscillate horizontally). Regenerating bricks (respawn after time delay). Gold bricks (high point value).

**Power-Up System**: Multi-ball (splits into three balls). Wide paddle (increases paddle width temporarily). Laser paddle (shoot lasers upward with spacebar). Sticky paddle (ball sticks, release with spacebar). Slow ball (reduces ball speed). Fast ball (increases ball speed). Extra life (adds one life). Score multiplier (2x points temporarily). Magnet (ball curves toward paddle). Shield (creates barrier below paddle once).

**Power-Down System**: Narrow paddle (shrinks paddle). Fast ball (uncontrollable speed). Invisible ball (ball becomes transparent). Reverse controls (left becomes right).

**Level System**: 50+ pre-designed levels with increasing difficulty. Level editor for custom level creation. Randomly generated endless mode. Boss levels every 10 stages featuring a large moving target. Level packs with themes (space, underwater, fantasy).

**Scoring System**: Base points per brick destroyed. Combo multiplier for consecutive hits without paddle contact. Speed bonus for completing levels quickly. Accuracy bonus based on paddle hits versus misses. Perfect clear bonus for destroying all bricks.

### Visual Effects

**Particle System**: Brick destruction particles matching brick color. Ball trail effect with gradient fade. Paddle glow effect. Screen shake on explosive brick detonation. Sparks when ball hits paddle.

**Background Effects**: Animated starfield or themed background. Parallax scrolling layers. Background music visualization.

**UI Animations**: Score counter with rolling numbers. Level transition with brick arrangement preview. Power-up collection feedback with icon display.

### User Interface Elements

**Game Screen**: Lives remaining (ball icons). Current score. Level number and progress bar. Active power-up indicators with timers. Pause functionality.

**Level Select**: Level grid with completion stars. Locked level indicators. Best score per level display.

---

## Game 3: Tetris Clone

### Concept
Falling tetromino pieces must be arranged to create complete horizontal lines, which then clear from the board. The game accelerates over time, and ends when pieces stack to the top of the playing field.

### Core Mechanics

**Piece System**: Seven standard tetromino shapes (I, O, T, S, Z, J, L). Pieces spawn at top center of playfield. Pieces fall at consistent intervals based on current level. Player can accelerate falling with down arrow. Instant drop with spacebar or up arrow.

**Rotation System**: Pieces rotate 90 degrees clockwise with one key, counter-clockwise with another. Implement Super Rotation System (SRS) with wall kicks for modern feel. I-piece has special rotation rules. O-piece does not rotate.

**Line Clearing**: Complete horizontal lines are detected and removed. Lines above cleared lines fall down. Multiple simultaneous line clears award bonus points. Tetris (four lines) awards maximum bonus.

**Ghost Piece**: Transparent preview showing where current piece will land. Helps players plan placement accurately.

### Features to Implement

**Game Modes**: Marathon mode (endless play, increasing speed). Sprint mode (clear 40 lines fastest). Ultra mode (highest score in 3 minutes). Puzzle mode (clear specific arrangements). Versus mode (AI opponent, garbage lines).

**Hold System**: Player can hold current piece for later use. Held piece swaps with current piece. Can only hold once per piece drop.

**Next Piece Preview**: Show next 1-6 upcoming pieces (configurable). Helps planning and strategy.

**Scoring System**: Points based on lines cleared simultaneously. Soft drop awards points per cell. Hard drop awards double points per cell. Back-to-back Tetris bonus. T-spin detection and bonus points. Combo system for consecutive line clears.

**Level Progression**: Speed increases every 10 lines cleared. Level display with progress indicator. Maximum level cap with celebration.

**Modern Features**: Lock delay (piece doesn't instantly lock on landing). Extended placement (resets lock delay with rotation or movement). Infinite spin prevention.

### Visual Customization

**Themes**: Classic (solid colors). Modern (gradient blocks with shine). Retro (8-bit pixel style). Neon (glowing outlines). Nature (wood, stone, leaf textures). Custom color picker.

**Effects**: Line clear animation (flash, slide, particles). Level up celebration. Screen darkening at game over. Smooth piece movement (not grid-locked).

**Board Customization**: Standard 10x20 grid. Wide mode 15x20. Tall mode 10x25. Tiny mode 6x12.

### Audio Implementation

**Sound Effects**: Piece movement clicks. Rotation sound. Soft drop tick. Hard drop thud. Line clear chime (different for singles, doubles, triples, Tetris). Level up fanfare. Game over melody.

**Music**: Multiple background track options. Speed increases with music tempo. Mute individual sounds or music.

---

## Game 4: Flappy Bird Clone

### Concept
The player controls a bird that continuously falls due to gravity. Tapping or clicking causes the bird to flap upward. The objective is to navigate through gaps in pipes without collision.

### Core Mechanics

**Physics System**: Constant gravity pulls bird downward. Each tap/click applies upward velocity. Terminal velocity prevents infinite falling speed. Bird rotation based on vertical velocity (points up when rising, down when falling).

**Pipe Generation**: Pipes spawn off-screen to the right. Pipes move leftward at constant speed. Gap position randomized within safe range. Gap size decreases with score.

**Collision Detection**: Pixel-perfect or bounding box collision with pipes. Ground and ceiling collision detection. Score increments when bird passes pipe center.

### Features to Implement

**Difficulty Progression**: Gap size decreases over time. Pipe speed increases with score. Moving pipes (vertical oscillation) at higher scores. Double pipes with offset gaps. Wind effects pushing bird sideways.

**Character Selection**: Multiple bird designs (classic, angry, robot, ghost, dragon). Unlockable characters based on achievements. Character-specific effects (trail colors, sounds).

**Environment Themes**: Day/night cycle. Seasonal themes (spring flowers, winter snow, autumn leaves). Space theme with asteroids instead of pipes. Underwater theme with bubbles and coral.

**Power-Ups**: Shield (one free collision). Slow motion (reduces game speed temporarily). Magnet (pulls toward gap center). Shrink (smaller hitbox temporarily). Ghost (pass through one pipe).

**Game Modes**: Classic endless mode. Time attack (survive 60 seconds). Score rush (reach target score fastest). Zen mode (no death, practice). Two-player race (split screen or turn-based).

### Visual Polish

**Animations**: Bird wing flapping animation. Parallax scrolling background layers (clouds, mountains, ground). Particle effects for flapping and collision. Screen shake on collision. Day/night transition gradient.

**UI Elements**: Current score (large, centered top). Best score indicator. Medal display based on score (bronze, silver, gold, platinum). Share button. Leaderboard display.

### Audio Design

**Sound Effects**: Flap sound (wing whoosh). Point scored (cheerful ding). Collision (impact thud). Button presses. Achievement unlocked.

**Music**: Calm background loop. Intensity increases with score. Victory/game over jingles.

---

## Game 5: Space Invaders Clone

### Concept
The player controls a spaceship at the bottom of the screen, shooting at rows of descending alien invaders. The aliens move horizontally and drop down when reaching screen edges. The game ends if aliens reach the bottom or the player loses all lives.

### Core Mechanics

**Player Movement**: Horizontal movement with arrow keys or A/D. Fixed vertical position. Shooting with spacebar. Fire rate limited (one bullet on screen, or cooldown system).

**Enemy Behavior**: Enemies arranged in grid formation. All enemies move together horizontally. Enemies move down and reverse direction at screen edges. Movement speed increases as enemies are destroyed. Random enemies fire downward bullets.

**Defensive Shields**: Destructible barriers between player and enemies. Shields take damage from both player and enemy bullets. Visual degradation showing damage state.

### Features to Implement

**Enemy Types**: Standard invaders (one hit, low points). Armored invaders (two hits). Fast invaders (move quicker, worth more). Splitting invaders (divide into two when hit). Boss invaders (large, multiple hit points, special attacks).

**Power-Up System**: Rapid fire (increased fire rate). Spread shot (three bullets at angles). Piercing shot (bullets pass through enemies). Shield (temporary invincibility). Bomb (clears all enemies on screen). Extra life.

**UFO Bonus**: Mystery ship crosses top of screen randomly. High point value when destroyed. May drop special power-ups.

**Wave System**: Increasingly difficult enemy formations. Boss waves every 5 levels. Bonus rounds (no enemies shoot, speed challenge). Different enemy types introduced progressively.

**Scoring**: Points based on enemy type. Accuracy bonus at wave end. Speed bonus for fast completion. Combo system for consecutive hits.

### Visual Design

**Enemy Animations**: Idle animation frames. Death explosion effect. Movement trails at high speeds.

**Player Effects**: Ship thruster animation. Bullet trail effects. Shield visual feedback.

**Environment**: Animated starfield background. Planet or moon in background. Parallax effect.

### Game Modes

**Classic Mode**: Original gameplay style. Three lives. Increasing difficulty.

**Survival Mode**: Endless waves. One life. High score focus.

**Challenge Mode**: Pre-designed scenarios. Time limits. Specific objectives.

**Boss Rush**: Only boss encounters. Pattern memorization. High difficulty.

---

## Game 6: Pong

### Concept
Two paddles on opposite sides of the screen bounce a ball back and forth. Players score when the ball passes the opponent's paddle. First to reach the target score wins.

### Core Mechanics

**Paddle Control**: Vertical movement only. Configurable keys for each player. AI opponent option. Mouse control option for single player.

**Ball Physics**: Constant speed movement. Angle changes based on paddle hit location. Speed increases with each paddle hit. Maximum speed cap.

**Scoring**: Point awarded when ball passes paddle. Games to 11 points (configurable). Win by 2 rule optional.

### Features to Implement

**AI Difficulty Levels**: Easy (slow reaction, mistakes). Medium (moderate tracking, occasional errors). Hard (near-perfect tracking, aggressive). Impossible (perfect play, predicts bounces).

**Game Variations**: Classic Pong (standard rules). Multi-ball (up to 3 balls simultaneously). Obstacle Pong (barriers in play area). Power-up Pong (collectibles affect gameplay). Curve Ball (ball curves based on paddle movement).

**Power-Ups**: Paddle size increase/decrease. Ball speed change. Multi-ball activation. Paddle speed boost. Invisible ball (briefly).

**Visual Modes**: Classic (white on black, minimal). Neon (glowing effects, dark background). Retro (scan lines, CRT effect). Modern (gradients, particles).

**Multiplayer**: Local two-player (same keyboard). AI opponent. Tournament mode (bracket system).

### Audio

**Sound Effects**: Paddle hit (pitch varies with speed). Wall bounce. Score point. Game win/lose.

**Music**: Optional background music. Victory/defeat themes.

---

## Game 7: Minesweeper

### Concept
A grid contains hidden mines. The player reveals cells to find all non-mine cells without triggering any mines. Numbers indicate adjacent mine counts, requiring logical deduction to solve.

### Core Mechanics

**Grid System**: Configurable grid size (beginner 9x9, intermediate 16x16, expert 30x16). Configurable mine count. First click guaranteed safe (mines generated after).

**Cell States**: Hidden (unrevealed). Revealed (shows number or empty). Flagged (player-marked as mine). Questioned (uncertain marker).

**Number Logic**: Revealed cells show count of adjacent mines (0-8). Empty cells (0 adjacent) auto-reveal neighbors. Chain reaction for connected empty regions.

### Features to Implement

**Difficulty Presets**: Beginner (9x9, 10 mines). Intermediate (16x16, 40 mines). Expert (30x16, 99 mines). Custom (user-defined).

**Game Modes**: Classic (standard rules). No-guess (guaranteed solvable without guessing). Timed challenge (complete in time limit). Daily puzzle (same puzzle for all players).

**Statistics Tracking**: Games won/lost. Win percentage per difficulty. Best times per difficulty. Current win streak. Total mines flagged.

**Visual Options**: Classic Windows style. Modern flat design. Dark mode. Colorblind-friendly numbers. Animation for reveals.

**Helpful Features**: Remaining mine counter. Timer display. Chord clicking (reveal adjacent if flags match number). Auto-flag obvious mines (optional). Hint system (highlights safe cell).

**Undo System**: Undo last move. Only available in practice mode. Tracks undo usage.

### User Interface

**Game Grid**: Clear cell boundaries. Distinct unrevealed/revealed states. Flag and question mark toggles. Touch-friendly cell size option.

**Controls Panel**: New game button. Difficulty selector. Mine counter. Timer. Settings access.

**End Game**: Win celebration (time, 3BV score). Loss (reveals all mines). Play again prompt.

---

## Game 8: 2048

### Concept
Tiles with numbers slide on a 4x4 grid. When two tiles with the same number collide, they merge into their sum. The goal is to create a tile with the value 2048 (or higher).

### Core Mechanics

**Tile Movement**: All tiles slide in chosen direction (up, down, left, right). Tiles slide until hitting wall or another tile. Same-value tiles merge on collision. Only one merge per tile per move.

**Tile Spawning**: New tile appears after each move. 90% chance of value 2, 10% chance of value 4. Spawns in random empty cell. Game over when no empty cells and no possible merges.

**Scoring**: Score increases by merged tile value. Track current score and best score. Persist best score in localStorage.

### Features to Implement

**Board Variations**: Classic 4x4 grid. Small 3x3 (harder). Large 5x5 or 6x6 (easier). Rectangular options.

**Game Modes**: Classic (reach 2048). Endless (continue after 2048). Time attack (highest score in 2 minutes). Move limit (reach target in X moves). Puzzle mode (specific starting layouts).

**Visual Themes**: Classic (colored tiles). Dark mode. Pastel colors. High contrast. Custom color picker. Tile animations (slide, merge pop, new tile fade-in).

**Statistics**: Games played. Highest tile achieved. Average score. Total merges. Time played.

**Undo Feature**: Undo last move (limited uses). Track move history. Score reverts with undo.

**AI Helper**: Suggest best move. Auto-play option. Show win probability.

### Visual Polish

**Animations**: Smooth tile sliding. Merge pop effect. New tile fade-in. Score increment animation. Game over overlay. Victory celebration for 2048.

**Tile Design**: Distinct colors per value. Font size adjusts for large numbers. Subtle shadows for depth.

---

## Game 9: Platformer (Infinite Runner Style)

### Concept
The player controls a character that automatically runs forward. The player must jump to avoid obstacles and gaps. The game speeds up over time, testing reflexes and pattern recognition.

### Core Mechanics

**Character Physics**: Constant horizontal movement (world scrolls left). Jump with spacebar or tap. Gravity affects jump arc. Double jump ability (unlockable). Wall slide and wall jump (optional).

**Obstacle Generation**: Platforms at varying heights and lengths. Gaps requiring jumps. Spikes and hazards. Moving platforms. Enemies.

**Collision System**: Platform collision (land on top). Hazard collision (death or damage). Collectible collision (coins, power-ups).

### Features to Implement

**Obstacle Types**: Static platforms (various sizes). Moving platforms (horizontal, vertical). Crumbling platforms (fall after contact). Spring platforms (boost jump). Spike platforms. Conveyor platforms (push left or right).

**Hazard Types**: Ground spikes. Ceiling spikes. Swinging blades. Projectile launchers. Enemy characters (walking, flying).

**Power-Ups**: Shield (one hit protection). Magnet (attract nearby coins). 2x multiplier (temporary). Rocket (fly above obstacles). Shrink (smaller hitbox).

**Character Selection**: Multiple characters with unique abilities. Unlockable through achievements or currency. Cosmetic variations.

**Environment Themes**: Forest, city, space, underwater, volcano. Theme changes every X distance. Unique obstacles per theme.

**Progression System**: Missions (collect X coins, reach X distance). Daily challenges. Achievement system. Unlockable content.

### Visual Design

**Parallax Backgrounds**: Multiple layers moving at different speeds. Theme-appropriate scenery. Day/night variations.

**Character Animation**: Run cycle. Jump and fall poses. Death animation. Power-up effects.

**Particle Effects**: Dust on landing. Trail behind character. Coin collection sparkles. Death explosion.

### Audio

**Sound Effects**: Jump sound. Landing sound. Coin collection. Power-up activation. Obstacle collision. Death.

**Music**: Upbeat background track. Speed increases with game intensity. Theme-specific music.

---

## Game 10: Memory Match

### Concept
A grid of face-down cards contains matching pairs. The player flips two cards at a time, trying to find matches. The game is complete when all pairs are found.

### Core Mechanics

**Card System**: Even number of cards forming pairs. Cards start face-down. Click/tap flips card face-up. Two cards flipped per turn.

**Matching Logic**: If two flipped cards match, they stay face-up. If they don't match, flip back after delay. Matched cards may disappear or remain visible.

**Win Condition**: All pairs found. Track moves taken and time elapsed.

### Features to Implement

**Difficulty Levels**: Easy (4x3 = 6 pairs). Medium (4x4 = 8 pairs). Hard (6x4 = 12 pairs). Expert (6x6 = 18 pairs). Custom grid size.

**Theme Packs**: Emoji icons. Animals. Flags. Numbers. Letters. Custom image upload.

**Game Modes**: Classic (find all pairs). Timed (complete before timer). Moves limit (complete in X moves). Memory challenge (cards shown briefly at start). Multiplayer (take turns, most pairs wins).

**Visual Effects**: Card flip animation. Match celebration. Mismatch shake. Completion fireworks. Hover preview.

**Statistics**: Best time per difficulty. Best moves per difficulty. Games completed. Total matches found. Accuracy percentage.

**Accessibility**: Sound cues for flip and match. Color-blind friendly icons. Keyboard navigation option.

### Multiplayer Features

**Turn-based Local**: Two players alternate turns. Match awards extra turn. Score tracking. Winner announcement.

**AI Opponent**: Memory simulation (remembers X% of flipped cards). Difficulty affects memory accuracy. Turn timer for AI.

---

## Game 11: Typing Speed Game

### Concept
Words or sentences appear on screen, and the player must type them correctly as quickly as possible. The game measures typing speed (WPM), accuracy, and provides practice for improving typing skills.

### Core Mechanics

**Word Display**: Text appears for player to type. Current character highlighted. Correct characters marked green. Incorrect characters marked red.

**Input Handling**: Real-time keystroke capture. Backspace support for corrections. No cursor movement (type sequentially).

**Scoring**: Words per minute (WPM) calculation. Accuracy percentage. Adjusted WPM (raw WPM * accuracy).

### Features to Implement

**Game Modes**: Word mode (individual words). Sentence mode (full sentences). Paragraph mode (longer text). Code mode (programming syntax). Custom text (user input).

**Difficulty Levels**: Easy (common short words). Medium (longer words, punctuation). Hard (uncommon words, numbers). Expert (symbols, mixed case).

**Timed Challenges**: 15-second sprint. 1-minute test. 5-minute endurance. Custom duration.

**Progress Tracking**: WPM history graph. Accuracy trend. Problem keys identification. Daily/weekly goals.

**Word Sources**: Common English words. Top 1000 words. Programming keywords. Quotes and literature. Custom word lists.

**Visual Modes**: Clean minimal display. Typewriter aesthetic. Matrix-style falling text. Racing theme (words are cars to catch).

**Competitive Features**: Global leaderboards. Daily challenges. Achievement badges. Multiplayer race mode.

### Educational Features

**Problem Key Analysis**: Track most mistyped keys. Suggest practice exercises. Finger placement reminders.

**Lesson Mode**: Start with home row. Progressive key introduction. Specific finger training.

**Statistics Dashboard**: All-time best WPM. Average accuracy. Total words typed. Time spent practicing.

---

## Game 12: Puzzle Slider (15 Puzzle)

### Concept
A grid contains numbered tiles with one empty space. Tiles adjacent to the empty space can slide into it. The goal is to arrange tiles in numerical order.

### Core Mechanics

**Tile Movement**: Click/tap tile adjacent to empty space. Tile slides into empty space. Only horizontal or vertical movement.

**Win Detection**: Check if all tiles are in correct position. Display win screen with statistics.

**Move Counting**: Track total moves made. Track time elapsed. Calculate efficiency rating.

### Features to Implement

**Grid Sizes**: 3x3 (8 puzzle). 4x4 (15 puzzle). 5x5 (24 puzzle). Custom sizes.

**Image Mode**: Use image instead of numbers. Image splits into tiles. Various image options. Custom image upload.

**Puzzle Variations**: Number ordering (standard). Reverse ordering. Image reconstruction. Pattern matching.

**Helper Features**: Show solution moves. Undo last move. Hint (highlight correct move). Solve automatically (watch AI).

**Challenge Modes**: Par system (solve in X moves). Time trials. Daily puzzles. Difficulty rankings.

**Statistics**: Best time per size. Best moves per size. Puzzles completed. Average solve time.

### Solvability

**Puzzle Generation**: Ensure all generated puzzles are solvable. Use valid shuffle algorithm. Verify parity before presenting.

**Difficulty Scaling**: Control shuffle depth. Easier puzzles closer to solved state.

---

## Game 13: Connect Four

### Concept
Two players take turns dropping colored discs into a vertical grid. Discs fall to the lowest available position in the chosen column. The first player to connect four discs horizontally, vertically, or diagonally wins.

### Core Mechanics

**Disc Dropping**: Click column to drop disc. Disc animates falling to position. Turn alternates between players.

**Win Detection**: Check horizontal lines of four. Check vertical lines of four. Check diagonal lines (both directions). Highlight winning line.

**Draw Detection**: No empty spaces remaining. No winner found.

### Features to Implement

**Board Sizes**: Standard 7x6. Wide 9x6. Tall 7x8. Custom dimensions.

**Game Modes**: Player vs player (local). Player vs AI. AI vs AI (watch). Online multiplayer (requires backend).

**AI Difficulty**: Random (picks any valid column). Easy (blocks obvious wins). Medium (basic strategy). Hard (minimax algorithm). Impossible (perfect play).

**Game Variations**: Standard (connect 4). Connect 5 (larger board). Pop Out (remove own discs from bottom). Power Up (special abilities).

**Visual Options**: Classic red/yellow. Custom colors. Themed designs (sports, space, ocean). Animation quality settings.

**Statistics**: Games won/lost/drawn. Win streak. Vs AI difficulty victories. Opening move statistics.

### Visual Polish

**Animations**: Disc drop physics. Bounce effect on landing. Winning line pulse/glow. Board fill on draw.

**UI Elements**: Turn indicator. Disc preview on hover. Undo button (in casual mode). New game button.

---

## Game 14: Solitaire (Klondike)

### Concept
The classic card game where the player builds four foundation piles from Ace to King by suit, using a tableau of seven columns and a draw pile.

### Core Mechanics

**Card Dealing**: Seven tableau columns (1-7 cards each, top card face-up). Remaining cards form stock pile. Four empty foundation piles.

**Card Movement**: Face-up cards can move to tableau (descending, alternating color). Complete sequences can move together. Aces start foundations. Foundations build up by suit.

**Stock Pile**: Click to draw cards (1 or 3 at a time, configurable). Cycle through stock unlimited or limited times.

### Features to Implement

**Draw Options**: Draw 1 card (easier). Draw 3 cards (harder). Unlimited passes. Limited passes (3 or 1).

**Auto Features**: Auto-complete when possible. Auto-move aces to foundation. Suggest valid moves.

**Undo System**: Unlimited undo. Undo history. Reset to start.

**Statistics Tracking**: Games played. Games won. Win percentage. Current streak. Best time. Fastest win.

**Visual Themes**: Classic green felt. Dark mode. Custom backgrounds. Card deck designs.

**Scoring Systems**: Standard scoring. Vegas scoring (negative start, earn per card). No scoring (relaxed play).

### Game Variations

**Klondike**: Standard rules described above.

**Spider Solitaire**: Eight tableau columns. Build down regardless of suit. Complete suit sequences to remove.

**FreeCell**: Four free cells for temporary card storage. All cards visible from start.

**Pyramid**: Remove pairs that sum to 13. Cards arranged in pyramid shape.

---

## Game 15: Whack-a-Mole

### Concept
Moles pop up randomly from holes, and the player must click/tap them before they disappear. Fast reactions earn points, while misses or delays cost opportunities.

### Core Mechanics

**Mole Behavior**: Moles appear in random holes. Visible for limited time (decreases with difficulty). Disappear if not whacked. Multiple moles can appear simultaneously.

**Scoring**: Points per mole whacked. Bonus for speed. Combo multiplier for consecutive hits. Negative points for misses (optional).

**Game Timing**: Fixed game duration. Score as much as possible. Mole frequency increases over time.

### Features to Implement

**Hole Layouts**: Standard 3x3 grid. Extended 4x4 grid. Circular arrangement. Random positions.

**Character Types**: Standard mole (normal points). Golden mole (bonus points). Bomb mole (lose points if hit). Speed mole (very fast). Helmet mole (requires two hits).

**Power-Ups**: Slow motion (moles stay longer). Multi-hit (one click hits all visible). Freeze (moles pause). Double points.

**Game Modes**: Classic timed (60 seconds). Survival (miss X moles, game over). Endless (play until quit). Speed run (whack X moles fastest).

**Customization**: Character skins (pirates, zombies, aliens). Environment themes (garden, desert, space). Custom durations.

**Statistics**: High score. Total moles whacked. Accuracy percentage. Average reaction time.

### Visual and Audio

**Animations**: Mole pop-up animation. Whack impact effect. Stars/swirls on hit. Hole dirt particles.

**Sound Effects**: Mole appear sound. Whack impact. Miss sound. Combo sounds. Game end fanfare.

---

## Game 16: Hangman

### Concept
One player thinks of a word, and the other guesses letters. Correct guesses reveal letter positions; incorrect guesses add to the hangman drawing. Too many wrong guesses results in loss.

### Core Mechanics

**Word Selection**: Random word from category. Custom word input. Difficulty based on word length.

**Letter Guessing**: Keyboard input or on-screen buttons. Correct letters fill in blanks. Incorrect letters show in used list.

**Game State**: Track incorrect guesses (6-10 allowed). Hangman drawing progresses with errors. Win when word complete. Lose when hangman complete.

### Features to Implement

**Word Categories**: Animals. Countries. Foods. Movies. Sports. Custom categories.

**Difficulty Levels**: Easy (short common words, more guesses). Medium (moderate words). Hard (long uncommon words, fewer guesses).

**Hints**: Category revealed. First letter given. Consonants only hint. Definition hint.

**Game Modes**: Single player vs computer. Two player (one enters word). Daily challenge. Category marathon.

**Visual Styles**: Classic stick figure. Themed drawings (robot, monster, etc.). Progress bar alternative.

**Vocabulary Building**: Word definitions after game. Add to personal word list. Track learned words.

**Statistics**: Games won/lost. Win percentage by category. Average guesses. Favorite categories.

### Multiplayer Features

**Local Two Player**: Player 1 enters secret word. Player 2 guesses. Alternating roles.

**Challenge Mode**: Same word for all players. Compare guesses needed. Leaderboard per word.

---

## Game 17: Tower Defense

### Concept
Enemies follow a path toward the player's base. The player builds defensive towers along the path to destroy enemies before they reach the goal. Strategic placement and upgrades are key to success.

### Core Mechanics

**Enemy Waves**: Enemies spawn in waves. Follow predetermined path. Various speeds and health. Reaching goal costs lives.

**Tower Placement**: Build towers on valid positions. Towers cost currency. Towers auto-attack enemies in range. Cannot block enemy path (if path-based).

**Economy**: Earn currency for kills. Interest on saved currency. Bonus for wave completion.

### Features to Implement

**Tower Types**: Basic tower (moderate damage, range, speed). Sniper tower (high damage, long range, slow). Rapid tower (low damage, fast fire). Splash tower (area damage). Slow tower (reduces enemy speed). Support tower (buffs nearby towers).

**Tower Upgrades**: Multiple upgrade paths per tower. Increased damage, range, speed. Special abilities at max level. Visual changes with upgrades.

**Enemy Types**: Basic (normal stats). Fast (quick but weak). Tank (slow but tough). Flyer (ignores path, requires anti-air). Healer (heals nearby enemies). Boss (very tough, abilities).

**Special Abilities**: Global powers with cooldowns. Air strike (damage area). Freeze all (temporary slow). Boost towers (temporary buff). Extra currency.

**Game Modes**: Campaign (story progression). Endless (infinite waves). Sandbox (unlimited money). Challenge (restrictions).

**Map Variety**: Multiple map layouts. Different path configurations. Varying build locations. Theme variations.

### Visual Design

**Tower Animations**: Idle animation. Attack animation. Upgrade visual effect. Placement preview.

**Enemy Animations**: Walk cycle. Damage indication. Death animation. Special abilities.

**Effects**: Projectiles with trails. Explosions. Status effect indicators. Victory/defeat screens.

### Strategic Depth

**Tower Synergies**: Slow towers help others. Support tower bonuses. Chokepoint optimization.

**Upgrade Strategy**: Early game economy. Mid game power. Late game specialization.

---

## Game 18: Rhythm Game

### Concept
Musical notes or beats scroll toward target zones, and the player must press the correct keys in time with the music. Accuracy and timing determine score.

### Core Mechanics

**Note System**: Notes scroll vertically (typically downward). Multiple lanes (3-6). Notes aligned with music beats. Hit window determines accuracy.

**Timing Judgment**: Perfect (exact timing). Great (close timing). Good (acceptable timing). Miss (too early or late).

**Scoring**: Points based on judgment. Combo multiplier for consecutive hits. Combo breaks on miss.

### Features to Implement

**Note Types**: Single tap notes. Hold notes (press and hold). Slide notes (drag direction). Multi-notes (simultaneous).

**Difficulty System**: Easy (fewer notes, larger window). Normal (moderate complexity). Hard (many notes, tight timing). Expert (maximum difficulty).

**Song Selection**: Multiple tracks included. Various genres and tempos. Custom beatmap import. BPM display.

**Visual Themes**: Classic arrows. Circular notes. Custom note shapes. Lane customization. Background effects synced to music.

**Practice Features**: Song preview. Section practice. Slow playback. No-fail mode.

**Progress System**: Score per song. Letter grades (D through S). Unlock new songs. Achievement badges.

### Visual Effects

**Hit Feedback**: Flash on lane hit. Judgment text display. Combo counter. Score increment.

**Background**: Music visualization. Animated backgrounds. Intensity matches song.

**UI Elements**: Song progress bar. Current score. Combo display. Health/life bar (if applicable).

### Audio Importance

**Music Selection**: Clear beat tracks. Various genres. Volume control. Hit sounds toggle.

**Sync Calibration**: Offset adjustment. Visual/audio sync test. Auto-calibration option.

---

## Game 19: Maze Runner

### Concept
The player navigates through a maze from start to finish, avoiding dead ends and finding the optimal path. Mazes can be generated randomly or designed as puzzles.

### Core Mechanics

**Movement**: Arrow keys or WASD. Smooth movement or grid-based. Collision with walls.

**Maze Structure**: Walls and passages. Single start point. Single or multiple end points. Guaranteed solvable path.

**Completion**: Reach end point. Track time and moves. Compare to optimal path.

### Features to Implement

**Maze Generation Algorithms**: Recursive backtracker. Prim's algorithm. Kruskal's algorithm. Different algorithms create different maze feels.

**Maze Sizes**: Small (15x15). Medium (30x30). Large (50x50). Custom dimensions.

**Game Modes**: Standard (reach exit). Timed (beat the clock). Collectathon (gather all items). Escape (enemies chase). Puzzle (switches and doors).

**Visibility Modes**: Full visibility (see entire maze). Fog of war (reveal as you explore). Spotlight (limited view radius). Darkness (only immediate area).

**Maze Themes**: Hedge garden. Stone dungeon. Space station. Haunted house.

**Helper Features**: Breadcrumb trail. Mini-map. Hint path (shows direction). Reset position.

**Challenge Features**: Moving walls. Teleporters. One-way passages. Keys and locked doors. Enemies.

### Visual Design

**Wall Styles**: Simple lines. 3D walls (pseudo). Themed graphics.

**Player Character**: Simple marker. Animated character. Trail behind movement.

**Effects**: Fog transitions. Goal glow. Collectible sparkles.

### Progression

**Level System**: Multiple pre-designed mazes. Increasing complexity. Boss mazes.

**Statistics**: Best times per maze. Total mazes completed. Percentage explored.

---

## Game 20: Card Battle Game

### Concept
A strategic card game where players build decks and battle against AI or other players. Cards have various stats, abilities, and synergies.

### Core Mechanics

**Card System**: Cards have attack, defense, cost. Cards have types and abilities. Draw cards each turn. Limited hand size.

**Resource System**: Mana or energy regenerates each turn. Cards cost resources to play. Maximum resource increases over time.

**Combat**: Play cards to board. Cards attack opposing cards or player. Reduce opponent health to zero to win.

### Features to Implement

**Card Types**: Creature cards (attack and defense). Spell cards (instant effects). Equipment cards (buff creatures). Trap cards (triggered effects).

**Deck Building**: Minimum deck size (30 cards). Maximum copies of same card (3). Deck validation. Save multiple decks.

**Card Abilities**: Charge (attack immediately). Taunt (must be attacked first). Shield (blocks one attack). Lifesteal (heal when dealing damage). Deathrattle (effect on death). Battlecry (effect when played).

**Game Modes**: Campaign (AI story battles). Practice (casual AI). Ranked (competitive, ladder system). Arena (draft deck, play until losses).

**Card Collection**: Earn cards through play. Card packs. Crafting system. Card rarity (common, rare, epic, legendary).

**AI Opponents**: Multiple difficulty levels. Different AI deck strategies. Boss battles with special rules.

### Visual Design

**Card Design**: Clear stat display. Ability text. Artwork space. Rarity indicator.

**Board Layout**: Player hand. Play area (board). Deck and discard. Resource display. Health totals.

**Effects**: Card play animation. Attack animation. Ability effects. Victory/defeat screens.

### Balance Considerations

**Cost Curves**: Low cost cards for early game. High cost cards for late game. Balanced resource generation.

**Counters**: Each strategy has counters. No dominant strategy. Multiple viable deck types.

## Game 21: Super Mario Bros Style Platformer

### Concept
A side-scrolling platformer game inspired by classic Mario games where the player controls a character who runs, jumps, and navigates through levels filled with platforms, enemies, obstacles, and collectibles. The objective is to reach the end of each level (typically marked by a flagpole or goal) while collecting coins, defeating enemies, and avoiding hazards. The game features multiple worlds with distinct themes, boss battles, power-up transformations, and secrets to discover.

### Core Mechanics

**Player Movement System**: The player character moves horizontally using arrow keys or A/D keys with acceleration and deceleration for a smooth, weighty feel rather than instant velocity changes. Running speed increases gradually when holding the direction key, and the character slides slightly when stopping or changing direction to simulate momentum. A dedicated run button (Shift or X) increases maximum speed and jump distance. The character faces the direction of movement, and sprite animation changes between idle, walking, running, and skidding states.

**Jump Physics**: Jumping is the core mechanic and must feel responsive and controllable. Press the jump key (Spacebar, Z, or Up Arrow) to jump with height determined by how long the button is held (variable jump height). Implement a jump buffer so that pressing jump slightly before landing still triggers a jump. Include coyote time allowing jumps for a brief moment after walking off a platform edge. The jump arc follows a parabolic curve with configurable gravity and initial velocity. Maximum jump height is reached at approximately 0.3 to 0.4 seconds of button hold. Falling speed has a terminal velocity cap to prevent uncontrollable descents.

**Collision Detection**: Implement axis-aligned bounding box (AABB) collision detection for the player, enemies, platforms, and items. Use separate collision checks for horizontal and vertical movement to prevent corner clipping. Platform collision should only occur when the player is falling and their feet are above the platform top. One-way platforms allow jumping through from below but land on from above. Solid tiles block movement from all directions.

**Camera System**: The camera follows the player horizontally with a slight lead in the movement direction. Implement a dead zone in the center of the screen where small movements don't trigger camera movement. Camera smoothly interpolates to the target position rather than snapping. Vertical camera movement is more restricted, only adjusting for significant height changes. Camera is bounded by level edges and cannot show areas outside the playable space. Optional camera shake effect for impacts and explosions.

**World and Level Structure**: The game is organized into worlds, each containing multiple levels (for example, World 1-1, World 1-2, etc.). Each world has a distinct visual theme and introduces new mechanics or enemies. The final level of each world typically features a boss encounter. Secret exits in some levels can unlock bonus worlds or shortcuts. A world map screen shows level progression and allows level selection for completed stages.

### Player States and Transformations

**Small State**: The default starting state where the player is one tile tall. Taking damage in this state results in losing a life. Can fit through one-tile-high gaps.

**Super State**: After collecting a Super Mushroom, the player grows to two tiles tall. Taking damage reverts to Small State instead of losing a life. Can break brick blocks by hitting them from below. Cannot fit through one-tile gaps without crouching.

**Fire State**: After collecting a Fire Flower while in Super State, the player gains the ability to throw fireballs. Fireballs bounce along the ground and defeat most enemies on contact. Fire button (X or Shift) throws fireballs with a cooldown between shots. Taking damage reverts to Super State.

**Star Power State**: Collecting a Star grants temporary invincibility. The player flashes through colors rapidly. Contact with enemies defeats them instead of causing damage. Increased movement speed. Duration is approximately 10 to 12 seconds with an audio cue warning when ending.

**Additional Power States (Optional Advanced Features)**: Cape or Raccoon power allowing gliding and flight. Hammer suit for throwing hammers in an arc. Frog suit for improved swimming controls. Mini mushroom for accessing tiny passages. Mega mushroom for temporary giant size destroying everything.

### Enemy Types and Behaviors

**Goomba (Basic Walker)**: The simplest enemy that walks in one direction. Turns around when hitting a wall or edge (optional, can walk off edges). Defeated by jumping on top (squishes flat) or fireball. Deals damage on side or bottom contact. Worth 100 points when defeated. Spawns from pipes or level start positions.

**Koopa Troopa (Shell Enemy)**: Walks similarly to Goomba but has a shell. Jumping on it causes it to retreat into shell and stop moving. Hitting or jumping on the shell again sends it sliding. Sliding shell defeats other enemies and can ricochet off walls. Can defeat the player if hit by a fast-moving shell. Different colors have different behaviors (green walks off edges, red turns at edges). Worth 100 points, shell kick combos multiply points.

**Piranha Plant (Pipe Enemy)**: Emerges from pipes periodically to attack. Retreats back into pipe after a set time. Cannot emerge if player is standing directly on or adjacent to the pipe. Some variants shoot fireballs. Cannot be defeated by jumping, requires fireballs or star power. Worth 200 points.

**Hammer Bro (Projectile Enemy)**: Stands on platforms and throws hammers in an arc. Hammers travel in a parabolic path and must be avoided. Occasionally jumps to different platform heights. More aggressive when player approaches. Worth 1000 points. One of the more challenging regular enemies.

**Bullet Bill (Projectile)**: Fired from cannons (Bill Blasters) at regular intervals. Travels in a straight horizontal line at constant speed. Can be defeated by jumping on top. Cannons do not fire if player is standing on or directly next to them. Worth 200 points.

**Cheep Cheep (Water Enemy)**: Fish that swim in water levels. Some jump out of water in arcing patterns. Defeated by fireballs or star power, not by jumping while in water. Worth 200 points.

**Blooper (Water Enemy)**: Squid that moves in erratic patterns underwater. Chases the player with jerky movements. More difficult to avoid than Cheep Cheeps. Worth 200 points.

**Lakitu (Cloud Enemy)**: Floats on a cloud above the player. Throws Spiny eggs that hatch into Spinies on ground contact. Follows the player horizontally. Can be defeated by jumping on the cloud. Respawns after a delay if defeated. Cloud can sometimes be ridden after defeating. Worth 800 points.

**Spiny (Hazard Enemy)**: Cannot be jumped on due to spiky shell (hurts player). Must be defeated with fireballs, shells, or star power. Walks like a Goomba. Worth 200 points.

**Buzzy Beetle (Armored Enemy)**: Similar to Koopa but immune to fireballs. Shell behavior identical to Koopa shell. Occasionally found on ceilings, dropping when player passes. Worth 100 points.

**Boss: Bowser (World Boss)**: Large enemy at the end of castle levels. Breathes fire at regular intervals. Jumps occasionally, causing ground shake. Multiple hit points or must be defeated by environmental hazard (reaching axe to collapse bridge). Different Bowser fights can have unique patterns and increasing difficulty. Final Bowser fight should be most challenging with combined attack patterns.

### Platform and Terrain Types

**Solid Ground Blocks**: Standard terrain that cannot be passed through. Can have various visual appearances (grass, stone, castle brick, etc.).

**Brick Blocks**: Breakable when hit from below by Super or Fire Mario. Small Mario bounces off without breaking. May contain coins (single or multiple hits). May contain power-ups. Breaking awards 50 points.

**Question Mark Blocks**: Bounces when hit from below. Contains coins or power-ups. Becomes an empty solid block after activation. Visual indicator shows it contains something valuable.

**Hidden Blocks**: Invisible until hit from below. Usually contain valuable items like 1-Up mushrooms or vines. Placed in secret locations that reward exploration.

**Moving Platforms**: Horizontal platforms that slide left and right on a fixed path. Vertical platforms that move up and down. Falling platforms that drop when stepped on and respawn. Circular path platforms. Platform movement continues regardless of player position.

**One-Way Platforms**: Can be jumped through from below. Solid when landing from above or walking on. Useful for vertical level design. Visually distinct (often thinner or with specific markings).

**Conveyor Belts**: Move the player in a direction while standing on them. Can move with or against player movement. Speed can vary. Visual animation shows movement direction.

**Ice Platforms**: Reduced friction causing sliding. Player takes longer to stop and change direction. Can be combined with other hazards for difficulty.

**Cloud Platforms**: Often found in sky levels. May be solid or semi-solid (can jump through). Some move, some are stationary.

**Donut Blocks**: Start falling after player stands on them for a moment. Visual wobble indicates instability. Respawn after falling off screen.

### Collectibles and Items

**Coins**: The primary collectible scattered throughout levels. Worth 200 points each. Collecting 100 coins awards an extra life (counter resets). Found floating in air, in blocks, or in hidden areas. Coin trails often indicate correct paths or secrets.

**Super Mushroom**: Red mushroom that transforms Small Mario to Super Mario. Emerges from blocks and moves horizontally. Bounces off walls and falls off edges. Worth 1000 points.

**Fire Flower**: Orange and red flower that grants fire power. Only appears if player is already Super (otherwise spawns mushroom). Stationary when revealed. Worth 1000 points.

**Star (Super Star)**: Grants temporary invincibility. Bounces erratically when revealed. Worth 1000 points. Triggers special music.

**1-Up Mushroom**: Green mushroom that awards an extra life. Moves like Super Mushroom but often placed in hidden or difficult locations. Worth 0 points (the life is the reward). Distinctive color makes it recognizable.

**Coin Blocks**: Some blocks contain multiple coins (usually 10 to 16). Must hit repeatedly within time limit to get all coins. Timer visible through block sprite changing speed.

### Level Elements and Hazards

**Pipes**: Iconic green pipes that serve multiple purposes. Some are purely decorative obstacles. Some can be entered by pressing down while standing on them. Lead to underground bonus areas or warp zones. Piranha Plants emerge from certain pipes. Pipe color can indicate function (green standard, red dangerous, etc.).

**Pits and Gaps**: Bottomless or water-filled gaps that cause instant death if fallen into. Require jumping to cross. Width varies to create different difficulty challenges. May have platforms within them.

**Lava and Fire**: Instant death hazard found in castle levels. May have fireballs that jump out at intervals. Creates sense of danger and urgency.

**Water**: Swimming mechanics engage when entering water. Player can swim in any direction using movement keys. Jump button provides upward thrust. Gravity is reduced but still present. Air meter optional for underwater sections. Water enemies appear in these areas.

**Spike Traps**: Stationary hazards that cause damage on contact. Cannot be destroyed. Must be avoided through careful movement.

**Thwomps (Crushing Blocks)**: Large stone faces that wait for player approach. Slam down quickly when player is below. Rise slowly back up. Must time passage carefully. Found primarily in castle levels.

**Fire Bars**: Rotating bars of fireballs attached to blocks. Rotate in consistent patterns (clockwise or counter-clockwise). Different lengths create varying difficulty. Must time movement to pass safely.

**Pendulums and Swinging Platforms**: Platforms that swing on fixed pivot points. Require timing jumps to land on or pass. Create dynamic obstacles.

**Warp Zones**: Hidden areas containing pipes to skip ahead to later worlds. Significant reward for exploration. Classic Mario element.

**Checkpoints**: Mid-level flags that save progress. Respawn at checkpoint after losing life. Visual confirmation when activated (flag changes). One or more per level depending on length.

**Flagpole (Level Goal)**: End-of-level marker that player jumps to. Higher grab point awards more points (100 to 5000 scale). Triggers level completion sequence. Flag slides down, player walks to castle. Fireworks may trigger based on timer value.

### Visual Design System

**Tile-Based Graphics**: Levels are constructed from a grid of tiles (typically 16x16 or 32x32 pixels). Background tiles, ground tiles, platform tiles, and decoration tiles. Tileset changes per world theme. Animated tiles for water, lava, coins, etc.

**Parallax Backgrounds**: Multiple background layers moving at different speeds. Creates depth illusion. Sky, distant hills, near hills, etc. Backgrounds change with world themes.

**World Themes**: 

World 1 - Grassland: Bright green grass, blue sky, white clouds, rolling hills, simple enemies, mushroom platforms.

World 2 - Desert: Sandy ground, pyramids, cacti, sun hazards, Pokey enemies, quicksand pits.

World 3 - Water/Beach: Ocean backgrounds, underwater sections, Cheep Cheeps, Bloopers, coral decorations.

World 4 - Ice/Snow: Slippery platforms, falling snow particles, frozen enemies, ice physics.

World 5 - Sky/Clouds: Cloud platforms, high altitude, Lakitus, Para-Goombas (winged enemies), vertically-focused levels.

World 6 - Forest/Jungle: Dense vegetation, vine climbing, tree platforms, forest enemies.

World 7 - Mountain/Cave: Rocky terrain, dark areas, narrow passages, falling rocks.

World 8 - Castle/Lava: Dark fortress aesthetic, lava hazards, Bowser iconography, most challenging enemies, final boss.

**Character Animation Frames**: Idle standing pose. Walking cycle (3 to 4 frames). Running cycle (faster animation). Jumping (single frame or arc-based). Falling. Skidding/braking. Crouching. Death. Power-up transformation. Fire throwing. Swimming (4 frames).

**Enemy Animation Frames**: Each enemy has appropriate animations for walking, attacking, and death.

**Particle Effects**: Coin sparkle. Block break debris. Fireball impact. Enemy defeat poof. Star sparkle trail. Power-up reveal glow. Landing dust.

### Audio Design

**Music Tracks**: Main overworld theme (upbeat, iconic). Underground theme (mysterious, echoey). Underwater theme (flowing, calm). Castle theme (tense, ominous). Boss battle theme (intense, dramatic). Star power theme (fast, triumphant). Level complete jingle. Game over melody. World map theme.

**Sound Effects**: Jump sound. Landing sound. Coin collection ding. Power-up appearance. Power-up collection (growth sound). Block bump. Block break. Fireball shoot. Fireball impact. Enemy stomp. Enemy shell kick. Player damage (shrink sound). Player death. 1-Up collection. Time warning beep. Flagpole slide. Pause sound.

**Audio Implementation Notes**: Sound effects should be short and punchy. Music should loop seamlessly. Star power music overrides normal music. Low time warning triggers faster music tempo. Boss rooms have distinct audio atmosphere.

### User Interface Elements

**Title Screen**: Game logo with animation. Start Game button. Level Select (if unlocked). Options/Settings button. High scores display. Animated background with game elements.

**World Map Screen**: Visual map showing all worlds and levels. Current position indicator. Completed levels marked. Locked levels shown differently. Path connections between levels. World theme preview.

**In-Game HUD**: Score display (top left). Coin counter with coin icon. World and level indicator (1-1, etc.). Lives remaining with character icon. Time remaining countdown. Power-up status indicator.

**Pause Menu**: Resume button. Restart level. Return to map. Settings access. Semi-transparent overlay.

**Level Complete Screen**: Score breakdown (time bonus, enemy bonus, etc.). Stars or rating earned. Next level button. Replay option. Map return option.

**Game Over Screen**: Game Over text. Continue option (if lives system allows). Score summary. Return to title.

**Settings Menu**: Music volume slider. Sound effects volume slider. Control remapping. Difficulty selection (if applicable). Display options.

### Scoring System

**Point Values**: Coin: 200 points. Goomba stomp: 100 points. Koopa stomp: 100 points. Shell kick enemy combo: 200, 400, 800, 1600, etc. (doubles each enemy). Fireball enemy kill: 200 points. Brick break: 50 points. Power-up collection: 1000 points. 1-Up collection: 0 points. Flagpole grab: 100 to 5000 (height-based). Time bonus: Remaining seconds multiplied by 50.

**Combo System**: Consecutive stomps without landing increase multiplier. Shell kicks defeating multiple enemies multiply points. Displayed with floating score text that gets larger.

**High Score Tracking**: Store top 10 scores with names. Persist in localStorage. Separate leaderboards per world (optional).

### Game Modes

**Story Mode**: Progress through all worlds sequentially. Lives system (start with 3 to 5). Game over returns to world start or uses continues. Final boss victory triggers ending sequence.

**Free Play**: Any unlocked level selectable. Practice without life consequences. Good for speedrun practice.

**Time Attack**: Complete levels as fast as possible. Global timer across all levels or per-level times. Leaderboard for best times.

**Endless Mode (Procedural)**: Randomly generated levels. Increasing difficulty. Survive as long as possible. High score focus.

**Boss Rush**: Face all bosses consecutively. Limited health/lives. Speedrun element.

**Multiplayer Modes**: Cooperative: Two players on screen, camera follows both or splits. Competitive: Race to flagpole. Turn-based: Alternate on death or level complete.

### Level Design Principles

**Difficulty Curve**: World 1 introduces basic mechanics gently. Each world adds one or two new elements. Early levels of each world are easier than late levels. Optional hard paths for skilled players. Secrets reward exploration without being required.

**Teaching Through Design**: First Goomba encounter has safe setup to learn stomping. First pit is small, near safe landing. New enemies introduced in controlled environments. Block contents taught through placement (mushroom when needed). Visual language is consistent (question blocks always contain something).

**Level Pacing**: Mix of action and calm moments. Checkpoint placement after difficult sections. Coin trails suggest paths. Alternating above-ground and underground sections. Boss buildup through increasingly difficult enemies.

**Secret Placement**: Hidden blocks in seemingly empty spaces. Pipe entrances require experimentation. Wall passages in suspicious dead ends. Alternate exits hidden in non-obvious locations. Rewards match difficulty of finding them.

### Technical Implementation Details

**Game Loop Structure**: Fixed timestep update (60 FPS target). Delta time handling for smooth animation. Separate update and render phases. Input polling at start of each frame. Physics updates with collision resolution. Enemy AI updates. Camera position update. Render all layers back to front.

**Level Data Format**: JSON or custom format for level data. Tile map with layer support. Entity spawn positions. Trigger zones for events. Level metadata (time limit, music, background).

**Tile Map Rendering**: Only render tiles visible on screen. Tile index maps to tileset sprite. Animated tiles cycle through frames. Collision map separate from visual map (allows decorative non-solid tiles).

**Entity Management**: Object pool for enemies, projectiles, particles. Activate/deactivate based on camera distance. State machine for complex entity behaviors. Collision layers (player, enemy, projectile, item, etc.).

**Save System**: Save which levels are completed. Save high scores. Save unlocked secrets/warp zones. Save total coins collected (if persistent). Auto-save on level complete.

### Controls Configuration

**Keyboard Controls Default**: Arrow Keys or WASD: Movement. Spacebar or W or Up: Jump. Shift or X: Run/Fire. Down or S: Crouch/Enter Pipe. Escape or P: Pause. Enter: Select/Confirm.

**Gamepad Support**: Left Stick/D-Pad: Movement. A Button: Jump. B/X Button: Run/Fire. Start: Pause. Support common gamepad mappings.

**Touch Controls (Mobile)**: Left side virtual D-pad or left/right buttons. Right side jump button (large, easy to hit). Run button near jump. Pause button in corner. Responsive touch areas.

### Polish and Feel

**Screen Shake**: Brief shake on block break. Shake on Thwomp impact. Subtle shake on boss damage.

**Juice Effects**: Squash and stretch on landing. Character leans into running direction. Block bounce animation. Enemy squash on stomp. Particles on every interaction.

**Responsive Feedback**: Immediate jump response (no delay). Visual confirmation of all inputs. Hit stop on enemy defeat (brief freeze frame). Screen flash on damage or power-up.

**Game Feel Tuning**: Jump should feel satisfying and controllable. Landing should feel impactful. Running should feel fast and exciting. Damage should feel significant but fair.

### Accessibility Features

**Adjustable Difficulty**: Extra lives option. Damage reduction mode. Slower game speed option. Auto-run option.

**Visual Accessibility**: High contrast mode. Colorblind-friendly enemy/item colors. Screen shake toggle. Flash reduction option.

**Control Accessibility**: Full key remapping. One-handed control option. Hold-to-run vs toggle-run. Auto-jump option.

### Advanced Features (Optional Enhancements)

**Level Editor**: Place tiles on grid. Place enemies and items. Set spawn points and goals. Test play immediately. Save and load custom levels. Share levels via code or file.

**Replay System**: Record input for each level. Playback ghost for time attack. Share replays.

**Achievement System**: Complete all levels. Collect all coins in a level. Speedrun achievements. No damage achievements. Find all secrets.

**Unlockables**: Character skins. Music player. Concept art gallery. Hard mode.

---

## Implementation Prompt Template

When requesting any game from this document, use the following structure:

```
Create a [GAME NAME] game using HTML, CSS, and JavaScript in a single file.

Include these specific features:
- [List desired features from the game's section]
- [Any modifications or additions]

Visual style preference:
- [Theme choice]
- [Color scheme]
- [Animation level]

Additional requirements:
- [Mobile support needed?]
- [Specific controls?]
- [Multiplayer features?]

Please ensure:
1. The game is fully playable immediately upon opening the HTML file
2. All assets are generated with CSS/Canvas (no external images required)
3. High scores persist using localStorage
4. The game is responsive and works on both desktop and mobile
5. Include clear instructions visible to the player
```

---

## Quick Reference: Game Complexity Levels

**Beginner Projects (Good for learning)**: Pong, Memory Match, Whack-a-Mole, Hangman, Tic-Tac-Toe (not detailed above but simple to add).

**Intermediate Projects**: Snake, Breakout, Tetris, Flappy Bird, Minesweeper, 2048, Connect Four, Typing Game.

**Advanced Projects**: Space Invaders, Platformer, Tower Defense, Solitaire, Puzzle Slider, Maze Runner.

**Complex Projects**: Rhythm Game, Card Battle Game.

---

This document provides comprehensive specifications for creating professional-quality browser-based games. Each game section contains all necessary details for implementation, from core mechanics to visual polish and user interface design. Use these specifications as a complete blueprint for game development.