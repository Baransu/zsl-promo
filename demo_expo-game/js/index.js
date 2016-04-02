// import Player from './player.js';
// import Camera from './camera.js';
// import Tile from './tile.js';
// import Bullet from './bullet.js';

var playerColor;
var players = [];

// create an new instance of a pixi stage
var container = new PIXI.Container();

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
renderer.backgroundColor = 0xFFFFFF;

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var camera = new Camera();

var keyPressed = [];

var lastTime = Date.now();

var tileSize = 128;
var scene = [];
var otherPlayers = [];
var id;

var name = prompt("Podaj swoje imie") || "Name";
// console.log(name);

var tilesData = [];

var playerTexture = 'player1.png';
var bullets = [];
var socket = io();
var life = -1;

socket.emit('entering', name);

socket.on('connected', function(msg){
	playerColor = msg.color;
	// console.log(msg.texture)
	playerTexture = msg.texture;
	id = msg.id;
	players = msg.players;
	tilesData = msg.tiles;
	life = msg.life;
	init();
});

socket.on('update-position', function(msg) {
	var player = otherPlayers.find(p => p.id === msg.id);
	if(player) {
		player.position.x = msg.x;
		player.position.y = msg.y;
	}
});

socket.on('update-rotation', function(msg) {
	var pp = otherPlayers.find(p => p.id === msg.id);
	if(pp) {
		pp.setRotation(msg.rotation);
	}
});

socket.on('player-disconnected', function(msg) {
	// console.log('player disconnected', msg);
	var player = otherPlayers.find(p => p.id === msg);
	if(player) {
		player.remove();
		var index = otherPlayers.indexOf(player);
		otherPlayers.splice(index, 1);
	}
});

socket.on('hit', function(msg) {
	if(player && player.id == msg.id) {
		player.setLife(msg.life)
	} else {
		for(var i = 0; i < otherPlayers.length; i++) {
			if(msg.id == otherPlayers[i].id) {
				otherPlayers[i].setLife(msg.life);
			}
		}
	}
});

socket.on('death', function(msg) {
	// delete player
	if(player && player.id == msg.id) {
		player.remove();
		alert('Umarłeś!!!');
		location.reload();
	} else {
		for(var i = 0; i < otherPlayers.length; i++) {
			if(msg.id == otherPlayers[i].id) {
				otherPlayers[i].remove();
			}
		}
	}
});

socket.on('player-connected', function(msg) {
	otherPlayers.push(new Player(msg.id, msg.name, msg.x, msg.y, 64, 64, msg.texture, false, msg.life));
});

var bulletsDeleted = 0;
var bulletsDeleted2 = 0;
var bulletsCreated = 0;
socket.on('create-bullet', function(msg) {
	bullets.push(new Bullet(msg.id, msg.x, msg.y, msg.dirX, msg.dirY, msg.speed, msg.rotation));
	bulletsCreated++;
	console.log('created', bulletsCreated);
	container.children.sort(depthCompare);
});

var bulletsToDel = [];
socket.on('delete-bullets', function(msg) {
	var array = [];
	for(var i = 0; i < msg.length; i++) {
		bulletsDeleted2++;
		array.push(msg[i]);
	}
	bulletsToDel.push(array);
	console.log('predeleted', bulletsDeleted2);
});

var player;

function init() {

	for(var i = 0; i < tilesData.length; i++) {
		scene.push(new Tile(tilesData[i].x, tilesData[i].y, tileSize, tilesData[i].tex, false));
	}


	for(var i = 0; i < players.length; i++) {
		otherPlayers.push(new Player(players[i].id, players[i].name, players[i].x, players[i].y, 64, 64, players[i].texture, false, players[i].life));
	}

	player = new Player(id, name, 0, 0, 64, 64, playerTexture, true, life);

	container.children.sort(depthCompare);
	requestAnimationFrame( gameLoop );
}

function gameLoop() {

	var now = Date.now();

	var deltaTime = (now - lastTime) / 1000;

	// console.log(bulletsToDel)
	if(bulletsToDel.length > 0) {
		for(var i = 0; i < bullets.length; i++) {
			bullets[i].remove();
		}
		bullets = [];
		for(var i = 0; i < bulletsToDel[0].length; i++) {
			bullets.push(new Bullet(bulletsToDel[0][i].id, bulletsToDel[0][i].x, bulletsToDel[0][i].y, bulletsToDel[0][i].dirX, bulletsToDel[0][i].dirY, bulletsToDel[0][i].speed, bulletsToDel[0][i].rotation));
		}
		container.children.sort(depthCompare);
		bulletsToDel.shift();
	}

	player.update(deltaTime);
	for(var i = 0; i < scene.length; i++) {
		if(typeof scene[i].update == 'function') {
			scene[i].update(deltaTime);
		}
	}

	for(var i = 0; i < otherPlayers.length; i++) {
		if(typeof otherPlayers[i].update == 'function') {
			otherPlayers[i].update(deltaTime);
		}
	}

	for(var i = 0; i < bullets.length; i++) {
		if(typeof bullets[i].update == 'function') {
			bullets[i].update(deltaTime);
		}
	}

	lastTime = now;

	renderer.render(container);
	requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", function(e){
	keyPressed[e.which] = true;
}, false);

document.addEventListener("keyup", function(e){
	keyPressed[e.which] = false;
}, false);

var mouseX = 0;
var mouseY = 0;

document.addEventListener("mousemove", function(e){
	if(player) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		var angle = Math.atan2(e.clientY - HEIGHT/2, e.clientX - WIDTH/2);
		if (angle < 0)	angle = angle + Math.PI*2;
		player.setRotationSync(angle);
	}
}, false);
var mouseKeyPressed = [];
document.addEventListener('mousedown', function(e) {
	mouseKeyPressed[e.which] = true;
});

document.addEventListener('mouseup', function(e) {
	mouseKeyPressed[e.which] = false;
});

function depthCompare(a, b) {
	if (a.zIndex < b.zIndex)  return -1;
	if (a.zIndex > b.zIndex)  return 1;
	return 0;
}
