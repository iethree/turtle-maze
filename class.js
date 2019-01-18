//buttons

// red 0xF5752F
// blue 0x27B0E7
// green 0x7DD955
// yellow 0xFDD11E
// white 0xFDFFFF

class myScene extends Phaser.Scene{
	
	constructor(name, functions){
		super(name);
		
		this.player="";
		this.preload = functions.preload;
		this.create = functions.create;
		this.update = functions.update;
	}
	
	loadButtons(){
		//maybe don't need to load all of these
		var buttonColors = ['blue', 'green', 'grey', 'yellow', 'red'];
		for (var color of buttonColors){
			this.load.atlasXML(color+'_btn', 'art/buttons/'+color+'Sheet.png', 'art/buttons/'+color+'Sheet.xml');
		}
	}
	
	textButton(x, y, text, action, options){
			
		var options = {
			color: options.color || 'blue',
			type: options.type || 1,
			scaleX: options.scaleX || 1,
			scaleY:	options.scaleY || 1,
		};
		
		var key = options.color+'_button';
		var up_image = key+'04.png';
		var down_image = key+'05.png';
		
		this.anims.create({
			key: 'up_'+key,
			frames: [ { key: key, frame: up_image } ],
			frameRate: 2,
			repeat: -1,
		});
		this.anims.create({
			key: 'down_'+key,
			frames: [ { key: key, frame: down_image } ],
			frameRate: 2,
			repeat: -1
		});
		var button = this.add.sprite(x, y, key, up_image ).setScale(options.scaleX, options.scaleY).setScrollFactor(0);
		
		button.setInteractive();
		button.action = action;
		
		var style = { font: "20px Courier New", fill: "#ffffff" };  
		
		button.label = this.add.text(x, y, text, style).setOrigin(0.5).setScrollFactor(0);
		
		button.on('pointerdown', () => { 
			button.anims.play('down_'+key, true); 
			
			this.tweens.add({
				targets: button.label,
				y: y+1,
				//ease: 'Power1',
				paused: true,
				duration: 20,
			}).play();	
			button.action(); 
		});
		
		button.on('pointerup', () => { 
			button.anims.play('up_'+key, true);  
			this.tweens.add({
				targets: button.label,
				y: y-1,
				//ease: 'Power1',
				paused: true,
				duration: 20,
			}).play();
		});
		
		
		//button.addChild(label);
		
		button.setText  = function(text)  { button.setAlpha(1); button.label.setText(text); }
		button.setAction= function(action){ button.action = action; }
		button.hide = function(){ button.label.setText(''); button.setAlpha(0);}
		
		return button;
	}
	
	progressBar(x, y, options){
		
		var options = {
			length: options.length || 200,
			width:	options.width || 30,
			barColor: options.barColor || '0xE86A16',
			boxColor: options.boxColor || '0x000000',
			vertical: options.vertical || false
		};
		
		if(options.vertical){
			let temp = options.width;
			options.length = options.width;
			options.width = temp;
		}
		
		var progress= {
			box : this.add.graphics().setScrollFactor(0),
			bar : this.add.graphics().setScrollFactor(0)
		};
		
		//center anchor
		x = x-options.length/2;
		y = y-options.width/2;

		progress.box.fillStyle(options.boxColor, 0.6);
		progress.box.fillRoundedRect(x, y, options.length, options.width, 3);
		
		progress.setProgress = function(num){ //percent
			if (num>100)
				num = 100;
			if (num<0)
				num = 0;
			progress.bar.clear();
			progress.bar.fillStyle(options.barColor, 1);
			progress.bar.fillRoundedRect(x+5, y+5, (options.length-10)/100*num, options.width-10, 2);
		}
		
		return progress;
	}
	
	dialogBox(x, y, text, handler, options){
		
		var dialog = {};
	
		var width = screen.right-40;
		var height = 100;
		var pad = 7;
		
		var dialogBox = this.add.graphics().setScrollFactor(0);
		var dialogArrow = this.add.graphics().setScrollFactor(0);
		
		var hitarea = new Phaser.Geom.Rectangle(x,y, width, height);
		dialogBox.setInteractive(hitarea, Phaser.Geom.Rectangle.Contains);
		
	
		dialogBox.fillStyle(0xFFFFFF, 0.7);
		dialogBox.fillRoundedRect(x, y, width, height, 8);
		
		dialogArrow.fillStyle(0xFFFFFF, 0.7);
		//dialogArrow.fillTriangle(x+25, y+height, x+45, y+height, x+25, y+height+30); //left
		dialogArrow.fillTriangle(x+width-25, y+height, x+width-45, y+height, x+width-25, y+height+30); //right
		//dialogArrow.fillTriangle(x+width/2-10, y+height, x+width/2+10, y+height, x+width/2, y+height+30); //center

		var dialogText = this.add.text(
			x+pad,y+pad,
			'',
			{ color: 'black', font: '16px Times', wordWrap: { width: width-pad*2, useAdvancedWrap: true }}
		).setScrollFactor(0);
			
		var wordArray = text.split(' ');
		
		var wordcnt=0;
		var lettercnt=0;
		var displayText = '';
		
		
		
		dialog.handler = handler;
		
		dialog.emitter = new Phaser.Events.EventEmitter();
		dialog.emitter.on('done', dialog.handler, this);
		
		var scrollText = function(){ 
			
			if(wordcnt==wordArray.length){ //stop when we're at the end of the text
				timedEvent.remove();
				dialog.emitter.emit('done', 'textDone');
				return;
			}
			
			displayText += wordArray[wordcnt][lettercnt];
			lettercnt++;
			
			if(lettercnt==wordArray[wordcnt].length){//at end of each word
				displayText += ' ';
				lettercnt=0;
				wordcnt++;
			}
				
				dialogText.setText(displayText); 
			
			if(dialogText.displayHeight > height-pad*2){ //check for vertical overflow
				displayText = displayText.substring(0,displayText.length-(lettercnt+1)-wordArray[wordcnt-1].length)+'...';
				dialogText.setText(displayText); 
				displayText = '';
				
				if(lettercnt>0)
					wordcnt--;
				
				lettercnt=0;
				timedEvent.paused = true;
			} 
		}
		
		var timedEvent = this.time.addEvent({
		  delay: 40, //50 is good
		  callback: scrollText,
		  callbackScope: this,
		  loop: true
		});
		
		dialogBox.on('pointerdown', ()=>{timedEvent.paused = false; console.log('click dialog');});
		
		
		
		var scope = this;
		
		dialog.set = function(text){
			
			wordArray = text.split(' ');
		
			wordcnt=0;
			lettercnt=0;
			displayText = '';
			
			timedEvent = scope.time.addEvent({
			  delay: 5, //50 is good
			  callback: scrollText,
			  callbackScope: scope,
			  loop: true
			});
		}
		
		dialog.destroy = function(){
			timedEvent.remove();
			dialogBox.destroy();
			dialogText.destroy();
			
		}
		
		
		return dialog;
	}
}
	
	


