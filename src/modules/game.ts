import {
  Engine,
  PhysicsShapeType,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  Scene,
  HavokPlugin,
  UniversalCamera,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/inspector";
import { toRad } from "@mathigon/euclid";
import { physics } from "@/config";
import GameObject from "@/modules/nodes/gameObject";
import Player from "@/modules/nodes/player";

export default class Game {
  private static instance: Game; // Static property to hold the single instance
  private scene: Scene;
  private readonly engine: Engine;
  private readonly canvas: HTMLCanvasElement;

  private constructor() {
    // Make the constructor private to prevent direct instantiation
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);

    this.loadScene();
  }

  // Static method to get the single instance of the class
  public static getInstance(): Game {
    if (!Game.instance) Game.instance = new Game();
    return Game.instance;
  }

  private async loadScene() {
    await this.loadPhysics();

    //#region inputs
    const camera = new UniversalCamera("Camera", new Vector3(0, 0, -10), this.scene);
    camera.angularSensibility = 500;
    camera.minZ = 0.1;
    camera.inertia = 0;
    camera.attachControl(this.canvas, true);
    camera.inputs.addKeyboard();
    camera.inputs.addMouse();
    //#endregion

    //#region Scene
    new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);

    new GameObject({
      mesh: MeshBuilder.CreatePlane("ground", { size: 10 }, this.scene),
      collider: PhysicsShapeType.MESH,
      position: new Vector3(0, -6, 0),
      rotation: new Vector3(toRad(90), 0, 0),
    });

    new GameObject({
      mesh: MeshBuilder.CreateSphere("ball", { diameter: 2 }, this.scene),
      collider: PhysicsShapeType.SPHERE,
      physicsMaterial: { mass: 1 },
      position: new Vector3(0, 5, 0),
    });

    new Player();
    //#endregion

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
