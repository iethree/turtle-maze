//turtle game

const screen = {
	center:{
		x: document.documentElement.clientWidth/2,
		y: document.documentElement.clientHeight/2
	},
	top: 0,
	bottom: document.documentElement.clientHeight,
	left: 0,
	right: document.documentElement.clientWidth
}

var config = {
	type: Phaser.AUTO,
	width: document.documentElement.clientWidth,
	height: document.documentElement.clientHeight,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 }
		}
	},
	scene: new myScene('main scene', {
		preload: preload,
		create: create,
		update: update
	})
};

var game = new Phaser.Game(config);

function preload ()
{

	this.load.spritesheet('turtle',
		'art/turtlemin.png',
		{ frameWidth: 26, frameHeight: 34 }
	);

	//this.load.image('mazetiles', 'art/mazetiles.png');

	this.load.image('mazetile64', 'art/grass64.png');
	this.load.image('mazewall64h', 'art/wall64h.png');
	this.load.image('mazewall64v', 'art/wall64v.png');

	this.load.image('mazetile32', 'art/grass32.png');
	this.load.image('mazewall32h', 'art/wall32h.png');
	this.load.image('mazewall32v', 'art/wall32v.png');

	this.load.image('treasure', 'art/treasure48.png');
	this.load.image('target', 'art/target.png');
	this.load.image('carrot', 'art/carrot.png');
	this.load.image('victory', 'art/victory.png');

	buttonColors = ['blue', 'green', 'grey', 'yellow', 'red'];
	for (color of buttonColors){
		this.load.atlasXML(color+'_button', 'art/buttons/'+color+'Sheet.png', 'art/buttons/'+color+'Sheet.xml');
	}
}

