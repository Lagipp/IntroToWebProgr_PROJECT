
import { WelcomeScene } from "./welcomeScene.js"
import { GameOverScene } from "./gameOverScene.js"

let game

const gameOptions = 
{
    playerGravity: 1000,
    cherriesVelocity: -300,
    melonsVelocity: -225,
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
        scene: [WelcomeScene, PlayGame, GameOverScene],
    }

    game = new Phaser.Game(gameConfig)
    window.focus()
}

class PlayGame extends Phaser.Scene 
{
    constructor() 
    {
        super("PlayGame")
        this.score = 0
        this.collectablesScore = 0
        this.delay = 2000
        this.gap = 3
        this.pipeVelocity = -200
    }

    init()
    {
        this.score = 0
        this.collectablesScore = 0
        this.delay = 2000
        this.gap = 3
        this.pipeVelocity = -200
    }

    preload() 
    {
        // made by me using:  https://www.pixilart.com/draw 

        this.load.image('pipe_body_2', 'assets/sprites/pipe_body_2.png')
        this.load.image('pipe_bot_2', 'assets/sprites/pipe_bottom_2.png')
        this.load.image('pipe_top_2', 'assets/sprites/pipe_top_2.png')


        // free assets acquired from:  https://pixelfrog-assets.itch.io/pixel-adventure-1 
        //                             https://pixelfrog-assets.itch.io/pixel-adventure-2 

        this.load.spritesheet('player', 'assets/sprites/bird.png',   { frameWidth: 32, frameHeight: 32 } )
        this.load.spritesheet('cherry', 'assets/sprites/cherry.png', { frameWidth: 32, frameHeight: 32 } )
        this.load.spritesheet('melon', 'assets/sprites/melon.png',   { frameWidth: 32, frameHeight: 32 } )

        this.load.image('blue-bg', 'assets/backgrounds/Blue.png')
        this.load.image('gray-bg', 'assets/backgrounds/Gray.png')
        this.load.image('pink-bg', 'assets/backgrounds/Pink.png')
        this.load.image('purple-bg', 'assets/backgrounds/Purple.png')
        this.load.image('yellow-bg', 'assets/backgrounds/Yellow.png')
        this.load.image('green-bg', 'assets/backgrounds/Green.png')
        this.load.image('brown-bg', 'assets/backgrounds/Brown.png')


        /* music acquired from:  https://pixabay.com/sound-effects/swoosh-sound-effect-for-fight-scenes-or-transitions-2-149890/ */
        this.load.audio('swoosh', ['assets/sounds/swoosh.mp3'])

        /* music acquired from:  https://pixabay.com/music/video-games-music-for-arcade-style-game-146875/   */
        this.load.audio('bg-music', ['assets/sounds/bg-music-main-game.mp3'])

        /* music acquired from:  https://pixabay.com/sound-effects/interface-124464/  */
        this.load.audio('confirm', ['assets/sounds/confirm.mp3'])

        /* music acquired from:  https://pixabay.com/sound-effects/notifications-sound-127856/   */
        this.load.audio('collect-item', ['assets/sounds/collect-item.mp3'])

        /* music acquired from  https://pixabay.com/sound-effects/windows-error-sound-effect-35894/  */
        this.load.audio('windows-error-sound', ['assets/sounds/windows-error-sound.mp3'])
    }


    create() 
    {
        
        // https://web.archive.org/web/20221228131240/https://phaser.io/examples/v3/view/game-objects/container/add-tilesprite-to-container 
        // (archive.org link 'cause the official site is down for maintenance)

        const container = this.add.container(game.config.width / 2, game.config.height / 2)
        this.ts = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'green-bg').setAlpha(0.8)
        container.add(this.ts)


        this.bgMusic = this.sound.add('bg-music')

        let musicConfig = 
        {
            mute: false,
            volume: 0.15,
            rate: 1,
            loop: false,
            delay: 0
        }
        this.bgMusic.play(musicConfig)

        this.swoosh = this.sound.add('swoosh')
        this.confirmSound = this.sound.add('confirm')
        this.collectSound = this.sound.add('collect-item')
        this.windowsErrorSound = this.sound.add('windows-error-sound')


        this.pipesGroup = this.physics.add.group(
            {
                immovable: true,
                allowGravity: false,
            }
        )

        this.player = this.physics.add.sprite( game.config.width / 4, game.config.height / 2, 'player' )
        this.player.flipX = true;
        this.player.body.gravity.y = gameOptions.playerGravity
    
        this.cherriesGroup = this.physics.add.group( {} )
        this.melonsGroup = this.physics.add.group( {} )

