# Unlimited Games

Welcome to **Unlimited Games**, a collection of HTML5/JS games hosted in a single modern hub.

## Project Structure

- `index.html`: The main hub listing all games.
- `games/`: Directory containing individual game projects.
    - `_template/`: A starter template for creating new games.
- `assets/`: Global assets (images, fonts, sounds).
- `prompts/`: Record of prompts and requirements.

## How to Play

1.  Open `index.html` in your web browser.
2.  Browse the available games.
3.  Click "Play" on a game card to launch it.

## How to Add a New Game

See the workflow guide at [.agent/workflows/add_feature.md](.agent/workflows/add_feature.md) for detailed instructions.

1.  Copy `games/_template` to `games/your-game-name`.
2.  Develop your game in `index.html`, `style.css`, and `script.js` within that folder.
3.  Add a card for your game in the main `index.html`.

## Technologies

- HTML5
- CSS3 (Vanilla, Custom Properties)
- JavaScript (ES6+)

## License
MIT
