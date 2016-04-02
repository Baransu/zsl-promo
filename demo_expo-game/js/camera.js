'use strict'
class Camera {
	constructor() {
		this.view = {
			x: 0,
			y: 0
		};
		this.position = {
			x: 0,
			y: 0
		};
	}

	update() {
		this.view.x = this.position.x - WIDTH/2;
		this.view.y = this.position.y - HEIGHT/2;
	}

}
