import { Scene, UniversalCamera, Vector3 } from "@babylonjs/core";
import Game from "@/modules/game";

export default class GameScene extends Scene {
  protected readonly camera: UniversalCamera;

  constructor() {
    super(Game.getInstance().getEngine());
    this.camera = new UniversalCamera("camera", new Vector3(0, 0, -10), Game.getInstance().getScene());
    this.camera.attachControl(Game.getInstance().getCanvas(), true);
    this.camera.inputs.addKeyboard();
    this.camera.inputs.addMouse();
  }
}
