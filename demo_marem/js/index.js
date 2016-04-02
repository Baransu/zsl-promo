var images = [
    'bg1_1.png',
    'bg1_2.png',
    'bg1_3.png',

    'combat_background.png',

    'enemy1_anim.png',
    'enemy2_anim.png',
    'enemy3_anim.png',

    'ammo_1.png',
    'ammo_2.png',
    'ammo_3.png',

    'scale.png',

    'explosion.png',

    'player_idle.png',
    'player_run.png',

    'player_lvl1_idle.png',
    'player_lvl1_anim.png',

    'player_lvl2_idle.png',
    'player_lvl2_anim.png',

    'player_lvl3_idle.png',
    'player_lvl3_anim.png',

    'player_lvl4_idle.png',
    'player_lvl4_anim.png',

    'boss_idle.png',
    'boss_walk.png',

    'start_info.png',
    'boss_info.png',

    'start_screen.png',
    'comics_start.png',
    'comics_end.png',
    'comics_over_enemies.png',
    'comics_over_boss.png',

    'levelup_1.png',
    'levelup_2.png',
    'levelup_3.png'
]

var sounds = [
    'intro.ogg',
    'lost_in_city.ogg',
    'combat.ogg'
    //,
    //
    // 'cannon.ogg',
    // 'gatling.ogg',
    // 'gun.ogg',
    // 'machine_gun.ogg',
    //
    // 'monster_hit.ogg',
    // 'monster_boom.ogg'
]

var leftButton = 1; //a
var rightButton = 3; //d

var packCounts = 5;
var enemiesPacksDistance = 2500;
var worldSize = 5 * packCounts * enemiesPacksDistance;

var combat = false;
var combatGround = -5000;

var maxxp = 200 + 4000 + 6000;
var xpPerEnemy = 50;
var enemiesInCombat = 0;
var _enemiesInCombat = Math.round(maxxp/xpPerEnemy/packCounts);

var scalePerEnemy = 2.5/(maxxp/xpPerEnemy);

var cameraHeightMod = 0;

//gradient stuff
var bgGradient = 0;
var calcGradient = true;
var gradientColors = [];
var colors = [
	[62,35,255],
	[60,255,60],
	[255,35,98],
	[45,175,230],
	[255,0,255],
	[255,128,0]
];

var step = 0;
var colorIndices = [0,1,2,3];
var gradientSpeed = 0.05;
var boss = false;
var bossCombat = false;

var fadeTimer = 0;
var fadeTime = 2.5;
var fadeCompleted = false;
var fadeT = 0;

var textTimer = 5;
var textTime = 5;
var alphaDelay = 0.2;
var globalInfoImg = null;

var gameOver = false;
var gameEnd = false;
var gameStart = false;
var startScreen = true;

var endlessScreen = true;
var endlessImg = null;

var rotator = 0;

var postColor = ""

var introMusic = null;
var combatMusic = null;
var bgMusic = null;

introMusic = new Audio('data/sounds/intro.ogg');
introMusic.volume = 0.2;
introMusic.loop = true;

var machine = new Audio('data/sounds/machine_gun.ogg');
var ccannon = new Audio('data/sounds/cannon.ogg');
var gun = new Audio('data/sounds/gun.ogg');
var gatling = new Audio('data/sounds/gatling.ogg');
var eee = new Audio('data/sounds/monster_hit.ogg');
var eeee = new Audio('data/sounds/monster_boom.ogg');

