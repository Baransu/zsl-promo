var ParticleSystem = {};

ParticleSystem = function(args) {

	this.particlesPerSecond = args['particlesPerSecond'] || 10;
    this.variation = args['variation'] || 0;
	this.particleLife = args['particleLife'] || 1;
	this.angle = args['angle'] || 1;
	this.speed = args['speed'] || 1;
    this.toEmit = args['toEmit'] || 10;
    this.life = args['life'] || 1;

    this.lifeTimeVariation = this.variation;

    this.particle = null;

    this.angleVariation = this.variation;

	this.speedVariation = this.variation;

	this.gravity = 9.81;

	this.particles = [];

    this.scene = Amble.app.scene;
}

ParticleSystem.prototype = {

    awake: function(self) {

    },

    start: function(self) { },

    update: function(self) {
        if(this.life > 0) {

            this.life -= Amble.Time.deltaTime;

            if(this.toEmit > 0 && this.particle) {
                var newParticlesCount = this.particlesPerSecond * Amble.Time.deltaTime;
                for(var i = 0; i < newParticlesCount; i++) {

                    var particle = this.scene.instantiate(this.particle)

                    particle.transform.position.x = self.transform.position.x + Math.random() * this.variation;
                    particle.transform.position.y = self.transform.position.y// + Math.random() * 10*this.variation;

                    particle.getComponent('Particle').angle.x = this.angle.x + Math.random() * this.variation;
                    particle.getComponent('Particle').angle.y = this.angle.y + Math.random() * this.variation;
                    particle.getComponent('Particle').speed = this.speed + Math.random() * this.variation;
                    particle.getComponent('Particle').lifeTime = this.lifeTime + Math.random() * this.variation;;


                    particle.getComponent('Particle').system = this;

                    this.toEmit--;
                    this.particles.push(particle);
                }
            }

        } else if(this.life <= 0 && this.particles.length == 0) {
            this.life = 0;
            this.scene.remove(self);
        }

        if(!combat) {
            for(var i in this.particles) {
                this.scene.remove(this.particles[i]);
            }
            this.scene.remove(self);
        }
    },
}
