
let game

const gameOptions = 
{
    playerGravity: 1000,
    playerVelocity: 300
}

window.onload = function() 
{
    let gameConfig = 
    {
        type: Phaser.AUTO,
        scale: 
        {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 600,
        },
        
        pixelArt: true,
        physics: 
        {
            default: 'arcade',
            arcade: 
            {
                gravity: { y: 0 }
            }
        },
        scene: PlayGame,
    }

    game = new Phaser.Game(gameConfig)
    window.focus()

}

class PlayGame extends Phaser.Scene 
{
    constructor() 
    {
        super("PlayGame")
        this.score = 0;
        this.collectablesScore = 0
        this.delay = 2000
        this.gap = 3
        this.pipeVelocity = -200
    }

    preload() 
    {
        this.load.image('square_32', 'assets/square_32.png')
        this.load.image('square_64', 'assets/square_64.png')

        this.load.image('pipe_top', 'assets/pipe_top.png')
        this.load.image('pipe_bot', 'assets/pipe_bottom.png')
        this.load.image('pipe_body', 'assets/pipe_body.png')
        this.load.image('pipe_body_2', 'assets/pipe_body_2.png')
        this.load.image('pipe_bot_2', 'assets/pipe_bottom_2.png')
        this.load.image('pipe_top_2', 'assets/pipe_top_2.png')

        this.load.spritesheet('player', 'assets/bird.png',   { frameWidth: 32, frameHeight: 32 } )
        this.load.spritesheet('cherry', 'assets/cherry.png', { frameWidth: 32, frameHeight: 32 } )
        this.load.spritesheet('melon', 'assets/melon.png',   { frameWidth: 32, frameHeight: 32 } )

        this.load.image('blue-bg', 'assets/backgrounds/Blue.png')
        this.load.image('gray-bg', 'assets/backgrounds/Gray.png')
        this.load.image('pink-bg', 'assets/backgrounds/Pink.png')
        this.load.image('purple-bg', 'assets/backgrounds/Purple.png')
        this.load.image('yellow-bg', 'assets/backgrounds/Yellow.png')
        this.load.image('green-bg', 'assets/backgrounds/Green.png')
        this.load.image('brown-bg', 'assets/backgrounds/Brown.png')
    }

    create() 
    {
        // https://web.archive.org/web/20221228131240/https://phaser.io/examples/v3/view/game-objects/container/add-tilesprite-to-container 
        // (archive.org link 'cause the official site is down for maintenance)

        const container = this.add.container(game.config.width / 2, game.config.height / 2)
        this.ts = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'green-bg').setAlpha(0.8)
        container.add(this.ts)


        this.pipesGroup = this.physics.add.group(
            {
                immovable: true,
                allowGravity: false,
            }
        )

        this.player = this.physics.add.sprite( game.config.width / 4, game.config.height / 2, 'player' )
        this.player.flipX = true;
        this.player.body.gravity.y = gameOptions.playerGravity
    
        this.collectablesGroup = this.physics.add.group({})
        // this.physics.add.collider(this.collectablesGroup, this.platformGroup)

        this.physics.add.overlap(this.player, this.collectablesGroup, this.collectItem, null, this)
        this.physics.add.overlap(this.player, this.pipesGroup, this.restartGame, null, this)

        this.add.image(16, 16, "melon")
        this.scoreText = this.add.text(32, 4, "0", {fontSize: "30px", fill: "ffffff"})

        this.add.image(80, 16, "cherry")
        this.itemScoreText = this.add.text(96, 4, "0", {fontSize: "30px", fill: "ffffff"})

        this.cursors = this.input.keyboard.createCursorKeys()

