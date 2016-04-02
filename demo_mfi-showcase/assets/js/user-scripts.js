Class({

  name: "PlayerScript",

  properties: {

    speed: {
      type: Number,
      value: 700
    },

    maxSpeed: {
      type: Number,
      value: 1400
    },

    jump: {
      type: Boolean,
      value: false
    },

    jumpForce: {
      type: Number,
      value: 1200,
    },

    currentJumpForce: {
      type: Number,
      value: 1200
    },

    grounded: {
      type: Boolean,
      value: true
    },

    vy: {
      type: Number,
      value: 0
    },

    gameOver: {
      type: Boolean,
      value: false
    },

    runRenderer: null,
    rendererChange: false,
    backgroundAudio: null,

  },

  start: function(self) {

    this.currentJumpForce = this.jumpForce;
    this.firstDrop = true;

    this.backgroundAudio = AMBLE.loader.getAsset('bgmusic');
    this.backgroundAudio.loop = true;
    this.backgroundAudio.play();

    self.renderer.play = true;

  },

  update: function(self) {

    if(this.maxSpeed > this.speed) {
      this.speed += Time.deltaTime * 25;
    }

    if(!this.gameOver) {
      self.transform.position.x += Time.deltaTime * this.speed;
    }

    var camera = AMBLE.scene.getActorByTag('mainCamera');
    camera.transform.position.x = self.transform.position.x + camera.camera.size.x/3;
    var background = AMBLE.scene.getActorByName('background');
    background.transform.position.x = camera.transform.position.x;
    background.transform.position.y = camera.transform.position.y;

    var platforms = AMBLE.scene.getActorByName('MainCamera').getComponent('WorldManager').platforms;
    var platform;
    var x = self.transform.position.x;
    for(var i = 0; i < platforms.length; i++) {
      if(x > platforms[i].x && x < platforms[i].x + platforms[i].width) {
        platform = platforms[i];
        break;
      }
    }

    if(this.jump){

      self.transform.position.y -= this.currentJumpForce * Time.deltaTime;
      this.currentJumpForce -= Time.deltaTime * 981;

      if(self.renderer.rendererType == "AnimationRenderer") {
        self.renderer = new SpriteRenderer({
          layer: 2,
          sprite: 'player_jump'
        });
      }
    }

    if(platform && self.transform.position.y + self.renderer.size.y/2 >= platform.y && self.transform.position.y + self.renderer.size.y/2 < platform.y + platform.height) {

      this.jump = false;
      this.grounded = true;

      if(!this.gameOver) {
        self.transform.position.y = platform.y - self.renderer.size.y/2
      }

      if(self.renderer.rendererType == 'SpriteRenderer') {
        var sizeX = self.renderer.size.x;
        var sizeY = self.renderer.size.y;
        self.renderer = new AnimationRenderer({
          layer: 2,
          sprite: 'player_run',
          frames: 11,
          updatesPerFrame: 2,
          play: true
        });
        self.renderer.size.x = sizeX;
        self.renderer.size.y = sizeY;
      }

      this.vy = 0;

    } else if(!this.gameOver){

      this.grounded = false;

      // add v
      this.vy += Time.deltaTime * 981;

      self.transform.position.y += this.vy * Time.deltaTime;

    }

    if(self.transform.position.y > camera.transform.position.y + camera.camera.size.y/2 || (platform && self.transform.position.y + self.renderer.size.y/2 > platform.y + platform.height)) {
      this.backgroundAudio.pause();
      this.gameOver = true;
      self.renderer.visible = false;
      var g = AMBLE.scene.getActorByName('gameOver');
      g.renderer.visible = true;
      g.transform.position.x = camera.transform.position.x;
      g.transform.position.y = camera.transform.position.y;

    }

  },

  onkeydown: function(self, e) {
    if(e.which == 32 ) { // space
      this.spacePress(self, e);
    }
  },

  ontouchstart: function(self, e) {
    this.spacePress(self, e);
  },

  spacePress: function(self, e) {
    if(!this.jump && this.grounded) {
      this.jump = true;
      this.currentJumpForce = this.jumpForce;
    }

    if(this.gameOver) {
      location.reload();
    }
  },

  postRender: function(self) {

    var layer = AMBLE.mainCamera.camera.layer;
    layer.ctx.save();
    layer.font('40px Arial');

    var size = AMBLE.mainCamera.camera.size;
    var distance = (self.transform.position.x/self.renderer.size.x) | 0

    if(this.gameOver) {

      layer.textAlign('center');
      layer.fillStyle('white');
      layer.fillText("Przebiegłeś: " + distance + ' m', size.x/2 , 3*size.y/4);

    } else {

      layer.textAlign('left');
      layer.fillStyle('black');
      layer.fillText(distance + 'm', 0 , 40);

    }

    layer.ctx.restore();

  }

})

