(()=>{"use strict";class e extends Phaser.Scene{constructor(){super("WelcomeScene"),this.title="",this.hint=""}preload(){this.load.image("blue-bg","assets/backgrounds/Blue.png"),this.load.audio("confirm",["assets/sounds/confirm.mp3"])}create(){this.confirmSound=this.sound.add("confirm");const e=this.add.container(400,300);this.ts=this.add.tileSprite(0,0,800,600,"blue-bg").setAlpha(.9),e.add(this.ts),this.title=this.add.text(180,200,"ITWP Project",{font:"80px Arial Bold",fill:"white"}),this.hint=this.add.text(280,320,"Press 'Mouse 1' to start",{font:"24px Arial Bold",fill:"white"}),this.input.on("pointerdown",(function(){console.log("welcome: pointer clicked"),this.confirmSound.play({loop:!1,volume:.15}),this.scene.start("PlayGame")}),this)}}class s extends Phaser.Scene{constructor(){super("GameOverScene"),this.score=0,this.collectables=0,this.hint="",this.result=""}init(e){this.score=e.score,this.collectables=e.collectables,this.highScore=e.highScore}preload(){this.load.image("pink-bg","assets/backgrounds/Pink.png"),this.load.audio("confirm",["assets/sounds/confirm.mp3"])}create(){this.confirmSound=this.sound.add("confirm");const e=this.add.container(400,300);this.ts=this.add.tileSprite(0,0,800,600,"pink-bg").setAlpha(.9),e.add(this.ts);let s=this.score+5*this.collectables,t=`Your score is ${s}!`;this.result=this.add.text(180,200,t,{font:"60px Arial Bold",fill:"white"}),this.hint=this.add.text(280,320,"Press 'Mouse 1' to restart",{font:"24px Arial Bold",fill:"white"}),s>this.highScore&&(this.highScore=s),this.input.on("pointerdown",(function(){console.log("gameover: pointer clicked"),this.confirmSound.play({loop:!1,volume:.15}),this.scene.start("PlayGame",{highScore:this.highScore})}),this)}}let t;const i=-200;window.onload=function(){let i={type:Phaser.AUTO,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:800,height:600},pixelArt:!0,physics:{default:"arcade",arcade:{gravity:{y:0}}},scene:[e,o,s]};t=new Phaser.Game(i),window.focus()};class o extends Phaser.Scene{constructor(){super("PlayGame"),this.score=0,this.collectablesScore=0,this.delay=2e3,this.gap=3,this.pipeVelocity=-200,this.highScore=0}init(e){this.score=0,this.collectablesScore=0,this.delay=2e3,this.gap=3,this.pipeVelocity=-200,this.highScore=e.highScore||0}preload(){this.load.image("pipe_body","assets/sprites/pipe_body.png"),this.load.image("pipe_bot","assets/sprites/pipe_bottom.png"),this.load.image("pipe_top","assets/sprites/pipe_top.png"),this.load.image("time","assets/sprites/time.png"),this.load.spritesheet("player","assets/sprites/bird.png",{frameWidth:32,frameHeight:32}),this.load.spritesheet("cherry","assets/sprites/cherry.png",{frameWidth:32,frameHeight:32}),this.load.spritesheet("melon","assets/sprites/melon.png",{frameWidth:32,frameHeight:32}),this.load.image("enemy","assets/sprites/enemy.png"),this.load.image("blue-bg","assets/backgrounds/Blue.png"),this.load.image("pink-bg","assets/backgrounds/Pink.png"),this.load.image("green-bg","assets/backgrounds/Green.png"),this.load.image("trophy","assets/sprites/trophy.png"),this.load.audio("swoosh",["assets/sounds/swoosh.mp3"]),this.load.audio("bg-music",["assets/sounds/bg-music-main-game.mp3"]),this.load.audio("confirm",["assets/sounds/confirm.mp3"]),this.load.audio("collect-item",["assets/sounds/collect-item.mp3"]),this.load.audio("windows-error-sound",["assets/sounds/windows-error-sound.mp3"])}create(){const e=this.add.container(t.config.width/2,t.config.height/2);this.ts=this.add.tileSprite(0,0,t.config.width,t.config.height,"green-bg").setAlpha(.8),e.add(this.ts),this.bgMusic=this.sound.add("bg-music"),this.bgMusic.play({mute:!1,volume:.15,rate:1,loop:!1,delay:0}),this.swoosh=this.sound.add("swoosh"),this.confirmSound=this.sound.add("confirm"),this.collectSound=this.sound.add("collect-item"),this.windowsErrorSound=this.sound.add("windows-error-sound"),this.pipesGroup=this.physics.add.group({immovable:!0,allowGravity:!1}),this.player=this.physics.add.sprite(t.config.width/4,t.config.height/2,"player"),this.player.flipX=!0,this.player.body.gravity.y=1e3,this.cherriesGroup=this.physics.add.group({}),this.melonsGroup=this.physics.add.group({}),this.enemiesGroup=this.physics.add.group({}),this.physics.add.overlap(this.player,this.cherriesGroup,this.collectCherry,null,this),this.physics.add.overlap(this.player,this.melonsGroup,this.collectMelon,null,this),this.physics.add.overlap(this.player,this.pipesGroup,this.changeToGameOverScene,null,this),this.physics.add.overlap(this.player,this.enemiesGroup,this.changeToGameOverScene,null,this),this.add.image(20,20,"time"),this.scoreText=this.add.text(38,6,"0",{fontSize:"30px",fill:"ffffff"}),this.add.image(105,21,"melon").setAngle(-55),this.add.image(95,19,"cherry"),this.itemScoreText=this.add.text(117,6,"0",{fontSize:"30px",fill:"ffffff"}),console.log(`dbg: current highScore = ${this.highScore}`),this.highScore>0&&(this.add.image(175,20,"trophy"),this.highScoreText=this.add.text(190,6,`${this.highScore}`,{fontSize:"30px",fill:"ffffff"})),this.cursors=this.input.keyboard.createCursorKeys(),this.anims.create({key:"flying",frames:this.anims.generateFrameNumbers("player",{start:0,end:8}),frameRate:20,repeat:-1}),this.triggerTimer=this.time.addEvent({callback:this.addPipes,callbackScope:this,delay:this.delay,loop:!0})}createPipe(e,s,t){let i="body"===t?this.physics.add.sprite(e,s,"pipe_body"):"top"===t?this.physics.add.sprite(e,s,"pipe_top"):"bot"===t?this.physics.add.sprite(e,s,"pipe_bot"):"";this.pipesGroup.add(i),i.body.setVelocityX(this.pipeVelocity),i.checkWorldBounds=!0,i.outOfBoundsKill=!0}addPipes(){let e=Math.floor(8*Math.random()),s=[],o=this.gap;for(;o>0;)s.push(e+(o-1)),o--;for(let e=0;e<t.config.height/64;e++)-1===s.indexOf(e)&&-1!==s.indexOf(e+1)?this.createPipe(t.config.width-20,62*e+16,"top"):-1===s.indexOf(e)&&-1!==s.indexOf(e-1)?this.createPipe(t.config.width-20,62*e+16,"bot"):-1===s.indexOf(e)&&this.createPipe(t.config.width-20,62*e+16,"body");this.score+=1,this.scoreText.setText(this.score),Phaser.Math.Between(0,1)&&(this.cherriesGroup.create(t.config.width,Phaser.Math.Between(0,t.config.height),"cherry"),this.cherriesGroup.setVelocityX(-300)),this.score%3==0&&(this.melonsGroup.create(t.config.width,Phaser.Math.Between(125,475),"melon"),this.melonsGroup.setVelocityX(-225)),this.score>10&&(1===Phaser.Math.Between(0,2)?(this.enemiesGroup.create(Phaser.Math.Between(400,780),t.config.height,"enemy"),this.enemiesGroup.setVelocityX(i*Phaser.Math.Between(.5,2)),this.enemiesGroup.setVelocityY(i*Phaser.Math.Between(.8,1.5))):2===Phaser.Math.Between(0,2)&&(this.enemiesGroup.create(Phaser.Math.Between(400,780),0,"enemy"),this.enemiesGroup.setVelocityX(i*Phaser.Math.Between(.5,2)),this.enemiesGroup.setVelocityY(200*Phaser.Math.Between(.8,1.5))))}collectCherry(e,s){s.disableBody(!0,!0),this.collectSound.play({volume:.3}),this.collectablesScore+=1,this.score+=2,this.scoreText.setText(this.score),this.itemScoreText.setText(this.collectablesScore)}collectMelon(e,s){s.disableBody(!0,!0),this.collectSound.play({volume:.3}),this.collectablesScore+=1,this.itemScoreText.setText(this.collectablesScore)}changeToGameOverScene(){this.bgMusic.stop(),this.windowsErrorSound.play({volume:.3}),this.scene.start("GameOverScene",{score:this.score,collectables:this.collectablesScore,highScore:this.highScore})}update(){this.player.anims.play("flying",!0),this.cursors.space.isDown&&(this.player.body.velocity.y=-1e3/3,this.swoosh.play({loop:!1,volume:.07})),this.player.body.y>=t.config.height-2&&this.player.setY(t.config.height-64),this.player.body.y<=2&&this.player.setY(64),this.score>=50?this.gap=1:this.score>=40?this.delay=150:this.score>=35?this.delay=333:this.score>=30?this.delay=500:this.score>=25?this.pipeVelocity=-400:this.score>=20?this.gap=2:this.score>=15?this.delay=1e3:this.score>=10&&(this.pipeVelocity=-300)}}})();