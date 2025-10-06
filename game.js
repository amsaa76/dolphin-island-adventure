// Game Canvas Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true; // Enable smooth rendering for illustrated style

// Game State
let gameState = "start"; // start, playing, paused, gameOver, demoExpired
let gameRunning = false;
let animationId;

// Demo Timer (3 minutes = 180 seconds)
let demoTimeRemaining = 180;
let demoTimerInterval;

// Player Stats
let playerHealth = 100;
let playerMaxHealth = 100;
let playerCoins = 0;
let playerScore = 0;
let playerLevel = 1;

// Player (Dolphin) - Placeholder for illustrated sprite
const player = {
    x: 100,
    y: canvas.height - 150, // Position on ground
    width: 100,
    height: 80,
    speed: 5,
    velocityY: 0,
    isJumping: false,
    isGrounded: true,
    direction: "right", // "left" or "right"
    attacking: false,
    attackCooldown: 0,
    attackDuration: 15, // frames
    currentAnimation: "idle", // idle, walk, jump, attack
    animationFrame: 0,
    animationTimer: 0,
    animationSpeed: 10, // frames per second for animation update
    spriteSheet: null, // Placeholder for actual sprite sheet image
    animations: { // Define animation frames and their properties
        idle: { frames: 4, row: 0, frameWidth: 100, frameHeight: 80 },
        walk: { frames: 6, row: 1, frameWidth: 100, frameHeight: 80 },
        jump: { frames: 1, row: 2, frameWidth: 100, frameHeight: 80 },
        attack: { frames: 3, row: 3, frameWidth: 100, frameHeight: 80 }
    },
    invincible: false,
    invincibleTimer: 0
};

// Ground level
const groundLevel = canvas.height - 80;

// Enemies (Meme Coins) - Placeholders for illustrated sprites
let enemies = [];
const enemyTypes = [
    { name: "PEPE", color: "#4CAF50", width: 80, height: 80, health: 60, damage: 15, speed: 2, points: 100, weapon: "tongue", spriteSheet: null, animations: { idle: { frames: 4, row: 0, frameWidth: 80, frameHeight: 80 }, walk: { frames: 6, row: 1, frameWidth: 80, frameHeight: 80 } } },
    { name: "BONK", color: "#FFC107", width: 70, height: 70, health: 50, damage: 12, speed: 2.5, points: 80, weapon: "bone", spriteSheet: null, animations: { idle: { frames: 4, row: 0, frameWidth: 70, frameHeight: 70 }, walk: { frames: 6, row: 1, frameWidth: 70, frameHeight: 70 } } },
    { name: "DOGE", color: "#FF9800", width: 90, height: 90, health: 70, damage: 18, speed: 1.8, points: 120, weapon: "shiba-claw", spriteSheet: null, animations: { idle: { frames: 4, row: 0, frameWidth: 90, frameHeight: 90 }, walk: { frames: 6, row: 1, frameWidth: 90, frameHeight: 90 } } },
    { name: "WOJAK", color: "#B0BEC5", width: 60, height: 60, health: 40, damage: 10, speed: 3, points: 70, weapon: "sad-tear", spriteSheet: null, animations: { idle: { frames: 4, row: 0, frameWidth: 60, frameHeight: 60 }, walk: { frames: 6, row: 1, frameWidth: 60, frameHeight: 60 } } },
    { name: "SHIB", color: "#E57373", width: 85, height: 85, health: 65, damage: 16, speed: 1.9, points: 110, weapon: "katana", spriteSheet: null, animations: { idle: { frames: 4, row: 0, frameWidth: 85, frameHeight: 85 }, walk: { frames: 6, row: 1, frameWidth: 85, frameHeight: 85 } } },
    { name: "FLOKI", color: "#9CCC65", width: 75, height: 75, health: 55, damage: 13, speed: 2.2, points: 90, weapon: "axe", spriteSheet: null, animations: { idle: { frames: 4, row: 0, frameWidth: 75, frameHeight: 75 }, walk: { frames: 6, row: 1, frameWidth: 75, frameHeight: 75 } } },
    { name: "BABYDOGE", color: "#81D4FA", width: 65, height: 65, health: 45, damage: 11, speed: 2.8, points: 75, weapon: "pacifier", spriteSheet: null, animations: { idle: { frames: 4, row: 0, frameWidth: 65, frameHeight: 65 }, walk: { frames: 6, row: 1, frameWidth: 65, frameHeight: 65 } } }
];

