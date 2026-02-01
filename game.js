// Main Game Logic
const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Physics constants
const GRAVITY = 0.5;

// Available characters registry
const CHARACTERS = {};

// Register a character
function registerCharacter(character) {
    CHARACTERS[character.id] = character;
}

// Get all character IDs
function getCharacterIds() {
    return Object.keys(CHARACTERS);
}

// Get character by ID
function getCharacter(id) {
    return CHARACTERS[id.toLowerCase()] || null;
}

// Game state
let gameRunning = false;
let animationId = null;

// Initialize balls
const ball1 = {
    x: 0,
    y: 0,
    vx: 4,
    vy: 0,
    characterId: 'unarmed',
    character: null,
    hp: 100,
    maxHp: 100,
    speed: 5,
    maxSpeed: 5,
    damage: 0,
    radius: 30,
    lastShot: 0,
    hitCount: 0,
    currentSpeed: 0
};

const ball2 = {
    x: 0,
    y: 0,
    vx: -3,
    vy: 0,
    characterId: 'unarmed',
    character: null,
    hp: 100,
    maxHp: 100,
    speed: 5,
    maxSpeed: 5,
    damage: 0,
    radius: 30,
    lastShot: 0,
    hitCount: 0,
    currentSpeed: 0
};

const projectiles = [];

// Generate weapon select buttons dynamically
function generateWeaponButtons() {
    const container = document.getElementById('weaponSelect');
    const characterIds = getCharacterIds();
    
    if (characterIds.length === 0) return;
    
    // Player 1 buttons
    characterIds.forEach((id) => {
        const char = getCharacter(id);
        const btn = document.createElement('button');
        btn.className = 'weapon-btn' + (id === ball1.characterId ? ' active' : '');
        btn.textContent = `P1: ${char.name}`;
        btn.onclick = () => setCharacter(1, id);
        container.appendChild(btn);
    });
    
    // Add separator
    const separator = document.createElement('div');
    separator.style.width = '100%';
    separator.style.height = '5px';
    container.appendChild(separator);
    
    // Player 2 buttons
    characterIds.forEach((id) => {
        const char = getCharacter(id);
        const btn = document.createElement('button');
        btn.className = 'weapon-btn' + (id === ball2.characterId ? ' active' : '');
        btn.textContent = `P2: ${char.name}`;
        btn.onclick = () => setCharacter(2, id);
        container.appendChild(btn);
    });
}

function setCharacter(player, characterId) {
    const ball = player === 1 ? ball1 : ball2;
    const char = getCharacter(characterId);
    
    if (!char) return;
    
    ball.characterId = characterId;
    ball.character = char;
    
    // Initialize character
    char.onInit(ball);
    
    ball.hp = ball.maxHp;
    
    // Update UI
    updateCharacterDisplay(player);
    
    // Update active button styling
    document.querySelectorAll('.weapon-btn').forEach(btn => {
        const btnText = btn.textContent;
        if (btnText.includes(`P${player}:`) && btnText.includes(char.name)) {
            btn.classList.add('active');
        } else if (btnText.includes(`P${player}:`)) {
            btn.classList.remove('active');
        }
    });
}

function updateCharacterDisplay(player) {
    const ball = player === 1 ? ball1 : ball2;
    const char = ball.character;
    
    if (!char) return;
    
    if (player === 1) {
        document.querySelector('.player1 .fighter-name').textContent = char.name;
        document.querySelector('.player1 .fighter-icon').textContent = char.icon;
        document.getElementById('weapon1-display').textContent = `VS ${ball2.character.icon} ${ball2.character.name}`;
        document.getElementById('speed1').textContent = ball.speed.toFixed(1);
        document.getElementById('damage1').textContent = ball.damage.toFixed(1);
        document.getElementById('hp1-text').textContent = Math.ceil(ball.hp);
    } else {
        document.querySelector('.player2 .fighter-name').textContent = char.name;
        document.querySelector('.player2 .fighter-icon').textContent = char.icon;
        document.getElementById('weapon2-display').textContent = char.icon;
        document.getElementById('speed2').textContent = ball.speed.toFixed(1);
        document.getElementById('damage2').textContent = ball.damage.toFixed(1);
        document.getElementById('hp2-text').textContent = Math.ceil(ball.hp);
    }
}

