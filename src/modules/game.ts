import {
  Engine,
  Scene,
  HavokPlugin,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/inspector";
import { physics } from "@/config";
import Scene1 from "@/modules/scenes/scene1";

export default class Game {
  private static instance: Game;
  private scene: Scene;
  private readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;

  private constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);

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
    });

    this.engine.runRenderLoop(() => {
      this.canvas.focus();
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

  public getScene(): Scene {
    return this.scene;
  }

  public getEngine(): Engine {
    return this.engine;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
