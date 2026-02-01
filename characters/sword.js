// Sword Character
// Wields a sword that gains +1 damage each hit
const SwordCharacter = {
    id: 'sword',
    name: 'Sword',
    icon: '🗡️',
    color: '#ff6b6b',
    borderColor: '#c92a2a',
    description: 'Sword deals 1 more damage each attack. Reliable damage scaling.',
    
    // Sword weapon
    weapon: {
        damage: 5,
        fireRate: 800, // Attack every 0.8 seconds
        projectileSpeed: 12,
        projectileSize: 8,
        sprite: 'sword' // Custom sprite for sword
    },
    
    // Base stats
    stats: {
        speed: 5,
        maxSpeed: 5,
        damage: 5,
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
        
        // Reset sword damage
        ball.swordDamage = 5;
        ball.hitCount = 0;
        
        // Update weapon damage
        if (ball.character && ball.character.weapon) {
            ball.character.weapon.damage = ball.swordDamage;
        }
    },
    
    // Called every frame
    onUpdate(ball, target) {
        // Update damage display
        ball.damage = ball.swordDamage;
        
        // Update weapon damage
        if (ball.character && ball.character.weapon) {
            ball.character.weapon.damage = ball.swordDamage;
        }
    },
    
    // Custom draw method for the sword weapon
    onDrawWeapon(ctx, ball) {
        ctx.translate(ball.x, ball.y);
        
        // Rotate sword based on movement direction
        const angle = Math.atan2(ball.vy, ball.vx);
        ctx.rotate(angle);
        
        // Draw sword handle (brown)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(ball.radius - 5, -4, 10, 8);
        
        // Draw sword blade (silver/gray)
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(ball.radius + 5, -3, 25, 6);
        
        // Draw sword tip (pointed)
        ctx.beginPath();
        ctx.moveTo(ball.radius + 30, 0);
        ctx.lineTo(ball.radius + 25, -5);
        ctx.lineTo(ball.radius + 25, 5);
        ctx.closePath();
        ctx.fill();
        
        // Draw crossguard
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(ball.radius + 3, -6, 4, 12);
        
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    },
    
    // Called when hitting a wall
    onWallHit(ball, wallType) {
        // No special effect on wall hit
    },
    
    // Called when hitting another ball
    onBallHit(ball, otherBall) {
        // Contact damage based on current sword damage
        const contactDamage = ball.swordDamage * 0.5; // Less than projectile damage
        
        otherBall.hp = Math.max(0, otherBall.hp - contactDamage);
        
        // Update opponent's HP display
        const otherPlayer = otherBall === ball1 ? 1 : 2;
        document.getElementById(`hp${otherPlayer}-text`).textContent = Math.ceil(otherBall.hp);
        
        if (otherBall.hp <= 0) {
            endGame(otherBall === ball1 ? 2 : 1);
        }
        
        // Increase sword damage by 1
        ball.swordDamage += 1;
        ball.hitCount++;
        
        // Play slash sound effect (visual feedback for now)
        console.log('⚔️ SLASH! Damage now: ' + ball.swordDamage);
    },
    
    // Custom method called when projectile hits
    onProjectileHit(ball, target) {
        // Increase sword damage by 1 on successful hit
        ball.swordDamage += 1;
        ball.hitCount++;
        
        // Play slash sound effect (visual feedback for now)
        console.log('⚔️ SLASH! Damage now: ' + ball.swordDamage);
    }
};

// Register the character
registerCharacter(SwordCharacter);
