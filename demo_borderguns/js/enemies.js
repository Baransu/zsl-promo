/* global Animation */
/* global astar */

function Enemy(type, x, y, radius, waypoints, hp)
{
	this.enemyType = type;

	this.radius = radius;
	this.speed = 6;
	this.collider = new SAT.Circle(new SAT.Vector(x,y), radius);
	this.isHeavy = false;
	this.angle = 0;
	this.waypoints = waypoints || null;
	this.deltaV = new SAT.Vector();
	this.curWay = 0;
	this.curPath = 0;
	this.forward = new SAT.Vector();
	this.radarLength = CANVASW/2;
	this.toPlayerRadar;
	this.toPlayerCollision = true;
	this.playerIsInRange = true;

	this.useWaypoints = false;

	this.waypointsToNode = null;
	this.toNodes = new SAT.Vector();
	this.path = null;

	this.lastPlayerPos = new SAT.Vector();
	this.lastPlayerPos = player.toNode();

	this.curWaypointToNode = new SAT.Vector();

	this.lastDeltaV = new SAT.Vector();

	this.attackTimer = 0;
	this.attackCooldown = 1;

	this.die = false;

	this.maxHealth = hp;
	this.health = hp;

	this.healthPercentage = 1;

	this.bulletsTimer = 0;
	this.bulletCooldown = 0.1;

	this.bulletsSpeed = 1000;

	this.canShoot = false;

	this.id = 0;

	this.hit = false;
	this.hitTimer = 0;
	this.hitTime = 0.1;
	
	this.lastPath = 0;
	this.calcPath = true;	
}

