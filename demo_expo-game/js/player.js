'use strict'
class Player {
	constructor(id, name, x, y, width, height, tex, isPlayable, life) {
		this.width = width;
		this.height = height;
		this.id = id;
		this.name = name;
		this.isPlayable = isPlayable || false;

		this.shotTimer = 0;
		this.shotCooldown = 0.1;

		this.baseLife = life;
		this.life = life;

		this.position = {
			x: x,
			y: y
		};

		this.rotation = 0;

		this.speed = 350;

		this.text = new PIXI.Text(this.name, {font : '20px Arial', fill : 0xffffff, stroke: 'black', strokeThickness: 1, align : 'center'});
		this.lifeText = new PIXI.Text(this.life + '/' + this.baseLife , {font : '20px Arial', fill : 0xffffff, stroke: 'black', strokeThickness: 1, align : 'center'});

		var texture = PIXI.Texture.fromImage(tex);

		this.sprite = new PIXI.Sprite(texture);
		this.sprite.zIndex = 9999;
		this.lifeText.zIndex = 10000;
		this.text.zIndex = 10000;

		this.sprite.anchor.x = 0.5;
		this.sprite.anchor.y = 0.5;

		this.text.anchor.x = 0.5;
		this.text.anchor.y = 0.5;

		this.lifeText.anchor.x = 0.5;
		this.lifeText.anchor.y = 0.5;

		container.addChild(this.sprite);
		container.addChild(this.text);
		container.addChild(this.lifeText);
		container.children.sort(depthCompare);
	}

	setLife(life) {
		this.life = life;
		this.lifeText.setText(this.life + "/" + this.baseLife);
	}

	remove() {
		container.removeChild(this.sprite);
		container.removeChild(this.text);
		container.removeChild(this.lifeText);
	}

	setRotationSync(rotation) {

		this.rotation = rotation;
		this.sprite.rotation = rotation;

		socket.emit('update-player-rotation', {
			id: id,
			rotation: this.rotation
		});
	}

	setRotation(rotation) {
		this.rotation = rotation;
		this.sprite.rotation = rotation;
	}

	update(deltaTime) {
		if(this.isPlayable) {
			var posX = this.position.x;
			var posY = this.position.y;

			if(keyPressed[65]) {
				this.position.x -= this.speed * deltaTime;
			}

			if(keyPressed[68]) {
				this.position.x += this.speed * deltaTime;
			}

			if(keyPressed[87]) {
				this.position.y -= this.speed * deltaTime;
			}

			if(keyPressed[83]) {
				this.position.y += this.speed * deltaTime;
			}

			if(camera.position.x != this.position.x || camera.position.y != this.position.y) {

				//collision check
				for(var i = 0; i < scene.length; i++) {
					var tile = scene[i];

					if(tile.solid && this.position.x > tile.position.x - tile.size/2 && this.position.x < tile.position.x + tile.size/2 &&
						this.position.y > tile.position.y - tile.size/2 && this.position.y < tile.position.y + tile.size/2
					) {
							if(this.position.x > tile.position.x - tile.size/2 && this.position.x < tile.position.x + tile.size/2) {
								this.position.y = posY;
							}

							if(this.position.y > tile.position.y - tile.size/2 && this.position.y < tile.position.y + tile.size/2) {
								this.position.x = posX;
							}

						break;
					}
				}

				socket.emit('update-player-position', {
					id: id,
					x: this.position.x,
					y: this.position.y
				});
			}

			camera.position.x = this.position.x;
			camera.position.y = this.position.y;

			if(mouseKeyPressed[1] && this.shotTimer <= 0) {

				var dirX = mouseX - WIDTH/2;
				var dirY = mouseY - HEIGHT/2;
				var angle = Math.atan2(dirY, dirX);
				if (angle < 0)	angle = angle + Math.PI*2;

				var x = this.position.x + Math.cos(angle) * 50;
				var y = this.position.y + Math.sin(angle) * 50;

				var magnitude = Math.sqrt(Math.pow(dirX, 2) + Math.pow(dirY, 2));

				dirX /= magnitude;
				dirY /= magnitude;


				socket.emit('new-bullet', {
					dirX: dirX,
					dirY: dirY,
					x: x,
					y: y,
					playerId: player.id,
					rotation: angle
				});
				this.shotTimer = this.shotCooldown;
			}

			if(this.shotTimer > 0) {
				this.shotTimer -= deltaTime;
			}
		}

		camera.update();

		this.sprite.position.x = this.position.x - camera.view.x;
		this.sprite.position.y = this.position.y - camera.view.y;

		this.text.position.x = this.position.x - camera.view.x;
		this.text.position.y = this.position.y - camera.view.y - 70;

		this.lifeText.position.x = this.position.x - camera.view.x;
		this.lifeText.position.y = this.position.y - camera.view.y - 48;

	}

}