function drawBall(ball) {
    const char = ball.character;
    
    // Ball body
    ctx.fillStyle = char.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball outline
    ctx.strokeStyle = char.borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // HP text
    ctx.fillStyle = ball === ball1 ? 'white' : '#333';
    ctx.font = 'bold 16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(ball.hp), ball.x, ball.y);
}

function drawProjectile(proj) {
    const sprite = proj.sprite;
    const size = proj.size;
    
    ctx.save();
    ctx.translate(proj.x, proj.y);
    
    // Draw based on sprite type
    if (sprite === 'arrow') {
        ctx.rotate(Math.atan2(proj.vy, proj.vx));
        ctx.fillStyle = proj.color;
        ctx.fillRect(-10, -2, 20, 4);
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(6, -4);
        ctx.lineTo(6, 4);
        ctx.closePath();
        ctx.fill();
    } else if (sprite === 'bullet') {
        ctx.fillStyle = proj.color;
        ctx.fillRect(-size/2, -size/2, size, size);
    }
    
    ctx.restore();
}

function updateBall(ball) {
    // Apply gravity
    ball.vy += GRAVITY;
    
    // Update position
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Calculate current speed
    ball.currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

    // Bounce off walls (left and right)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx *= -1;
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
        
        // Trigger character wall hit event
        if (ball.character) {
            ball.character.onWallHit(ball, ball.x < canvas.width / 2 ? 'left' : 'right');
            updateCharacterDisplay(ball === ball1 ? 1 : 2);
        }
    }
    
    // Bounce off floor
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -1;
        
        // Trigger character wall hit event
        if (ball.character) {
            ball.character.onWallHit(ball, 'floor');
            updateCharacterDisplay(ball === ball1 ? 1 : 2);
        }
    }
    
    // Bounce off ceiling
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
        
        // Trigger character wall hit event
        if (ball.character) {
            ball.character.onWallHit(ball, 'ceiling');
            updateCharacterDisplay(ball === ball1 ? 1 : 2);
        }
    }
}

function checkBallCollision() {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = ball1.radius + ball2.radius;
    
    if (distance < minDistance) {
        // Balls are colliding
        
        // Calculate collision normal
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Separate balls
        const overlap = minDistance - distance;
        ball1.x -= nx * overlap * 0.5;
        ball1.y -= ny * overlap * 0.5;
        ball2.x += nx * overlap * 0.5;
        ball2.y += ny * overlap * 0.5;
        
        // Calculate relative velocity
        const dvx = ball2.vx - ball1.vx;
        const dvy = ball2.vy - ball1.vy;
        
        // Calculate relative velocity in collision normal direction
        const dvn = dvx * nx + dvy * ny;
        
        // Only bounce if balls are moving towards each other
        if (dvn < 0) {
            // Apply impulse
            const impulse = dvn;
            
            ball1.vx += impulse * nx;
            ball1.vy += impulse * ny;
            ball2.vx -= impulse * nx;
            ball2.vy -= impulse * ny;
            
            // Trigger character ball hit events
            if (ball1.character) {
                ball1.character.onBallHit(ball1, ball2);
                updateCharacterDisplay(1);
            }
            if (ball2.character) {
                ball2.character.onBallHit(ball2, ball1);
                updateCharacterDisplay(2);
            }
        }
    }
}

