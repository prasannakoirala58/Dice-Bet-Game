export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.diceResult = null;
  }

  preload() {
    // Load any assets here
  }

  create() {
    this.add.text(300, 50, 'Roll the Dice', { fontSize: '32px', fill: '#fff' });
    this.rollDiceBtn = this.add
      .text(300, 200, 'Roll', { fontSize: '32px', fill: '#0f0' })
      .setInteractive()
      .on('pointerdown', () => this.rollDice());

    this.diceResultText = this.add.text(300, 300, 'Result: ', {
      fontSize: '24px',
      fill: '#fff',
    });
  }

  rollDice() {
    fetch('/api/roll-dice')
      .then((res) => res.json())
      .then((data) => {
        this.diceResult = data.diceRoll;
        this.diceResultText.setText(`Result: ${this.diceResult}`);
      });
  }
}
