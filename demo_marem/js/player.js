var Player = {}

Player = function(args) {

    this.right = true;

    this.runSpeed = 360;
    this.currentRunSpeed = 0;
    this.runDrag = 720;
    this.direction = 1;

    this.normalAnim = null;
    this.runAnim = null;

    this.leftEnemies = [];
    this.rightEnemies = [];

    this.pressedRight = false;
    this.pressedLeft = false;

    this.originalHitDistance = 300;
    this.hitDistance = this.originalHitDistance;
    this.scaleMultipler = 1.004;

    this.deadEnemies = 0;

    this.normalAnim = new Amble.Graphics.AnimationRenderer({
        sprite: 'data/player_idle.png',
        updatesPerFrame: 8,
        frames: 3,
        layer: 2,
    });

    this.runAnim = new Amble.Graphics.AnimationRenderer({
        sprite: 'data/player_run.png',
        updatesPerFrame: 5,
        frames: 7,
        layer: 2,
    });

    this.level1ShootAnim = new Amble.Graphics.AnimationRenderer({
        sprite: 'data/player_lvl1_anim.png',
        updatesPerFrame: 8,
        frames: 4,
        layer: 2,
    });

    this.level1Idle = new Amble.Graphics.SpriteRenderer({
        sprite: 'data/player_lvl1_idle.png',
        layer: 2,
    });

    this.level2ShootAnim = new Amble.Graphics.AnimationRenderer({
        sprite: 'data/player_lvl2_anim.png',
        updatesPerFrame: 8,
        frames: 4,
        layer: 2,
    });

    this.level2Idle = new Amble.Graphics.SpriteRenderer({
        sprite: 'data/player_lvl2_idle.png',
        layer: 2,
    });

    this.level3ShootAnim = new Amble.Graphics.AnimationRenderer({
        sprite: 'data/player_lvl3_anim.png',
        updatesPerFrame: 8,
        frames: 4,
        layer: 2,
    });

    this.level3Idle = new Amble.Graphics.SpriteRenderer({
        sprite: 'data/player_lvl3_idle.png',
        layer: 2,
    });

    this.level4ShootAnim = new Amble.Graphics.AnimationRenderer({
        sprite: 'data/player_lvl4_anim.png',
        updatesPerFrame: 3,
        frames: 4,
        layer: 2,
    });

    this.level4Idle = new Amble.Graphics.SpriteRenderer({
        sprite: 'data/player_lvl4_idle.png',
        layer: 2,
    });

    this.bullets = [];

    this.bullet = {
        tag: ['bullet'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
            scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
            rotation: 180
        }},
        renderer: {name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'data/ammo_1.png',
            layer: 1
        }},
        components: [
            { name: "Bullet", args: {}}
        ]
    };

    this.levelUpInfo = {
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
            scale: { name: "Amble.Math.Vector2", args: {x:1.1 ,y: 1.1}},
        }},
        renderer: {name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'data/bullet.png',
            layer: 3
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
            color: '#d50000',
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
                variation: 0.5,
                particleLife: 1,
                angle: { name: "Amble.Math.Vector2", args: {x:-0.25 ,y: -1}},
                speed: 750,
                toEmit: 10,
                life: 0.1
            }}
        ]
    };

    this.gunParticle = {
        tag: ['particle'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
            scale: { name: "Amble.Math.Vector2", args: {x:1.5 ,y:1.5}},
        }},
        renderer: {name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'data/scale.png',
            layer: 2
        }},
        components: [
            { name: "Particle", args: {}}
        ]
    };
    this.gunParticleSystem = {
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
        }},
        components: [
            { name: "ParticleSystem", args: {
                particlesPerSecond: 10,
                variation: 0.5,
                particleLife: 1,
                angle: { name: "Amble.Math.Vector2", args: {x:-0.5 ,y: -1}},
                speed: 250,
                toEmit: 1,
                life: 0.1
            }}
        ]
    };

    this.combatBGPefab = {
        tag: ['bg'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
            scale: { name: "Amble.Math.Vector2", args: {x:1.1 ,y:1.1}},
        }},
        renderer: {name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'data/combat_background.png',
            layer: 0
        }},
        components: []
    };

    this.combatBackground = null;

    this.shootTimer = 0;

    this.currentLevel = 1;
    this.currentXP = 0;
    this.xp = [
        1000,
        1500,
        2000,
        2500
    ];

    this.defaultScale = new Amble.Math.Vector2({x:0, y: 0});

    this.scaleMultipler = 1.00;

    this.weaponsPrefs = [
        {
            positionMod: new Amble.Math.Vector2({x: -50, y: -13}),
            particleMod: new Amble.Math.Vector2({x: -45, y: -13}),
            shootSpread: 0,
            bulletsPerShoot: 1,
            shootCooldown: 0.25,
            weaponDmg: 60,
        },
        {
            positionMod: new Amble.Math.Vector2({x: -50, y: 0}),
            particleMod: new Amble.Math.Vector2({x: -10, y: -13}),
            shootSpread: 0.1,
            bulletsPerShoot: 1,
            shootCooldown: 0.1,
            weaponDmg: 40,
        },
        {

            positionMod: new Amble.Math.Vector2({x: -45, y: 5}),
            particleMod: new Amble.Math.Vector2({x: 10, y: -13}),
            shootSpread: 0.25,
            bulletsPerShoot: 10,
            shootCooldown: 0.1,
            weaponDmg: 7,
            speedMod: 0.7
        }
    ];

    this.cannon = {
        positionMod: new Amble.Math.Vector2({x: -45, y: -7}),
        shootSpread: 0.05,
        bulletsPerShoot: 1,
        shootCooldown: 0.3,
        weaponDmg: 500,
        speedMod: 0.3
    }

    this.stopForce = 1;

    this.explosions = [];

    this.maxHealth = 1000;
    this.health = this.maxHealth;

    this.canHideLevelUp = false;

    this.bullet1 = new Amble.Graphics.SpriteRenderer({
        sprite: 'data/ammo_1.png',
        layer: 1
    })

    this.bullet2 = new Amble.Graphics.SpriteRenderer({
        sprite: 'data/ammo_2.png',
        layer: 1
    })

    this.bullet3 = new Amble.Graphics.SpriteRenderer({
        sprite: 'data/ammo_3.png',
        layer: 1
    })

    this.levelUpInfo = {
        tag: ['info'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
            scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
        }},
        renderer: {name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'data/levelup_1.png',
            layer: 3
        }},
        components: []
    };

    this.info = null;

    this.lastLevel = false;

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

    this.bothRealesed = false;
}