Enemy.prototype.update = function(deltaTime, id)
{
	this.id = id;
	
	if(this.waypoints != null && this.useWaypoints)
	{

		var toNext = Math.sqrt(Math.pow((this.waypoints[this.curWay].x - this.collider.pos.x), 2) + Math.pow((this.waypoints[this.curWay].y - this.collider.pos.y), 2));	
		
		if(toNext <= toPointOffset)
		{
			if((this.curWay + 1) != this.waypoints.length)
				this.curWay++;
			else
				this.curWay = 0;
		}

		var deltaX = this.waypoints[this.curWay].x - this.collider.pos.x;
		var deltaY = this.waypoints[this.curWay].y - this.collider.pos.y;

		this.deltaV = new SAT.Vector(deltaX, deltaY).normalize();
	}

	//make angle
	this.angle = makeAngle(this.collider.pos.x, this.forward.x, this.collider.pos.y, this.forward.y);

	var toPlayerAngle = makeAngle(this.collider.pos.x, player.collider.pos.x, this.collider.pos.y, player.collider.pos.y);
	this.forward.x = this.collider.pos.x + Math.cos(toPlayerAngle) * (this.radius + 10);
	this.forward.y = this.collider.pos.y + Math.sin(toPlayerAngle) * (this.radius + 10);

	if(player.playerAlive)
	{
		//look for player
		var toPlayerX = player.collider.pos.x - this.collider.pos.x;
		var toPlayerY = -(player.collider.pos.y - this.collider.pos.y);
		var toPlayer = Math.sqrt(Math.pow(toPlayerX,2) + Math.pow(toPlayerY,2));

		if(toPlayer <= this.radarLength)
		{
			var toPointX = this.forward.x - this.collider.pos.x;
			var toPointY = -(this.forward.y - this.collider.pos.y);

			var dot = (toPointX * toPlayerX) + (toPointY * toPlayerY);

			var toPoint = Math.sqrt(Math.pow(toPointX,2) + Math.pow(toPointY,2))

			var cos = dot/(toPoint*toPlayer);

			var acos = Math.acos(cos);

			if(acos < Math.PI/2)
			{
				this.toPlayerRadar = new SAT.Polygon(new SAT.Vector(this.collider.pos.x, this.collider.pos.y),[
					new SAT.Vector(),
					new SAT.Vector(player.collider.pos.x - this.collider.pos.x, player.collider.pos.y - this.collider.pos.y),
					new SAT.Vector(player.collider.pos.x - this.collider.pos.x + 20, player.collider.pos.y - this.collider.pos.y + 20),
					new SAT.Vector(20,20),
				]);

				var obstaclesCol = true;
				var obstaclesCount = 0;
				for(var a = 1; a < obstacles.length; a++)
				{
					this.toPlayerCollision = SAT.testPolygonPolygon(this.toPlayerRadar, level.obstacles[a].toPolygon());
					if(this.toPlayerCollision)
					{								
						break;					
					}
					else
					{
						if(!this.playerIsInRange)
						{
							this.lastPlayerPos = player.toNode();
							this.makePath(this.lastPlayerPos);
						}
						this.playerIsInRange = true;
					}
				}
			}
		}
	}

	//follow player
	if(this.playerIsInRange && player.playerAlive)
	{
		switch(this.enemyType)
		{
		case "melee":

			this.useWaypoints = false;

			if(this.calcPath)
			{
				this.toNodes = this.toNode(this.collider.pos);
	
				this.lastPlayerPos = player.toNode();
				
				this.makePath(this.lastPlayerPos);
			}

			this.deltaV = this.deltaFromPath();	

			var meleeContact = SAT.testCircleCircle(this.collider, player.collider);

			//got ya
			if(meleeContact){
				this.deltaV = new SAT.Vector();

				if(this.attackTimer === 0 && player.playerAlive){
					this.deltaV = new SAT.Vector();

					var dmg = 0;
					dmg = 0 + rollDice(10,10);
					dmg = Math.min(dmg, 0 + rollDice(10, 10));
					dmg = Math.max(dmg, 0 + rollDice(10., 10));
					
					if (random(100) < enemiesCrit)
					{
					    dmg += 0 + rollDice(10, 10);
					}

					dmg *= 2;
					
					this.meleeDamage = dmg;
					player.applyDamage(this.meleeDamage);
					bloodEffectTimer = bloodEffectDuration;

					this.attackTimer = this.attackCooldown;
				}
			}

		break;
		case "ranged":
		break;
		}
		
		if(this.enemyType == "ranged" && this.bulletsTimer == 0)
		{
			this.useWaypoints = false;
			var toPlayerX = player.collider.pos.x - this.collider.pos.x;
			var toPlayerY = player.collider.pos.y - this.collider.pos.y;
			var toPlayer = Math.sqrt(Math.pow(toPlayerX,2) + Math.pow(toPlayerY,2));
			
			if(this.calcPath)
			{
				this.toNodes = this.toNode(this.collider.pos);
	
				this.lastPlayerPos = player.toNode();
				
				this.makePath(this.lastPlayerPos);
			}

			this.toPlayerRadar = new SAT.Polygon(new SAT.Vector(this.collider.pos.x, this.collider.pos.y),
			[
				new SAT.Vector(),
				new SAT.Vector(player.collider.pos.x - this.collider.pos.x, player.collider.pos.y - this.collider.pos.y),
				new SAT.Vector(player.collider.pos.x - this.collider.pos.x + 20, player.collider.pos.y - this.collider.pos.y + 20),
				new SAT.Vector(20,20),
			]);

			for(var a = 1; a < obstacles.length; a++)
			{
				this.toPlayerCollision = SAT.testPolygonPolygon(this.toPlayerRadar, level.obstacles[a].toPolygon());

				if(this.toPlayerCollision)
				{
					this.canShoot = false;							
					break;
				}
				else
				{
					this.canShoot = true;
				}
			}

			if(toPlayer <= 500 && this.canShoot)
			{
				this.deltaV = new SAT.Vector();

				var dmg = 0;
				var crit = false;
				dmg = 0 + rollDice(10, 10)
				dmg = Math.min(dmg, 0 + rollDice(10, 10));
				dmg = Math.max(dmg, 0 + rollDice(10, 10));
				
				if (random(100) < enemiesCrit)
				{
					dmg += 0 + rollDice(10, 10);
					crit = true;
				}					
				
				//bullet shoot direction
				var tempDirection = new SAT.Vector(toPlayerX, toPlayerY)
				tempDirection.normalize();

				var bul = new Bullet("simple", 0 , crit, dmg, bullet, this.forward.x, this.forward.y, gun.bulletSize, this.bulletsSpeed, new SAT.Vector(tempDirection.x, tempDirection.y, false));
				
				level.bullets.push(bul);
				this.bulletsTimer = this.bulletCooldown;
				this.canShoot = false;
			}
			else
			{
				this.deltaV = this.deltaFromPath();	
			}
		}		
	}

	if(!player.playerAlive)
		this.deltaV = new SAT.Vector();
	
	//moving to player last pos
	/*
	if(!this.playerIsInRange){

		this.toNodes = this.toNode(this.collider.pos)

		this.lastPlayerPos = player.toNode();

		this.makePath(this.lastPlayerPos);

		this.deltaV = this.deltaFromPath();	

	}
	*/

	this.collisionCheck();

	this.deltaV.scale(this.speed);
	this.collider.pos.add(this.deltaV);

	//this.forward.x = this.collider.pos.x + this.deltaV.x;
	//this.forward.y = this.collider.pos.y + this.deltaV.y;

	//preventing multiple enemies on one pathfindng node
	//enemies avoiding themselfs
	//console.log(this.toNodes);

	//TIMERS
	if(this.knockBackTimer > 0) this.knockBackTimer -= deltaTime;
	if(this.knockBackTimer < 0) this.knockBackTimer = 0;
	if(this.knockBackTimer === 0) this.isKnockBack = false;

	if(this.attackTimer > 0) this.attackTimer -= deltaTime;
	if(this.attackTimer < 0) this.attackTimer = 0;

	if(this.bulletsTimer > 0) this.bulletsTimer -= deltaTime;
	if(this.bulletsTimer < 0) this.bulletsTimer = 0;
	
	if(this.hit)
	{
		this.hitTimer += deltaTime;
		if(this.hitTimer > this.hitTime)
		{
			this.hit = false;
			this.hitTimer = 0;
		}
	}
	
	this.lastPath += deltaTime;
	if(this.lastPath > 1)
	{
		this.calcPath = true;
		this.lastPath = 0;
	}
	else 
	{
		this.calcPath = false;
	}
}

