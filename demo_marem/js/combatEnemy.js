var CombatEnemy = {};

CombatEnemy = function(args) {

    this.player = null;
    this.direction = 0;
    this.speed = 150;
    this.type = ''
    this.distanceToPlayer = 9999;
    this.doOnce = true;
    this.health = 100;
    this.xp = xpPerEnemy;

    this.doOnce = true;

    this.doOnce1 = true;

    this.explosion = {
        tag: ['explosion'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
            scale: { name: "Amble.Math.Vector2", args: {x:2 ,y:2}},
        }},
        renderer: {name: 'Amble.Graphics.AnimationRenderer', args: {
            sprite: 'data/explosion.png',
            updatesPerFrame: 2,
            frames: 9,
            layer: 3,
            loop: false
        }},
        components: []
    };

    this.bloodParticle = {
        tag: ['particle'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
            scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
        }},
        renderer: {name: 'Amble.Graphics.RectRenderer', args: {
            color: '#ffc400',
            size: { name: "Amble.Math.Vector2", args: {x:4 ,y:4}},
            layer: 1
        }},
        components: [
            { name: "Particle", args: {}}
        ]
    };
    this.bloodParticleSystem = {
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
        }},
        components: [
            { name: "ParticleSystem", args: {
                particlesPerSecond: 50,
                variation: 1,
                particleLife: 1,
                angle: { name: "Amble.Math.Vector2", args: {x:-0.25 ,y: -1}},
                speed: 750,
                toEmit: 10,
                life: 0.1
            }}
        ]
    };

    this.dmg = 50;

    this.isBoss = false;

    this.gameOverDistance = 150;
    this.bossSpeed = 25;

    this.bossHealth = 17500;

    this.lastHealth = this.bossHealth;
}

CombatEnemy.prototype = {

    awake: function(self) {
        this.player = Amble.app.scene.getActorByName('player');

        // var dirToPlayer = self.transform.position.x - this.player.transform.position.x;
        // if(self.transform.position.x < 0) {
        //     if(dirToPlayer > 0) {
        //         // self.transform.scale.x *= -1;
        //     } else {
        //         self.transform.scale.x *= -1;
        //     }
        // } else {
        //     if(dirToPlayer > 0) {
        //         self.transform.scale.x *= -1;
        //     } else {
        //         // self.transform.scale.x *= -1;
        //     }
        // }

        var playerLvl = this.player.getComponent('Player').currentLevel
        this.health *= playerLvl;
        this.dmg *=playerLvl

    },

    start: function(self) { },

    update: function(self) {

        if(this.doOnce1) {
            if(this.isBoss) {
                this.health = this.bossHealth;
            }

            var dirToPlayer = self.transform.position.x - this.player.transform.position.x;

            this.doOnce1 = false;
        }

        var d = self.transform.position.x - this.player.transform.position.x
        this.distanceToPlayer = Math.sqrt(Math.pow(d,2));
        if(this.doOnce) {
            if(self.transform.position.x > Amble.app.mainCamera.camera.position.x) {
                this.direction = -1;
            } else {
                this.direction = 1;
            }
            this.doOnce = false;
        }

        if(!this.isBoss) {
            //die
            if(this.health < 0) {
                Amble.app.scene.remove(self);
                var playerScript = this.player.getComponent('Player');
                var index = playerScript.combatEnemies.indexOf(self);

                if(this.health != -666 && !bossCombat && (gameOver || !gameEnd)) {
                    playerScript.currentXP += this.xp;
                    playerScript.scaleMultipler += scalePerEnemy;
                    playerScript.deadEnemies++;

                    eeee.volume = 0.05;
                    eeee.play();
                }

                eee.volume = 0.1;
                eee.play();
                
                var explosion = Amble.app.scene.instantiate(this.explosion);
                explosion.transform.position.x = self.transform.position.x;
                explosion.transform.position.y = self.transform.position.y;
                explosion.renderer.loop = false;
                playerScript.explosions.push(explosion);

                playerScript.combatEnemies.splice(index, 1);
            }

            // console.log(this.direction)

            if(this.distanceToPlayer > 50) {
                var v = this.direction * this.speed * Amble.Time.deltaTime
                self.transform.position.x += v;
            } else {
                Amble.app.scene.remove(self);
                var playerScript = this.player.getComponent('Player');
                var index = playerScript.combatEnemies.indexOf(self);

                playerScript.health -= this.dmg;
                if(playerScript.health < 0) {
                    playerScript.health = 0;
                }

                var explosion = Amble.app.scene.instantiate(this.explosion);
                explosion.transform.position.x = self.transform.position.x;
                explosion.transform.position.y = self.transform.position.y;
                explosion.renderer.loop = false;
                playerScript.explosions.push(explosion);

                if(gameOver || !gameEnd) {
                    eeee.volume = 0.05;
                    eeee.play();
                    eee.volume = 0.1;
                    eee.play();
                }

                playerScript.combatEnemies.splice(index, 1);
            }
        } else {

            if(this.lastHealth != this.health) {
                for(var i = 0; i < 20; i++) {
                    var p = Amble.app.scene.instantiate(this.bloodParticleSystem);
                    p.transform.position.x = self.transform.position.x;
                    p.transform.position.y = self.transform.position.y;
                    p.getComponent('ParticleSystem').particle = this.bloodParticle;
                }
            }


            if(this.health < 0 && !gameOver) {
                gameEnd = true;
                endlessScreen = true;
                endlessImg = Amble.app.loader.getAsset('data/comics_end.png');
                //show game end;
                console.log('you won')
            } else {
                if(this.distanceToPlayer > this.gameOverDistance) {
                    var v = this.direction * this.bossSpeed * Amble.Time.deltaTime
                    self.transform.position.x += v;
                } else if(!gameEnd){
                    gameOver = true;
                    //show game over
                    endlessScreen = true;
                    endlessImg = Amble.app.loader.getAsset('data/comics_over_boss.png');
                    console.log('game over')
                }
            }

            this.lastHealth = this.health;

            //boss
        }
    }
}
