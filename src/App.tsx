import React, { useEffect } from 'react';
import Phaser from 'phaser';

const App: React.FC = () => {
  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-game',
      scene: {
        preload: preload,
        create: create
      }
    };

    new Phaser.Game(config);

    function preload(this: Phaser.Scene) {
      // Preload assets here
    }

    function create(this: Phaser.Scene) {
      this.add.text(400, 300, 'Hello World', { fontSize: '32px' }).setOrigin(0.5);
    }
  }, []);

  return (
    <div>
      <header>
        <h1>Flappy Bird Clone</h1>
        <a href="https://github.com/pushrobin/flappybird" target="_blank" rel="noopener noreferrer">
          GitHub Repo
        </a>
      </header>
      <div id="phaser-game"></div>
    </div>
  );
};

export default App;