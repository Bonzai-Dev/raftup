import {
  PhysicsShapeType,
  HemisphericLight,
  MeshBuilder,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/inspector";
import { toRad } from "@mathigon/euclid";
import GameScene from "./";
import GameObject from "@/modules/nodes/gameObjects";
import Player from "@/modules/nodes/gameObjects/player";

export default class Scene1 extends GameScene {
  constructor() {
    super();
  }

  protected override scene() {
    this.camera.position = new Vector3(0, 0, -10);

    new HemisphericLight("light1", new Vector3(1, 1, 0), this);

    new GameObject({
      mesh: MeshBuilder.CreatePlane("ground", { size: 10 }, this),
      collider: PhysicsShapeType.MESH,
      position: new Vector3(0, -6, 0),
      rotation: new Vector3(toRad(90), 0, 0),
    });

    new GameObject({
      mesh: MeshBuilder.CreateSphere("ball", { diameter: 2 }, this),
      collider: PhysicsShapeType.SPHERE,
      physicsMaterial: { mass: 1 },
      position: new Vector3(0, 5, 0),
    });

    new Player();
  }
}