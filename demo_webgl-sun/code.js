var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000000);

var renderer = new THREE.WebGLRenderer({alpha: true});

renderer.setClearColor(0x000000);

renderer.setSize(window.innerWidth, window.innerHeight);

var geometry, material;

var curPlanetInterval = 0;

//geometry = new THREE.BoxGeometry(2500, 2500, 2500);
geometry = new THREE.SphereGeometry(50000, 32, 48)
//material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('materials/skybox/0101.png'), fog: false });
material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('materials/thefinalfrontier.png'), fog: false });
var skybox = new THREE.Mesh(geometry, material);
scene.add(skybox);

//geometry = new THREE.SphereGeometry(1.09, 32, 48);
//material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('materials/sun.jpg'), fog: false });
//var sun = new THREE.Mesh(geometry, material);
//scene.add(sun);

var planetInterval = setInterval(function () {
    centercam(curPlanetInterval);
    if (curPlanetInterval >= 8)
        curPlanetInterval = 0;
    else
        curPlanetInterval++;
}, 60000)

var light = new THREE.PointLight( 0xffeeee, 1, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var au = 234.54791;
var year = 365.24;
var units = {
	au: 234.54791,
	earthR: 1,
	day: 12,
	year: function() { return this.day * 365.25 },
};

var universe = {
    
	planets: [	{name: 'Słońce', radius: 10.9, semimajoraxis: 0, inclination: 0, ascnode: 0, orbitperiod: 1, rotationperiod: 25.05, material: 'materials/sun.jpg', orbitcolor: 0x858585, sun: true},
				{name: 'Merkury', radius: 0.382, semimajoraxis: 0.387, inclination: 6.34, ascnode: 48.331, orbitperiod: -0.24, rotationperiod: 58.646, material: 'materials/mercury.jpg', orbitcolor: 0x858585},
                {name: 'Wenus', radius: 0.949, semimajoraxis: 0.723, inclination: 2.19, ascnode: 76.678, orbitperiod: -0.615, rotationperiod: -243.018, material: 'materials/venus.jpg', orbitcolor: 0xe1b97b},
                {name: 'Ziemia', radius: 1.00, semimajoraxis: 1.000, inclination: 1.57, ascnode: -11.260, orbitperiod: -0.01, rotationperiod: 1, material: 'materials/earth.jpg', orbitcolor: 0x5d6f6e},
				{name: 'Mars',  radius: 0.532, semimajoraxis: 1.523, inclination: 1.67, ascnode: 49.562, orbitperiod: -1.88, rotationperiod: 1.025, material: 'materials/mars.jpg', orbitcolor: 0x894c11},
                {name: 'Jowisz', radius: 11.209, semimajoraxis: 5.204, inclination: 0.32, ascnode: 100.492, orbitperiod: -11.861, rotationperiod: 0.413, material: 'materials/jupiter.jpg', orbitcolor: 0xe1b29a},
                {name: 'Saturn', radius: 9.44, semimajoraxis: 9.582, inclination: 0.93, ascnode: 113.642, orbitperiod: -29.457, rotationperiod: 0.44, material: 'materials/saturn.jpg', orbitcolor: 0xe6d0ad},
                {name: 'Uran', radius: 4.007, semimajoraxis: 19.189, inclination: 1.02, ascnode: 73.999, orbitperiod: -84.016, rotationperiod: 0.718, material: 'materials/uranus.jpg', orbitcolor: 0x69c4ee},
                {name: 'Neptun', radius: 3.883, semimajoraxis: 30.070, inclination: 0.72, ascnode: 131.782, orbitperiod: -164, rotationperiod: 0.671, material: 'materials/neptune.jpg', orbitcolor: 0x5f84e4},
			],
    
    /*
    planets: [  { name: 'Słońce', radius: 10.9, semimajoraxis: 0, inclination: 0, ascnode: 0, orbitperiod: 1, rotationperiod: 25.05, material: 'materials/sun.jpg', orbitcolor: 0x858585, sun: true },
				{ name: 'Merkury', radius: 0.382, semimajoraxis: 0.387, inclination: 6.34, ascnode: 48.331, orbitperiod: -0.24, rotationperiod: 58.646, material: 'materials/mercury.jpg', orbitcolor: 0x858585 },
                { name: 'Wenus', radius: 0.949, semimajoraxis: 0.723, inclination: 2.19, ascnode: 76.678, orbitperiod: -0.615, rotationperiod: -243.018, material: 'materials/venus.jpg', orbitcolor: 0xe1b97b },
                { name: 'Ziemia', radius: 1.00, semimajoraxis: 1.000, inclination: 1.57, ascnode: -11.260, orbitperiod: -1, rotationperiod: 1, material: 'materials/earth.jpg', orbitcolor: 0x5d6f6e },
				{ name: 'Mars', radius: 0.532, semimajoraxis: 1.523, inclination: 1.67, ascnode: 49.562, orbitperiod: -1.88, rotationperiod: 1.025, material: 'materials/mars.jpg', orbitcolor: 0x894c11 },
                { name: 'Jowisz', radius: 11.209, semimajoraxis: 5.204, inclination: 0.32, ascnode: 100.492, orbitperiod: -11.861, rotationperiod: 0.413, material: 'materials/jupiter.jpg', orbitcolor: 0xe1b29a },
                { name: 'Saturn', radius: 9.44, semimajoraxis: 9.582, inclination: 0.93, ascnode: 113.642, orbitperiod: -29.457, rotationperiod: 0.44, material: 'materials/saturn.jpg', orbitcolor: 0xe6d0ad },
                { name: 'Uran', radius: 4.007, semimajoraxis: 19.189, inclination: 1.02, ascnode: 73.999, orbitperiod: -84.016, rotationperiod: 0.718, material: 'materials/uranus.jpg', orbitcolor: 0x69c4ee },
                { name: 'Neptun', radius: 3.883, semimajoraxis: 30.070, inclination: 0.72, ascnode: 131.782, orbitperiod: -164, rotationperiod: 0.671, material: 'materials/neptune.jpg', orbitcolor: 0x5f84e4 },
    ],
    */
	meshes: [],
	barycenters: [],
    orbits: [],
	clock: new THREE.Clock(true),
	initialize: function() {
		var selector = '';
		for(var i = 0; i < this.planets.length; i++) {
			if(this.planets[i].sun) {
				this.meshes[i] = new THREE.Mesh(new THREE.SphereGeometry(this.planets[i].radius * units.earthR, 64, 64), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture(this.planets[i].material), fog: false }));
			} else {
				this.meshes[i] = new THREE.Mesh(new THREE.SphereGeometry(this.planets[i].radius * units.earthR, 64, 64), new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture(this.planets[i].material), fog: false }));
			}
			selector += '<span onclick="centercam(' + i + ')" >' + this.planets[i].name + '</span><br />';
			this.planets[i].order = i;
			this.barycenters[i] = {object: new THREE.Object3D(), orbitspeed: 2 * Math.PI / this.planets[i].orbitperiod / units.year() / 60, rotatespeed: 2 * Math.PI / this.planets[i].rotationperiod / units.day / 60};
			this.barycenters[i].object.position.set(0, 0, 0);
            this.barycenters[i].object.add(this.meshes[i]);
            this.meshes[i].position.x = this.planets[i].semimajoraxis * units.au;
            scene.add(this.barycenters[i].object);
            //this.orbits[i] = new THREE.Mesh(new THREE.TorusGeometry( this.planets[i].semimajoraxis, 0.5, 3, 180 ), new THREE.MeshBasicMaterial());
            
            var geometrySpline = new THREE.Geometry();

			for (var j = 0; j <= 360; j ++ ) {

                var vertex = new THREE.Vector3();
                var segment = 0 + j / 360 * Math.PI * 2;

                vertex.x = 0.5 * Math.cos( segment );
                vertex.y = 0.5 * Math.sin( segment );

                geometrySpline.vertices.push( vertex );

            }
            
            this.orbits[i] = new THREE.Line( geometrySpline, new THREE.LineBasicMaterial( { color: this.planets[i].orbitcolor, linewidth: 20 } ));
            this.orbits[i].rotation.x = Math.PI / 2;
            this.orbits[i].scale.multiplyScalar(this.planets[i].semimajoraxis * 2 * units.au);
            this.barycenters[i].object.add(this.orbits[i]);
            this.barycenters[i].object.rotation.y = this.planets[i].ascnode * Math.PI / 180;  
            this.barycenters[i].object.rotation.x = this.planets[i].inclination * Math.PI / 180;  
        }
        document.getElementById('selector').innerHTML = selector;
    },
	reinitialize: function() {
		for(var i = 0; i < this.planets.length; i++) {
			this.barycenters[i].orbitspeed = 2 * Math.PI / this.planets[i].orbitperiod / units.year() / 60;
			this.barycenters[i].rotatespeed = 2 * Math.PI / this.planets[i].rotationperiod / units.day / 60;
			this.meshes[i].position.x = this.planets[i].semimajoraxis * units.au;
		}
	},
	update: function() {
		for(var i = 0; i < this.barycenters.length; i++) {
			this.barycenters[i].object.rotation.y -= this.barycenters[i].orbitspeed;
//            this.orbits[i].rotation.z -= this.barycenters[i].orbitspeed;
//            this.meshes[i].rotateOnAxis(new THREE.Vector3(Math.cos(this.planets[i].axialtilt / 2 * Math.PI), Math.sin(this.planets[i].axialtilt / 2 * Math.PI), 0), this.barycenters[i].rotatespeed);
            this.meshes[i].rotation.y += this.barycenters[i].rotatespeed;
		}
		document.getElementById('dayspassed').innerHTML = (this.clock.getElapsedTime() / units.day).toFixed(1);
	}	
};

