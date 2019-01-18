//maze.js

class Node{
	constructor(back){
		this.visited=false;
		this.left = true;
		this.right = true;
		this.up = true;
		this.down = true;
		this.back = false;
	}
	setFalse(dir){
			this[dir]=false;
			return this;
	}
}

class Maze {
	constructor(width, height){
		this.maze = [];
		this.width = width;
		this.height = height;
		for(var i=0; i<this.height; i++){
			this.maze.push([]);
			for(let j=0; j<this.width; j++)
				this.maze[i].push(new Node());
		}
		this.maze[0][0].back = [0,0];
		this.visited=1;
	}
	getDirections(loc){
		var options = [];

		if(loc[0]>0 && !this.maze[ loc[1] ][ loc[0]-1  ].visited )//can go left
			options.push('left');
		if(loc[0]<this.width-1 && !this.maze[loc[1] ][ loc[0]+1].visited)//can go right
			options.push('right');
		if(loc[1]>0 && !this.maze[ loc[1]-1 ][ loc[0]].visited )//can go up
			options.push('up');
		if(loc[1]<this.height-1 && !this.maze[ loc[1]+1 ][ loc[0] ].visited )//can go down
			options.push('down');

		if(options.length)
			return options;
		else
			return false;
	}
	getRandomDirection(loc){
		var options = this.getDirections(loc);
		if(!options)
			return false;
		if(options.length == 1 )
			return options[0];
		else
			return options[getRandomInt(0, options.length)];
	}

	move(loc){
		var next, old, direction='';

		while(this.visited<=this.height*this.width){
			next = this.getRandomDirection(loc);
			if(!next){
				loc = this.maze[loc[1]][loc[0]].back;
				continue;
			}
			else{
					old = loc, direction = '';

					this.maze[old[1]][old[0]].setFalse(next); //remove wall from next direction

					if(next=="right"){
						loc = [ old[0]+1, old[1] ];
						direction = 'left';
					}
					else if(next=="left"){
						loc = [ old[0]-1, old[1] ];
						direction = 'right';
					}
					else if(next=="up"){
						loc = [ old[0], old[1]-1 ];
						direction = 'down';
					}
					else if(next=="down"){
						loc = [ old[0], old[1]+1 ];
						direction = 'up';
					}
					else{
						console.log(next, 'error: not a direction');
						continue;
					}
					this.visited++;
					this.maze[loc[1]][loc[0]].visited=true; //set as visited
					this.maze[loc[1]][loc[0]][direction] = false; //unblock
					this.maze[loc[1]][loc[0]].back = old; //save a way to go back
				}

		}
		return this.maze; 	//we're done
	}
}

function getRandomInt(min, max){
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function test(width, height){
	console.log(width+ 'x' +height)
	console.time('init');
	tester = new Maze(width, height);
	console.timeEnd('init');
	console.time('create');
	tester.move([0,0]);
	console.timeEnd('create');
}
test(40,40)
test(100,100);
