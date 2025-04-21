import {
  PhysicsShapeType,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import Scene, { SceneParameters } from "./scene";
import Game from "@/modules/game";
import { Control, Image } from "@babylonjs/gui";
import Ocean from "@/modules/nodes/gameObjects/ocean";

export default class Test extends Scene {
  constructor(parameters: SceneParameters) {
    super({ engine: parameters.engine, canvas: parameters.canvas, debugMode: true });
  }

  protected override async scene() {
    const transparentMaterial = new StandardMaterial("transparentMaterial", this);
    transparentMaterial.diffuseColor = new Color3(1, 0, 0);
    transparentMaterial.alpha = 0.5;

    const gui = Game.getInstance().getGui();
    const image = new Image("cursor", "/cursor.svg");
    image.width = "5px";
    image.height = "5px";
    image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    image.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    image.isPointerBlocker = false;
    gui.addControl(image);

    const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(1, 1, 0), this);
    hemisphericLight.intensity = 0.6;
    const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(-1, -2, -1), this);
    directionalLight.position = new Vector3(20, 10, 20);
    directionalLight.intensity = 0.3;

    new Ocean();
  }
}
