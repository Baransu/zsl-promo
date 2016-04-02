var CombatBoss = {}

CombatBoss = function(args) {

    this.player = null;

    this.speed = 25;

    this.distanceToPlayer = 9999;

    this.health = 1000;

    this.explosion = {
        tag: ['explosion'],
        options: {},
        transform: { name: "Amble.Transform", args: {
            position: { name: "Amble.Math.Vector2", args: {x:0 ,y: 0}},
            scale: { name: "Amble.Math.Vector2", args: {x:2 ,y:2}},
        }},
        renderer: {name: 'Amble.Graphics.AnimationRenderer', args: {
            sprite: 'data/explosion.png',
            updatesPerFrame: 2,
            frames: 8,
            layer: 3,
            loop: false
        }},
        components: []
    };

    this.gameOverDistance = 100;

    this.doOnce = true;
    this.direction = 0;

}

CombatBoss.prototype = {

    awake: function(self) {

        this.player = Amble.app.scene.getActorByName('player');

    },

    update: function(self) {

        var d = self.transform.position.x - this.player.transform.position.x
        this.distanceToPlayer = Math.sqrt(Math.pow(d,2));

        if(this.doOnce) {
            if(d > 0) {
                this.direction = -1;
                self.transform.scale.x *= 1
            } else {
                this.direction = 1;
                self.transform.scale.x *= -1
            }
            this.doOnce = false;
        }

        //die
        if(this.health < 0) {
            Amble.app.scene.remove(self);
            var playerScript = this.player.getComponent('Player');
            var index = playerScript.combatEnemies.indexOf(self);

            var explosion = Amble.app.scene.instantiate(this.explosion);
            explosion.transform.position.x = self.transform.position.x;
            explosion.transform.position.y = self.transform.position.y;
            explosion.renderer.loop = false;
            playerScript.explosions.push(explosion);

            playerScript.combatEnemies.splice(index, 1);
        }

        if(this.distanceToPlayer > this.gameOverDistance) {
            var v = this.speed * this.direction * Amble.Time.deltaTime;
            self.transform.position.x += v;
        } else {
            ///game over
        }

    }
}