        this.physics.add.overlap(this.player, this.cherriesGroup, this.collectCherry, null, this)
        this.physics.add.overlap(this.player, this.melonsGroup, this.collectMelon, null, this)
        this.physics.add.overlap(this.player, this.pipesGroup, this.changeToGameOverScene, null, this)

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
        let pipe =    piece === 'body' ? this.physics.add.sprite(x, y, 'pipe_body_2')
                    : piece === 'top'  ? this.physics.add.sprite(x, y, 'pipe_top_2')
                    : piece === 'bot'  ? this.physics.add.sprite(x, y, 'pipe_bot_2')
                    : ''

        this.pipesGroup.add( pipe )
    
        pipe.body.setVelocityX( this.pipeVelocity )
    

        /* don't know if this even works? */
        /* found on some forum page, but could be an older version of phaser */
        pipe.checkWorldBounds = true
        pipe.outOfBoundsKill = true
    }


    /* stacking multiple pipe elements with a gap in between */
    addPipes() 
    {
        let hole = Math.floor(Math.random() * 8)

        let gapValues = []
        let gap = this.gap


        /* forming the idxs of randomized hole index (hole starting point index) + gap size
           e.g. hole = 2; gap size = 3  ==>  gap is indexes 2, 3, 4  (hole open from 3rd pipe through 5th pipe)

           gap size shrinks during play
           e.g. hole = 2; gap size = 2  ==>  gap is indexes 2, 3  (hole open from 3rd pipe through 4th pipe) */

        while (gap > 0) 
        { 
            gapValues.push(hole + (gap - 1)); 
            gap-- 
        }

        for (let i = 0; i < game.config.height / 64; i++)
        {

            /* testing to see if we need a top, bottom or body piece depending on if
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

        /* incrementing score (difficulty) when new pipes are spawned */
        this.score += 1
        this.scoreText.setText(this.score)

        /* spawning cherries at random intervals anywhere on the screen */
        if(Phaser.Math.Between(0,1)) {
            this.cherriesGroup.create(game.config.width, Phaser.Math.Between(0, game.config.height), "cherry")
            this.cherriesGroup.setVelocityX( gameOptions.cherriesVelocity )
        }

        /* spawning melons every third score, always near the middle of the screen */
        if(this.score % 3 === 0)
        {
            this.melonsGroup.create(game.config.width, Phaser.Math.Between(125, 475), "melon")
            this.melonsGroup.setVelocityX( gameOptions.melonsVelocity )
        }
        
    }

    /* cherries increase score (difficulty) but also collectablecount by 2 */
    collectCherry(player, item) 
    {
        item.disableBody(true, true)
        this.collectSound.play({ volume: 0.3 })
        this.collectablesScore += 1
        this.score += 2
        this.scoreText.setText(this.score)
        this.itemScoreText.setText(this.collectablesScore)
    }

    /* melons don't increase difficulty, only collectablecount by 1 */
    collectMelon(player, item) 
    {
        item.disableBody(true, true)
        this.collectSound.play({ volume: 0.3 })
        this.collectablesScore += 1
        this.itemScoreText.setText(this.collectablesScore)
    }


    /* when colliding with pipe, changing scenes, stopping music and playing error noise */
    changeToGameOverScene()
    {
        this.bgMusic.stop()
        this.windowsErrorSound.play({ volume: 0.3 })
        this.scene.start("GameOverScene", { score: this.score, collectables: this.collectablesScore })
    }
    

    update() 
    {
        this.player.anims.play('flying', true)

        if (this.cursors.space.isDown) 
        { 
            this.player.body.velocity.y = -gameOptions.playerGravity / 3;
            this.swoosh.play({ loop: false, volume: 0.07 }) 
        }

        /* VERY crass attempt at confining the player inside the window size */
        if(this.player.body.y >= game.config.height - 2) { this.player.setY(game.config.height - 64) }
        if(this.player.body.y <= 0 + 2)                  { this.player.setY(0 + 64) }


        /* increasing the difficulty of the game based on the score */
        if(this.score >= 50) { this.gap = 1 }
        else if(this.score >= 40) { this.delay = 150 }
        else if(this.score >= 35) { this.delay = 333 }
        else if(this.score >= 30) { this.delay = 500 }
        else if(this.score >= 25) { this.pipeVelocity = -400 }
        else if(this.score >= 20) { this.gap = 2 }
        else if(this.score >= 15) { this.delay = 1000 }
        else if(this.score >= 10) { this.pipeVelocity = -300 }

    }


    /*  https://www.html5gamedevs.com/topic/35715-resetting-a-scene/  */
    // restartGame()
    // {
    //     this.score = 0;
    //     this.collectablesScore = 0
    //     this.delay = 2000
    //     this.gap = 3 
    //     this.pipeVelocity = -200
    //     this.scene.start("PlayGame")
    // }

}