Enemy.prototype.applyDamage = function(damage)
{
	this.health -= damage;

	//hp check
	if(this.health < 0) this.health = 0;
	if(this.health > this.maxHealth) this.health = this.maxHealth;

	this.healthPercentage = this.health/this.maxHealth;
	
	//death
	if(this.health == 0)
	{		
		isFollowing = false;
		followEnemy = null;
		animations.push(new Animation("img/explosion3.png", this.collider.pos.x, this.collider.pos.y, 4800, 195, 25, false, 1, 0.6));	
		score += 10;
		level.wave.enemies.splice(this.id, 1);	
	}
	this.hit = true;
}

Enemy.prototype.makePath = function(target)
{
	var pathEnd = pathfindingGraph.grid[target.x][target.y]
	var pathStart = pathfindingGraph.grid[this.toNodes.x][this.toNodes.y];
	this.path = astar.search(pathfindingGraph, pathStart, pathEnd, true);

    this.curPath = 0;
}

Enemy.prototype.toNode = function(target)
{
	for(var a = 0; a < nSizeX; a++)
	{			
		for(var b = 0; b < nSizeY; b++)
		{
			var boxX = a * pathfindingNodesScale;
			var boxY = b * pathfindingNodesScale;
			if (boxX <= target.x && boxX + pathfindingNodesScale >= target.x &&
				boxY <= target.y && boxY + pathfindingNodesScale >= target.y)
			{
				return new SAT.Vector(a,b);
			}
		}
	}
}