// Coins
let coinItems = [];

// Power-ups
let powerUps = [];
const powerUpTypes = [
    { name: "Health Potion", color: "#E74C3C", effect: "heal", value: 25, duration: 0, size: 30 },
    { name: "Invincibility", color: "#F1C40F", effect: "invincible", value: 0, duration: 5 * 60, size: 30 } // 5 seconds
];

// Particles for effects
let particles = [];

// Keys
const keys = {
    w: false, ArrowUp: false,
    a: false, ArrowLeft: false,
    s: false, ArrowDown: false,
    d: false, ArrowRight: false,
    " ": false // Space for attack
};

// Event Listeners
document.addEventListener("keydown", (e) => {
    const key = e.key === " " ? " " : e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
        e.preventDefault();
    }
});

document.addEventListener("keyup", (e) => {
    const key = e.key === " " ? " " : e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
        e.preventDefault();
    }
});

// --- UI Functions ---
function updateHUD() {
    document.getElementById("healthBar").style.width = `${playerHealth / playerMaxHealth * 100}%`;
    document.getElementById("healthText").textContent = `${playerHealth}/${playerMaxHealth}`;
    document.getElementById("level").textContent = playerLevel;
    document.getElementById("coins").textContent = playerCoins;
    document.getElementById("score").textContent = playerScore;
}

