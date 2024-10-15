import Phaser from 'phaser';
import GameScene from './game';

// Config
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameScene,
  canvas: document.getElementById('gameCanvas'),
};

const game = new Phaser.Game(config);

document.getElementById('startGame').addEventListener('click', () => {
  game.scene.start('GameScene');
});
