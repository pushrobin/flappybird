import React from 'react';
import Phaser from 'phaser';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BIRD_RADIUS = 20;
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const FLOOR_HEIGHT = 100;

class FlappyBirdScene extends Phaser.Scene {
  private bird!: Phaser.GameObjects.Arc;
  private pipes: Phaser.GameObjects.Rectangle[] = [];
  private floor!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private retryButton!: Phaser.GameObjects.Text;
  private score: number = 0;
  private gameSpeed: number = 2;
  private isGameRunning: boolean = false;

  constructor() {
    super('FlappyBirdScene');
  }

  preload() {
    // No assets to preload for now
  }

  create() {
    // Create blue background
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x87CEEB).setOrigin(0, 0);

    // Create bird
    this.bird = this.add.circle(GAME_WIDTH / 4, GAME_HEIGHT / 2, BIRD_RADIUS, 0xFF0000);

    // Create floor
    this.floor = this.add.rectangle(0, GAME_HEIGHT - FLOOR_HEIGHT, GAME_WIDTH, FLOOR_HEIGHT, 0x8B4513).setOrigin(0, 0);

    // Create score text
    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '32px', color: '#000' });

    // Create start button
    this.startButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Start', { fontSize: '48px', color: '#000' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.startGame());

    // Create retry button (hidden initially)
    this.retryButton = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Retry', { fontSize: '48px', color: '#000' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.retryGame())
      .setVisible(false);

    // Set up keyboard input
    this.input.keyboard?.on('keydown-Z', this.flapBird, this);
  }

  update() {
    if (!this.isGameRunning) return;

    // Apply gravity to bird
    this.bird.y += 2;

    // Move pipes
    for (let i = 0; i < this.pipes.length; i += 2) {
      if (!this.pipes[i] || !this.pipes[i + 1]) {
        console.warn(`Pipe at index ${i} or ${i + 1} is null`);
        continue;
      }
      this.pipes[i].x -= this.gameSpeed;
      this.pipes[i + 1].x -= this.gameSpeed;

      // Check if pipe is off screen and reposition
      if (this.pipes[i].x + PIPE_WIDTH < 0) {
        this.repositionPipe(this.pipes[i], this.pipes[i + 1]);
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
        this.gameSpeed = Math.min(5, 2 + this.score / 20); // Increase speed up to a maximum
      }

      // Check for collision with pipes
      if (this.checkCollision(this.bird, this.pipes[i]) || this.checkCollision(this.bird, this.pipes[i + 1])) {
        this.endGame();
      }
    }

    // Check for collision with floor
    if (this.bird.y + BIRD_RADIUS > GAME_HEIGHT - FLOOR_HEIGHT) {
      this.endGame();
    }
  }

  private startGame() {
    this.isGameRunning = true;
    this.startButton.setVisible(false);
    this.createPipes();
  }

  private retryGame() {
    this.scene.restart();
  }

  private flapBird() {
    if (this.isGameRunning) {
      this.bird.y -= 50;
    }
  }

  private createPipes() {
    for (let i = 0; i < 3; i++) {
      const x = GAME_WIDTH + i * 300;
      const bottomPipeHeight = Phaser.Math.Between(100, GAME_HEIGHT - FLOOR_HEIGHT - PIPE_GAP - 100);
      const bottomPipe = this.add.rectangle(x, GAME_HEIGHT - FLOOR_HEIGHT, PIPE_WIDTH, bottomPipeHeight, 0x00FF00).setOrigin(0, 1);
      const topPipe = this.add.rectangle(x, 0, PIPE_WIDTH, GAME_HEIGHT - FLOOR_HEIGHT - bottomPipeHeight - PIPE_GAP, 0x00FF00).setOrigin(0, 0);
      this.pipes.push(bottomPipe, topPipe);
    }
  }

  private repositionPipe(bottomPipe: Phaser.GameObjects.Rectangle, topPipe: Phaser.GameObjects.Rectangle) {
    if (!bottomPipe || !topPipe) {
      console.warn('Attempted to reposition destroyed pipes');
      return;
    }
    const x = GAME_WIDTH;
    const bottomPipeHeight = Phaser.Math.Between(100, GAME_HEIGHT - FLOOR_HEIGHT - PIPE_GAP - 100);
    bottomPipe.setPosition(x, GAME_HEIGHT - FLOOR_HEIGHT);
    bottomPipe.setSize(PIPE_WIDTH, bottomPipeHeight);
    topPipe.setPosition(x, 0);
    topPipe.setSize(PIPE_WIDTH, GAME_HEIGHT - FLOOR_HEIGHT - bottomPipeHeight - PIPE_GAP);
  }

  private checkCollision(bird: Phaser.GameObjects.Arc, pipe: Phaser.GameObjects.Rectangle): boolean {
    const birdCircle = new Phaser.Geom.Circle(bird.x, bird.y, bird.radius);
    return Phaser.Geom.Intersects.CircleToRectangle(birdCircle, pipe.getBounds());
  }

  private endGame() {
    this.isGameRunning = false;
    this.retryButton.setVisible(true);
  }
}

const App: React.FC = () => {
  React.useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      scene: FlappyBirdScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
        },
      },
    };

    new Phaser.Game(config);
  }, []);

  return (
    <div>
      <header>
        <h1>Flappy Bird Clone</h1>
        <a href="https://github.com/pushrobin/flappybird" target="_blank" rel="noopener noreferrer">
          GitHub Repo
        </a>
      </header>
      <div id="phaser-game" />
    </div>
  );
};

export default App;