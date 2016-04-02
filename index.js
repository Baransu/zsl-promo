var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var process = require('process');

const PORT = 3000;

var playerColors = [
  0x8e24aa,
  0x5e35b1,
  0x3949ab,
  0x1e88e5,
  0x039be5,
  0x00acc1,
  0x00897b,
  0x43a047,
  0x7cb342,
  0xc0ca33,
  0xfbc02d,
  0xff6f00,
  0xe53935,
  0xe91e63
];

var mapSize = 10;
var tilesImages = [
  'bg1.png',
  'bg2.png',
  'bg3.png',
  'bg4.png'
];

var playerImages = [
  'player1.png',
  'player2.png'
];

var bulletSpeed = 2000;

var tiles = [];

for(var y = -mapSize/2; y < mapSize/2; y++) {
  for(var x = -mapSize/2; x < mapSize/2; x++) {
    tiles.push({
      tex: tilesImages[Math.floor(Math.random() * tilesImages.length)],
      x: x * 128,
      y: y * 128
    });
  }
}

var players = [];
var bullets = [];
var bulletsToAdd = [];

var bulletDmg = 15;

app.use(express.static(path.join(__dirname, '')));

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});

var bulletsCreated = 0;
var bulletsDeleted = 0;

var clients = [];

io.on('connection', function(socket){

  console.log('a user connected');

  socket.on('disconnect', function() {
    console.log('user disconnected');
    socket.broadcast.emit('player-disconnected', socket.userID);
    var player = players.find(p => p.id === socket.userID);
    if(player) {
      var index = players.indexOf(player);
      players.splice(index, 1);
    }
  });

  socket.on('update-player-position', function(msg){
    var id = msg.id;
    var player = players.find(p => p.id === id);
    if(player) {
      player.x = msg.x;
      player.y = msg.y;

      socket.broadcast.emit('update-position', player);
    }

  });

  socket.on('update-player-rotation', function(msg){
    var id = msg.id;
    var player = players.find(p => p.id === id);
    if(player) {
      player.rotation = msg.rotation;
      socket.broadcast.emit('update-rotation', player);
    }

  });

  socket.on('new-bullet', function(msg) {

    var bullet = {
      x: msg.x,
      y: msg.y,
      dirX: msg.dirX,
      dirY: msg.dirY,
      speed: bulletSpeed,
      id: uuid.v1(),
      playerId: msg.playerId,
      dmg: bulletDmg,
      rotation: msg.rotation
    };
    // console.log(bullet.rotation)

    bullets.push(bullet);
    io.sockets.emit('create-bullet', bullet);
    bulletsCreated++;
    // console.log('created', bulletsCreated);
  });

  socket.on('entering', function(msg) {

    var player = {
      name: msg,
      id: uuid.v1(),
      texture: playerImages[Math.floor(Math.random() * playerImages.length)],
      color: playerColors[Math.floor(Math.random() * playerColors.length)],
      x: 0,
      y: 0,
      life: 1000,
    };

    // console.log(player.texture);

    socket.userID = player.id;

    socket.emit('connected', {
      players: players,
      tiles: tiles,
      texture: player.texture,
      color: player.color,
      id: player.id,
      life: player.life
    });

    socket.broadcast.emit('player-connected', player);

    clients[socket.id] = socket;
    player.socket = socket.id;
    players.push(player);
  });
});

var lastTime = Date.now();

var interval = setInterval(gameLoop, 1000/60);
function gameLoop() {

  var now = Date.now();
  var deltaTime = (now - lastTime) / 1000;

  update(deltaTime);

  lastTime = now;
}

function update(deltaTime) {
  //bullets update

  var bulletsToDel = [];
  for(var i = 0; i < bullets.length; i++) {
    if(bullets[i].x < -mapSize/2 * 128 || bullets[i].x > mapSize/2 * 128 ||
      bullets[i].y < -mapSize/2 * 128 || bullets[i].y > mapSize/2 * 128
    ) {
      bulletsToDel.push(bullets[i]);
    } else {
      bullets[i].x += deltaTime * bulletSpeed * bullets[i].dirX;
      bullets[i].y += deltaTime * bulletSpeed * bullets[i].dirY;
    }

    // player col
    for(var j = 0; j < players.length; j++) {
      var distance = Math.pow(players[j].y - bullets[i].y, 2) + Math.pow(players[j].x - bullets[i].x, 2);

      if(distance < Math.pow(32, 2) && players[j].id != bullets[i].playerId) {
        // life sub
        players[j].life -= bullets[i].dmg;

        //socket send to player
        // clients[players[j].socket].emit('hit', players[j]);
        io.sockets.emit('hit', players[j]);
        //player life check
        if(players[j].life <= 0) {
          //send life info
          io.sockets.emit('death', players[j]);
          players.splice(j, 1);
        }


        //bullet delete
        bulletsToDel.push(bullets[i]);
      }
    }

  }

  if(bulletsToDel.length > 0) {
    for(var i = 0; i < bulletsToDel.length; i++) {
      var index = bullets.find(b => b.id == bulletsToDel[i].id);
      bulletsDeleted++;
      bullets.splice(index, 1);
    }
    io.sockets.emit('delete-bullets', bullets);
  }

}