function updateDemoTimer() {
    const minutes = Math.floor(demoTimeRemaining / 60);
    const seconds = demoTimeRemaining % 60;
    document.getElementById("timeRemaining").textContent =
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function showScreen(screenId) {
    document.querySelectorAll(".screen-overlay").forEach(screen => {
        screen.style.display = "none";
    });
    if (screenId !== "gameCanvas") { // gameCanvas is not an overlay, it's the main game area
        document.getElementById(screenId).style.display = "flex";
    }
}

// --- Game Flow Functions ---
function startGame() {
    showScreen("gameCanvas"); // Hide all overlays, canvas is visible by default
    gameState = "playing";
    gameRunning = true;
    
    // Reset game state
    playerHealth = 100;
    playerCoins = 0;
    playerScore = 0;
    playerLevel = 1;
    enemies = [];
    coinItems = [];
    powerUps = [];
    particles = [];
    player.x = 100;
    player.y = groundLevel - player.height;
    player.velocityY = 0;
    player.isJumping = false;
    player.isGrounded = true;
    player.attacking = false;
    player.attackCooldown = 0;
    player.currentAnimation = "idle";
    player.animationFrame = 0;
    player.invincible = false;
    player.invincibleTimer = 0;

    // Start demo timer
    demoTimeRemaining = 180;
    updateDemoTimer();
    clearInterval(demoTimerInterval);
    demoTimerInterval = setInterval(() => {
        demoTimeRemaining--;
        updateDemoTimer();
        if (demoTimeRemaining <= 0) {
            endDemo();
        }
    }, 1000);
    
    updateHUD();
    gameLoop();
}

function restartGame() {
    startGame();
}

function endDemo() {
    gameRunning = false;
    gameState = "demoExpired";
    clearInterval(demoTimerInterval);
    cancelAnimationFrame(animationId);
    
    document.getElementById("demoFinalScore").textContent = playerScore;
    document.getElementById("demoFinalCoins").textContent = playerCoins;
    showScreen("demoExpiredScreen");
}

function gameOver() {
    gameRunning = false;
    gameState = "gameOver";
    clearInterval(demoTimerInterval);
    cancelAnimationFrame(animationId);
    
    document.getElementById("finalScore").textContent = playerScore;
    document.getElementById("finalCoins").textContent = playerCoins;
    showScreen("gameOverScreen");
}

function showUpgradeScreen() {
    showScreen("upgradeScreen");
}

function closeUpgradeScreen() {
    // Depending on previous state, go back to start or game over screen
    if (gameState === "gameOver" || gameState === "demoExpired") {
        showScreen("gameOverScreen"); // Or a specific screen for demo expired
    } else {
        showScreen("startScreen");
    }
}

// Payment Functions (Placeholder)
function payWithCard() {
    alert("Payment with Card/PayPal will be integrated here.\nThis will redirect to payment gateway.");
}

function payWithDolphin() {
    alert("Wallet connection will be integrated here.\nThis will connect to Solana wallet and process $DOLPHIN payment.");
}

// --- Drawing Functions (Illustrated Style) ---

// Draw Dolphin Character (Muscular, Illustrated Style)
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    if (player.direction === "left") {
        ctx.scale(-1, 1);
    }
    ctx.translate(-player.width / 2, -player.height / 2);

    // Apply invincibility flicker
    if (player.invincible && Math.floor(player.invincibleTimer / 5) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    // Placeholder for actual illustrated sprite
    // In a real game, you would draw a sprite sheet frame here
    // For now, we draw a stylized dolphin using canvas API

    // If a sprite sheet is loaded, draw from it
    if (player.spriteSheet) {
        const anim = player.animations[player.currentAnimation];
        const sx = anim.frameWidth * player.animationFrame;
        const sy = anim.row * anim.frameHeight;
        ctx.drawImage(player.spriteSheet, sx, sy, anim.frameWidth, anim.frameHeight, 0, 0, player.width, player.height);
    } else {
        // Fallback drawing if no sprite sheet
        // Body
        ctx.fillStyle = "#4A90E2"; // Blue
        ctx.beginPath();
        ctx.ellipse(player.width / 2, player.height / 2 + 10, player.width / 2 - 10, player.height / 2 - 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Muscular Chest/Shoulders
        ctx.fillStyle = "#357ABD"; // Darker blue
        ctx.beginPath();
        ctx.ellipse(player.width / 2, player.height / 2 - 5, player.width / 2 - 20, player.height / 2 - 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = "#4A90E2";
        ctx.beginPath();
        ctx.ellipse(player.width / 2 + 20, player.height / 2 - 20, 30, 25, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = "#357ABD";
        ctx.beginPath();
        ctx.ellipse(player.width / 2 + 45, player.height / 2 - 20, 20, 10, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(player.width / 2 + 30, player.height / 2 - 28, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(player.width / 2 + 32, player.height / 2 - 28, 2, 0, Math.PI * 2);
        ctx.fill();

        // Fins (simplified for now)
        ctx.fillStyle = "#357ABD";
        ctx.beginPath();
        ctx.moveTo(player.width / 2 - 30, player.height / 2 + 30);
        ctx.lineTo(player.width / 2 - 50, player.height / 2 + 50);
        ctx.lineTo(player.width / 2 - 10, player.height / 2 + 50);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(player.width / 2 + 30, player.height / 2 + 30);
        ctx.lineTo(player.width / 2 + 50, player.height / 2 + 50);
        ctx.lineTo(player.width / 2 + 10, player.height / 2 + 50);
        ctx.closePath();
        ctx.fill();
    }

    // Attack animation (simple visual effect)
    if (player.attacking) {
        ctx.strokeStyle = "#FFD700"; // Gold color
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(player.width / 2 + 60, player.height / 2 - 10, 30, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
    }

    ctx.globalAlpha = 1; // Reset alpha
    ctx.restore();
}

// Draw Enemy (Meme Monster) - Placeholder for illustrated sprite
function drawEnemy(enemy) {
    ctx.save();
    
    // If a sprite sheet is loaded, draw from it
    if (enemy.spriteSheet) {
        const anim = enemy.animations[enemy.currentAnimation || "idle"];
        const sx = anim.frameWidth * enemy.animationFrame;
        const sy = anim.row * anim.frameHeight;
        ctx.drawImage(enemy.spriteSheet, sx, sy, anim.frameWidth, anim.frameHeight, enemy.x, enemy.y, enemy.width, enemy.height);
    } else {
        // Fallback drawing if no sprite sheet
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2 - 15, enemy.y + enemy.height / 2 - 10, 10, 0, Math.PI * 2);
        ctx.arc(enemy.x + enemy.width / 2 + 15, enemy.y + enemy.height / 2 - 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2 - 15, enemy.y + enemy.height / 2 - 10, 4, 0, Math.PI * 2);
        ctx.arc(enemy.x + enemy.width / 2 + 15, enemy.y + enemy.height / 2 - 10, 4, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.fillStyle = "#A0522D"; // Brownish
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 + 20, 15, 0, Math.PI, false);
        ctx.fill();

        // Weapon (simplified placeholder)
        ctx.fillStyle = "#8B4513"; // Brown
        if (enemy.weapon === "tongue") {
            ctx.fillRect(enemy.x + enemy.width / 2 - 5, enemy.y + enemy.height / 2 + 35, 10, 20);
        } else if (enemy.weapon === "bone") {
            ctx.fillRect(enemy.x + enemy.width / 2 + 30, enemy.y + enemy.height / 2 - 20, 10, 40);
        } // Add more weapon drawings as needed
    }

    // Health bar
    ctx.fillStyle = "#333";
    ctx.fillRect(enemy.x, enemy.y - 20, enemy.width, 10);
    ctx.fillStyle = "#FF4136"; // Red
    ctx.fillRect(enemy.x, enemy.y - 20, enemy.width * (enemy.health / enemy.maxHealth), 10);

    ctx.restore();
}

// Draw Coin
function drawCoin(coin) {
    ctx.save();
    const pulse = Math.sin(Date.now() / 200 + coin.x) * 3;

    ctx.fillStyle = "#FFD700"; // Gold
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 20 + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#FFA500"; // Darker Gold
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 15 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#FFA500";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$DOL", coin.x, coin.y);

    ctx.restore();
}

// Draw Power-up
function drawPowerUp(powerUp) {
    ctx.save();
    const pulse = Math.sin(Date.now() / 150 + powerUp.x) * 2;

    ctx.fillStyle = powerUp.color;
    ctx.beginPath();
    ctx.arc(powerUp.x, powerUp.y + pulse, powerUp.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(powerUp.effect === "heal" ? "+" : "★", powerUp.x, powerUp.y + pulse);

    ctx.restore();
}

// Draw Background (Island) - More detailed and serious style
function drawBackground() {
    // Sky Gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, "#87CEEB"); // Light Blue
    skyGradient.addColorStop(0.7, "#B0E0E6"); // Powder Blue
    skyGradient.addColorStop(1, "#ADD8E6"); // Light Blue
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Distant Mountains/Hills
    ctx.fillStyle = "#6B8E23"; // Olive Drab
    ctx.beginPath();
    ctx.moveTo(0, groundLevel - 100);
    ctx.lineTo(canvas.width * 0.2, groundLevel - 200);
    ctx.lineTo(canvas.width * 0.4, groundLevel - 150);
    ctx.lineTo(canvas.width * 0.6, groundLevel - 250);
    ctx.lineTo(canvas.width * 0.8, groundLevel - 180);
    ctx.lineTo(canvas.width, groundLevel - 120);
    ctx.lineTo(canvas.width, groundLevel);
    ctx.lineTo(0, groundLevel);
    ctx.closePath();
    ctx.fill();

    // Clouds (more realistic shapes)
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    const cloudOffset = (Date.now() / 100) % (canvas.width + 200);
    drawCloud(cloudOffset - 150, 80, 150, 70);
    drawCloud(cloudOffset + 200, 120, 180, 90);
    drawCloud(cloudOffset + 600, 60, 120, 60);

    // Ground (Island) - Layered for depth
    // Darker base ground
    ctx.fillStyle = "#8B4513"; // SaddleBrown
    ctx.fillRect(0, groundLevel, canvas.width, canvas.height - groundLevel);

    // Grass layer
    ctx.fillStyle = "#32CD32"; // LimeGreen
    ctx.beginPath();
    ctx.moveTo(0, groundLevel);
    ctx.lineTo(canvas.width, groundLevel);
    ctx.lineTo(canvas.width, groundLevel - 30);
    ctx.lineTo(canvas.width * 0.8, groundLevel - 40);
    ctx.lineTo(canvas.width * 0.6, groundLevel - 20);
    ctx.lineTo(canvas.width * 0.4, groundLevel - 50);
    ctx.lineTo(canvas.width * 0.2, groundLevel - 30);
    ctx.lineTo(0, groundLevel - 40);
    ctx.closePath();
    ctx.fill();

    // Sand/Beach layer
    ctx.fillStyle = "#F4A460"; // SandyBrown
    ctx.beginPath();
    ctx.moveTo(0, groundLevel + 20);
    ctx.lineTo(canvas.width, groundLevel + 20);
    ctx.lineTo(canvas.width, groundLevel + 50);
    ctx.lineTo(0, groundLevel + 50);
    ctx.closePath();
    ctx.fill();

    // Water edge
    ctx.fillStyle = "#4682B4"; // SteelBlue
    ctx.fillRect(0, groundLevel + 50, canvas.width, 10);

    // Palm Trees (more detailed)
    drawDetailedPalmTree(150, groundLevel - 100);
    drawDetailedPalmTree(canvas.width - 200, groundLevel - 120);
}

function drawCloud(x, y, width, height) {
    ctx.beginPath();
    ctx.ellipse(x, y, width * 0.6, height * 0.8, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.4, y - height * 0.3, width * 0.5, height * 0.7, 0, 0, Math.PI * 2);
    ctx.ellipse(x + width * 0.8, y, width * 0.6, height * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawDetailedPalmTree(x, y) {
    // Trunk
    ctx.fillStyle = "#8B4513"; // SaddleBrown
    ctx.beginPath();
    ctx.moveTo(x, y + 100);
    ctx.lineTo(x + 10, y + 100);
    ctx.lineTo(x + 20, y);
    ctx.lineTo(x - 10, y);
    ctx.closePath();
    ctx.fill();

    // Leaves (more organic)
    ctx.fillStyle = "#228B22"; // ForestGreen
    ctx.beginPath();
    ctx.ellipse(x + 5, y - 20, 40, 20, -Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y - 20, 40, 20, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y - 20, 40, 20, Math.PI / 2, 0, Math.PI * 2);
    ctx.ellipse(x + 5, y - 20, 40, 20, 0, 0, Math.PI * 2);
    ctx.fill();
}

// --- Game Logic Updates ---

// Update Player
function updatePlayer() {
    // Determine player animation state
    let moving = false;
    if (keys.a || keys.ArrowLeft) {
        player.x -= player.speed;
        player.direction = "left";
        moving = true;
    }
    if (keys.d || keys.ArrowRight) {
        player.x += player.speed;
        player.direction = "right";
        moving = true;
    }

    if (player.isJumping) {
        player.currentAnimation = "jump";
    } else if (player.attacking) {
        player.currentAnimation = "attack";
    } else if (moving) {
        player.currentAnimation = "walk";
    } else {
        player.currentAnimation = "idle";
    }

    // Update animation frame
    player.animationTimer++;
    if (player.animationTimer >= player.animationSpeed) {
        const anim = player.animations[player.currentAnimation];
        player.animationFrame = (player.animationFrame + 1) % anim.frames;
        player.animationTimer = 0;
    }

    // Jump
    if ((keys.w || keys.ArrowUp) && player.isGrounded) {
        player.velocityY = -15; // Jump strength
        player.isJumping = true;
        player.isGrounded = false;
    }

    // Gravity
    player.velocityY += 0.8; // Gravity strength
    player.y += player.velocityY;

    // Ground collision
    if (player.y + player.height >= groundLevel) {
        player.y = groundLevel - player.height;
        player.velocityY = 0;
        player.isJumping = false;
        player.isGrounded = true;
    }

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Attack
    if (keys[" "] && player.attackCooldown <= 0) {
        player.attacking = true;
        player.attackCooldown = player.attackDuration; // Set cooldown
        checkAttackHit();
    }
    if (player.attackCooldown > 0) {
        player.attackCooldown--;
        if (player.attackCooldown === 0) {
            player.attacking = false;
        }
    }

    // Invincibility timer
    if (player.invincibleTimer > 0) {
        player.invincibleTimer--;
        if (player.invincibleTimer === 0) {
            player.invincible = false;
        }
    }
}

// Check Attack Hit
function checkAttackHit() {
    enemies.forEach((enemy, index) => {
        // Simple collision detection for attack
        const attackRange = 80; // How far the attack reaches
        const playerAttackX = player.direction === "right" ? player.x + player.width : player.x - attackRange;
        
        // Check for overlap with enemy bounding box
        if (player.attacking &&
            playerAttackX < enemy.x + enemy.width &&
            playerAttackX + attackRange > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            enemy.health -= 20; // Damage dealt
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#FF4136"); // Red particles for hit
            
            if (enemy.health <= 0) {
                playerScore += enemy.points;
                enemies.splice(index, 1);
                updateHUD();
                // Chance to drop a power-up
                if (Math.random() < 0.3) { // 30% chance
                    spawnPowerUp(enemy.x, enemy.y);
                }
            }
        }
    });
}

// Spawn Enemy
function spawnEnemy() {
    // Adjust spawn rate and max enemies based on player level
    const maxEnemies = 3 + playerLevel;
    const spawnChance = 0.005 + (playerLevel * 0.001);

    if (Math.random() < spawnChance && enemies.length < maxEnemies) {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        enemies.push({
            x: canvas.width + 50,
            y: groundLevel - type.height,
            width: type.width,
            height: type.height,
            ...type,
            maxHealth: type.health,
            dx: -(type.speed + (playerLevel * 0.5)), // Move left, speed increases with level
            currentAnimation: "walk", // Enemies always walk
            animationFrame: 0,
            animationTimer: 0,
            animationSpeed: 12 // Enemy animation speed
        });
    }
}

// Update Enemies
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x += enemy.dx;
        
        // Update enemy animation frame
        enemy.animationTimer++;
        if (enemy.animationTimer >= enemy.animationSpeed) {
            const anim = enemy.animations[enemy.currentAnimation];
            enemy.animationFrame = (enemy.animationFrame + 1) % anim.frames;
            enemy.animationTimer = 0;
        }

        // Remove off-screen enemies
        if (enemy.x + enemy.width < 0) {
            enemies.splice(index, 1);
            return;
        }
        
        // Collision with player
        if (!player.invincible &&
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            playerHealth -= enemy.damage; // Player takes damage
            createParticles(player.x + player.width / 2, player.y + player.height / 2, "#FF4136"); // Red particles for player hit
            player.invincible = true;
            player.invincibleTimer = 60; // 1 second invincibility
            enemies.splice(index, 1); // Enemy disappears after hitting player
            updateHUD();
            
            if (playerHealth <= 0) {
                gameOver();
            }
        }
    });
}

// Spawn Coin
function spawnCoin() {
    if (Math.random() < 0.01) { // Adjust spawn rate
        coinItems.push({
            x: canvas.width + 20,
            y: groundLevel - 50 - Math.random() * 100, // Random height above ground
            value: 10,
            dx: -3 // Move left
        });
    }
}

// Update Coins
function updateCoins() {
    coinItems.forEach((coin, index) => {
        coin.x += coin.dx;
        
        // Remove off-screen coins
        if (coin.x < -20) {
            coinItems.splice(index, 1);
            return;
        }
        
        // Check collection by player
        const dx = coin.x - (player.x + player.width / 2);
        const dy = coin.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) { // Collection radius
            playerCoins += coin.value;
            playerScore += 25;
            coinItems.splice(index, 1);
            createParticles(coin.x, coin.y, "#FFD700"); // Gold particles for collection
            updateHUD();
        }
    });
}

// Spawn Power-up
function spawnPowerUp(x, y) {
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    powerUps.push({
        x: x,
        y: y,
        dx: -2,
        ...type
    });
}

// Update Power-ups
function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.x += powerUp.dx;

        // Remove off-screen
        if (powerUp.x < -powerUp.size) {
            powerUps.splice(index, 1);
            return;
        }

        // Check collection by player
        const dx = powerUp.x - (player.x + player.width / 2);
        const dy = powerUp.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 40) {
            applyPowerUp(powerUp);
            powerUps.splice(index, 1);
        }
    });
}

// Apply Power-up effect
function applyPowerUp(powerUp) {
    if (powerUp.effect === "heal") {
        playerHealth = Math.min(playerMaxHealth, playerHealth + powerUp.value);
        createParticles(player.x + player.width / 2, player.y + player.height / 2, "#00FF00"); // Green particles for heal
    } else if (powerUp.effect === "invincible") {
        player.invincible = true;
        player.invincibleTimer = powerUp.duration; // Set invincibility duration
        createParticles(player.x + player.width / 2, player.y + player.height / 2, "#ADD8E6"); // Blue particles for invincibility
    }
    updateHUD();
}

// Create Particles
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 7,
            dy: (Math.random() - 0.5) * 7,
            color: color,
            life: 40
        });
    }
}

// Update Particles
function updateParticles() {
    particles.forEach((p, index) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Draw Particles
function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 40;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

// --- Main Game Loop ---
function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    spawnEnemy();
    spawnCoin();
    
    updatePlayer();
    updateEnemies();
    updateCoins();
    updatePowerUps(); // Update power-ups
    updateParticles();
    
    drawPlayer();
    enemies.forEach(drawEnemy);
    coinItems.forEach(drawCoin);
    powerUps.forEach(drawPowerUp); // Draw power-ups
    drawParticles();
    
    animationId = requestAnimationFrame(gameLoop);
}

// Initial setup
showScreen("startScreen");
updateHUD();
updateDemoTimer();

