var Enemy = {}

Enemy = function(args) {
    this.direction = 0;
    this.speed = 400;
    this.doOnce = true;

    this.doOnce1 = true;
}

Enemy.prototype = {

    awake: function(self) {
        this.player = Amble.app.scene.getActorByName('player');
        var dirToPlayer = self.transform.position.x - this.player.transform.position.x;
        if(dirToPlayer > 0) {
            this.direction = 1;
            // self.transform.scale.x *= -1;
        } else {
            this.direction = -1;
            self.transform.scale.x *= -1;
        }
    },

    start: function(self) { },

    update: function(self) {

        if(self.transform.position.x > Amble.app.mainCamera.camera.position.x) {
            this.direction = -1;
        } else {
            this.direction = 1;
        }

        if(!combat) {

            self.transform.position.x += this.direction * this.speed * Amble.Time.deltaTime;
            var distance = Math.abs(self.transform.position.x - this.player.transform.position.x);
            if(distance < 100) {
                enemiesInCombat = _enemiesInCombat;
                // combat = true;
                this.player.getComponent('Player').stopForce = 0;
                if(this.doOnce) {
                    fadeTimer = fadeTime;
                    this.speed = 0;
                    this.doOnce = false;
                }
                // Amble.app.scene.remove(self);
            }
        }
    }
}
