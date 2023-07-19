
export class WelcomeScene extends Phaser.Scene
{
    constructor()
    {
        super("WelcomeScene")
        this.title = ''
        this.hint = ''
    }

    preload()
    {
        /* asset acquired from:  https://pixelfrog-assets.itch.io/pixel-adventure-1  */
        this.load.image('blue-bg', 'assets/backgrounds/Blue.png')

        /* music acquired from:  https://pixabay.com/sound-effects/interface-124464/  */
        this.load.audio('confirm', ['assets/sounds/confirm.mp3'])
    }

    create()
    {
        /* some code taken from: 
        https://www.freecodecamp.org/news/how-to-build-a-simple-game-in-the-browser-with-phaser-3-and-typescript-bdc94719135/ */

        this.confirmSound = this.sound.add('confirm')

        const container = this.add.container(800 / 2, 600 / 2)
        this.ts = this.add.tileSprite(0, 0, 800, 600, 'blue-bg').setAlpha(0.9)
        container.add(this.ts)

        let titleText = "ITWP Project"
        this.title = this.add.text(180, 200, titleText, { font: '80px Arial Bold', fill: 'white' })

        let hintText = "Press 'Mouse 1' to start"
        this.hint = this.add.text(280, 320, hintText, { font: '24px Arial Bold', fill: 'white' })

        this.input.on('pointerdown', function () 
        { 
            console.log(`welcome: pointer clicked`)
            this.confirmSound.play({ loop: false, volume: 0.15,  })
            this.scene.start("PlayGame")
        }, this)
    }
}