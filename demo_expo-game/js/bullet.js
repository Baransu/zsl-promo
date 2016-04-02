'use strict'
class Bullet {
  constructor(id, x, y, dirX, dirY, speed, rotation) {
      this.id = id;
    	// console.log(this.id);
      this.speed = speed;
      this.x = x;
      this.y = y;
      this.dirY = dirY;
      this.dirX = dirX;

  		var texture = PIXI.Texture.fromImage('bullet.png');
      this.sprite = new PIXI.Sprite(texture);
  		this.sprite.zIndex = 10;

  		this.sprite.anchor.x = 0.5;
  		this.sprite.anchor.y = 0.5;
      // console.log(rotation)
      this.sprite.rotation = rotation + Math.PI;
      container.addChild(this.sprite);
  }

  remove() {
    container.removeChild(this.sprite);
  }

  update(deltaTime) {

    this.x += this.speed * deltaTime * this.dirX;
    this.y += this.speed * deltaTime * this.dirY;

    this.sprite.position.x = this.x - camera.view.x;
    this.sprite.position.y = this.y - camera.view.y;
  }
}
