"use client";
import { useEffect, useRef } from "react";

// Simple Phaser mini-game: show a lab background and clickable stars to collect
export default function ScienceQuestGame({ width = 960, height = 540 }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const Phaser = (await import("phaser")).default;

      // Scenes
      class PreloadScene extends Phaser.Scene {
        constructor() { super("preload"); }
        preload() {
          this.load.image("lab", "/student/game-assets/bg/chemestry-lab.png");
          this.load.image("star", "/student/game-assets/objects/star.png");
          this.load.image("student", "/student/game-assets/characters/student.png");
          this.load.audio("bgm", "/student/game-assets/sounds/Background Music.mp3");
          this.load.audio("correct", "/student/game-assets/sounds/correct-answer.mp3");
        }
        create() {
          this.scene.start("play");
        }
      }

      class PlayScene extends Phaser.Scene {
        constructor() { super("play"); }
        create() {
          const { width, height } = this.sys.game.canvas;
          // Background
          const bg = this.add.image(width/2, height/2, "lab");
          const scaleX = width / bg.width;
          const scaleY = height / bg.height;
          const scale = Math.max(scaleX, scaleY);
          bg.setScale(scale).setScrollFactor(0);

          // Music
          try { this.sound.add("bgm", { loop: true, volume: 0.2 }).play(); } catch {}

          // Score text
          this.score = 0;
          this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "18px", color: "#fff" }).setScrollFactor(0);

          // Place some stars
          const group = this.physics.add.group();
          for (let i = 0; i < 8; i++) {
            const x = 80 + i * ((width - 160) / 7);
            const y = Phaser.Math.Between(120, height - 80);
            const star = group.create(x, y, "star");
            star.setScale(0.5);
            star.setInteractive({ useHandCursor: true });
            star.on("pointerdown", () => {
              star.disableBody(true, true);
              this.score += 10;
              this.scoreText.setText(`Score: ${this.score}`);
              try { this.sound.play("correct", { volume: 0.6 }); } catch {}
              if (group.countActive() === 0) {
                this.add.text(width/2, height/2, "Great job!", { fontSize: "32px", color: "#0f0" }).setOrigin(0.5);
              }
            });
          }
        }
      }

      if (!isMounted || gameRef.current) return;
      const config = {
        type: Phaser.AUTO,
        width,
        height,
        parent: containerRef.current,
        backgroundColor: "#1a1a1a",
        physics: { default: "arcade", arcade: { gravity: { y: 0 } } },
        scene: [PreloadScene, PlayScene],
      };
      const game = new Phaser.Game(config);
      gameRef.current = game;
    })();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        try { gameRef.current.destroy(true); } catch {}
        gameRef.current = null;
      }
    };
  }, [width, height]);

  return <div ref={containerRef} className="w-full h-[70vh] md:h-[75vh] rounded overflow-hidden bg-black" />;
}
