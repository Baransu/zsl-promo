var WorldManager = {};

WorldManager = function(args) {
    this.scene = Amble.app.scene;

    this.boss = {
        name: 'boss',
        tag: ['boss'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            scale: { name: "Amble.Math.Vector2", args: {x:3.5 ,y:3.5}},
        }},
        renderer: {name: 'Amble.Graphics.AnimationRenderer', args: {
            sprite: 'data/boss_idle.png',
            updatesPerFrame: 8,
            frames: 4,
            layer: 2
        }},
        components: [
            { name: "Boss", args: {}}
        ]
    };

    this.combatBoss = {
        name: 'combatBoss',
        tag: ['combatBoss'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            scale: { name: "Amble.Math.Vector2", args: {x:3.5 ,y:3.5}},
        }},
        renderer: {name: 'Amble.Graphics.AnimationRenderer', args: {
            sprite: 'data/boss_walk.png',
            updatesPerFrame: 5,
            frames: 4,
            layer: 2
        }},
        components: [
            { name: "CombatEnemy", args: {}}
        ]
    };

    this.enemy = {
        tag: ['enemy'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            scale: { name: "Amble.Math.Vector2", args: {x:-1 ,y:1}},
            rotation: 0
        }},
        renderer: {name: 'Amble.Graphics.AnimationRenderer', args: {
            sprite: 'data/enemy1_anim.png',
            updatesPerFrame: 5,
            frames: 6,
            layer: 1,
            anchor: { name: "Amble.Math.Vector2", args: {x:0.5 ,y:0.5}},
        }},
        components: [
            { name: "Enemy", args: {}}
        ]
    };

    this.combatEnemy = {
        tag: ['combatEnemy'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
            scale: { name: "Amble.Math.Vector2", args: {x:-1 ,y:1}},
            rotation: 0
        }},
        renderer: {name: 'Amble.Graphics.AnimationRenderer', args: {
            sprite: 'data/enemy1_anim.png',
            updatesPerFrame: 7,
            frames: 6,
            layer: 2,
            anchor: { name: "Amble.Math.Vector2", args: {x:0.5 ,y:0.5}},
        }},
        components: [
            { name: "CombatEnemy", args: {}}
        ]
    };

    this.bg1 = {
        tag: ['bg_1'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: -Amble.app.height/4}},
            scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
        }},
        renderer: {name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'data/bg1_1.png',
            layer: 0,
        }},
        components: []
    };

    this.bg2 = {
        tag: ['bg_2'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: -Amble.app.height/4}},
            scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
        }},
        renderer: {name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'data/bg1_2.png',
            layer: 0,
        }},
        components: []
    };

    this.bg3 = {
        tag: ['bg_3'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: -Amble.app.height/4}},
            scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
        }},
        renderer: {name: 'Amble.Graphics.SpriteRenderer', args: {
            sprite: 'data/bg1_3.png',
            layer: 0,
        }},
        components: []
    };


    this.player = null;
    this.lastBuildingEnd = 0;

    this.minBuildingWidth = 400;
    this.maxBuildingWidth = 800;
    this.minGap = 100;
    this.maxGap = 250;

    this.enemiesLocations = [];

    this.currentPack = [];

    this.combatDelayTimer = 0;

    //change to 4
    this.enemySpawnDelay = 0;

    this.combatEnemies = [];

    this.backgrounds1 = [];
    this.backgrounds2 = [];
    this.backgrounds3 = [];

    this.lastCameraPos = new Amble.Math.Vector2({x: 0, y:0});

    // this.bgMusic = new Amble.Audio({
    //     audio: 'data/sounds/lost_in_city.ogg',
    //     loop: true,
    // });
    //
    // this.combatMusic = new Amble.Audio({
    //     audio: 'data/sounds/combat.ogg',
    //     volumeMax: 0.4,
    //     loop: true,
    // });
    //
    // this.introMusic = new Amble.Audio({
    //     audio: 'data/sounds/intro.ogg',
    //     loop: true,
    // });

    this.afterCombat = false;
    this.spawnBossOnce = true;
}