var app = new Amble.Application({

    resize: true,
    fullscreen: true,
    antyAliasing: false,
    width: 1280,
    height: 720,

    defaultBgColor: '#000',

    mainCamera: {
        name: 'MainCamera',
        tag: ['mainCamera'],
        options: {},
        camera: { name: "Amble.Camera", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}}
        }},
        components: [
            { name: "Camera", args: {}}
        ]
    },

    preload: function(){

        var player = {
            name: 'player',
            tag: ['player'],
            options: {},
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
                rotation: 0
            }},
            renderer: {name: 'Amble.Graphics.AnimationRenderer', args: {
                sprite: 'data/player_idle.png',
                updatesPerFrame: 10,
                frames: 3,
                layer: 2,
                anchor: { name: "Amble.Math.Vector2", args: {x:0.5 ,y:0.5}},
            }},
            components: [
                { name: "Player", args: {}}
            ]
        };

        var p = this.scene.instantiate(player)

        var worldManager = {
            name: 'worldManager',
            tag: ['manager'],
            options: {},
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                scale: { name: "Amble.Math.Vector2", args: {x:1 ,y:1}},
                rotation: 0
            }},
            components: [
                { name: "WorldManager", args: {}}
            ]
        };

        var manager = this.scene.instantiate(worldManager);

        var endObstacle = {
            name: 'end',
            tag: ['end'],
            options: {},
            transform: { name: "Amble.Transform", args: {
                position: { name: "Amble.Math.Vector2", args: {x:0 ,y:0}},
                scale: { name: "Amble.Math.Vector2", args: {x:-1 ,y:1}},
                rotation: 0
            }},
            renderer: {name: 'Amble.Graphics.RectRenderer', args: {
                color: 'magenta',
                size: { name: "Amble.Math.Vector2", args: {x:10 ,y:100}}
            }},
            components: []

        }
        var end1 = this.scene.instantiate(endObstacle);
        end1.transform.position.x = worldSize;
        var end2 = this.scene.instantiate(endObstacle);
        end2.transform.position.x = -worldSize;

        for(var i = 0; i < images.length; i++) {
            this.loader.load('image', 'data/' + images[i]);
        }

        for(var i = 0; i < sounds.length; i++) {
            this.loader.load('audio', 'data/sounds/' + sounds[i]);
        }
    },

    //actual start function
    start: function(){
        // audio = new Amble.Audio({audio:'data/sounds/rezoner1.mp3', loop: true});
        // audio.play();
        console.log(_enemiesInCombat);
        endlessImg = this.loader.getAsset('data/start_screen.png');
        endlessScreen = true;
    },

    preupdate: function(){
        // volumeTimer += Amble.Time.deltaTime;
        // audio.setVolume(Math.abs(Math.sin(volumeTimer)/4));
    },

    postupdate: function(){

    	if(bgGradient > 0) bgGradient -= Amble.Time.deltaTime;
    	if(bgGradient < 0) bgGradient = 0;

        if(calcGradient) {
    		var c0_0 = colors[colorIndices[0]];
    		var c0_1 = colors[colorIndices[1]];
    		var c1_0 = colors[colorIndices[2]];
    		var c1_1 = colors[colorIndices[3]];

    		var istep = 1 - step;
    		var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
    		var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
    		var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
    		gradientColors[0] = "rgb(" + r1 + ", " + g1 + "," + b1 + ")";

    		var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
    		var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
    		var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
    		gradientColors[1] = "rgb(" + r2 + ", " + g2 + ", " + b2 + ")";

    		step += gradientSpeed;
    		if (step >= 1) {
    			step %= 1;
    			colorIndices[0] = colorIndices[1];
    			colorIndices[2] = colorIndices[3];

    			colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
    			colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
    		}
    	}

        var layer = this.mainCamera.camera.layer(0);
    	var my_gradient = layer.ctx.createLinearGradient(0, 0, this.width/2, this.height);
    	my_gradient.addColorStop(0, gradientColors[0]);
    	my_gradient.addColorStop(1, gradientColors[1]);

        postColor = my_gradient

        if(combat) {
            this.defaultBgColor = my_gradient;
        } else {
            this.defaultBgColor = '#000';
        }
    },

    postrender: function(){
        //fading
        var layer = this.mainCamera.camera.layer(3);
        var playerScript = this.scene.getActorByName('player').getComponent('Player');

        if(combat && !playerScript.levelUP) {

            var currentXP = playerScript.currentXP;
            var currentLevel = playerScript.currentLevel;
            var xp = playerScript.xp;
            var maxWidth = this.width/2;
            var hpMaxWidth = this.width/3;
            var x = maxWidth * currentXP/xp[currentLevel];
            var nextLevel = currentLevel + 1;

            switch(currentLevel) {
                case 1:
                    currentLevel = 'GUY'
                    nextLevel = 'TOUGH GUY'
                break;
                case 2:
                    currentLevel = 'TOUGH GUY'
                    nextLevel = 'PISSED TOUGH GUY'
                break;
                case 3:

                    currentLevel = 'PISSED TOUGH GUY'
                    nextLevel = 'BADASS';
                    if(boss) {
                        currentLevel = 'BADASS'
                    }

                break;
            }

            var y = 5*this.height/6;
            var hpY = 4*this.height/5;
            var height = 15;

            var currentHP = playerScript.health;
            var maxHP = playerScript.maxHealth;
            var hpX = hpMaxWidth * currentHP/maxHP;

            layer.font(
                '30px Pixel'
            /*bg fill*/).fillStyle(
                'black'
            ).fillRect(
                this.width/2 - maxWidth/2,
                y,
                maxWidth,
                height
            /*progress*/).fillStyle(
                '#d81b60'
            ).fillRect(
                this.width/2 - maxWidth/2,
                y,
                x,
                height
            /*bg stroke*/).strokeStyle(
                'white'
            ).strokeRect(
                this.width/2 - maxWidth/2,
                y,
                maxWidth,
                height
            /*hp bg fill*/).fillStyle(
                'black'
            ).fillRect(
                this.width/2 - hpMaxWidth/2,
                hpY,
                hpMaxWidth,
                height
            /*current hp*/).fillStyle(
                '#43a047'
            ).fillRect(
                this.width/2 - hpMaxWidth/2,
                hpY,
                hpX,
                height
            /*hp bg stroke stroke*/).strokeStyle(
                'white'
            ).strokeRect(
                this.width/2 - hpMaxWidth/2,
                hpY,
                hpMaxWidth,
                height
            ).fillStyle('white').textAlign(
                'right'
            ).fillText(
                currentLevel,
                this.width/2 - maxWidth/2 - 10,
                y + 15
            ).textAlign(
                'left'
            ).fillText(
                nextLevel,
                this.width/2 + maxWidth/2 + 10,
                y + 15
            ).textAlign(
                'center'
            ).font(
                '15px Pixel'
            ).fillText(
                'rank',
                this.width/2,
                y + 11
            ).fillText(
                'health',
                this.width/2,
                hpY + 11
            );
        }

        if(fadeTimer > 0) {
            fadeT += Amble.Time.deltaTime;
            var alpha = Math.sin(Math.PI * (fadeT/2)/fadeTime);
            layer.fillStyle('rgba(0,0,0,' + alpha + ')').fillRect(-this.width,-this.height, 4*this.width, 4*this.height);
            fadeTimer -= Amble.Time.deltaTime;
        }

        if(fadeTimer < 0) {
            // fadeT = 0;
            fadeTimer = 0;
            fadeCompleted = true;
        }

        if(textTimer > 0 && globalInfoImg) {

            var alpha = textTimer/(textTime * alphaDelay);

            layer.ctx.save();
            layer.ctx.globalAlpha = alpha; // 50% transparent
            layer.ctx.drawImage(globalInfoImg, 0, 0);

            layer.ctx.restore();
            textTimer -= Amble.Time.deltaTime;
        }

        if(endlessScreen && endlessImg) {
            layer.fillStyle(this.defaultBgColor).fillRect(-this.width/2, -this.height/2, 2*this.width, 2*this.height);
            layer.ctx.drawImage(endlessImg, 0, 0);
        }

        for(var a = 0; a < this.width/5; a++) {
            layer.ctx.save();
            layer.fillStyle(postColor);
            layer.ctx.globalAlpha = Math.random() * 0.05
            layer.fillRect(0,a * 5,2*this.width,5);
            layer.ctx.globalAlpha = Math.random() * 0.05
            layer.strokeStyle(postColor)
            layer.strokeRect(0, a * 5,2*this.width,5);
            layer.ctx.restore();
        }
    }
});