        this.anims.create(
            {
                key: 'flying',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 8}),
                frameRate: 20,
                repeat: -1,
            }
        )
        
        this.triggerTimer = this.time.addEvent(
            {
                callback: this.addPipes,
                callbackScope: this,
                delay: this.delay,
                loop: true,
            }
        )

    }

    /* creating a single pipe element */
    createPipe(x, y, piece)
    {
        // let pipe = this.physics.add.sprite(x, y, 'square_64')

        let pipe = piece === 'body' ? this.physics.add.sprite(x, y, 'pipe_body_2')
                    : piece === 'top' ? this.physics.add.sprite(x, y, 'pipe_top_2')
                    : piece === 'bot' ? this.physics.add.sprite(x, y, 'pipe_bot_2')
                    : ''

        this.pipesGroup.add( pipe )
    
        pipe.body.setVelocityX( this.pipeVelocity )
    
        pipe.checkWorldBounds = true
        pipe.outOfBoundsKill = true
    }

    /* stacking multiple pipe elements with a gap in between */
    addPipes() 
    {
        let hole = Math.floor(Math.random() * 8)

        let gapValues = []
        let gap = this.gap

        // forming the idxs of randomized hole index (hole starting point index) + gap size
        // e.g. hole = 2; gap size = 3  ==>  gap = indexes 2, 3, 4  (hole open from 3rd pipe through 5th pipe)
        //
        // gap size shrinks during play
        // e.g. hole = 2; gap size = 2  ==>  gap = indexes 2, 3  (hole open from 3rd pipe through 4th pipe)

        while (gap > 0) 
        { 
            gapValues.push(hole + (gap - 1)); 
            gap-- 
        }

        for (let i = 0; i < game.config.height / 64; i++)
        {

            /* testing to see if we need a top, bot or body piece depending on if
               the gap is next to the current iterating piece */

            /* currently body, next is empty ==> top piece */
            if(gapValues.indexOf(i) === -1 && gapValues.indexOf(i+1) !== -1)
            {
                this.createPipe(game.config.width - 20, i * 62 + 16, 'top')
            } 

            /* currently body, last was empty ==> bottom piece */
            else if (gapValues.indexOf(i) === -1 && gapValues.indexOf(i-1) !== -1)
            {
                this.createPipe(game.config.width - 20, i * 62 + 16, 'bot')
            }

            /* currently not a gap, place body piece */
            else if(gapValues.indexOf(i) === -1)
            {
                this.createPipe(game.config.width - 20, i * 62 + 16, 'body')
            }
        }

        this.score += 1
        this.scoreText.setText(this.score)

        if(Phaser.Math.Between(0,1)) {
            this.collectablesGroup.create(game.config.width, Phaser.Math.Between(0, game.config.height), "cherry")
            this.collectablesGroup.setVelocityX(-gameOptions.playerVelocity)
        }
    }

    collectItem(player, item) 
    {
        item.disableBody(true, true)
        this.collectablesScore += 1
        this.score += 2
        this.scoreText.setText(this.score)
        this.itemScoreText.setText(this.collectablesScore)
    }


    update() 
    {
        this.player.anims.play('flying', true)

        if (this.cursors.space.isDown || this.cursors.up.isDown) { this.player.body.velocity.y = -gameOptions.playerGravity / 3 }

        /* VERY crass attempt at confining the player inside the window size */
        if(this.player.body.y >= game.config.height - 2) { this.player.setY(game.config.height - 64) }
        if(this.player.body.y <= 0 + 2)                  { this.player.setY(0 + 64) }


        if(this.score >= 50) { this.gap = 1 }
        else if(this.score >= 40) { this.delay = 150 }
        else if(this.score >= 35) { this.delay = 333 }
        else if(this.score >= 30) { this.delay = 500; console.log(`score > 30: delay shortened`) }
        else if(this.score >= 25) { this.pipeVelocity = -400; console.log(`score > 25: pipeVel increased`) }
        else if(this.score >= 20) { this.gap = 2; console.log(`score > 20: gap size - 1`) }
        else if(this.score >= 15) { this.delay = 1000; console.log(`score > 15: delay shortened`) }
        else if(this.score >= 10) { this.pipeVelocity = -300; console.log(`score > 10: pipeVel increased`) }

    }

    /*  https://www.html5gamedevs.com/topic/35715-resetting-a-scene/  */
    restartGame()
    {
        this.score = 0;
        this.collectablesScore = 0
        this.delay = 2000
        this.gap = 3 
        this.pipeVelocity = -200
        this.scene.start("PlayGame")
    }

}