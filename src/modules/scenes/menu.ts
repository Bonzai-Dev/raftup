import {
  Vector3,
  PhysicsShapeType,
  HemisphericLight,
  DirectionalLight,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import { toRad } from "@mathigon/euclid";
import { Button } from "@babylonjs/gui";
import { tags } from "@/config";
import Scene, { SceneParameters } from "./scene";
import Game, { GameStates } from "@/modules/game";
import Ocean from "./ocean";
import OceanMesh from "@/modules/nodes/gameObjects/ocean";
import Mesh from "@/modules/nodes/gameObjects/meshes/mesh";
import Radio from "@/modules/nodes/gameObjects/meshes/radio";

export default class Test extends Scene {
  constructor(parameters: SceneParameters) {
    super({ engine: parameters.engine, canvas: parameters.canvas });
  }

  protected override async scene() {
    const transparentMaterial = new StandardMaterial("transparentMaterial", this);
    transparentMaterial.diffuseColor = new Color3(1, 0, 0);
    transparentMaterial.alpha = 0.5;

    const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(1, 1, 0), this);
    hemisphericLight.intensity = 0.6;
    const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0.447, -0.895, 0), this);
    directionalLight.position = new Vector3(0, 10, 0);
    directionalLight.intensity = 0.3;

    this.camera.inputs.removeByType("FreeCameraMouseInput");
    this.camera.rotation = new Vector3(0.35, -2.2, 0);
    this.camera.position = new Vector3(15.01, -0.615, 12.62);

    const playButton = Button.CreateSimpleButton("playButton", "PLAY");
    playButton.width = "50px";
    playButton.height = "35px";
    playButton.color = "white";
    playButton.thickness = 0;
    playButton.hoverCursor = "pointer";
    this.gui.addControl(playButton);

    playButton.onPointerUpObservable.add(() => {
      const game = Game.getInstance();

      game.getMenuMusic().stop();
      game.getRadioMusic().pause();

      game.setCurrentState(GameStates.PLAYING);
      game.setScene(new Ocean({ engine: game.getEngine(), canvas: game.getCanvas() }));
    });

    new OceanMesh();

    new Mesh("./assets/models/raft.glb", "raft", {
      collider: PhysicsShapeType.BOX,
      position: new Vector3(0, -10, 0),
      physicsMaterial: { mass: 5000, restitution: 0, friction: 1 },
      tags: [tags.floating],
    });

    new Radio(new Vector3(-2, -10, -0.5), new Vector3(0, toRad(15), 0));

    new Mesh("./assets/models/plasticChair.glb", "plasticChair", {
      collider: PhysicsShapeType.BOX,
      position: new Vector3(-2, -5, -3),
      rotation: new Vector3(0, toRad(-45), 0),
      physicsMaterial: { mass: 50, restitution: 0, friction: 1 },
      tags: [tags.floating, tags.pickable],
    });
  }
}
