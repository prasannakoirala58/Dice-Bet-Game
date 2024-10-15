import './style.css';
import Phaser from 'phaser';

// Game configuration
const sizes = {
  width: 500,
  height: 500,
};

const gameStartDiv = document.querySelector('#gameStartDiv');
const gameStartBtn = document.querySelector('#gameStartBtn');
const gameEndDiv = document.querySelector('#gameEndDiv');
const gameWinLoseSpan = document.querySelector('#gameWinLoseSpan');
const gameEndScoreSpan = document.querySelector('#gameEndScoreSpan');

let playerGuess = 0;
let score = 0;

class GameScene extends Phaser.Scene {
  constructor() {
    super('scene-game');
    this.diceImages = [];
    this.diceRollResult = 0;
    this.rollSound;
    this.scoreText;
    this.rollingDice;
    this.playerGuessText;
    this.resultText;
  }

  preload() {
    for (let i = 1; i <= 6; i++) {
      this.load.image(`dice-${i}`, `/assets/dice-${i}.png`);
    }
    this.load.audio('rollSound', '/assets/dice-roll.mp3');
    this.load.image('bg', '/assets/bg.png');
  }

  create() {
    this.scene.pause('scene-game');

    this.add
      .image(sizes.width / 2, sizes.height / 2, 'bg')
      .setDisplaySize(sizes.width, sizes.height);

    this.rollSound = this.sound.add('rollSound');

    this.scoreText = this.add.text(sizes.width - 120, 20, `Score: ${score}`, {
      fontSize: '18px',
      fill: '#ffffff',
    });

    // Create flex container for dice options
    const flexContainer = this.add.container(sizes.width / 2, sizes.height / 2 - 50);
    const diceSize = 60;
    const padding = 10;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const i = row * 3 + col;
        const x = col * (diceSize + padding) - (diceSize + padding);
        const y = row * (diceSize + padding) - diceSize / 2;

        const dice = this.add
          .image(x, y, `dice-${i + 1}`)
          .setInteractive({ useHandCursor: true })
          .setDisplaySize(diceSize, diceSize);

        dice.on('pointerdown', () => {
          playerGuess = i + 1;
          this.rollDice();
        });

        flexContainer.add(dice);
        this.diceImages.push(dice);
      }
    }

    // Single rolling dice in the center bottom
    this.rollingDice = this.add
      .image(sizes.width / 2, sizes.height / 2 + 100, 'dice-1')
      .setDisplaySize(80, 80)
      .setInteractive({ useHandCursor: true });

    this.rollingDice.on('pointerdown', () => {
      if (score < 10) {
        this.rollDice();
      }
    });

    // Player's guess text
    this.playerGuessText = this.add
      .text(sizes.width / 2, sizes.height - 50, '', {
        fontSize: '24px',
        fill: '#ffffff',
      })
      .setOrigin(0.5);

    // Result text
    this.resultText = this.add
      .text(sizes.width / 2, 70, '', {
        fontSize: '32px',
        fill: '#ffffff',
        lineHeight: 180,
      })
      .setOrigin(0.5)
      .setPadding(0, 10, 0, 0);
  }

  async rollDice() {
    this.rollSound.play();
    this.playerGuessText.setText(`Your guess: ${playerGuess}`);

    // Simulate rolling animation
    await new Promise((resolve) => {
      let rollCount = 0;
      const rollInterval = setInterval(() => {
        const randomFace = Phaser.Math.Between(1, 6);
        this.rollingDice.setTexture(`dice-${randomFace}`);
        rollCount++;
        if (rollCount >= 20) {
          clearInterval(rollInterval);
          resolve();
        }
      }, 50);
    });

    // Send request to server for dice roll
    try {
      const response = await fetch('http://localhost:5000/api/roll-dice');
      const data = await response.json();
      this.diceRollResult = data.diceRoll;
    } catch (error) {
      console.error('Error fetching dice roll:', error);
      this.diceRollResult = Phaser.Math.Between(1, 6);
    }

    // Set final dice image
    this.rollingDice.setTexture(`dice-${this.diceRollResult}`);

    // Send bet to server
    try {
      const response = await fetch('http://localhost:5000/api/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guess: playerGuess,
        }),
      });
      const data = await response.json();

      if (data.betResult) {
        score += 1;
        this.resultText.setText('You Win! 🎉').setColor('#00ff00');
      } else {
        this.resultText.setText('You Lose! 😢').setColor('#ff0000');
      }
    } catch (error) {
      console.error('Error placing bet:', error);
    }

    this.scoreText.setText(`Score: ${score}`);
    gameEndScoreSpan.textContent = score;

    if (score >= 1) {
      this.endGame();
    }
  }

  endGame() {
    // Destroy or hide existing game elements
    this.children.removeAll(); // Remove all existing game objects

    // Create a blue screen background
    const blueScreen = this.add.rectangle(
      sizes.width / 2,
      sizes.height / 2,
      sizes.width,
      sizes.height,
      0x0d0d35
    );
    blueScreen.setOrigin(0.5);

    // Display the Game Over text
    this.resultText = this.add
      .text(sizes.width / 2, sizes.height / 2, 'Game Over\nRefresh to start again', {
        fontSize: '32px',
        fill: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    // Disable any game interactions or animations
    this.input.removeAllListeners(); // Remove all input listeners to disable interactions
    this.scene.pause(); // Pause the game scene to stop any further updates
  }
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: document.getElementById('gameCanvas'),
  scene: [GameScene],
};

const game = new Phaser.Game(config);

gameStartBtn.addEventListener('click', () => {
  gameStartDiv.style.display = 'none';
  game.scene.resume('scene-game');
});
