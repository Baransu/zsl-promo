var Boss = {}

Boss = function(args) {
    this.doOnce = true;
    this.doOnce1 = true;

}

Boss.prototype = {
    awake: function(self) {
        this.player = Amble.app.scene.getActorByName('player');

    },

    start: function(self) { },

    update: function(self) {

        // if(this.doOnce1) {
        //     var d = self.transform.position.x - this.player.transform.position.x
        //     if(d > 0) {
        //         // this.direction = -1;
        //         self.transform.scale.x *= 1
        //     } else {
        //         self.transform.scale.x *= -1
        //         // this.direction = 1;
        //     }
        //     this.doOnce1 = false;
        // }


        var distance = Math.abs(self.transform.position.x - this.player.transform.position.x);
        if(distance < 200) {
            if(this.doOnce) {
                bossCombat = true;
                enemiesInCombat = 50; //125
                fadeTimer = fadeTime;
                this.player.getComponent("Player").speed = 0;
                this.doOnce = false;
            }
        }
    }
}