Enemy.prototype.deltaFromPath = function()
{
	if(this.path[this.curPath + 1] != undefined)
	{		
		var curEnemyXTemp = this.path[this.curPath].x * pathfindingNodesScale;
		var curEnemyYTemp = this.path[this.curPath].y * pathfindingNodesScale;

		var nextEnemyXTemp = this.path[this.curPath + 1].x * pathfindingNodesScale;
		var nextEnemyYTemp = this.path[this.curPath + 1].y * pathfindingNodesScale;

		var toCurLng = Math.sqrt(Math.pow((this.collider.pos.x - curEnemyXTemp),2) + Math.pow((this.collider.pos.y - curEnemyYTemp),2));
		var toNextLng = Math.sqrt(Math.pow((this.collider.pos.x - nextEnemyXTemp),2) + Math.pow((this.collider.pos.y - nextEnemyYTemp),2));

		
		var deltaX = (this.path[this.curPath + 1].x * pathfindingNodesScale + pathfindingNodesScale/2) - this.collider.pos.x;
		var deltaY = (this.path[this.curPath + 1].y * pathfindingNodesScale + pathfindingNodesScale/2) - this.collider.pos.y;
		
		if(toCurLng >= toNextLng)
			this.curPath++;	
		
		this.lastDeltaV = new SAT.Vector(deltaX, deltaY).normalize();
		
		return new SAT.Vector(deltaX, deltaY).normalize();
	}
	else
	{
		return new SAT.Vector();
	}
}

Enemy.prototype.collisionCheck = function()
{
	if(level.obstacles != null)
	{
		for(var a = 0; a < level.obstacles.length; a++)
		{
			var response = new SAT.Response();
			var col = SAT.testPolygonCircle(level.obstacles[a].toPolygon(), this.collider, response);

			if(col)
			{
				collisonResponse(response, this.collider, level.obstacles[a]);
			}		
		}
	}
}

Enemy.prototype.render = function()
{	
	if(this.path != null && gizomos)
	{
		for(var a = 0; a < this.path.length; a++)
		{
			ctx.fillStyle = "black";
			ctx.fillRect(this.path[a].x * pathfindingNodesScale - viewX, this.path[a].y * pathfindingNodesScale - viewY, pathfindingNodesScale, pathfindingNodesScale)
		}
	}
	
	var pos = this.collider.pos;
	if(pos.x <= viewX + CANVASW && pos.x + this.collider.r >= viewX &&
	   pos.y <= viewY + CANVASH && pos.y + this.collider.r >= viewY)
	{
		//drawing with shadows		
		ctx.save();
		
		if(this.enemyType == "melee")
		{
			ctx.fillStyle = "red";
			if(this.hit)
				ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
			else 
				ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
		}
		else
		{
			ctx.fillStyle = "orange";
			if(this.hit)
				ctx.shadowColor = 'rgba(255, 204, 0, 0.7)';
			else 
				ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
		} 
			
		ctx.shadowBlur = 15;		
		ctx.beginPath();
		ctx.arc(this.collider.pos.x - viewX, this.collider.pos.y - viewY, this.collider.r, 0, 2 * Math.PI, false); // Draws a circle
		ctx.fill();		
		ctx.restore();		
	}

	if(gizomos)
	{		
		ctx.fillStyle = "black";
		for(var a = 0; a < this.waypoints.length; a++)
		{
			ctx.fillRect(this.waypoints[a].x - viewX, this.waypoints[a].y - viewY, 5,5);
		}
	}

	//ctx.fillStyle = "green";
	//ctx.fillRect(this.forward.x - viewX, this.forward.y - viewY, 10,10);

	//hp bar
	ctx.lineWidth = 2; 
	ctx.fillStyle = "black";
	ctx.fillRect(this.collider.pos.x - 100/2  - viewX, this.collider.pos.y - this.radius - 15*2 - viewY, 100, 15)
	//ctx.strokeStyle = "white";
	//ctx.strokeRect(this.collider.pos.x - 100/2 - viewX, this.collider.pos.y - this.radius - 15*2 - viewY, 100, 15)
	ctx.fillStyle = "red";
	ctx.fillRect(this.collider.pos.x - 100/2  - viewX, this.collider.pos.y - this.radius - 15*2 - viewY, 100 * this.healthPercentage, 15)

	ctx.strokeStyle = "black";
	ctx.font = "15px Pixel";
	ctx.fillStyle = "white";
	ctx.strokeText(this.health + "/" + this.maxHealth, this.collider.pos.x - 100/2 - viewX + 5, this.collider.pos.y - this.radius - 15*1.25 - viewY);
	ctx.fillText(this.health + "/" + this.maxHealth, this.collider.pos.x - 100/2 - viewX + 5, this.collider.pos.y - this.radius - 15*1.25 - viewY);
}