Class({
  name: "WorldManager",

  properties: {

    stone: {
      type: Object,
      value: {
        left: 'stoneHalfLeft',
        mid: 'stoneHalfMid',
        right: 'stoneHalfRight'
      }
    },

    grass: {
      type: Object,
      value: {
        left: 'grassHalfLeft',
        mid: 'grassHalfMid',
        right: 'grassHalfRight'
      }
    },

    castle: {
      type: Object,
      value: {
        left: 'castleHalfLeft',
        mid: 'castleHalfMid',
        right: 'castleHalfRight'
      }
    },

    snow: {
      type: Object,
      value: {
        left: 'snowHalfLeft',
        mid: 'snowHalfMid',
        right: 'snowHalfRight'
      }
    },

    sand: {
      type: Object,
      value: {
        left: 'sandHalfLeft',
        mid: 'sandHalfMid',
        right: 'sandHalfRight'
      }
    },

    maxPlatformSize: {
      type: Number,
      value: 30,
    },

    minPlatformSize: {
      type: Number,
      value: 5,
    },

    platforms: {
      type: Array,
      value: []
    },

    minGap: {
      type: Number,
      value: 490,
    },

    maxGap: {
      type: Number,
      value: 700,
    },

    maxYVariation: {
      type: Number,
      value: 50,
    }
  },

  awake: function(self) {

    this.createPlatform(self.transform.position.x - self.camera.size.x/2, self.transform.position.y + self.camera.size.y/2.5, self.camera.size.x/50, 0, 0);

  },

  update: function(self) {

    // add if last platform distance to camera > camera.width
    var lastPlatform = this.platforms[this.platforms.length - 1];
    if(lastPlatform.x + lastPlatform.width < self.transform.position.x + self.camera.size.x/2) {
      var platformParts = Mathf.getRandomIntInRange(this.minPlatformSize, this.maxPlatformSize);
      var gap = Mathf.getRandomIntInRange(this.minGap, this.maxGap);
      var yVariation = Mathf.getRandomIntInRange(0, this.maxYVariation);
      this.createPlatform(self.transform.position.x + self.camera.size.x/2, self.transform.position.y + self.camera.size.y/2.5, platformParts, gap, yVariation)
    }

    // delete platform if out of camera
    var firstPlatform = this.platforms[0];
    if(firstPlatform.x + firstPlatform.width < self.transform.position.x - self.camera.size.x/2) {
      this.platforms.shift();
    }

  },

  createPlatform: function(startX, startY, platformParts, gapSize, yVariation) {

    var assetsType = ['stone', 'grass', 'snow', 'sand', 'castle'];
    var assetType = assetsType[Mathf.getRandomIntInRange(0, assetsType.length - 1)];

    var assetPrefab = {
      name: 'actor_',
      tag: 'actor',
      hideInHierarchy: false,
      selected: false,
      transform: { name: "Transform", args: {
        position: { name: "Vec2", args: {x: 0, y: 0}},
        scale: { name: "Vec2", args: {x: 1, y:1 }},
        rotation: 0
      }},
      renderer: { name: 'SpriteRenderer', args: {
        sprite: '',
        layer: 1
      }},
      components: []
    };

    var platform = {
      children: [],
      x: startX + gapSize, // add gap
      y: startY - yVariation, // add variation
      width: (platformParts + 2) * 70,
      height: 70
    };

    // add left sprite
    assetPrefab.renderer.args.sprite = this[assetType].left;
    assetPrefab.transform.args.position.args.x = platform.x + 35;
    assetPrefab.transform.args.position.args.y = platform.y + 35;
    assetPrefab.name = this.generatePlatformAssetName();
    platform.children.push(AMBLE.scene.instantiate(assetPrefab));

    assetPrefab.renderer.args.sprite = this[assetType].mid;

    for(var i = 1; i <= platformParts; ++i) {
      // add actor to scene and to platform child
      assetPrefab.transform.args.position.args.x = platform.x + 35 + (i * 70);
      assetPrefab.name = this.generatePlatformAssetName();
      platform.children.push(AMBLE.scene.instantiate(assetPrefab));
    }

    // add right sprite
    assetPrefab.renderer.args.sprite = this[assetType].right;
    assetPrefab.transform.args.position.args.x = platform.x + 35 + ((i) * 70);
    assetPrefab.name = this.generatePlatformAssetName();
    platform.children.push(AMBLE.scene.instantiate(assetPrefab));

    this.platforms.push(platform);

  },

  generatePlatformAssetName: function() {
    return Math.floor((1 + Math.random()) * (new Date().getTime()))
      .toString(16)
      .substring(1);
  },


})