WorldManager.prototype = {

    awake: function(self) { },

    start: function(self) {

        this.player = this.scene.getActorByName('player');

        for(var i = -1; i < (3 - 1); i++) {

            var bg1 = this.scene.instantiate(this.bg1);
            var bg2 = this.scene.instantiate(this.bg2);
            var bg3 = this.scene.instantiate(this.bg3);

            bg1.transform.position.x = Amble.app.mainCamera.camera.position.x + (Amble.app.width*i);
            bg3.transform.position.x = Amble.app.mainCamera.camera.position.x + (Amble.app.width*i);
            bg2.transform.position.x = Amble.app.mainCamera.camera.position.x + (Amble.app.width*i);

            this.backgrounds1.push(bg1);
            this.backgrounds2.push(bg2);
            this.backgrounds3.push(bg3);
        }

        //enemies spawn locations
        this.enemiesLocations.push(this.player.transform.position.x + enemiesPacksDistance)
        this.enemiesLocations.push(this.player.transform.position.x - enemiesPacksDistance)

        // 
        // console.log(this.enemiesLocations);
    },

    update: function(self) {

        if(boss && this.spawnBossOnce){

            var enemy = this.scene.instantiate(this.boss);
            enemy.transform.position.x = this.player.transform.position.x + 1500;
            enemy.transform.scale.x *= -1;
            this.currentPack.push(enemy);

            var enemy = this.scene.instantiate(this.boss);
            enemy.transform.position.x = this.player.transform.position.x - 1500;
            enemy.transform.scale.x *= 1;
            this.currentPack.push(enemy);

            // console.log('boss spawned')

            textTimer = 7;
            textTime = 7;
            alphaDelay = 0.33;
            globalInfoImg = Amble.app.loader.getAsset('data/boss_info.png');
            this.spawnBossOnce = false;
        }

        if(!combat && fadeCompleted && fadeTimer <= 0 && !this.afterCombat) {
            this.player.getComponent('Player').stopForce = 1;
            combat = true;
            // this.bgMusic = new Amble.Audio({
            //     audio: 'data/sounds/lost_in_city.ogg',
            //     loop: true,
            // });
            //
            // this.combatMusic = new Amble.Audio({
            //     audio: 'data/sounds/combat.ogg',
            //     loop: true,
            // });

            bgMusic.pause();
            combatMusic.play();
            // this.combatMusic._audio.currentTime = 0;
            fadeTimer = fadeTime;
            fadeCompleted = false;
        }

        if(combat && this.afterCombat && fadeTimer <= 0) {
            combat = false;
            // fadeCompleted = false;
            // fadeT = 0;

            //
            // this.combatMusic = new Amble.Audio({
            //     audio: 'data/sounds/combat.ogg',
            //     loop: true,
            // });
            combatMusic.pause();
            // console.log('music change')
            bgMusic.play();
            // this.bgMusic._audio.currentTime = 0;
            fadeTimer = fadeTime;
            fadeCompleted = false;
        }

        if(!combat && fadeTimer <= 0 && fadeCompleted) {
            fadeCompleted = false;
            fadeT = 0;
            fadeTimer = 0;
            this.afterCombat = false;
        }
        //
        // if(!combat && fadeTimer > 0 && !this.afterCombat) {
        //     bgMusic.volume = fadeTimer * 0.1;
        // }
        //
        // if(combat && fadeTimer > 0 && this.afterCombat) {
        //     combatMusic.volume = fadeTimer * 0.1;
        // }

        if(!combat) {
            //spawn enemies if distance to pack location < sceen width
            if(!boss) {
                for(var i = 0; i < this.enemiesLocations.length; i++) {
                    var distance = this.enemiesLocations[i] - this.player.transform.position.x;
                    if(Math.abs(distance) < Amble.app.width && this.currentPack.length == 0) {
                        //spawn
                        var packSize = 3;
                        for(var j = 0; j < packSize; j++) {
                            var enemy = this.scene.instantiate(this.enemy);
                            enemy.transform.position.x = this.enemiesLocations[i] + Math.floor(Math.random() * 300) + 200;
                            this.currentPack.push(enemy);
                        }
                        this.enemiesLocations.splice(i, 1);


                        break;
                    }
                }
            }

            for(var i = 0; i < this.backgrounds1.length; i++) {
                var d = this.backgrounds1[i].transform.position.x - Amble.app.mainCamera.camera.position.x
                var distance = Math.sqrt(Math.pow((this.backgrounds1[i].transform.position.x - Amble.app.mainCamera.camera.position.x),2))
                if(distance > 2*Amble.app.width) {
                    this.scene.remove(this.backgrounds1[i]);
                    this.backgrounds1.splice(i, 1);
                } else if (distance < Amble.app.width  && this.backgrounds1.length < 3) {
                    var b = this.scene.instantiate(this.bg1);
                    if(d < 0) {
                        b.transform.position.x = this.backgrounds1[this.backgrounds1.length - 1].transform.position.x + Amble.app.width;
                    } else {
                        b.transform.position.x = this.backgrounds1[0].transform.position.x - Amble.app.width;
                    }
                    this.backgrounds1.push(b)

                    this.backgrounds1.sort(function(a,b){
                        var distA = a.transform.position.x - Amble.app.mainCamera.camera.position.x;
                        var distB = b.transform.position.x - Amble.app.mainCamera.camera.position.x;
                        return distA - distB;
                    });
                }
            }

            for(var i = 0; i < this.backgrounds2.length; i++) {
                var d = this.backgrounds2[i].transform.position.x - Amble.app.mainCamera.camera.position.x
                var distance = Math.sqrt(Math.pow((this.backgrounds2[i].transform.position.x - Amble.app.mainCamera.camera.position.x),2))
                if(distance > 2*Amble.app.width) {
                    this.scene.remove(this.backgrounds2[i]);
                    this.backgrounds2.splice(i, 1);
                } else if (distance < Amble.app.width && this.backgrounds2.length < 3) {

                    var b = this.scene.instantiate(this.bg2);

                    if(d < 0) {
                        b.transform.position.x = this.backgrounds2[this.backgrounds2.length - 1].transform.position.x + Amble.app.width;
                    } else {
                        b.transform.position.x = this.backgrounds2[0].transform.position.x - Amble.app.width;
                    }

                    this.backgrounds2.push(b)
                    this.backgrounds2.sort(function(a,b){
                        var distA = a.transform.position.x - Amble.app.mainCamera.camera.position.x;
                        var distB = b.transform.position.x - Amble.app.mainCamera.camera.position.x;
                        return distA - distB;
                    });
                }
            }

            for(var i = 0; i < this.backgrounds3.length; i++) {
                var d = this.backgrounds3[i].transform.position.x - Amble.app.mainCamera.camera.position.x
                var distance = Math.sqrt(Math.pow(d,2))
                if(distance > 2*Amble.app.width) {
                    this.scene.remove(this.backgrounds3[i]);
                    this.backgrounds3.splice(i, 1);
                } else if (distance < Amble.app.width && this.backgrounds3.length < 3) {
                    var b = this.scene.instantiate(this.bg3);
                    if(d < 0) {
                        b.transform.position.x = this.backgrounds3[this.backgrounds3.length - 1].transform.position.x + Amble.app.width;
                    } else {
                        b.transform.position.x = this.backgrounds3[0].transform.position.x - Amble.app.width;
                    }
                    this.backgrounds3.push(b)

                    this.backgrounds3.sort(function(a,b){
                        var distA = a.transform.position.x - Amble.app.mainCamera.camera.position.x;
                        var distB = b.transform.position.x - Amble.app.mainCamera.camera.position.x;
                        return distA - distB;
                    });
                }
            }

            var bgSpeed = 25;
            if(this.lastCameraPos.x > Amble.app.mainCamera.camera.position.x) {
                for(var i in this.backgrounds1) {
                    this.backgrounds1[i].transform.position.x -= bgSpeed * Amble.Time.deltaTime;
                }

                for(var i in this.backgrounds2) {
                    this.backgrounds2[i].transform.position.x += 2*bgSpeed * Amble.Time.deltaTime;
                }

                for(var i in this.backgrounds3) {
                    this.backgrounds3[i].transform.position.x += 3*bgSpeed * Amble.Time.deltaTime;
                }
            } else if(this.lastCameraPos.x < Amble.app.mainCamera.camera.position.x) {
                for(var i in this.backgrounds1) {
                    this.backgrounds1[i].transform.position.x += bgSpeed * Amble.Time.deltaTime;
                }

                for(var i in this.backgrounds2) {
                    this.backgrounds2[i].transform.position.x -= 2*bgSpeed * Amble.Time.deltaTime;
                }

                for(var i in this.backgrounds3) {
                    this.backgrounds3[i].transform.position.x -= 3*bgSpeed * Amble.Time.deltaTime;
                }
            }

            this.lastCameraPos.x = Amble.app.mainCamera.camera.position.x;
            this.lastCameraPos.y = Amble.app.mainCamera.camera.position.y;

        } else if (combat && fadeTimer <= 0){
            fadeT = 0;
            fadeTimer = 0;
            fadeCompleted = false;
            if(enemiesInCombat > 0) {
                if(this.combatDelayTimer > this.enemySpawnDelay) {
                    this.combatDelayTimer = 0;
                    this.enemySpawnDelay = Math.floor(Math.random() * (1.5 - 0.5)) + 0.5;

                    //spawn enemy
                    var rand = Math.random();
                    var dir = rand < 0.5 ? -1 : 1;

                    //spawn boss

                    var e = this.scene.instantiate(this.combatEnemy);
                    if(e) {
                        e.transform.position.y = combatGround;
                        var x = Amble.app.mainCamera.camera.position.x + (dir*2*Amble.app.width/3)
                        e.transform.position.x = x;
                        e.transform.scale.x *= -dir;
                        enemiesInCombat--;
                        this.combatEnemies.push(e);
                    }

                    if(enemiesInCombat == 0 && bossCombat) {
                        var bo = this.scene.instantiate(this.combatBoss);
                        bo.transform.position.y = combatGround;
                        var x = Amble.app.mainCamera.camera.position.x + (dir*2*Amble.app.width/3)
                        bo.transform.position.x = x;
                        bo.transform.scale.x *= -dir;
                        bo.getComponent('CombatEnemy').isBoss = true;
                        this.combatEnemies.push(bo);
                    }

                } else {
                    this.combatDelayTimer += Amble.Time.deltaTime;
                }
            }

            if(this.combatEnemies.length == 0 && enemiesInCombat == 0 && !bossCombat) {
                for(var i in this.currentPack) {
                    this.scene.remove(this.currentPack[i]);
                }

                this.enemiesLocations = [];
                this.enemiesLocations.push(this.player.transform.position.x + enemiesPacksDistance)
                this.enemiesLocations.push(this.player.transform.position.x - enemiesPacksDistance)

                this.currentPack = [];
                // combat = false;
                fadeTimer = fadeTime;
                this.afterCombat = true;
                // console.log(this.enemiesLocations);
                var lvl = this.player.getComponent('Player').currentLevel
                if(lvl == 3 && this.player.getComponent('Player').currentXP == this.player.getComponent('Player').xp[3]) {
                    boss = true;
                    // console.log('boss')
                }
            }
        }
        // console.log(enemiesInCombat, this.combatEnemies.length, combat)
    }
}
