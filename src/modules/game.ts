import {
  Engine,
  PhysicsShapeType,
  HemisphericLight,
  Vector3,
  Vector2,
  PhysicsAggregate,
  MeshBuilder,
  Scene,
  HavokPlugin,
  ArcRotateCamera,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/inspector";
import { physics } from "@/config";
import GameObject from "@/modules/nodes/gameObject";
import { toRad } from "@mathigon/euclid";

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

    const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, -2, 10), this.scene);
    camera.attachControl(this.canvas, true);

    new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);

    new GameObject({
      scene: this.scene,
      mesh: MeshBuilder.CreatePlane("ground", { size: 10 }, this.scene),
      collider: PhysicsShapeType.MESH,
      position: new Vector3(0, -6, 0),
      rotation: new Vector3(toRad(90), 0, 0),
    });

    new GameObject({
      scene: this.scene,
      mesh: MeshBuilder.CreateSphere("ball", { diameter: 2 }, this.scene),
      collider: PhysicsShapeType.SPHERE,
      physicsMaterial: { mass: 1 },
      position: new Vector3(0, 5, 0),
    });

    // hide/show the Inspector
    window.addEventListener("keydown", (event) => {
      // Shift+Ctrl+Alt+I
      if (event.shiftKey && event.ctrlKey && event.altKey && (event.key === "I" || event.key === "i")) {
        if (this.scene.debugLayer.isVisible()) this.scene.debugLayer.hide();
        else this.scene.debugLayer.show();
      }
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  private async loadPhysics() {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(physics.gravity, havokPlugin);
  }
}
