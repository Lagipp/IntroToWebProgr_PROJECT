
export class GameOverScene extends Phaser.Scene
{
    
    constructor()
    {
        super("GameOverScene")
        this.score = 0
        this.collectables = 0
        this.hint = ''
        this.result = ''
    }

    init(params)
    {
        this.score = params.score
        this.collectables = params.collectables
        this.highScore = params.highScore
    }

    preload()
    {
        /* asset acquired from:  https://pixelfrog-assets.itch.io/pixel-adventure-1  */
        this.load.image('pink-bg', 'assets/backgrounds/Pink.png')

        /* music acquired from:  https://pixabay.com/sound-effects/interface-124464/  */
        this.load.audio('confirm', ['assets/sounds/confirm.mp3'])
    }

    create()
    {
        /* some code taken from: 
        https://www.freecodecamp.org/news/how-to-build-a-simple-game-in-the-browser-with-phaser-3-and-typescript-bdc94719135/ */

        this.confirmSound = this.sound.add('confirm')

        const container = this.add.container(800 / 2, 600 / 2)
        this.ts = this.add.tileSprite(0, 0, 800, 600, 'pink-bg').setAlpha(0.9)
        container.add(this.ts)

        let totalScore = this.score + (this.collectables * 5)
        let resultText = `Your score is ${totalScore}!`
        this.result = this.add.text(180, 200, resultText, { font: '60px Arial Bold', fill: 'white' })

        let hintText = "Press 'Mouse 1' to restart"
        this.hint = this.add.text(280, 320, hintText, { font: '24px Arial Bold', fill: 'white' })

        /* updating high-score status */
        if(totalScore > this.highScore) this.highScore = totalScore

        this.input.on('pointerdown', function () 
        { 
            console.log(`gameover: pointer clicked`)
            this.confirmSound.play({ loop: false, volume: 0.15 })
            this.scene.start("PlayGame", { highScore: this.highScore })
        }, this)
    }
}