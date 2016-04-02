var Particle = {}

Particle = function(args) {

    this.system = null;

    this.angle = new Amble.Math.Vector2({x: 0, y: -1});
    this.speed = 100;
    this.lifeTime = 1;

    this.gravity = 981;
    this.vy = 0;
}

Particle.prototype = {

    awake: function(self) {

    },

    update: function(self) {

        this.vy -= this.gravity * Amble.Time.deltaTime;
        self.transform.position.x += this.speed * this.angle.x * Amble.Time.deltaTime;
        self.transform.position.y += (this.speed * this.angle.y * Amble.Time.deltaTime) - (this.vy * Amble.Time.deltaTime);

        if(this.lifeTime > 0) this.lifeTime -= Amble.Time.deltaTime;
        else if(this.lifeTime <= 0) {
            Amble.app.scene.remove(self);
            var index = this.system.particles.indexOf(self);
            this.system.particles.splice(index, 1);
        }

        if(self.transform.position.y > Amble.app.mainCamera.camera.position.x + Amble.app.height/2) {
            Amble.app.scene.remove(self);
            var index = this.system.particles.indexOf(self);
            this.system.particles.splice(index, 1);
        }
    }
}
