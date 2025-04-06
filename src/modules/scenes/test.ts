import { PhysicsShapeType, HemisphericLight, MeshBuilder, Vector3, SpotLight, DirectionalLight, PointLight } from "@babylonjs/core";
import "@babylonjs/inspector";
import { toRad } from "@mathigon/euclid";
import Scene, { SceneParameters } from "./scene";
import GameObject from "@/modules/nodes/gameObjects/object";
import Player from "@/modules/nodes/gameObjects/player";

export default class Test extends Scene {
  constructor(parameters: SceneParameters) {
    super({ engine: parameters.engine, canvas: parameters.canvas, debugMode: true });
  }

  protected override scene() {
    this.camera.position = new Vector3(0, 0, -10);

    // const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(1, 1, 0), this);
    // hemisphericLight.intensity = 0.6;
    const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0, -1, -1), this);
    directionalLight.position = new Vector3(0, 10, 0);
    directionalLight.intensity = 0.3;
    directionalLight.autoCalcShadowZBounds = true;

    new GameObject({
      mesh: MeshBuilder.CreatePlane("ground", { size: 500 }, this),
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

    new GameObject({
      mesh: MeshBuilder.CreateSphere("ball2", { diameter: 2 }, this),
      collider: PhysicsShapeType.SPHERE,
      physicsMaterial: { mass: 1 },
      position: new Vector3(5, 5, 0),
    });

    new Player();
  }
}
