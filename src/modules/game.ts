import {
  Engine,
  HavokPlugin,
  Scene
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/inspector";
import { physics } from "@/config";
import Scene1 from "@/modules/scenes/scene1";
import GameScene from "./scenes";

export default class Game {
  private static instance: Game;
  private scene: GameScene;
  private readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;

  private constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine) as GameScene;
    this.loadGame();
  }

  private async loadGame() {
    await this.loadPhysics();

    this.scene = new Scene1();

    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    this.canvas.addEventListener("click", () => {
      this.canvas.requestPointerLock();
      this.canvas.focus();
    });

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  public static getInstance(): Game {
    if (!Game.instance) Game.instance = new this();
    return this.instance;
  }

  private async loadPhysics() {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(physics.gravity, havokPlugin);
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
