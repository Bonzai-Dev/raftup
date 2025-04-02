import { Scene, Vector3, HavokPlugin, UniversalCamera } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/inspector";
import { physics } from "@/config";
import Game from "@/modules/game";

export default class GameScene extends Scene {
  protected readonly camera: UniversalCamera;

  constructor() {
    super(Game.getInstance().getEngine());
    this.camera = new UniversalCamera("Camera", Vector3.Zero(), this);
    this.camera.fov = 1.5;
    this.camera.angularSensibility = 500;
    this.camera.minZ = 0.1;
    this.camera.inertia = 0;
    this.camera.attachControl(Game.getInstance().getCanvas(), true);
    this.camera.inputs.addKeyboard();
    this.camera.inputs.addMouse();

    this.camera.keysUp.push("W".charCodeAt(0));
    this.camera.keysDown.push("S".charCodeAt(0));
    this.camera.keysLeft.push("A".charCodeAt(0));
    this.camera.keysRight.push("D".charCodeAt(0));

    this.loadScene();
  }

  protected scene() {}

  private async loadScene() {
    await this.loadPhysics();
    this.scene();
  }

  private async loadPhysics() {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    this.enablePhysics(physics.gravity, havokPlugin);
  }

  public getCamera(): UniversalCamera {
    return this.camera;
  }
}
