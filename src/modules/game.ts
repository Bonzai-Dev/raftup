import { Engine } from "@babylonjs/core";
import Test from "@/modules/scenes/test";
import GameScene from "./scenes/scene";

export default class Game {
  private static instance: Game;
  private scene: GameScene;
  private readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;

  private constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.engine = new Engine(this.canvas, true);
    this.scene = new Test({ engine: this.engine, canvas: this.canvas, debugMode: true });
    this.loadGame();
  }

  private async loadGame() {
    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  public static getInstance(): Game {
    if (!Game.instance) Game.instance = new this();
    return this.instance;
  }

  public getScene(): GameScene {
    return this.scene as GameScene;
  }

  public getEngine(): Engine {
    return this.engine;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
