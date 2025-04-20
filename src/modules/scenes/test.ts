import {
  PhysicsShapeType,
  MeshBuilder,
  Vector3,
  SpotLight,
  HemisphericLight,
  DirectionalLight,
  StandardMaterial,
  Color3,
  Tags,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import { toRad } from "@mathigon/euclid";
import Scene, { SceneParameters } from "./scene";
import GameObject from "@/modules/nodes/gameObjects/object";
import Player from "@/modules/nodes/gameObjects/player";
import Mesh from "@/modules/nodes/gameObjects/mesh";
import Game from "@/modules/game";
import { Control, Image } from "@babylonjs/gui";
import { tags } from "@/config";

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

    new Mesh("/src/assets/models/raft.glb", "raft");
    new Mesh("/src/assets/models/trash/plasticBarrel.glb", "plasticBarrel");

    new GameObject({
      mesh: MeshBuilder.CreatePlane("ground", { size: 500 }, this),
      collider: PhysicsShapeType.MESH,
      position: new Vector3(0, -6, 0),
      rotation: new Vector3(toRad(90), 0, 0),
      physicsMaterial: { restitution: 0, mass: 0 }
    });

    new GameObject({
      mesh: MeshBuilder.CreateBox("pillar", { width: 0.5, height: 0.5, depth: 8 }, this),
      collider: PhysicsShapeType.MESH,
      position: new Vector3(0, -6, 0),
      rotation: new Vector3(toRad(90), 0, 0),
    });

    new GameObject({
      mesh: MeshBuilder.CreateSphere("ball", { diameter: 2 }, this),
      collider: PhysicsShapeType.SPHERE,
      physicsMaterial: { mass: 1 },
      position: new Vector3(5, 5, 0),
      material: transparentMaterial,
    });

    new GameObject({
      mesh: MeshBuilder.CreateSphere("ball2", { diameter: 2 }, this),
      collider: PhysicsShapeType.SPHERE,
      physicsMaterial: { mass: 1 },
      position: new Vector3(2, 11, 0),
      tags: [tags.pickable],
    });

    new Player(new Vector3(0, 10, 0));
  }
}
