window.Amble = (function(){

    var Amble = {};
    Amble.app = {};

    /* Game */
    Amble.Application = function(args){
        var that = this;
        Amble.app = this;

        this.resize = typeof args['resize'] === 'boolean' ? args['resize'] : false;
        this.antyAliasing = typeof args['antyAliasing'] === 'boolean' ? args['antyAliasing'] : false;
        //wrap this things up
        if(this.resize) {
            window.addEventListener('resize', function(){

                var camera = Amble.app.mainCamera.camera;
                for(var i = 0; i < camera.layers.length; i++) {
                    camera.layers[i].layer.resize();
                }

            });
        }

        this.fullscreen = args['fullscreen'] || false;
        this.width = args['width'] || 640;
        this.height = args['height'] || 480;

        this.scene = new Amble.Scene();

        this.mainCamera = this.scene.instantiate(args['mainCamera']);

        //init all public game loop functions
        var gameLoopFunctionsList = ['preload', 'loaded', 'start', 'preupdate', 'postupdate', 'prerender', 'postrender'];
        for(var i in gameLoopFunctionsList){
            this[gameLoopFunctionsList[i]] = typeof args[gameLoopFunctionsList[i]] === 'function' ? args[gameLoopFunctionsList[i]] : function(){};
        }

        //private game loop functions
        this.update = function(){
            this.mainCamera.camera.update()
            this.scene.update();

            //update all objects on scene
            //priorytet sort?
        };

        this.defaultBgColor = args['defaultBgColor'] || 'transparent';

        this.render = function(){

            var camera = this.mainCamera.camera;

            for(var i = 0; i < camera.layers.length; i++) {
                camera.layers[i].layer.ctx.restore();
                if(i == 0) camera.layers[i].layer.clear(this.defaultBgColor);
                else camera.layers[i].layer.clear();
            }


            // layer.ctx.stroke();
            for(var i = 0; i < camera.layers.length; i++) {

                camera.layers[i].layer.ctx.save();
                // if(!startScreen && !gameEnd && !gameOver && !gameStart) {
                    camera.layers[i].layer.ctx.translate(this.width/2, this.height/2);

                    rotator += Amble.Time.rawDeltaTime;
                    var angle = 2.5 * Math.sin(rotator)/8;
                    camera.layers[i].layer.ctx.scale(1 + Math.sin(rotator/1.5)/24, 1 + Math.sin(rotator/1.5)/24);
                    camera.layers[i].layer.ctx.rotate(angle*Math.PI/180);

                    camera.layers[i].layer.ctx.translate(-this.width/2, -this.height/2);
                // }
            }

            this.scene.render(camera);
        };

        this.loader = new Amble.Data.Loader();

        var loadingTimer = 0;
        var currentLoadingText = 0;

        var colors = [
            "#e53935",
            "#d81b60",
            "#8e24aa",
            "#5e35b1",
            "#3949ab",
            "#1e88e5",
            "#039be5",
            "#00acc1",
            "#00897b",
            "#43a047",
            "#7cb342",
            "#c0ca33",
            "#fbc02d",
            "#6d4c41",
            "#ff6f00",
            "#546e7a"
        ];

        var color = colors[Math.floor(Math.random() * colors.length - 1)];

        this.loadingInterval = setInterval(function(){
            var x = (that.width - that.width/4) * ((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length);
            var layer = that.mainCamera.camera.layer(0);
            layer.ctx.save();
            var loading = [
                "   loading.  ",
                "   loading.. ",
                "   loading...",
            ]

            layer.clear('black')
                .fillStyle(color)
                .strokeStyle('white')
                .fillRect(that.width/8, that.height/2 - that.height/16, x, that.height/8)
                .strokeRect(that.width/8, that.height/2 - that.height/16, (that.width - that.width/4), that.height/8);

            layer.ctx.shadowColor = "white";
            layer.ctx.shadowBlur = 20;

            layer.fillStyle('white');//.strokeStyle('black').lineWidth(1);
            layer.ctx.textAlign = 'center';
            layer.ctx.font = "35px Pixel";
            var text = parseInt(((that.loader.successCount + that.loader.errorCount)/that.loader.queue.length) * 100) + "%"
            layer.ctx.fillText(text, that.width/2, that.height/2 + 5)

            layer.ctx.font = "30px Pixel";
            text = loading[currentLoadingText];
            layer.ctx.fillText(text, that.width/2, 2*that.height/3 + 10)

            loadingTimer += 1/60;
            if(loadingTimer > 1) {
                loadingTimer = 0;
                currentLoadingText++;
                if(currentLoadingText == loading.length) currentLoadingText = 0;
            }
            layer.ctx.restore();

        }, 1000/60);

        /* setting all loading heppens there */
        this.preload();

        // /* all loading */
        this.loader.loadAll(function(){
            setTimeout(function(){
                clearInterval(that.loadingInterval);
                Amble.Input._setListeners();


                introMusic.play();

                bgMusic = new Audio('data/sounds/lost_in_city.ogg');
                bgMusic.volume = 0.2;
                bgMusic.loop = true;

                combatMusic = new Audio('data/sounds/combat.ogg');
                combatMusic.volume = 0.2;
                combatMusic.loop = true;


                Amble.app.loader.audioCache = [];
                that.scene.start();
                that.start();
                gameLoop();
            }, 1000);
        })

        /* hearth of the Amble/game */
        function gameLoop(){

            var now = Date.now();
            Amble.Time.deltaTime = (now - Amble.Time._lastTime) / 1000.0;
            Amble.Time.rawDeltaTime = Amble.Time.deltaTime;
            Amble.Time.deltaTime *= Amble.Time.deltaScale;

            //dafuq?
            that.preupdate();
            that.update();
            that.postupdate();
            that.render();
            that.postrender();

            Amble.Time._lastTime = now;
            requestAnimationFrame(gameLoop)
        }
    };

    /* Time */
    Amble.Time = {
        deltaScale: 1,
        deltaTime: 0,
        rawDeltaTime: 0,
        _lastTime: Date.now()
    };

    Amble.Camera = function(args){
        this.position = args['position'] || new Amble.Math.Vector2({});
        this.context = document.getElementById(args['context']) || document.body;
        this.size = new Amble.Math.Vector2({x: Amble.app.width, y: Amble.app.height});
        this.view = new Amble.Math.Vector2(this.position.x - this.size.x, this.position.y - this.size.y);
        this.scale = 1;
        this.layers = [];
    };

    Amble.Camera.prototype = {

        layer: function(index){
            if(index < 0) {
                index = 0;
                throw "Z-index cannot be negative!"
            }
            var layer = this.layers.find(l => l.index == index);
            if(!layer) {
                return this.addLayer(index).layer;
            } else {
                return layer.layer;
            }
        },

        addLayer: function(index){
            var l = this.layers.find(l => l.index == index);
            if(!l) {
                var layer = {
                    index: index,
                    layer: new Amble.Graphics.Layer(this.size.x, this.size.y, index)
                }
                layer.layer.appendTo(this.context)
                this.layers.push(layer);

                return layer;
            }
        },

        update: function(){
            this.view = new Amble.Math.Vector2({x: this.position.x - this.size.x/2, y: this.position.y - this.size.y/2});
            return this;
        }
    };

    /* Utils */
    Amble.Utils = {

        generateID: function() {
            return Math.floor((1 + Math.random()) * (new Date().getTime()))
              .toString(16)
              .substring(1);
        },

        makeFunction: function(obj) {
            if(obj instanceof Object) {
                if(obj.hasOwnProperty('name')) {
                    var args = {};
                    for(var i in obj.args) {
                        args[i] = Amble.Utils.makeFunction(obj.args[i])
                    }
                    var func = Amble.Utils.stringToFunction(obj.name)
                    return new func(args);

                } else {
                    return obj;
                }
            } else {
                return obj;
            }
        },

        clone: function(obj) {
            var copy = {};
            if (obj instanceof Object || obj instanceof Array) {
                for(var attr in obj) {
                    if(attr == 'components') {
                        copy[attr] = [];
                        for(var i in obj[attr]) {
                            copy[attr][i] = {
                                id: obj[attr][i].name,
                                body: Amble.Utils.makeFunction(obj[attr][i])
                            }
                        }
                    } else {
                        copy[attr] = Amble.Utils.makeFunction(obj[attr]);
                    }
                }
            }
            return copy;
        },

        stringToFunction: function(str) {
            var arr = str.split(".");
            var fn = window || this;
            for (var i = 0, len = arr.length; i < len; i++) {
                fn = fn[arr[i]];
            }

            if (typeof fn !== "function") {
                throw new Error("function not found");
            }

            return  fn;
        }
    };

    Amble.Actor = function(args) {

        //transform is basic actro component

        //other are optional
        //2 types of components (user custom in components array, and engine built in components like renderer)
        this.renderer = {};
        this.components = {};
    };

    Amble.Actor.prototype = {

        getComponent: function(componentName){
            var component = this.components.find(c => c.id == componentName);
            return component.body;
        }
    };

    /* Scene */
    Amble.Scene = function(){
        this.children = [];
        this.started = false;
    };

    Amble.Scene.prototype = {

        getActorByName: function(name) {
            return this.children.find(c => c.name === name)
        },

        getActorByTag: function(tag) {
            return this.children.find(c => tag === tag);
        },

        getActorsByTag: function(tag) {
            return this.children.filter(c => tag === tag);
        },

        //get by tag array?

        getActorByID: function(id){
            return this.children.find(c => c.sceneID === id);
        },

        instantiate: function(obj){
            var actor = new Amble.Actor();
            var clone = Amble.Utils.clone(obj);
            for(var i in clone) {
                actor[i] = clone[i];
            }
            return this.add(actor, obj);
        },

        add: function(object, prefab) {

            var sceneID = Amble.Utils.generateID();

            object.sceneID = sceneID;

            object.prefab = prefab;

            if(object.components != 'undefined') {
                for(var i in object.components) {
                    var _component = object.components[i].body;
                    if(typeof _component.awake == 'function'){
                        _component.awake(object);
                    }
                }
            }

            if(this.started) {
                for(var j in object.components.components){
                    var _component = object.components.components[j].body;
                    if(typeof _component.start == 'function'){
                        _component.start(object);
                    }
                }
            }

            this.children.push(object);

            return object;
        },

        remove: function(object, callback){
            var index = this.children.indexOf(object);
            if(index != -1) {
                this.children.splice(index, 1);
                if(callback) callback(this.children);
            }
        },

        start: function(){
            for(var i in this.children){
                /* component start */
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.start == 'function'){
                        _component.start(this.children[i]);
                    }
                }
            }

            this.started = true;
        },

        update: function(){
            for(var i in this.children){
                /* script update */
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.update == 'function'){
                        _component.update(this.children[i]);
                    }
                }
            }

        },

        render: function(camera){
            for(var i in this.children){
                /* render objects by renderer*/
                if(this.children[i].renderer && typeof this.children[i].renderer.render === 'function') {
                    this.children[i].renderer.render(this.children[i], camera)
                }
            }
        },

        //input events
        onmousewheel: function(e){
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onmousewheel == 'function'){
                        _component.onmousewheel(this.children[i], e);
                    }
                }
            }
        },

        onmousedown: function(e){
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onmousedown == 'function'){
                        _component.onmousedown(this.children[i], e);
                    }
                }
            }
        },

        onmouseup: function(e){
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onmouseup == 'function'){
                        _component.onmouseup(this.children[i], e);
                    }
                }
            }
        },

        onkeydown: function(e) {
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onkeydown == 'function'){
                        _component.onkeydown(this.children[i], e);
                    }
                }
            }
        },

        onkeyup: function(e){
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.onkeyup == 'function'){
                        _component.onkeyup(this.children[i], e);
                    }
                }
            }
        },

        oncontextmenu: function(e){
            for(var i in this.children){
                for(var j in this.children[i].components){
                    var _component = this.children[i].components[j].body;
                    if(typeof _component.oncontextmenu == 'function'){
                        _component.oncontextmenu(this.children[i], e);
                    }
                }
            }
        }
    };

    /* Transform */
    Amble.Transform = function(args) {
        this.position = args['position'] || new Amble.Math.Vector2({});
        this.rotation = args['rotation'] || 0;

        //move size to other component -> there rename to scale
        this.scale = args['scale'] || new Amble.Math.Vector2({x: 1, y: 1});
    };

    /* Sound */
    Amble.Audio = function(args) {
        this.volumeMax = args['volumeMax'] || 0.25;
        this.propVolume = 0.25;
        this.propLoop = args['loop'] || false;
        this.audio = args['audio'] || undefined;
        this._audio = null;
        this._attached = false;
    }

    Amble.Audio.prototype = {

        play: function() {
            if(!this._attached) {
                this._attach();
            }

            if(this._audio) {
                // console.log(this._audio.currentTime);
                this._audio.play();
            }
            return this;
        },

        _attach: function(){
            this._audio = Amble.app.loader.getAsset(this.audio);
            this._audio.volume = this.propVolume;
            this._audio.loop = this.propLoop;
            if(this._audio)
                this._attached = true;
        },

        // currentTime: function(time) {
        //     this._audio.currentTime = time;
        //     return this;
        // },

        setVolume: function(volume) {
            if(this._attached)
                this._attach();
            if(volume > this.volumeMax) volume = this.volumeMax;
            if(volume < 0) volume = 0;
            this._audio.volume = this.propVolume = volume;
            return this;
        },

        getVolume: function(){
            return this._audio.volume;
        },

        pause: function() {
            this._audio.pause();
        },

        loop: function(loop) {
            this._audio.loop = this.propLoop = loop;
        }

    }

    /* Graphics */
    Amble.Graphics = {};

    Amble.Graphics.Layer = function(width, height, index){
        this.canvas = document.createElement('canvas');
        this.canvas.width = width || Amble.app.width;
        this.canvas.height = height || Amble.app.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = index.toString() || '0';
        this.ctx = this.canvas.getContext('2d');

        this.ctx.imageSmoothingEnabled = Amble.app.antyAliasing;
        this.ctx.mozImageSmoothingEnabled = Amble.app.antyAliasing;
        this.ctx.msImageSmoothingEnabled = Amble.app.antyAliasing;
        this.ctx.imageSmoothingEnabled = Amble.app.antyAliasing;

        //scale to fullscreen
        this.resize = function() {

          var scaleX = window.innerWidth / this.canvas.width;
          var scaleY = window.innerHeight / this.canvas.height;

          var scaleToFit = Math.min(scaleX, scaleY);
          var scaleToCover = Math.max(scaleX, scaleY);

          var w = window.innerWidth - (this.canvas.width * scaleToFit);
          var h = window.innerHeight - (this.canvas.height * scaleToFit);

          this.canvas.style.top = (h/2) + 'px';
          this.canvas.style.left = (w/2) + 'px';

          this.canvas.style.transformOrigin = "0 0"; //scale from top left
          this.canvas.style.transform = "scale(" + scaleToFit + ")";
        }
        this.resize();
    };

    Amble.Graphics.Layer.prototype = {

        appendTo: function(element){
            this.parent = element;
            element.appendChild(this.canvas);
            return this;
        },

        setZIndex: function(zIndex){
            this.canvas.style.zIndex = zIndex;
            return this;
        },

        remove: function(){
            this.parent.removeChild(this.canvas);
            return this;
        },

        clear: function(color){
            this.ctx.save();
            this.ctx.setTransform(1,0,0,1,0,0);
            if (color) {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            } else {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            this.ctx.restore();
            return this;
        },

        fillStyle: function(color){
            this.ctx.fillStyle = color;
            return this;
        },

        fillRect: function(x, y, width, height){
            this.ctx.fillRect(x, y, width, height);
            return this;
        },

        strokeStyle: function(color){
            this.ctx.strokeStyle = color;
            return this;
        },

        strokeRect: function(x, y, width, height){
            this.ctx.strokeRect(x, y, width, height);
            return this;
        },

        stroke: function(){
            this.ctx.stroke();
            return this;
        },

        lineWidth: function(width){
            this.ctx.lineWidth = width;
            return this;
        },

        font: function(font) {
            this.ctx.font = font;
            return this;
        },

        textAlign: function(align) {
            this.ctx.textAlign = align;
            return this;
        },

        fillText: function(text, x, y) {
            this.ctx.fillText(text, x, y);
            return this;
        }

        //more canvas methods

    };

    Amble.Graphics.AnimationRenderer = function(args) {
        this.sprite = args['sprite'];
        this.layer = args['layer'] || 0;
        this.updatesPerFrame = 1/60 * args['updatesPerFrame'] || 1;
        this.frames = args['frames'] || 1;

        this.loop = args['loop'] || true;

        this._currentFrame = 0;
        this._updates = 0;

        this._sprite = new Image();

        this._frameTimer = 0;

        this.size = new Amble.Math.Vector2({x: 0, y: 0})

        this.anchor = args['anchor'] || new Amble.Math.Vector2({x: 0.5, y: 0.5});

    };

    Amble.Graphics.AnimationRenderer.prototype = {

        render: function(self, camera) {

          // if(self.transform.position.x + this.size.x/2 < camera.position.x + camera.size.x/2 &&
          //   self.transform.position.x - this.size.x/2 > camera.position.x - camera.size.x/2 &&
          //   self.transform.position.y + this.size.y/2 < camera.position.y + camera.size.y/2 &&
          //   self.transform.position.y - this.size.y/2 > camera.position.y - camera.size.y/2
          // ) {



            var layer = camera.layer(this.layer);

            layer.ctx.save();

            if(this._sprite) {

                if(this._sprite.src != this.sprite && Amble.app.loader.isDone()) {
                    this._sprite = Amble.app.loader.getAsset(this.sprite);
                    if(!this._sprite) return;
                }

                if(this.anchor.x < 0) this.anchor.x = 0;
                if(this.anchor.x > 1) this.anchor.x = 1;

                if(this.anchor.y < 0) this.anchor.y = 0;
                if(this.anchor.y > 1) this.anchor.y = 1;

                var width = (this._sprite.width/this.frames) | 0;
                var height = this._sprite.height;
                this.size.x = width;
                this.size.y = height;
                var x = (self.transform.position.x - camera.view.x)// | 0;
                var y = (self.transform.position.y - camera.view.y)// | 0;

                layer.ctx.translate(x, y);
                layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);
                layer.ctx.rotate(-self.transform.rotation * Amble.Math.TO_RADIANS);

                if(this._sprite.src) {
                    layer.ctx.drawImage(
                        this._sprite,
                        this._currentFrame * width,
                        0,
                        width,
                        height,
                        (-width * this.anchor.x) | 0,
                        (-height * this.anchor.y) | 0,
                        width,
                        height
                    );
                }

            } else {
                this._sprite = Amble.app.loader.getAsset(this.sprite);
            }

            layer.ctx.restore();

            this._updates += Amble.Time.deltaTime;
          	if(this._updates > this.updatesPerFrame) {
          		this._updates = 0;
          		if(this._currentFrame < this.frames - 1) this._currentFrame++;
          		else if(this.loop) this._currentFrame = 0;
          	}
          }

    };


    Amble.Graphics.SpriteRenderer = function(args) {
        this.sprite = args['sprite'];
        this.layer = args['layer'] || 0;

        this._sprite = new Image();
        this.anchor = args['anchor'] || new Amble.Math.Vector2({x: 0.5, y: 0.5});
        this.size = new Amble.Math.Vector2({x: 0, y: 0})
    }

    Amble.Graphics.SpriteRenderer.prototype = {

        render: function(self, camera) {

            var layer = camera.layer(this.layer);

            layer.ctx.save();

            if(this._sprite) {

                if(this._sprite.src != this.sprite && Amble.app.loader.isDone()) {
                    this._sprite = Amble.app.loader.getAsset(this.sprite);
                    if(!this._sprite) return;
                }

                if(this.anchor.x < 0) this.anchor.x = 0;
                if(this.anchor.x > 1) this.anchor.x = 1;

                if(this.anchor.y < 0) this.anchor.y = 0;
                if(this.anchor.y > 1) this.anchor.y = 1;

                var width = this._sprite.width | 0;
                var height = this._sprite.height | 0;
                this.size.x = width;
                this.size.y = height;
                var x = (self.transform.position.x - camera.view.x) | 0;
                var y = (self.transform.position.y - camera.view.y) | 0;

                layer.ctx.translate(x, y);
                layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);
                layer.ctx.rotate(-self.transform.rotation * Amble.Math.TO_RADIANS);

                if(this._sprite.src)
                    layer.ctx.drawImage(this._sprite, (-width * this.anchor.x) | 0, (-height * this.anchor.y) | 0);

            } else {
                this._sprite = Amble.app.loader.getAsset(this.sprite);
            }

            layer.ctx.restore();
        }
    };

    /* Amble.Graphics.Renderer constructor */
    Amble.Graphics.RectRenderer = function(args){
        this.color = args['color'] || 'pink';
        this.layer = args['layer'] || 0;
        this.size = args['size'];
        //to implement
        this.anchor = new Amble.Math.Vector2({});
    };

    /* Amble.Graphics.Renderer functions */
    Amble.Graphics.RectRenderer.prototype = {

        render: function(self, camera){

            var layer = camera.layer(this.layer);

            var width = this.size.x | 0;
            var height = this.size.y | 0;
            var x = (self.transform.position.x - camera.view.x) | 0;
            var y = (self.transform.position.y - camera.view.y) | 0;

            layer.ctx.save();

            // move origin to object origin
            layer.ctx.translate(x, y);

            //scale
            layer.ctx.scale(self.transform.scale.x, self.transform.scale.y);

            // rotation in radians
            layer.ctx.rotate(-self.transform.rotation * Amble.Math.TO_RADIANS);

            // draw
            layer.fillStyle(this.color).fillRect((-width/2) | 0, (-height/2) | 0, width, height);

            layer.ctx.restore();
        }

    };

    /* Math */
    Amble.Math = {};

    Amble.Math.TO_RADIANS = Math.PI/180;

    Amble.Math.Vector2 = function(args){
        this.x = args['x'] || 0;
        this.y = args['y'] || 0;
    };

    Amble.Math.Vector2.prototype = {

        copy: function(vec2){
            this.x = vec2.x;
            this.y = vec2.y;
            return this;
        },

        add: function(vec2){
            this.x += vec2.x;
            this.y += vec2.y;
            return this;
        },

        sub: function(vec2){
            this.x -= vec2.x;
            this.y -= vec2.y;
            return this;
        },

        multiply: function(multipler) {
            this.x *= multipler;
            this.y *= multipler;
            return this;
        },

        dot: function(other) {
            return this.x * other.x + this.y * other.y;
        },

        length2: function(){
            return this.dot(this);
        },

        length: function() {
            return Math.sqrt(this.length2());
        },

        normalize: function(){
            var l = this.length();
            if(l > 0) {
                this.x = this.x / l;
                this.y = this.y / l;
            }
            return this;
        }
    }

    Amble.Math.Vector3 = function(args){
        this.x = args['x'] || 0;
        this.y = args['y'] || 0;
        this.z = args['z'] || 0;
    };

    Amble.Math.Vector3.prototype = {

        copy: function(vec3){
            this.x = vec3.x;
            this.y = vec3.y;
            this.z = vec3.z;
            return this;
        },

        add: function(vec3){
            this.x += vec3.x;
            this.y += vec3.y;
            this.z += vec3.z;
            return this;
        },

        sub: function(vec3){
            this.x -= vec3.x;
            this.y -= vec3.y;
            this.z -= vec3.z;
            return this;
        },

        dot: function(other) {
            return this.x * other.x + this.y * other.y + this.z * other.z;
        },

        length2: function(){
            return this.dot(this);
        },

        length: function() {
            return Math.sqrt(this.length2());
        },

        normalize: function(){
            var l = this.length();
            if(l > 0) {
                this.x = this.x / l;
                this.y = this.y / l;
                this.z = this.z / l;
            }
            return this;
        }
    }

    /* Input */
    Amble.Input = {

        debug: false,

        isKeyPressed: function(keycode){
            return Amble.Input._keyValues[keycode];
        },

        isMousePressed: function(keycode){
            return Amble.Input._mouseValues[keycode];
        },

        _mouseValues: [],

        _keyValues: [],

        mousePosition: new Amble.Math.Vector2({}),

        offset: new Amble.Math.Vector2({}),

        wheelDelta: new Amble.Math.Vector3({}),

        isShiftPressed: false,

        isCtrlPressed: false,
    }

    Amble.Input._eventFunctions = {

        keydown: function(e){
            if(Amble.Input.debug)
                console.log(e.which);
            Amble.Input.isShiftPressed = e.shiftKey;
            Amble.Input.isCtrlPressed = e.ctrlKey;
            Amble.Input._keyValues[e.which] = true;

            Amble.app.scene.onkeydown(e);
        },

        keyup: function(e){
            Amble.Input._keyValues[e.which] = false;

            Amble.app.scene.onkeyup(e);
        },

        mousedown: function(e){
            if(Amble.Input.debug)
                console.log(e.which);
            Amble.Input._mouseValues[e.which] = true;

            Amble.app.scene.onmousedown(e);
        },

        mouseup: function(e){
            if(Amble.Input.debug)
                console.log(e.which);
            Amble.Input._mouseValues[e.which] = false;

            Amble.app.scene.onmouseup(e);
        },

        mousemove: function(e){
            var offsetLeft = Amble.app.mainCamera.camera.context.offsetLeft;
            var offsetTop = Amble.app.mainCamera.camera.context.offsetTop;

            if(Amble.Input.debug) {
                console.log(e.clientX - offsetLeft);
                console.log(e.clientY - offsetTop);
            }

            Amble.Input.offset.x = offsetLeft;
            Amble.Input.offset.y = offsetTop;

            Amble.Input.mousePosition.x = e.clientX - offsetLeft;
    		Amble.Input.mousePosition.y = e.clientY - offsetTop;
        },

        wheel: function(e){
            Amble.Input.wheelDelta.x = e.deltaX;
            Amble.Input.wheelDelta.y = e.deltaY;
            Amble.Input.wheelDelta.z = e.deltaZ;

            Amble.app.scene.onmousewheel(e);
        },

        contextmenu: function(e) {
            e.preventDefault();
            Amble.app.scene.oncontextmenu(e);
        }
    }

    Amble.Input._setListeners = function(){

        var element = Amble.app.mainCamera.camera.context;
        document.addEventListener('keydown', Amble.Input._eventFunctions.keydown, false);
        document.addEventListener('keyup', Amble.Input._eventFunctions.keyup, false);
        document.addEventListener('mousedown', Amble.Input._eventFunctions.mousedown, false);
        document.addEventListener('mouseup', Amble.Input._eventFunctions.mouseup, false);
        document.addEventListener('mousemove', Amble.Input._eventFunctions.mousemove, false);
        document.addEventListener("wheel", Amble.Input._eventFunctions.wheel, false);
        document.addEventListener("contextmenu", Amble.Input._eventFunctions.contextmenu, false);

        //touch start
        //touch end
        //touch move
    }

    Amble.Input._removeListeners = function(){

        var element = Amble.app.mainCamera.camera.context;
        if (document.removeEventListener) { // For all major browsers, except IE 8 and earlier

            document.removeEventListener('keydown', Amble.Input._eventFunctions.keydown, false);
            document.removeEventListener('keyup', Amble.Input._eventFunctions.keyup, false);
            document.removeEventListener('mousedown', Amble.Input._eventFunctions.mousedown, false);
            document.removeEventListener('mouseup', Amble.Input._eventFunctions.mouseup, false);
            document.removeEventListener('mousemove', Amble.Input._eventFunctions.mousemove, false);
            document.removeEventListener("wheel", Amble.Input._eventFunctions.wheel, false);
            document.removeEventListener("contextmenu", Amble.Input._eventFunctions.contextmenu, false);

        } else if (document.detachEvent) { // For IE 8 and earlier versions

            document.detachEvent('keydown', Amble.Input._eventFunctions.keydown, false);
            document.detachEvent('keyup', Amble.Input._eventFunctions.keyup, false);
            document.detachEvent('mousedown', Amble.Input._eventFunctions.mousedown, false);
            document.detachEvent('mouseup', Amble.Input._eventFunctions.mouseup, false);
            document.detachEvent('mousemove', Amble.Input._eventFunctions.mousemove, false);
            document.detachEvent("wheel", Amble.Input._eventFunctions.wheel, false);
            document.detachEvent("contextmenu", Amble.Input._eventFunctions.contextmenu, false);

        }
    }

    /* Data */
    Amble.Data = {};

    Amble.Data.Loader = function(){
        this.queue = [];
        this.types = [];
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.audioCache = [];
    };

    Amble.Data.Loader.prototype = {
        /* Supported types: image, json */

        load: function(type, path){
            this.queue.push(path);
            this.types.push(type);
        },

        isDone: function(){
            return (this.queue.length == this.successCount + this.errorCount);
        },

        getAsset: function(path){
            var a =  this.cache.find(c => c.path == path);
            if(a) return a.data;
            else return undefined;
        },

        loadAll: function(callback){

            if(this.queue.length == 0){
                callback();
            }

            for(var i = 0; i < this.queue.length; i++){
                var that = this;
                switch(this.types[i]){

                    /* loading audio */
                    case 'audio':
                        var audioPath = this.queue[i];
                        var audio = new Audio();
                        audio.src = audioPath;
                        audio.preload = 'auto'

                        audio.addEventListener('canplaythrough', function(e){
                            that.successCount++;
                            if(that.isDone()) {

                                callback();
                            }
                        }, false);

                        audio.addEventListener('error', function(e){
                            that.errorCount++;
                            if(that.isDone()) {
                                console.log('audio load error')
                                callback();
                            }
                        }, false);

                        this.audioCache.push({
                            data: audio,
                            type: 'audio',
                            path: audioPath
                        });

                    break;

                    /* loading image */
                    case 'image':
                        var imgPath = this.queue[i];
                        var img = new Image();

                        img.addEventListener('load', function(){
                            that.successCount++;
                            if(that.isDone()) callback();
                        }, false);

                        img.addEventListener('error', function(){
                            that.errorCount++;
                            if(that.isDone()) callback();
                        }, false);

                        img.src = imgPath;

                        this.cache.push({
                            data: img,
                            type: 'image',
                            path: imgPath
                        });

                    break;

                    /* loading json file */
                    case 'json':

                        var jsonPath = this.queue[i];
                        var xobj = new XMLHttpRequest();

                        xobj.overrideMimeType("application/json");
                        xobj.open('GET', jsonPath, true);

                        xobj.addEventListener("load", function(e){
                            var path = e.srcElement.responseURL.toString();
                            var href = window.location.href.toString();

                            var path = path.split(href).pop();
                            that.cache.push({
                                data: e.srcElement.responseText,
                                type: 'json',
                                path: path
                            });

                            that.successCount++;
                            if(that.isDone()) callback();
                        }, false);

                        xobj.addEventListener("error", function(e){
                            var path = e.srcElement.responseURL.toString();
                            var href = window.location.href.toString();

                            var path = path.split(href).pop();

                            that.cache.push({
                                data: e.srcElement.responseText,
                                type: 'json',
                                path: path
                            });

                            that.errorCount++;
                            if(that.isDone()) callback();
                        }, false);
                        xobj.send(null);

                    break;
                }
            }
        },
    }

    return Amble;

}());