var centercamplanet = 0;

function centercam(id) {
	//universe.meshes[centercamplanet].remove(ppp);
	//universe.meshes[id].add(ppp);
	if(camera.position.distanceTo(new THREE.Vector3(0,0,0)) < universe.planets[id].radius * units.earthR) {
	   camera.position.setZ(universe.planets[id].radius * units.earthR * 5);
	}
	centercamplanet = id;
}

var input = {
    update: function() {
        if(Key.isDown(Key.Q)) camera.translateZ(-0.01 * camera.position.distanceTo(new THREE.Vector3(0,0,0)));
        if(Key.isDown(Key.E)) camera.translateZ(0.01 * camera.position.distanceTo(new THREE.Vector3(0,0,0)));
        if(Key.isDown(Key.A)) camera.translateX(-0.01 * camera.position.distanceTo(new THREE.Vector3(0,0,0)));
        if(Key.isDown(Key.D)) camera.translateX(0.01 * camera.position.distanceTo(new THREE.Vector3(0,0,0)));
        if(Key.isDown(Key.S)) camera.translateY(-0.01 * camera.position.distanceTo(new THREE.Vector3(0,0,0)));
        if(Key.isDown(Key.W)) camera.translateY(0.01 * camera.position.distanceTo(new THREE.Vector3(0,0,0)));
    }
};