function create ()
{
	var moving;
	var makeMaze = (scale)=>{

		var tile = 64*scale;

		if(scale==0.5){
			var mazetile='mazetile32';
			var mazewall = { h: 'mazewall32h', v: 'mazewall32v'};
		}
		else{
			var mazetile='mazetile64';
			var mazewall = { h: 'mazewall64h', v: 'mazewall64v'};
		}

		var offset = {
			x: (screen.right-Math.floor(screen.right/tile)*tile)/2,
			y: (screen.bottom-Math.floor(screen.bottom/tile)*tile)/2
		};

		this.add.tileSprite(screen.center.x,screen.center.y, Math.floor(screen.right/tile)*tile, Math.floor(screen.bottom/tile)*tile, mazetile);
		var walls = this.physics.add.staticGroup();
		var treasure = this.physics.add.sprite(screen.right-offset.x-tile/2, screen.bottom-offset.y-tile/2, 'treasure').setScale(scale);

		walls.create.top = (x,y,tile)=>{
			walls.create(x, y-tile/2 , mazewall.h);
		};
		walls.create.bottom = (x,y,tile)=>{
			walls.create(x, y+tile/2 , mazewall.h);
		};
		walls.create.left = (x,y,tile)=>{
			walls.create(x-tile/2, y , mazewall.v);
		};
		walls.create.right = (x,y,tile)=>{
			walls.create(x+tile/2, y , mazewall.v);
		};

		drawMaze(Math.floor(screen.right/tile), Math.floor(screen.bottom/tile), offset, tile, walls);

		var clicker = this.add.sprite(-100, -100, 'carrot').setScale(scale);

		//create turtle
		var turtle = this.physics.add.sprite(tile/2+offset.x, tile/2+offset.y, 'turtle').setScale(scale);
		turtle.setSize(this.width*scale, this.height*scale, 0, 0);
		this.physics.add.collider(turtle, walls, dontMove);


		this.physics.add.collider(turtle, treasure, ()=>{
			var victory = this.add.sprite(screen.center.x, screen.center.y-200, 'victory')
			if(screen.right<victory.width)
				victory.setScale(1/(victory.width/screen.right));
			this.textButton(screen.center.x, screen.center.y, "New Game", ()=>{location.reload()}, {});
		});

		//this.physics.add.collider(turtle, clicker, ()=>{clicker.disableBody(true,true)});

		function getNearestTile(x, y){
			x = Math.floor((x-offset.x)/tile)*tile + tile/2 + offset.x ;
			y = Math.floor((y-offset.y)/tile)*tile + tile/2 + offset.y;
			return [x,y];
		}

		setTimeout(()=>{this.input.on('pointerdown', function(pointer, objects){

			loc={
				x: game.input.activePointer.downX,
				y: game.input.activePointer.downY
			};

			mover(turtle, loc);

		});},500);//wait half a second to avoid unwanted clicks

		function mover(turtle, loc){
			var speed = 80;

			dontMove();
			[clicker.x, clicker.y] = [loc.x, loc.y];


			[loc.x, loc.y] = getNearestTile(loc.x, loc.y);

			dist = {
				x: loc.x-turtle.x,
				y: loc.y-turtle.y
			};

			turtle.anims.play('walk');

			if(Math.abs(dist.x)>Math.abs(dist.y)){ //left right
				dist.y=0, loc.y = turtle.y; //don't move up/down
				dist.x>0 ? moveRight() : moveLeft();
			}
			else{ //up down
				dist.x=0, loc.x = turtle.x; //don't move left/right
				dist.y>0 ? moveDown() : moveUp();
			}

			moving = setTimeout(dontMove, Math.abs(Math.abs(dist.x) > Math.abs(dist.y) ? dist.x : dist.y)/80*1000)

			function moveLeft(){
				turtle.setAngle(270);
				turtle.setVelocityX(-speed);
			}
			function moveRight(){
				turtle.setAngle(90);
				turtle.setVelocityX(speed);
			}
			function moveDown(){
				turtle.setAngle(180);
				turtle.setVelocityY(speed);
			}
			function moveUp(){
				turtle.setAngle(0);
				turtle.setVelocityY(-speed);
			}
		}

		function dontMove(){
			turtle.anims.stop();
			turtle.setVelocityX(0);
			turtle.setVelocityY(0);
			//[turtle.x, turtle.y] = getNearestTile(turtle.x, turtle.y);
			clearTimeout(moving);
			[clicker.x, clicker.y] = [-100, -100];
		}

		this.anims.create({
			key: 'walk',
			frames: this.anims.generateFrameNumbers('turtle', { start: 0, end: 2 }),
			frameRate: 10,
			repeat: -1,
		});

	}

	var easy = ()=>{
		title.setText('Generating Maze...');
		easyButton.hide();
		hardButton.hide();
		setTimeout(()=>makeMaze(1), 10);
	}

	var hard = ()=>{
		title.setText('Generating Maze...');
		easyButton.hide();
		hardButton.hide();
		setTimeout(()=>makeMaze(0.5), 10);
	}

	var style = { font: "20px Courier New", fill: "#ffffff" };

	var title = this.add.text(screen.center.x, screen.center.y-75, "Turtle Maze", style).setOrigin(0.5);
	var easyButton = this.textButton(screen.center.x, screen.center.y-25, "Easy", easy, {color: 'green'});
	var hardButton = this.textButton(screen.center.x, screen.center.y+25, "Hard", hard, {color: 'blue'});

}

function update ()
{ }

function drawMaze(width, height, offset, tile, walls){
	var maze = new Maze(width, height).move([0,0]);
	console.log(maze);

	var center = {x:offset.x-tile/2, y:offset.y-tile/2};

	for(let y=0; y<height; y++){
		center.y+=tile;
		center.x=offset.x-tile/2;

		for(let x=0; x<width; x++){
			center.x+=tile;

			if(maze[y][x].right)
				walls.create.right(center.x, center.y, tile);
			if(maze[y][x].down)
				walls.create.bottom(center.x, center.y, tile);
			if(maze[y][x].left)
				walls.create.left(center.x, center.y, tile);
			if(maze[y][x].up)
				walls.create.top(center.x, center.y, tile);
		}
	}
}
