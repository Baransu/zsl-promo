var Bullet = {}

Bullet = function(args) {
    this.dir = args['dir'] || 0;
    this.speed = 750;
    this.dirMod = args['dirMod'] || 0;
    this.mod = -1;
    this.speedMod = args['speedMod'] || 1;
}

Bullet.prototype = {

    awake: function(self) {
        var rand = Math.random();
        this.mod = rand < 0.5 ? -1 : 1;
        this.speed *= this.speedMod;
    },

    start: function(self) { },

    update: function(self) {
        var v = this.mod * this.dirMod * this.speed * Amble.Time.deltaTime
        self.transform.position.y += v;
        self.transform.position.x += this.speed * this.dir * Amble.Time.deltaTime;

        if(this.dir == -1 && self.transform.position.x < Amble.app.mainCamera.camera.position.x - Amble.app.width/2) {
            Amble.app.scene.remove(self);
        } else if(this.dir == 1 && self.transform.position.x > Amble.app.mainCamera.camera.position.x + Amble.app.width/2) {
            Amble.app.scene.remove(self);
        }
    }
}