var smallplanets = false;

Key.onKeydown = function (event) {
        this._pressed[event.keyCode] = true;
		if(event.keyCode == this.O) {
			for(var i = 0; i < universe.orbits.length; i++) {
				universe.orbits[i].visible = !universe.orbits[i].visible;
			}	
		}
		if(event.keyCode == this.P) {
			if(smallplanets) {
				universe.meshes[0].scale.set(1, 1, 1);
				for(var i = 1; i < universe.meshes.length; i++) {
					universe.meshes[i].scale.set(1, 1, 1);
				}
				ppp.scale.set(1, 1, 1);
				smallplanets = false;
			} else {
				universe.meshes[0].scale.set(0.1, 0.1, 0.1);
				for(var i = 1; i < universe.meshes.length; i++) {
					universe.meshes[i].scale.set(0.01, 0.01, 0.01);
				}
				//ppp.scale.set(100, 100, 100);
				if(centercamplanet == 0) {
					//ppp.scale.set(10, 10, 10);
				}
				smallplanets = true;
			}
		}
    },

universe.initialize();

document.getElementById('displayDiv').appendChild(renderer.domElement);

camera.position.x = -20;
camera.position.y = 5;
camera.position.z = 20;

var lookeyluke = 1;

//universe.meshes[6].add(camera);
var ppp = new THREE.Object3D();
//universe.meshes[centercamplanet].add(ppp);
scene.add(ppp);
ppp.add(camera);

function animateScene() {
    input.update();
    universe.update();
    ppp.position.setFromMatrixPosition(universe.meshes[centercamplanet].matrixWorld);
//	ppp.rotateOnAxis(new THREE.Vector3(Math.cos(universe.planets[centercamplanet].axialtilt / 2 * Math.PI), Math.sin(universe.planets[centercamplanet].axialtilt / 2 * Math.PI), 0), -universe.barycenters[centercamplanet].rotatespeed);
//	ppp.rotation.y += universe.barycenters[centercamplanet].orbitspeed - universe.barycenters[centercamplanet].rotatespeed;
//	ppp.rotation.y += - universe.barycenters[centercamplanet].rotatespeed;
    skybox.position.copy(camera.localToWorld(new THREE.Vector3(0, 0, 0)));
    //sun.rotation.y += 0.01;
    //universe.barycenters[lookeyluke].object.updateMatrixWorld();
    //camera.lookAt(new THREE.Vector3().setFromMatrixPosition(universe.meshes[lookeyluke].matrixWorld));
    //camera.updateProjectionMatrix();
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    requestAnimationFrame(animateScene);
    renderer.render(scene, camera);


}

animateScene();