function shootProjectile(ball, target) {
    if (!ball.character || !ball.character.weapon) return;
    
    const weapon = ball.character.weapon;
    const now = Date.now();
    
    if (now - ball.lastShot < weapon.fireRate) return;
    
    ball.lastShot = now;
    
    // Calculate direction to target
    const dx = target.x - ball.x;
    const dy = target.y - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    projectiles.push({
        x: ball.x,
        y: ball.y,
        vx: (dx / dist) * weapon.projectileSpeed,
        vy: (dy / dist) * weapon.projectileSpeed,
        damage: weapon.damage,
        owner: ball,
        sprite: weapon.sprite,
        size: weapon.projectileSize,
        color: ball.character.borderColor
    });
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        
        // No gravity on projectiles
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Remove if out of bounds
        if (proj.x < -50 || proj.x > canvas.width + 50 || proj.y < -50 || proj.y > canvas.height + 50) {
            projectiles.splice(i, 1);
            continue;
        }

        // Check collision with balls
        const targets = [ball1, ball2].filter(b => b !== proj.owner);
        for (const target of targets) {
            const dx = proj.x - target.x;
            const dy = proj.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < target.radius + proj.size / 2) {
                target.hp = Math.max(0, target.hp - proj.damage);
                updateHP(target);
                projectiles.splice(i, 1);
                
                // Knockback
                target.vx += proj.vx * 0.3;
                target.vy += proj.vy * 0.3;
                
                break;
            }
        }
    }
}

function updateHP(ball) {
    const player = ball === ball1 ? 1 : 2;
    document.getElementById(`hp${player}-text`).textContent = Math.ceil(ball.hp);
    
    if (ball.hp <= 0) {
        endGame(ball === ball1 ? 2 : 1);
    }
}

function endGame(winner) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    // Draw winner overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`PLAYER ${winner} WINS!`, canvas.width / 2, canvas.height / 2);
}

function gameLoop() {
    if (!gameRunning) return;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update physics
    updateBall(ball1);
    updateBall(ball2);
    
    // Check ball collision
    checkBallCollision();
    
    // Character update hooks
    if (ball1.character) ball1.character.onUpdate(ball1, ball2);
    if (ball2.character) ball2.character.onUpdate(ball2, ball1);
    
    shootProjectile(ball1, ball2);
    shootProjectile(ball2, ball1);
    
    updateProjectiles();

    // Draw everything
    projectiles.forEach(drawProjectile);
    drawBall(ball1);
    drawBall(ball2);

    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    gameLoop();
}

function pauseGame() {
    gameRunning = !gameRunning;
    document.getElementById('pauseBtn').textContent = gameRunning ? 'PAUSE' : 'RESUME';
    if (gameRunning) gameLoop();
}

function resetGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    // Reset balls
    ball1.x = canvas.width * 0.25;
    ball1.y = canvas.height / 2;
    
    // Random direction and speed for ball1
    const angle1 = Math.random() * Math.PI * 2; // Random angle 0-360 degrees
    const speed1 = 3 + Math.random() * 4; // Random speed between 3-7
    ball1.vx = Math.cos(angle1) * speed1;
    ball1.vy = Math.sin(angle1) * speed1;
    ball1.hitCount = 0;
    ball1.lastShot = 0;
    
    ball2.x = canvas.width * 0.75;
    ball2.y = canvas.height / 2;
    
    // Random direction and speed for ball2
    const angle2 = Math.random() * Math.PI * 2; // Random angle 0-360 degrees
    const speed2 = 3 + Math.random() * 4; // Random speed between 3-7
    ball2.vx = Math.cos(angle2) * speed2;
    ball2.vy = Math.sin(angle2) * speed2;
    ball2.hitCount = 0;
    ball2.lastShot = 0;
    
    // Reinitialize characters
    if (ball1.character) ball1.character.onInit(ball1);
    if (ball2.character) ball2.character.onInit(ball2);
    
    projectiles.length = 0;
    
    updateHP(ball1);
    updateHP(ball2);
    updateCharacterDisplay(1);
    updateCharacterDisplay(2);
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBall(ball1);
    drawBall(ball2);
    
    document.getElementById('pauseBtn').textContent = 'PAUSE';
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Initialize after characters are loaded
window.addEventListener('load', () => {
    generateWeaponButtons();
    setCharacter(1, 'unarmed');
    setCharacter(2, 'unarmed');
    resetGame();
});
