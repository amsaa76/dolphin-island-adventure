# Dolphin Island Adventure - Web3 Game

This is a web-based action/adventure game demo, featuring a muscular dolphin hero battling meme-coin monsters on an island. The game is designed with an illustrated, non-pixelated art style, aiming for a modern 2D game illustration aesthetic.

## Game Features (Demo Version):

-   **Muscular Dolphin Hero:** Placeholder for a detailed, non-pixelated dolphin character with animations for idle, walk, jump, and attack.
-   **Meme Coin Enemies:** Seven distinct meme-coin characters (PEPE, BONK, DOGE, WOJAK, SHIB, FLOKI, BABYDOGE) with unique placeholder designs and weapons.
-   **Detailed Island Environment:** Illustrated background featuring sky, clouds, mountains, grass, beach, and detailed palm trees.
-   **Smooth Animation Logic:** Code is structured to handle smooth sprite animations for player and enemies.
-   **Professional HUD:** Health bar, level, score, and $DOLPHIN coin count with a modern design.
-   **Enhanced Game Mechanics:** Player movement, jumping, attacking, dynamic enemy spawning, power-ups (health potion, temporary invincibility), and improved collision detection.
-   **3-Minute Free Demo:** Includes start, game over, and demo expired screens with upgrade options.
-   **Payment Options:** Placeholder for credit card and $DOLPHIN token payments to unlock the full game.

## How to Play (Demo Controls):

-   **Move:** `W A S D` keys or `Arrow Keys`
-   **Jump:** `W` key or `Up Arrow`
-   **Attack:** `SPACEBAR`

## Project Structure:

-   `index.html`: Main HTML file for the game structure and UI.
-   `style.css`: CSS file for styling the game interface and overall look.
-   `game.js`: JavaScript file containing all game logic, drawing functions, and animation handling.
-   `assets/`: (To be created) This folder will contain all game assets like sprite sheets for characters, enemies, and environmental elements.

## Integrating Illustrated Sprites:

To achieve the desired professional, non-pixelated 

illustrated sprites, you will need to provide the following image assets:

1.  **Dolphin Hero Sprite Sheet:**
    -   A single image file containing all animation frames for the muscular dolphin hero.
    -   Frames should include: `idle`, `walk` (left/right), `jump`, and `attack`.
    -   Each animation state should have multiple frames for smooth transitions.
    -   The `game.js` file is configured to use `player.animations` object to define frame properties (frames per animation, row in sprite sheet, frame width/height).

2.  **Meme Coin Enemies Sprite Sheets:**
    -   Separate image files (or a single combined sprite sheet) for each of the seven meme-coin enemies (PEPE, BONK, DOGE, WOJAK, SHIB, FLOKI, BABYDOGE).
    -   Each enemy sprite sheet should include `idle` and `walk` animation frames.
    -   Ensure each enemy has a unique look and weapon as described in the GDD.

3.  **Environmental Assets:**
    -   Any specific background elements, foreground details, or parallax layers you wish to use instead of the programmatic drawing.

### How to Integrate Sprites:

1.  **Place Image Files:** Put your `.png` or `.webp` sprite sheet files into the `assets/` directory.
2.  **Load Images in `game.js`:**
    -   In `game.js`, you will need to load these images using `new Image()`.
    -   Assign the loaded image objects to `player.spriteSheet` and `enemy.spriteSheet` (for each enemy type).
    -   Example:
        ```javascript
        const dolphinSprite = new Image();
        dolphinSprite.src = 'assets/dolphin_sprite_sheet.png';
        dolphinSprite.onload = () => {
            player.spriteSheet = dolphinSprite;
        };
        // Do similar for enemies
        ```
3.  **Adjust Animation Properties:** Update the `player.animations` and `enemyTypes[i].animations` objects in `game.js` to correctly reflect the `frameWidth`, `frameHeight`, `frames` count, and `row` (if using a single sprite sheet with multiple rows for different animations) for each animation.

## Development & Contribution:

Feel free to clone this repository, make your changes, and submit pull requests. Let's build an amazing Web3 game together!

## Live Demo:

[https://branch-1--dolphin-illustrated-game.manus.im/](https://branch-1--dolphin-illustrated-game.manus.im/)

---

**Powered by Dolphin Solana** 🐬 | [dolphintokens.com](https://dolphintokens.com)

