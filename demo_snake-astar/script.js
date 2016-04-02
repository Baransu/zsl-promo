var tab = [];
var myDiv;
var playGroundSize = 25
var lastAppleX = 0;
var lastAppleY = 0;
var interval;
var curPosX = 13;
var curPosY = 13;
var dlugosc = 0
var snakeLastX = [];
var snakeLastY = [];
var myDivHtml;
var tempY;
var tempX;
var lastX;
var lastY;
var end, start;
var abc;
var path;
var over;
var retarded = false;

function init(){
	myDiv = document.getElementById("myDiv");

	//zapelnienie tablicy 0
	for(var cnt = 0; cnt < 25; cnt++){
		tab[cnt] = [];
		for(var tnc = 0; tnc < 25; tnc++){
				tab[cnt][tnc] = 1;
		}
	}

	//ustawinie pozycji poczatkowej
	tab[curPosX][curPosY] = 0;

	appleRand();
	printTab();

	interval = setInterval(move, 1000/50);

}

function changed(e){
	clearInterval(interval);
	interval = setInterval(move, 1000/e);
}

function checkbox(e){
	if(e.checked) retarded = false;
	else retarded = true;

}

function appleRand(){
	tab[lastAppleX][lastAppleY] = 1;
	over = false;
	do{
		tempX = Math.floor(Math.random() * playGroundSize);
		tempY = Math.floor(Math.random() * playGroundSize);

		if(tab[tempX][tempY] != 0)
			over = true

	} while(!over)

	lastAppleX = tempX;
	lastAppleY = tempY;
	tab[tempX][tempY] = 2;

	//pathfinding
	abc = new Graph(tab)
	end = abc.grid[tempX][tempY];

}

function printTab(){

	myDivHtml = "";

	for(var cnt = 0; cnt < playGroundSize; cnt++){
		for(var tnc = 0; tnc < playGroundSize; tnc++){
			if(tab[cnt][tnc] == 0)
				myDivHtml += ("<div class='field snake'></div>");
			else if(tab[cnt][tnc] == 2)
				myDivHtml += ("<div class='field jabko'></div>");
			else
				myDivHtml += ("<div class='field'></div>");
		}
	}

	myDiv.innerHTML = myDivHtml;
}

function move(){
	snakeLastX[0] = curPosX;
	snakeLastY[0] = curPosY;
	lastX = curPosX;
	lastY = curPosY;

	//pathfinding
	abc = new Graph(tab)
	start = abc.grid[curPosX][curPosY];
	path = astar.search(abc, start, end, {
        closest: true
    });

	if(path.length == 0){

		appleRand();
		curPosX = lastX;
		curPosY = lastY;
	}
	else{
		curPosY = path[0].y;
		curPosX = path[0].x;

	}

	if(tab[curPosX][curPosY] == 0 || tab[curPosX][curPosY] == 3){
		clearInterval(interval);
		tab[lastAppleX][lastAppleY] = 2;
		printTab();
		// alert("Game Over");
		location.reload();
		return;
	}
	//jedzenie jablka
	if(curPosY == lastAppleY && curPosX == lastAppleX){
		if(!retarded)
			dlugosc++
		appleRand();
	}

	if(retarded && dlugosc > 2)
		dlugosc = 2;

	//dlugosc snake'a
	for(var a = dlugosc; a >= 0; a--){

		snakeLastX[a] = snakeLastX[a-1];
		snakeLastY[a] = snakeLastY[a-1];

		if(a < 2){
			snakeLastX[0] = curPosX;
			snakeLastY[0] = curPosY;
		}
	}

	//reset tab
	for(var cnt = 0; cnt < 25; cnt++)
		for(var tnc = 0; tnc < 25; tnc++)
			tab[cnt][tnc] = 1;

	//set jabko
	tab[lastAppleX][lastAppleY] = 2;

	//print snake
	for(var a = 0; a <= dlugosc; a++){
		tab[snakeLastX[a]][snakeLastY[a]] = 0;
	}

	printTab();
}