Player.prototype = {
    //when object is added to scene
    awake: function(self) { },

    //when game is started or when added to scene to
    start: function(self){
        this.groundX = self.transform.position.y;
        cameraHeightMod = Amble.app.height/5;
        this.combatEnemies = Amble.app.scene.getActorByName('worldManager').getComponent('WorldManager').combatEnemies;
        this.defaultScale.x = self.transform.scale.x;
        this.defaultScale.y = self.transform.scale.y;

        this.combatBackground = Amble.app.scene.instantiate(this.combatBGPefab);

        this.combatBackground.transform.position.y = combatGround;

    },

    update: function(self) {
        if(!combat) {
            if(Amble.Input.isMousePressed(leftButton) && !gameStart && !startScreen && !gameOver && !gameEnd) {
                this.currentRunSpeed = -this.runSpeed;
                this.direction = -1;
                if(this.right) {
                    self.transform.scale.x *= -1
                    this.defaultScale.x *= -1;
                    this.right = false;
                }
            }

            if(Amble.Input.isMousePressed(rightButton) && !gameStart && !startScreen && !gameOver && !gameEnd) {
                this.currentRunSpeed = this.runSpeed;
                this.direction = 1;
                if(!this.right) {
                    self.transform.scale.x *= -1;
                    this.defaultScale.x *= -1;
                    this.right = true;
                }
            }

            if(this.currentRunSpeed/this.direction < 1 ) {
                this.currentRunSpeed = 0;
                self.renderer = this.normalAnim;
            } else {
                self.renderer = this.runAnim
                this.currentRunSpeed -= this.direction * this.runDrag * Amble.Time.deltaTime;
            }

            if(this.stopForce == 0) self.renderer = this.normalAnim;

            this.hitDistance = this.originalHitDistance;

            self.transform.position.x += this.currentRunSpeed * Amble.Time.deltaTime * this.stopForce;
            self.transform.position.y = this.groundX;
            Amble.app.mainCamera.camera.position.y = self.transform.position.y - Amble.app.height/4;
            if(this.bullets.length > 0) {
                for(var i in this.bullets) Amble.app.scene.remove(this.bullets[i]);
                this.bullets = [];
            }


        } else if(!this.levelUP){

            var explosionsToDel = []
            for(var i in this.explosions) {
                if(this.explosions[i].renderer._currentFrame == this.explosions[i].renderer.frames - 1) {
                    explosionsToDel.push(this.explosions[i]);
                }
            }

            for(var i in explosionsToDel) {
                var index = this.explosions.indexOf(explosionsToDel[i]);
                this.explosions.splice(index, 1);
            }

            switch(this.currentLevel) {
                case 1:
                    self.renderer = this.level1Idle;
                    if(this.pressedLeft || this.pressedRight) self.renderer = this.level1ShootAnim;
                    break;
                case 2:
                    self.renderer = this.level2Idle;
                    if(this.pressedLeft || this.pressedRight) self.renderer = this.level2ShootAnim;
                    break;
                case 3:
                    self.renderer = this.level3Idle;
                    if(this.pressedLeft || this.pressedRight) self.renderer = this.level3ShootAnim;
                    break;
            }

            if(this.lastLevel || bossCombat) {
                self.renderer = this.level4Idle;
                if(this.pressedLeft || this.pressedRight) self.renderer = this.level4ShootAnim;
            }

            self.transform.position.y = combatGround;
            Amble.app.mainCamera.camera.position.y = self.transform.position.y;

            this.combatEnemies.sort(function(a,b){
                var distA = Math.sqrt(Math.pow(a.transform.position.x - Amble.app.mainCamera.camera.position.x, 2));
                var distB = Math.sqrt(Math.pow(b.transform.position.x - Amble.app.mainCamera.camera.position.x, 2));
                return distA - distB;
            });

            if(Amble.Input.isMousePressed(leftButton) && !gameStart && !startScreen && !gameOver && !gameEnd) {
                if(this.right) {
                    self.transform.scale.x *= -1;
                    this.defaultScale.x *= -1;
                    this.right = false;
                }
            }

            if(Amble.Input.isMousePressed(rightButton) && !gameStart && !startScreen && !gameOver && !gameEnd) {
                if(!this.right) {
                    self.transform.scale.x *= -1;
                    this.defaultScale.x *= -1;
                    this.right = true;
                }
            }

            var b = null;
            var bb = null;

            if(this.pressedLeft && this.shootTimer <= 0 && !gameStart && !startScreen && !gameOver && !gameEnd) {

                if(this.lastLevel || bossCombat) {
                    var shoots = this.cannon.bulletsPerShoot
                } else {
                    var shoots = this.weaponsPrefs[this.currentLevel - 1].bulletsPerShoot
                }

                if(this.currentLevel == 3) {
                    gatling.volume = 0.15;
                    gatling.play();
                }

                for(var i = 0; i < shoots; i++) {
                    this.bullet.components[0].args.dir = -1;

                    if(this.lastLevel || bossCombat) {
                        var dirMod = Math.random() * this.cannon.shootSpread;
                    } else {
                        var dirMod = Math.random() * this.weaponsPrefs[this.currentLevel - 1].shootSpread;
                    }

                    this.bullet.components[0].args.dirMod = dirMod;



                    if(this.currentLevel == 3 && this.lastLevel && !bossCombat) {
                        var mod = this.weaponsPrefs[this.currentLevel - 1].speedMod;
                        this.bullet.components[0].args.speedMod = (Math.random() * mod) + 2*mod;
                    }

                    var bb = Amble.app.scene.instantiate(this.bullet);

                    switch(this.currentLevel) {
                        case 1:
                            bb.renderer = this.bullet1;
                            gun.volume = 0.1;
                            gun.play();
                            break;
                        case 2:
                            bb.renderer = this.bullet1;
                            machine.volume = 0.2;
                            machine.play();
                            break;
                        case 3:
                            if(bossCombat || this.lastLevel) {
                                ccannon.volume = 0.05;
                                ccannon.play();
                            }
                            bb.renderer = this.bullet2;
                            break;
                    }

                    if(bossCombat || this.lastLevel) {
                        bb.renderer = this.bullet3;
                        bb.transform.position.x = self.transform.position.x + (this.cannon.positionMod.x * this.scaleMultipler);
                        bb.transform.position.y = combatGround + (this.cannon.positionMod.y * this.scaleMultipler);
                        bb.transform.scale.x *= 1.35;
                        bb.transform.scale.y *= 1.35;

                    } else {
                        bb.transform.position.x = self.transform.position.x + (this.weaponsPrefs[this.currentLevel - 1].positionMod.x * this.scaleMultipler);
                        bb.transform.position.y = combatGround + (this.weaponsPrefs[this.currentLevel - 1].positionMod.y * this.scaleMultipler);
                        var p = Amble.app.scene.instantiate(this.gunParticleSystem);
                        p.transform.position.x = self.transform.position.x + (this.weaponsPrefs[this.currentLevel - 1].particleMod.x * this.scaleMultipler);
                        p.transform.position.y = combatGround + (this.weaponsPrefs[this.currentLevel - 1].particleMod.y * this.scaleMultipler);
                        p.getComponent('ParticleSystem').particle = this.gunParticle;
                        p.getComponent('ParticleSystem').angle.x *= -1;
                    }

                    this.bullets.push(bb)
                }

                if(this.lastLevel || bossCombat) {
                    this.shootTimer = this.cannon.shootCooldown;
                } else {
                    this.shootTimer = this.weaponsPrefs[this.currentLevel - 1].shootCooldown;
                }

            } else if(this.pressedRight && this.shootTimer <= 0 && !gameStart && !startScreen && !gameOver && !gameEnd) {

                if(this.lastLevel || bossCombat) {
                    var shoots = this.cannon.bulletsPerShoot
                } else {
                    var shoots = this.weaponsPrefs[this.currentLevel - 1].bulletsPerShoot
                }

                if(this.currentLevel == 3) {

                    gatling.volume = 0.15;
                    gatling.play();
                }

                for(var i = 0; i < shoots; i++) {
                    this.bullet.components[0].args.dir = 1;
                    if(this.lastLevel || bossCombat) {
                        var dirMod = Math.random() * this.cannon.shootSpread;
                    } else {
                        var dirMod = Math.random() * this.weaponsPrefs[this.currentLevel - 1].shootSpread;
                    }
                    this.bullet.components[0].args.dirMod = dirMod;

                    if(this.currentLevel == 3 && this.lastLevel && !bossCombat) {
                        var mod = this.weaponsPrefs[this.currentLevel - 1].speedMod;
                        this.bullet.components[0].args.speedMod = (Math.random() * mod) + 2*mod;
                    }

                    var bb = Amble.app.scene.instantiate(this.bullet);
                    bb.transform.scale.x *= -1;

                    switch(this.currentLevel) {
                        case 1:
                            bb.renderer = this.bullet1;

                            gun.volume = 0.1;
                            gun.play();
                            break;
                        case 2:
                            bb.renderer = this.bullet1;

                            machine.volume = 0.2;
                            machine.play();
                            break;
                        case 3:
                            if (bossCombat || this.lastLevel) {

                                ccannon.volume = 0.05;
                                ccannon.play();
                            }
                            bb.renderer = this.bullet2;
                            break;
                    }

                    if(bossCombat || this.lastLevel) {
                        bb.renderer = this.bullet3;
                        bb.transform.position.x = self.transform.position.x - (this.cannon.positionMod.x * this.scaleMultipler);
                        bb.transform.position.y = combatGround + (this.cannon.positionMod.y * this.scaleMultipler);
                        bb.transform.scale.x *= 1.35;
                        bb.transform.scale.y *= 1.35;

                    } else {

                        bb.transform.position.x = self.transform.position.x - (this.weaponsPrefs[this.currentLevel - 1].positionMod.x * this.scaleMultipler);
                        bb.transform.position.y = combatGround + (this.weaponsPrefs[this.currentLevel - 1].positionMod.y * this.scaleMultipler);
                        var p = Amble.app.scene.instantiate(this.gunParticleSystem);
                        p.transform.position.x = self.transform.position.x - (this.weaponsPrefs[this.currentLevel - 1].particleMod.x * this.scaleMultipler);
                        p.transform.position.y = combatGround + (this.weaponsPrefs[this.currentLevel - 1].particleMod.y * this.scaleMultipler);
                        p.getComponent('ParticleSystem').particle = this.gunParticle;
                    }

                    this.bullets.push(bb)
                }

                if(this.lastLevel || bossCombat) {
                    this.shootTimer = this.cannon.shootCooldown;
                } else {
                    this.shootTimer = this.weaponsPrefs[this.currentLevel - 1].shootCooldown;
                }
            }

            var bulletsToDel = [];
            var enemiesToDel = [];

            for(var i = 0; i < this.combatEnemies.length; i++) {
                for(var j = 0; j < this.bullets.length; j++) {
                    //left
                    // console.log('dir', this.bullets[j].getComponent('Bullet').dir);
                    if(this.bullets[j].getComponent('Bullet').dir === -1) {
                        // console.log('left-check')
                        if(this.bullets[j].transform.position.x < this.combatEnemies[i].transform.position.x + this.combatEnemies[i].renderer.size.x/2
                            && this.combatEnemies[i].getComponent('CombatEnemy').direction > 0
                            && this.bullets[j].transform.position.y > this.combatEnemies[i].transform.position.y - this.combatEnemies[i].renderer.size.y/2
                            && this.bullets[j].transform.position.y < this.combatEnemies[i].transform.position.y + this.combatEnemies[i].renderer.size.y/2
                        ) {

                            if(!bulletsToDel.find(e => e == this.bullets[j])) {
                                Amble.app.scene.remove(this.bullets[j]);
                                bulletsToDel.push(this.bullets[j]);
                            }

                            if(this.lastLevel || bossCombat) {
                                var dmg = this.cannon.weaponDmg



                            } else {
                                var dmg = this.weaponsPrefs[this.currentLevel - 1].weaponDmg
                            }

                            this.combatEnemies[i].getComponent('CombatEnemy').health -= dmg;

                            var p = Amble.app.scene.instantiate(this.bloodParticleSystem);
                            p.transform.position.x = this.combatEnemies[i].transform.position.x;
                            p.transform.position.y = this.combatEnemies[i].transform.position.y;
                            p.getComponent('ParticleSystem').particle = this.bloodParticle;
                        }

                    } else if(this.bullets[j].getComponent('Bullet').dir === 1) { //right
                        if(this.bullets[j].transform.position.x > this.combatEnemies[i].transform.position.x - this.combatEnemies[i].renderer.size.x/2
                            && this.combatEnemies[i].getComponent('CombatEnemy').direction < 0
                            && this.bullets[j].transform.position.y > this.combatEnemies[i].transform.position.y - this.combatEnemies[i].renderer.size.y/2
                            && this.bullets[j].transform.position.y < this.combatEnemies[i].transform.position.y + this.combatEnemies[i].renderer.size.y/2
                        ) {
                            // console.log('right-check')

                            if(!bulletsToDel.find(e => e == this.bullets[j])) {
                                Amble.app.scene.remove(this.bullets[j]);
                                bulletsToDel.push(this.bullets[j]);
                            }

                            if(this.lastLevel || bossCombat) {
                                var dmg = this.cannon.weaponDmg

                            } else {
                                var dmg = this.weaponsPrefs[this.currentLevel - 1].weaponDmg
                            }

                            this.combatEnemies[i].getComponent('CombatEnemy').health -= dmg;

                            var p = Amble.app.scene.instantiate(this.bloodParticleSystem);
                            p.transform.position.x = this.combatEnemies[i].transform.position.x;
                            p.transform.position.y = this.combatEnemies[i].transform.position.y;
                            p.getComponent('ParticleSystem').particle = this.bloodParticle;
                        }
                    }
                }
            }

            var doOnce = true;
            for(var i in bulletsToDel) {
                if(doOnce) {
                    if(this.currentLevel == 3) {

                        eee.volume = 0.1;
                        eee.play();
                        // console.log('explosion')
                        if(this.lastLevel || bossCombat) {
                            var explosion = Amble.app.scene.instantiate(this.explosion);
                            explosion.transform.position.x = bulletsToDel[i].transform.position.x;
                            explosion.transform.position.y = bulletsToDel[i].transform.position.y;
                            explosion.renderer.loop = false;
                            this.explosions.push(explosion);
                        }
                    }
                    doOnce = false;
                }
                var index = this.bullets.indexOf(bulletsToDel[i])
                this.bullets.splice(index, 1);
            }

            self.transform.scale.x = this.defaultScale.x * this.scaleMultipler;
            self.transform.scale.y = this.defaultScale.y * this.scaleMultipler;

            this.combatBackground.transform.position.x = Amble.app.mainCamera.camera.position.x;
        }

        Amble.app.mainCamera.camera.position.x = self.transform.position.x;
        if(this.shootTimer > 0) this.shootTimer -= Amble.Time.deltaTime;

        // console.log(this.currentXP)
        if(this.currentXP > this.xp[this.currentLevel] && this.currentLevel < this.xp.length - 1 && !bossCombat) {
            this.currentLevel++;
            this.currentXP = 0;
            this.levelUP = true;

            var worldManager = Amble.app.scene.getActorByName('worldManager').getComponent('WorldManager');
            worldManager.enemy.renderer.args.sprite = 'data/enemy'+ this.currentLevel +'_anim.png'
            worldManager.combatEnemy.renderer.args.sprite = 'data/enemy'+ this.currentLevel +'_anim.png'

            worldManager.enemy.transform.args.scale.args.x *= 1.25;
            worldManager.enemy.transform.args.scale.args.y *= 1.25;

            worldManager.combatEnemy.transform.args.scale.args.x *= 1.25;
            worldManager.combatEnemy.transform.args.scale.args.y *= 1.25;

            this.levelUpInfo.renderer.args.sprite = 'data/levelup_' + (this.currentLevel - 1) + '.png';
            this.info = Amble.app.scene.instantiate(this.levelUpInfo);
            this.info.transform.position.x = Amble.app.mainCamera.camera.position.x;
            this.info.transform.position.y = Amble.app.mainCamera.camera.position.y - Amble.app.height/10;
            this.info.transform.scale.x = 1.1;
            this.info.transform.scale.y = 1.1;

            Amble.Time.deltaScale = 0;
        }

        if(this.currentXP >= this.xp[this.xp.length - 1] && !bossCombat && !this.lastLevel) {
            this.lastLevel = true;
            this.levelUP = true;

            this.levelUpInfo.renderer.args.sprite = 'data/levelup_3.png';
            this.info = Amble.app.scene.instantiate(this.levelUpInfo);
            this.info.transform.scale.x = 1.1;
            this.info.transform.scale.y = 1.1;
            this.info.transform.position.x = Amble.app.mainCamera.camera.position.x;
            this.info.transform.position.y = Amble.app.mainCamera.camera.position.y - Amble.app.height/10;

            Amble.Time.deltaScale = 0;
        }

        if(this.health <= 0 && !gameEnd) {
            this.health = 0;
            gameOver = true;
            endlessScreen = true;
            if(boss) {
                endlessImg = Amble.app.loader.getAsset('data/comics_over_boss.png');
            } else {
                endlessImg = Amble.app.loader.getAsset('data/comics_over_enemies.png');
            }
            //show game over
        }

        if(gameEnd && this.bothRealesed) {
            if(this.pressedLeft) {
                location.reload();
            } else if(this.pressedRight) {
                window.location.href = "http://ludumdare.com/compo/ludum-dare-34/?action=preview&uid=61228"
            }
        }

        if(gameOver && this.bothRealesed) {
            if(this.pressedLeft) {
                location.reload();
            } else if(this.pressedRight) {
                window.location.href = "http://ludumdare.com/compo/ludum-dare-34/?action=preview&uid=61228"
            }
        }

        //add realese requested
        if(startScreen && this.pressedLeft && this.pressedRight && this.bothRealesed) {
            startScreen = false;
            gameStart = true;
            // console.log('start screen end')
            endlessImg = Amble.app.loader.getAsset('data/comics_start.png');
            this.bothRealesed = false;
        }

        //comic end
        if(gameStart && this.pressedLeft && this.pressedRight && this.bothRealesed) {
            gameStart = false;
            textTimer = 6;
            textTime = 6;
            alphaDelay = 0.33;
            endlessScreen = false;
            globalInfoImg = Amble.app.loader.getAsset('data/start_info.png');
            // console.log('start commic end')

            //play bgmusic

            // var manager = Amble.app.scene.getActorByName('worldManager').getComponent('WorldManager');;
            introMusic.pause();
            // manager.bgMusic = new Amble.Audio({
            //     audio: 'data/sounds/lost_in_city.ogg',
            //     loop: true,
            // });
            bgMusic.play();


            this.bothRealesed = false;
        }

        //startScreen end
        if(startScreen && this.pressedLeft && this.pressedRight && this.bothRealesed) {
            startScreen = false;
            gameStart = true;
            // console.log('start screen end')
            this.bothRealesed = false;
        }

        if(this.levelUP && this.pressedLeft && this.pressedRight && this.canHideLevelUp) {
            Amble.app.scene.remove(this.info);
            this.levelUP = false;
            this.canHideLevelUp = false;
            Amble.Time.deltaScale = 1;
            if(this.lastLevel) {
                this.currentXP = this.xp[this.xp.length - 1];
                for(var i in this.combatEnemies) {
                    this.combatEnemies[i].getComponent('CombatEnemy').health = -666;
                }
                enemiesInCombat = 0;
            }
        }

    },

    onmousedown: function(self, e) {
        var key = e.which;

        if(combat || startScreen || gameStart || gameOver || gameEnd) {
            if(key == leftButton) {
                this.pressedLeft = true;
            } else if(key == rightButton) {
                this.pressedRight = true;
            }
        }

    },

    // onkeydown: function(self, e) {
    //     var key = e.which;
    //     if(key == 32) {
    //         if(Amble.Time.deltaScale == 1) {
    //             Amble.Time.deltaScale = 0
    //         } else {
    //             Amble.Time.deltaScale = 1
    //         }
    //     }
    // },

    onmouseup: function(self, e) {
        var key = e.which;

        if(key == leftButton) {
            this.pressedLeft = false
        }

        if(key == rightButton) {
            this.pressedRight = false;
        }

        if(!this.pressedRight && !this.pressedLeft)
            this.canHideLevelUp = true;

        if((gameStart || startScreen || gameOver || gameEnd) && !this.pressedLeft && !this.pressedRight) {
            this.bothRealesed = true;
        }
    }

}
