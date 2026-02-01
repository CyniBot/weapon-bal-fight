// Unarmed Character
// Gains speed and damage with every hit, deals damage based on current speed

const UnarmedCharacter = {
    id: 'unarmed',
    name: 'Unarmed',
    icon: '⚪',
    color: '#999',
    borderColor: '#666',
    description: 'Gains speed and damage with every hit. Damage scales with current velocity.',
    
    // No weapon - deals contact damage
    weapon: null,
    
    // Base stats
    stats: {
        speed: 5,
        maxSpeed: 5,
        damage: 0,
        maxHp: 100,
        radius: 30
    },
    
    // Called when character is initialized
    onInit(ball) {
        ball.speed = this.stats.speed;
        ball.maxSpeed = this.stats.maxSpeed;
        ball.damage = this.stats.damage;
        ball.radius = this.stats.radius;
        ball.maxHp = this.stats.maxHp;
        ball.hp = ball.maxHp;
        
        // Reset hit counter
        ball.hitCount = 0;
    },
    
    // Called every frame
    onUpdate(ball, target) {
        // Calculate damage based on current speed
        // Damage = speed * 2 (so at 5 speed = 10 damage, at 10 speed = 20 damage, etc)
        const speedDamage = ball.currentSpeed * 2;
        ball.damage = speedDamage;
    },
    
    // Called when hitting a wall
    onWallHit(ball, wallType) {
        // Increase speed by 0.5 when hitting wall (can't damage walls)
        ball.hitCount++;
        ball.speed = Math.min(ball.speed + 0.5, ball.maxSpeed);
        
        // Also increase max speed by 0.5
        ball.maxSpeed += 0.5;
        
        // Apply the speed boost immediately
        // Get current direction
        const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (currentSpeed > 0) {
            const ratio = ball.speed / currentSpeed;
            ball.vx *= ratio;
            ball.vy *= ratio;
        }
    },
    
    // Called when hitting another ball
    onBallHit(ball, otherBall) {
        // Calculate damage based on current speed
        const contactDamage = ball.currentSpeed * 2;
        
        // Deal damage to the other ball
        otherBall.hp = Math.max(0, otherBall.hp - contactDamage);
        
        // Update opponent's HP display
        const otherPlayer = otherBall === ball1 ? 1 : 2;
        document.getElementById(`hp${otherPlayer}-text`).textContent = Math.ceil(otherBall.hp);
        
        if (otherBall.hp <= 0) {
            endGame(otherBall === ball1 ? 2 : 1);
        }
        
        // Increase speed and damage by 0.5 on successful hit
        ball.hitCount++;
        ball.speed = Math.min(ball.speed + 0.5, ball.maxSpeed);
        ball.damage += 0.5;
        
        // Also increase max speed by 0.5
        ball.maxSpeed += 0.5;
    }
};

// Register the character
registerCharacter(UnarmedCharacter);
