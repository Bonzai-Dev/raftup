import { Engine } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import Test from "@/modules/scenes/test";
import GameScene from "./scenes/scene";

export default class Game {
  private static instance: Game;
  private scene: GameScene;
  private readonly gui: AdvancedDynamicTexture;
  private readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;

  private constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.engine = new Engine(this.canvas, true);
    this.scene = new Test({ engine: this.engine, canvas: this.canvas });
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
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

  public getGui(): AdvancedDynamicTexture {
    return this.gui;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
