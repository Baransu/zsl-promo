'use strict'
class Tile {
	constructor(x, y, size, tex, solid) {

		this.position = {
			x: x,
			y: y
		};

		this.size = size;
		var texture = PIXI.Texture.fromImage(tex);
		this.tile = new PIXI.Sprite(texture);

		this.solid = solid || false;

		this.tile.anchor.x = 0.5;
		this.tile.anchor.y = 0.5;

		this.tile.position.x = this.position.x - camera.view.x;
		this.tile.position.y = this.position.y - camera.view.y;
		this.tile.zIndex = 0;

		container.addChild(this.tile);
	}

	update(deltaTime) {
		this.tile.position.x = this.position.x - camera.view.x;
		this.tile.position.y = this.position.y - camera.view.y;
	}

}
